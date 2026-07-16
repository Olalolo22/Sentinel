import { Context } from "hono";
import { getChain } from "../db/db.js";

export async function chain(c: Context) {
  const job_id = c.req.param("job_id")!;
  
  try {
    const receipts = await getChain(job_id);
    if (!receipts || receipts.length === 0) {
      return c.json({ error: "No chain found for this job_id" }, 404);
    }

    let overall_valid = true;
    const chainLinks = [];

    for (let i = 0; i < receipts.length; i++) {
      const current = receipts[i];
      let link_valid = true;

      // Check hash-link validity
      if (i > 0) {
        const prev = receipts[i - 1];
        if (current.prev_receipt_hash !== prev.verdict_hash) {
          link_valid = false;
          overall_valid = false;
        }
      } else {
        // First item shouldn't have a prev hash (or if it does, it links to an unknown parent)
        if (current.prev_receipt_hash) {
          link_valid = false;
          overall_valid = false;
        }
      }

      chainLinks.push({
        receipt: current,
        valid_link: link_valid
      });
    }

    return c.json({
      job_id,
      chain: chainLinks,
      chain_head_hash: receipts[receipts.length - 1].verdict_hash,
      overall_valid
    });
  } catch (error: any) {
    console.error("Chain Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
}
