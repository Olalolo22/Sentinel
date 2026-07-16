import { Context } from "hono";
import crypto from "crypto";
import { normalize, decodeReportStrings } from "../pipeline/stage0_normalize.js";
import { stage1Heuristics } from "../pipeline/stage1_heuristics.js";
import { stage2Judge, JudgeResponse } from "../pipeline/stage2_judge.js";
import { stage3Assemble } from "../pipeline/stage3_assemble.js";
import { signReceipt } from "../receipts/signing.js";
import { insertReceipt, incrementBilling, getSeenCount } from "../db/db.js";
import { getRedis } from "../cache/redis.js";

export async function batchScan(c: Context) {
  try {
    const body = await c.req.json();
    if (!Array.isArray(body)) {
      return c.json({ error: "Expected an array of payloads" }, 400);
    }
    
    // Process sequentially for simplicity, or parallelize with Promise.all
    const results = await Promise.all(body.map(async (item) => {
      try {
        const { content, content_type = "text", context = "generic", job_id, prev_receipt_hash, actor_id = "unknown_actor" } = item;

        if (!content) {
          return { error: "Missing 'content' field" };
        }

        // Increment billing counter for actor
        await incrementBilling(actor_id);

        // Hash raw content
        const content_sha256 = crypto.createHash("sha256").update(content).digest("hex");
        const seen_count = await getSeenCount(content_sha256);

        // Stage 0 - Normalize
        const { canonical, decodeReport } = normalize(content, content_type);
        const decodeReportStrs = decodeReportStrings(decodeReport);

        // Stage 1 - Heuristics
        const stage1 = stage1Heuristics(canonical);

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
            } catch (e) {}
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
              } catch (e) {}
            }
          }
        }

        // Stage 3 - Assemble
        const decision = stage3Assemble(content, stage1, stage2, job_id, prev_receipt_hash, actor_id);
        
        decision.trust_receipt.content_sha256 = content_sha256;
        decision.decode_report = decodeReportStrs;
        decision.seen_count = seen_count;

        // Sign Receipt
        const { signature, payloadHash } = signReceipt(decision.trust_receipt);
        
        const finalDecision = {
          ...decision,
          trust_receipt: {
            ...decision.trust_receipt,
            verdict_hash: payloadHash,
            signature
          }
        };

        // Store in DB
        try {
          await insertReceipt(finalDecision.trust_receipt);
        } catch (e) {}

        return finalDecision;
      } catch (e: any) {
        return { error: "Item processing failed", message: e?.message };
      }
    }));

    return c.json(results);
  } catch (error: any) {
    console.error("Batch Scan Error:", error);
    return c.json({ error: "Internal Server Error", message: error?.message }, 500);
  }
}
