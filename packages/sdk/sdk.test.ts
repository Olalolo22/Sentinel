/**
 * @sentinel/sdk — test suite
 *
 * Tests cover:
 *   1. verifyReceiptLocal — signature validation logic
 *   2. Sentinel.scan() — happy path + chain auto-linking
 *   3. Sentinel.verifyBeforeSettlement() — throws on non-allow
 *   4. Sentinel.getChain()
 *   5. SentinelBlocked error shape
 *   6. SentinelUnreachable on network failure
 *   7. restoreChainMap / getChainMap round-trip
 *
 * Uses vitest's built-in fetch mock (no real network calls).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash, generateKeyPairSync, sign as cryptoSign } from "crypto";
import stableStringify from "./src/stable-stringify.ts";
import { verifyReceiptLocal } from "./src/verify.ts";
import { Sentinel } from "./src/client.ts";
import { SentinelBlocked, SentinelUnreachable, SentinelInvalidSignature } from "./src/errors.ts";
import type { TrustReceipt, Decision, Chain } from "./src/types.ts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReceipt(overrides: Partial<TrustReceipt> = {}): TrustReceipt {
  return {
    content_sha256: "abc123",
    verdict_hash: "vh_001",
    actor_id: "erc8004:xlayer:0xDEAD",
    job_id: "job_test",
    prev_receipt_hash: null,
    model_version: "gemini-1.5-pro",
    rules_version: "1.0.0",
    timestamp: 1752300000,
    action: "allow",
    signature: "ed25519:PLACEHOLDER",
    bond_ref: null,
    ...overrides,
  };
}

function signReceipt(receipt: TrustReceipt, privKey: ReturnType<typeof generateKeyPairSync>["privateKey"]) {
  const { signature: _sig, verdict_hash: _vh, ...without } = receipt as any;
  const canon = stableStringify(without);
  const payloadHash = createHash("sha256").update(canon).digest("hex");
  const sigBuf = cryptoSign(null, Buffer.from(payloadHash, "utf8"), privKey);
  return `ed25519:${sigBuf.toString("base64")}`;
}

function makeDecision(action: Decision["action"] = "allow"): Decision {
  const receipt = makeReceipt({ action });
  return {
    action,
    risk_score: action === "allow" ? 5 : 85,
    confidence: 0.97,
    requires_human: false,
    reason: "test",
    threats: [],
    sanitized_content: null,
    decode_report: [],
    seen_count: 1,
    trust_receipt: receipt,
    billing: { cached: false, charged: "0.05 USDT" },
  };
}

// ─── 1. verifyReceiptLocal ────────────────────────────────────────────────────

describe("verifyReceiptLocal", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const pubKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

  it("returns true for a correctly signed receipt", () => {
    const receipt = makeReceipt();
    receipt.signature = signReceipt(receipt, privateKey);
    expect(verifyReceiptLocal(receipt, pubKeyPem)).toBe(true);
  });

  it("throws SentinelInvalidSignature for a tampered receipt", () => {
    const receipt = makeReceipt();
    receipt.signature = signReceipt(receipt, privateKey);
    // Tamper after signing
    (receipt as any).action = "reject";
    expect(() => verifyReceiptLocal(receipt, pubKeyPem)).toThrow(SentinelInvalidSignature);
  });

  it("throws SentinelInvalidSignature for a bad signature prefix", () => {
    const receipt = makeReceipt({ signature: "bad:notvalid" });
    expect(() => verifyReceiptLocal(receipt, pubKeyPem)).toThrow(SentinelInvalidSignature);
  });

  it("throws SentinelInvalidSignature for garbage base64", () => {
    const receipt = makeReceipt({ signature: "ed25519:!!!notbase64!!!" });
    expect(() => verifyReceiptLocal(receipt, pubKeyPem)).toThrow(SentinelInvalidSignature);
  });
});

// ─── 2. Sentinel.scan() ───────────────────────────────────────────────────────

describe("Sentinel.scan()", () => {
  let sentinel: Sentinel;

  beforeEach(() => {
    sentinel = new Sentinel({ actorId: "erc8004:xlayer:0xTEST" });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("POSTs to /v1/scan and returns the decision", async () => {
    const mockDecision = makeDecision("allow");
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(mockDecision), { status: 200 })
    );

    const result = await sentinel.scan("hello world", { context: "generic" });
    expect(result.action).toBe("allow");
    expect(result.trust_receipt.verdict_hash).toBe("vh_001");

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/scan");
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.content).toBe("hello world");
    expect(sentBody.actor_id).toBe("erc8004:xlayer:0xTEST");
  });

  it("auto-links prev_receipt_hash for subsequent scans on the same jobId", async () => {
    const first = makeDecision("allow");
    const second = makeDecision("allow");
    second.trust_receipt.verdict_hash = "vh_002";
    second.trust_receipt.prev_receipt_hash = "vh_001";

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(new Response(JSON.stringify(first), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(second), { status: 200 }));

    await sentinel.scan("step 1", { jobId: "job_99" });
    await sentinel.scan("step 2", { jobId: "job_99" });

    const [, secondInit] = (fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit];
    const secondBody = JSON.parse(secondInit.body as string);
    expect(secondBody.prev_receipt_hash).toBe("vh_001");
  });

  it("throws SentinelUnreachable when fetch throws (network error)", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError("ECONNREFUSED"));
    await expect(sentinel.scan("test")).rejects.toThrow(SentinelUnreachable);
  });

  it("throws SentinelUnreachable on non-2xx response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "rate limited" }), { status: 429 })
    );
    await expect(sentinel.scan("test")).rejects.toThrow(SentinelUnreachable);
  });
});

// ─── 3. Sentinel.verifyBeforeSettlement() ────────────────────────────────────

describe("Sentinel.verifyBeforeSettlement()", () => {
  let sentinel: Sentinel;

  beforeEach(() => {
    sentinel = new Sentinel({ actorId: "erc8004:xlayer:0xBUYER" });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns the decision when action is allow", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeDecision("allow")), { status: 200 })
    );
    const decision = await sentinel.verifyBeforeSettlement("job_1", "clean content");
    expect(decision.action).toBe("allow");
  });

  it("throws SentinelBlocked when action is reject", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeDecision("reject")), { status: 200 })
    );
    await expect(
      sentinel.verifyBeforeSettlement("job_1", "malicious content")
    ).rejects.toThrow(SentinelBlocked);
  });

  it("throws SentinelBlocked when action is review", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeDecision("review")), { status: 200 })
    );
    await expect(
      sentinel.verifyBeforeSettlement("job_1", "ambiguous content")
    ).rejects.toThrow(SentinelBlocked);
  });

  it("throws SentinelBlocked when action is hold_escrow", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeDecision("hold_escrow")), { status: 200 })
    );
    await expect(
      sentinel.verifyBeforeSettlement("job_1", "suspicious content")
    ).rejects.toThrow(SentinelBlocked);
  });

  it("sets context=deliverable on the request", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeDecision("allow")), { status: 200 })
    );
    await sentinel.verifyBeforeSettlement("job_1", "content");
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.context).toBe("deliverable");
    expect(body.job_id).toBe("job_1");
  });
});

// ─── 4. Sentinel.getChain() ───────────────────────────────────────────────────

describe("Sentinel.getChain()", () => {
  let sentinel: Sentinel;

  beforeEach(() => {
    sentinel = new Sentinel({ actorId: "erc8004:xlayer:0xAGENT" });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("GETs /v1/chain/{jobId} and returns the chain", async () => {
    const mockChain: Chain = {
      job_id: "job_xyz",
      chain: [],
      chain_head_hash: "head_hash_abc",
      overall_valid: true,
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(mockChain), { status: 200 })
    );

    const chain = await sentinel.getChain("job_xyz");
    expect(chain.job_id).toBe("job_xyz");
    expect(chain.overall_valid).toBe(true);

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(url).toContain("/v1/chain/job_xyz");
  });
});

// ─── 5. SentinelBlocked error shape ──────────────────────────────────────────

describe("SentinelBlocked", () => {
  it("exposes action, risk_score, and verdict_hash", () => {
    const decision = makeDecision("reject");
    const err = new SentinelBlocked(decision);
    expect(err.action).toBe("reject");
    expect(err.risk_score).toBe(85);
    expect(err.verdict_hash).toBe("vh_001");
    expect(err instanceof SentinelBlocked).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

// ─── 6. Chain map persistence round-trip ─────────────────────────────────────

describe("getChainMap / restoreChainMap", () => {
  it("snapshots and restores the chain map", () => {
    const sentinel = new Sentinel({ actorId: "erc8004:xlayer:0xAGENT" });
    // Inject state directly via restore
    sentinel.restoreChainMap({ job_a: "hash_a", job_b: "hash_b" });
    const snap = sentinel.getChainMap();
    expect(snap).toEqual({ job_a: "hash_a", job_b: "hash_b" });
  });
});
