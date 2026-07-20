import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../app.js";

// Mock the db module
vi.mock("../db/db.js", () => {
  const receipts = new Map();
  const disputes = new Map();
  return {
    getReceipt: vi.fn(async (hash: string) => receipts.get(hash)),
    submitDispute: vi.fn(async (hash: string, actor: string, url: string) => {
      disputes.set(hash, {
        verdict_hash: hash,
        claimant_actor_id: actor,
        evidence_url: url,
        status: "open"
      });
    }),
    getDispute: vi.fn(async (hash: string) => disputes.get(hash)),
    approveDisputeStatus: vi.fn(),
    insertDynamicRule: vi.fn(),
    incrementBilling: vi.fn(),
    getSeenCount: vi.fn(),
    insertReceipt: vi.fn(),
    getChain: vi.fn()
  };
});

import { getReceipt, submitDispute, getDispute, approveDisputeStatus } from "../db/db.js";

describe("Dispute API", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /v1/dispute requires verdict_hash, claimant_actor_id, and raw_content", async () => {
    const res = await app.request("/v1/dispute", {
      method: "POST",
      body: JSON.stringify({ verdict_hash: "hash", claimant_actor_id: "actor" }) // missing raw_content
    });
    expect(res.status).toBe(400);
  });

  it("POST /v1/dispute fails if receipt not found", async () => {
    vi.mocked(getReceipt).mockResolvedValueOnce(null);
    const res = await app.request("/v1/dispute", {
      method: "POST",
      body: JSON.stringify({ verdict_hash: "hash", claimant_actor_id: "actor", raw_content: "attack payload" })
    });
    expect(res.status).toBe(404);
  });

  it("POST /v1/dispute fails if receipt was not an allow", async () => {
    vi.mocked(getReceipt).mockResolvedValueOnce({ action: "reject" });
    const res = await app.request("/v1/dispute", {
      method: "POST",
      body: JSON.stringify({ verdict_hash: "hash", claimant_actor_id: "actor", raw_content: "attack payload" })
    });
    expect(res.status).toBe(400);
  });

  it("POST /v1/dispute succeeds and creates dispute", async () => {
    vi.mocked(getReceipt).mockResolvedValueOnce({ action: "allow" });
    vi.mocked(getDispute).mockResolvedValueOnce(null);

    const res = await app.request("/v1/dispute", {
      method: "POST",
      body: JSON.stringify({ verdict_hash: "hash_allow", claimant_actor_id: "actor123", raw_content: "attack payload" })
    });
    
    expect(res.status).toBe(201);
    expect(submitDispute).toHaveBeenCalledWith("hash_allow", "actor123", null, "attack payload");
  });

  it("POST /v1/dispute/:verdict_hash/approve succeeds", async () => {
    vi.mocked(getDispute).mockResolvedValueOnce({ status: "open", verdict_hash: "hash", raw_content: "attack" });
    const res = await app.request("/v1/dispute/hash/approve", { method: "POST" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("approved");
  });
});
