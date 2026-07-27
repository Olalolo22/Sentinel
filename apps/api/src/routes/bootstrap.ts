import { Context } from "hono";
import crypto from "crypto";
import { normalize, decodeReportStrings } from "../pipeline/stage0_normalize.js";
import { stage1Heuristics } from "../pipeline/stage1_heuristics.js";
import { stage2Judge, JudgeResponse } from "../pipeline/stage2_judge.js";
import { stage3Assemble } from "../pipeline/stage3_assemble.js";
import { signReceipt } from "../receipts/signing.js";
import { insertReceipt, incrementBilling, getSeenCount } from "../db/db.js";
import { getRedis } from "../cache/redis.js";

/**
 * OKX A2MCP Bootstrap Trust Route
 * Endpoint path: /v1/bootstrap-trust (also mounted on /v1/a2mcp/bootstrap-trust and /v1/a2mcp/scan)
 * Service type: A2MCP
 * Payment protocol: OKX Agent Payments Protocol (x402)
 *
 * Runs Sentinel's full 4-stage cryptographic scan pipeline and returns an OKX A2MCP-compliant response
 * containing the verdict, pipeline breakdown, and Ed25519 signed trust receipt.
 */
export async function bootstrapTrust(c: Context) {
  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }

    // Flexible payload extractor — handles content, prompt, message, input, or action
    const content =
      body.content ||
      body.prompt ||
      body.message ||
      body.input ||
      (typeof body.action === "string" ? body.action : JSON.stringify(body.action || {})) ||
      "OKX A2MCP Bootstrap Trust Check";

    const content_type = body.content_type || "text";
    const context = body.context || "okx_a2mcp_bootstrap";
    const job_id = body.job_id || `okx_job_${Date.now().toString(36)}`;
    const prev_receipt_hash = body.prev_receipt_hash || null;
    const actor_id = body.actor_id || body.agent_id || "okx_a2mcp_caller";

    // Track actor billing
    await incrementBilling(actor_id);

    // Hash raw content
    const content_sha256 = crypto.createHash("sha256").update(content).digest("hex");
    const seen_count = await getSeenCount(content_sha256);

    // Stage 0 - Normalize
    const { canonical, decodeReport } = normalize(content, content_type);
    const decodeReportStrs = decodeReportStrings(decodeReport);

    // Stage 1 - Heuristics
    const stage1 = await stage1Heuristics(canonical);

    // Stage 2 - Judge
    let stage2: JudgeResponse | null = null;
    if (!stage1.shouldShortCircuit) {
      const cacheKey = `llm_judge:${content_sha256}:${context}`;
      let redis = null;

      try {
        if (process.env.REDIS_URL) redis = getRedis();
      } catch (e) {}

      let cachedStr = null;
      if (redis) {
        try {
          cachedStr = await redis.get(cacheKey);
        } catch (e) {
          console.error("Redis Cache Error:", e);
        }
      }

      if (cachedStr) {
        try {
          stage2 = JSON.parse(cachedStr);
        } catch (e) {}
      }

      if (!stage2) {
        stage2 = await stage2Judge(content, canonical, decodeReportStrs, context);
        if (redis) {
          try {
            await redis.setex(cacheKey, 86400, JSON.stringify(stage2));
          } catch (e) {
            console.error("Redis Set Error:", e);
          }
        }
      }
    }

    // Stage 3 - Assemble Decision
    const decision = stage3Assemble(content, stage1, stage2, job_id, prev_receipt_hash, actor_id);

    // Attach computed sha256
    decision.trust_receipt.content_sha256 = content_sha256;

    // Sign Receipt with Sentinel's Ed25519 key
    const { signature, payloadHash } = signReceipt(decision.trust_receipt);

    const action = decision.action;
    const riskScore = decision.risk_score / 100; // normalize 0-1
    const confidence = decision.confidence;
    const threats = decision.threats || [];
    const flags = threats.map((t: any) => (typeof t === "string" ? t : t.type || "HEURISTIC_THREAT"));
    const threat_category =
      threats.length > 0
        ? typeof threats[0] === "string"
          ? threats[0]
          : threats[0].type || "T1: Direct System Prompt Injection"
        : null;

    const trust_receipt = {
      ...decision.trust_receipt,
      verdict: {
        action,
        risk_score: riskScore,
        confidence,
        flags,
        threat_category,
      },
      verdict_hash: payloadHash,
      signature,
    };

    // Store receipt in DB
    try {
      await insertReceipt(trust_receipt);
    } catch (e) {
      console.error("DB Insert Error:", e);
    }

    // OKX A2MCP Standard Response Format
    const a2mcpResponse = {
      service: "Sentinel Trust Layer",
      service_type: "A2MCP",
      status: action === "reject" ? "REJECTED" : action === "review" || action === "hold_escrow" ? "REVIEW" : "APPROVED",
      payment: {
        protocol: "x402",
        network: "eip155:196", // X Layer mainnet
        scheme: "exact",
        amount: "0.05 USDT",
        payTo: process.env.SENTINEL_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000",
      },
      verdict: {
        action,
        risk_score: riskScore,
        confidence,
        flags,
        threat_category,
        reason: decision.reason,
      },
      trust_receipt,
      pipeline_summary: {
        stage0_normalized: true,
        stage1_short_circuit: stage1.shouldShortCircuit,
        stage2_llm_used: !stage1.shouldShortCircuit,
      },
      decode_report: decodeReportStrs,
      seen_count,
    };

    return c.json(a2mcpResponse);
  } catch (error: any) {
    console.error("A2MCP Bootstrap Error:", error);
    return c.json({ error: "Internal Server Error", message: error?.message }, 500);
  }
}

/**
 * GET Handler for OKX A2MCP Bootstrap Trust Endpoint
 * Responds to automated quotes and service status probes (e.g. `onchainos payment quote`)
 */
export async function bootstrapTrustInfo(c: Context) {
  return c.json({
    service: "Sentinel Trust Layer",
    service_type: "A2MCP",
    status: "ACTIVE",
    endpoint: "/v1/bootstrap-trust",
    method: "POST",
    payment: {
      protocol: "x402",
      network: "eip155:196", // X Layer mainnet
      scheme: "exact",
      amount: "0.05 USDT",
      payTo: process.env.SENTINEL_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000",
    },
    description: "OKX A2MCP bootstrap trust verification running Sentinel's 4-stage cryptographic threat detection pipeline.",
    usage: "Send HTTP POST with JSON payload containing 'content', 'prompt', 'message', or 'input'.",
  });
}

