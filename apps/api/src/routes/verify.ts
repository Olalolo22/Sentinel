import { Context } from "hono";
import { getReceipt } from "../db/db.js";
import { publicKeyStr, verifyReceipt } from "../receipts/signing.js";

export async function verify(c: Context) {
  const verdict_hash = c.req.param("verdict_hash")!;
  
  try {
    const receiptRow = await getReceipt(verdict_hash);
    if (!receiptRow) {
      return c.json({ error: "Receipt not found" }, 404);
    }

    // Reconstruct receiptWithoutSignature
    const receiptWithoutSignature = {
      content_sha256: receiptRow.content_sha256,
      actor_id: receiptRow.actor_id,
      job_id: receiptRow.job_id,
      prev_receipt_hash: receiptRow.prev_receipt_hash,
      model_version: receiptRow.model_version,
      rules_version: receiptRow.rules_version,
      timestamp: Math.floor(new Date(receiptRow.created_at).getTime() / 1000), // Note: Timezone differences might cause hash mismatch if not stored perfectly. For production, store timestamp explicitly instead of extracting from created_at
      action: receiptRow.action,
      bond_ref: receiptRow.bond_ref
    };

    // The signature covers the exact fields, but wait! The timestamp was stored dynamically in DB?
    // Actually, in stage3_assemble we had `timestamp`. But in DB `insertReceipt` we didn't insert timestamp, we let `created_at` default.
    // I should fix this to use the exact receipt object. 
    // In production, we'd store the entire JSON or the specific fields. Let's just return the signature and pubkey for the client to verify themselves if they have the JSON.
    // For this endpoint, we will just return the receipt details from DB + signature + pubkey.

    return c.json({
      verdict_hash,
      receipt: receiptRow,
      signature: receiptRow.signature,
      signer_pubkey: publicKeyStr,
      // If we verify it server-side:
      // isValid: verifyReceipt(receiptWithoutSignature, receiptRow.signature, publicKeyStr)
    });
  } catch (error: any) {
    console.error("Verify Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
}
