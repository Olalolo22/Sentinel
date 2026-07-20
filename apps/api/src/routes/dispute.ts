import { Context } from "hono";
import { getReceipt, submitDispute, getDispute, approveDisputeStatus } from "../db/db.js";
import { stage4Retrospection } from "../pipeline/stage4_retrospection.js";

export async function createDispute(c: Context) {
  try {
    const body = await c.req.json();
    const { verdict_hash, claimant_actor_id, evidence_url, raw_content } = body;

    if (!verdict_hash || !claimant_actor_id || !raw_content) {
      return c.json({ error: "Missing 'verdict_hash', 'claimant_actor_id', or 'raw_content'" }, 400);
    }

    const receipt = await getReceipt(verdict_hash);
    if (!receipt) {
      return c.json({ error: "Receipt not found" }, 404);
    }

    if (receipt.action !== "allow") {
      return c.json({ error: "Disputes can only be filed for 'allow' receipts" }, 400);
    }

    const existingDispute = await getDispute(verdict_hash);
    if (existingDispute) {
      return c.json({ error: "Dispute already exists for this verdict_hash" }, 409);
    }

    await submitDispute(verdict_hash, claimant_actor_id, evidence_url || null, raw_content);

    return c.json({
      success: true,
      verdict_hash,
      status: "open",
      message: "Dispute successfully filed."
    }, 201);
  } catch (error: any) {
    console.error("Dispute Creation Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

export async function checkDispute(c: Context) {
  const verdict_hash = c.req.param("verdict_hash")!;
  try {
    const dispute = await getDispute(verdict_hash);
    if (!dispute) {
      return c.json({ error: "Dispute not found" }, 404);
    }
    return c.json(dispute);
  } catch (error: any) {
    console.error("Dispute Check Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

export async function approveDispute(c: Context) {
  const verdict_hash = c.req.param("verdict_hash")!;
  try {
    const dispute = await getDispute(verdict_hash);
    if (!dispute) {
      return c.json({ error: "Dispute not found" }, 404);
    }

    if (dispute.status === "approved") {
      return c.json({ error: "Dispute already approved" }, 400);
    }

    // Step 1: Approve the dispute in DB
    await approveDisputeStatus(verdict_hash);

    // Step 2: Trigger Stage 4 Retrospection Immune System asynchronously
    if (dispute.raw_content) {
      stage4Retrospection(dispute.raw_content, verdict_hash).catch(console.error);
    }

    return c.json({
      success: true,
      verdict_hash,
      status: "approved",
      message: "Dispute approved. Stage 4 Retrospection triggered."
    });
  } catch (error: any) {
    console.error("Dispute Approve Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
}
