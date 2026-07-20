/**
 * @sentinel/sdk — Sentinel client
 *
 * Thin wrapper around the Sentinel HTTP API.
 * All decision logic lives in the API; the SDK adds:
 *   - Typed requests / responses
 *   - Automatic chain-linking (job_id → last verdict_hash map)
 *   - verifyBeforeSettlement() convenience method
 *   - Local Ed25519 receipt verification
 *   - x402 payment header injection
 *   - Never fails open — throws on API error
 */

import {
  SentinelConfig,
  ScanOptions,
  Decision,
  Chain,
  VerifyResponse,
  TrustReceipt,
} from "./types.js";
import {
  SentinelBlocked,
  SentinelUnreachable,
} from "./errors.js";
import { verifyReceiptLocal } from "./verify.js";

const DEFAULT_BASE_URL = "https://sentinel-api.up.railway.app";
const DEFAULT_TIMEOUT_MS = 30_000;

export class Sentinel {
  private readonly actorId: string;
  private readonly baseUrl: string;
  private readonly paymentSigner?: SentinelConfig["paymentSigner"];
  private readonly timeoutMs: number;

  /**
   * Local map: job_id → last verdict_hash.
   * Enables automatic chain-linking without callers having to track state.
   */
  private readonly chainMap = new Map<string, string>();

  constructor(config: SentinelConfig) {
    this.actorId = config.actorId;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.paymentSigner = config.paymentSigner;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Scan a single piece of content for threats.
   *
   * @param content  - The raw content string to scan
   * @param options  - Scan options (context, contentType, jobId, etc.)
   * @returns        - Full Decision object from the API
   * @throws SentinelUnreachable if the API cannot be reached
   */
  async scan(content: string, options: ScanOptions = {}): Promise<Decision> {
    const {
      context = "generic",
      contentType = "text",
      sanitize = false,
      jobId,
      prevReceiptHash,
    } = options;

    // Auto-link: resolve prev_receipt_hash from local chain map unless caller overrides
    const resolvedPrevHash =
      prevReceiptHash ??
      (jobId ? this.chainMap.get(jobId) ?? null : null);

    const body: Record<string, unknown> = {
      content,
      content_type: contentType,
      context,
      sanitize,
      actor_id: this.actorId,
    };

    if (jobId) body.job_id = jobId;
    if (resolvedPrevHash) body.prev_receipt_hash = resolvedPrevHash;

    const decision = await this.post<Decision>("/v1/scan", body);

    // Update chain map so the next scan for this job auto-links
    if (jobId && decision.trust_receipt?.verdict_hash) {
      this.chainMap.set(jobId, decision.trust_receipt.verdict_hash);
    }

    return decision;
  }

  /**
   * Convenience method for the buyer agent settlement flow.
   *
   * Scans content with context="deliverable", auto-links the chain for
   * jobId, and throws SentinelBlocked unless the verdict is "allow".
   *
   * Usage:
   *   await sentinel.verifyBeforeSettlement("job_8821", deliverableContent);
   *   // If we reach here, it's safe to release escrow.
   *
   * @throws SentinelBlocked   if action is reject / review / hold_escrow
   * @throws SentinelUnreachable if the API is down (never fails open)
   */
  async verifyBeforeSettlement(
    jobId: string,
    content: string,
    options: Omit<ScanOptions, "jobId" | "context"> = {}
  ): Promise<Decision> {
    const decision = await this.scan(content, {
      ...options,
      jobId,
      context: "deliverable",
    });

    if (decision.action !== "allow") {
      throw new SentinelBlocked(decision);
    }

    return decision;
  }

  /**
   * Fetch and validate the full trust chain for a job.
   *
   * @param jobId - The job identifier
   * @returns Chain object with per-link validity flags
   */
  async getChain(jobId: string): Promise<Chain> {
    return this.get<Chain>(`/v1/chain/${encodeURIComponent(jobId)}`);
  }

  /**
   * Fetch a receipt by verdict_hash from the API.
   *
   * @param verdictHash - The verdict_hash from a trust_receipt
   * @returns VerifyResponse including the signer pubkey
   */
  async getReceipt(verdictHash: string): Promise<VerifyResponse> {
    return this.get<VerifyResponse>(`/v1/verify/${encodeURIComponent(verdictHash)}`);
  }

  /**
   * Verify a TrustReceipt's Ed25519 signature locally (offline).
   *
   * @param receipt   - The TrustReceipt to verify
   * @param pubKeyPem - Signer public key in PEM format.
   *                    Obtain once from GET /v1/health → signing_pubkey,
   *                    or pass the result of getReceipt().signer_pubkey.
   * @throws SentinelInvalidSignature if the signature is invalid
   * @returns true on success
   */
  verifyReceipt(receipt: TrustReceipt, pubKeyPem: string): true {
    return verifyReceiptLocal(receipt, pubKeyPem);
  }

  /**
   * Expose the current chain map snapshot (job_id → last verdict_hash).
   * Useful for persisting state across process restarts.
   */
  getChainMap(): Record<string, string> {
    return Object.fromEntries(this.chainMap);
  }

  /**
   * Restore a previously persisted chain map (e.g. from cold storage).
   */
  restoreChainMap(snapshot: Record<string, string>): void {
    for (const [jobId, verdictHash] of Object.entries(snapshot)) {
      this.chainMap.set(jobId, verdictHash);
    }
  }

  // ─── HTTP helpers ──────────────────────────────────────────────────────────

  private async post<T>(path: string, body: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.paymentSigner) {
      try {
        const paymentHeader = await this.paymentSigner(path, "0.05");
        if (paymentHeader) headers["X-Payment"] = paymentHeader;
      } catch (err) {
        throw new SentinelUnreachable(
          "Payment signer threw an error — aborting to avoid acting without payment proof.",
          err
        );
      }
    }

    return this.request<T>("POST", path, headers, JSON.stringify(body));
  }

  private async get<T>(path: string): Promise<T> {
    // GET endpoints are free; no payment header needed
    return this.request<T>("GET", path, {}, undefined);
  }

  private async request<T>(
    method: string,
    path: string,
    headers: Record<string, string>,
    body: string | undefined
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      // fetch() throws on network error — we wrap and re-throw
      // so callers get a typed SentinelUnreachable rather than a raw TypeError
      throw new SentinelUnreachable(
        `Sentinel API unreachable at ${url}: ${(err as Error).message}`,
        err
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      let detail = "";
      try {
        const errBody = (await response.json()) as { error?: string };
        detail = errBody.error ?? "";
      } catch {
        // ignore
      }
      throw new SentinelUnreachable(
        `Sentinel API returned ${response.status} for ${method} ${path}${detail ? `: ${detail}` : ""}`
      );
    }

    return response.json() as Promise<T>;
  }
}
