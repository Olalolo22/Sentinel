/**
 * @sentinel/sdk — Types
 *
 * All shapes mirror the API's decision object exactly so consumers get
 * full type-safety without a separate schema library.
 */

// ─── Threat taxonomy ──────────────────────────────────────────────────────────

export type ThreatType =
  | "T1_prompt_injection"
  | "T2_hidden_encoded_instructions"
  | "T3_escrow_manipulation"
  | "T4_payment_redirection"
  | "T5_malicious_payloads_links"
  | "T6_negotiation_coercion"
  | "T7_data_exfiltration_prompts"
  | "T8_cross_agent_worms";

export type ThreatSeverity = "low" | "medium" | "high" | "critical";

export interface Threat {
  type: ThreatType;
  severity: ThreatSeverity;
  /** [start, end] character offsets in raw content */
  span: [number, number];
  excerpt: string;
  rationale: string;
}

// ─── Action / verdict ────────────────────────────────────────────────────────

export type Action = "allow" | "review" | "reject" | "hold_escrow";

export type ContentType = "text" | "html" | "markdown" | "file-b64";

export type ScanContext =
  | "task_spec"
  | "negotiation_msg"
  | "deliverable"
  | "generic";

// ─── Trust receipt ────────────────────────────────────────────────────────────

export interface TrustReceipt {
  content_sha256: string;
  verdict_hash: string;
  actor_id: string;
  job_id: string | null;
  prev_receipt_hash: string | null;
  model_version: string;
  rules_version: string;
  timestamp: number;
  action: Action;
  signature: string;
  bond_ref: string | null;
}

// ─── Decision (full scan response) ───────────────────────────────────────────

export interface Decision {
  action: Action;
  risk_score: number;
  confidence: number;
  requires_human: boolean;
  reason: string;
  threats: Threat[];
  sanitized_content: string | null;
  decode_report: string[];
  seen_count: number;
  trust_receipt: TrustReceipt;
  billing: {
    cached: boolean;
    charged: string;
  };
}

// ─── Chain types ──────────────────────────────────────────────────────────────

export interface ChainLink {
  receipt: TrustReceipt & Record<string, unknown>;
  valid_link: boolean;
}

export interface Chain {
  job_id: string;
  chain: ChainLink[];
  chain_head_hash: string;
  overall_valid: boolean;
}

// ─── Verify response ──────────────────────────────────────────────────────────

export interface VerifyResponse {
  verdict_hash: string;
  receipt: TrustReceipt & Record<string, unknown>;
  signature: string;
  signer_pubkey: string;
}

// ─── SDK config ───────────────────────────────────────────────────────────────

export interface SentinelConfig {
  /**
   * The ERC-8004 agent identity string, e.g. "erc8004:xlayer:0x..."
   * Included in every scan request as actor_id and embedded in receipts.
   */
  actorId: string;

  /**
   * Base URL of the Sentinel API.  Defaults to the production endpoint.
   */
  baseUrl?: string;

  /**
   * Optional: a function that returns the x402 payment header value.
   * Sentinel calls this before every paid request and attaches the result
   * as the `X-Payment` header.  If omitted, the header is not sent
   * (suitable for free-tier / local dev).
   */
  paymentSigner?: (requestPath: string, amountUsdt: string) => Promise<string> | string;

  /**
   * Timeout in milliseconds for each HTTP request.  Default: 30_000.
   */
  timeoutMs?: number;
}

export interface ScanOptions {
  context?: ScanContext;
  contentType?: ContentType;
  sanitize?: boolean;
  jobId?: string;
  /** If supplied, overrides the SDK's auto-linked prev_receipt_hash */
  prevReceiptHash?: string;
}
