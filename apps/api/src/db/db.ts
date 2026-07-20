import pg from "pg";

let useMemoryOnly = false;
let db: pg.Pool | null = null;

// Memory storage fallbacks
const memoryReceipts = new Map<string, any>();
const memoryBilling = new Map<string, number>();
const memoryDisputes = new Map<string, any>();
const memoryDynamicRules: any[] = [];

try {
  if (process.env.DATABASE_URL) {
    db = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    // Fire-and-forget test connection
    db.query("SELECT 1").catch(() => {
      console.warn("[db] Postgres connection failed. Falling back to memory-only mode.");
      useMemoryOnly = true;
    });
  } else {
    useMemoryOnly = true;
  }
} catch (e) {
  useMemoryOnly = true;
}

export async function incrementBilling(actor_id: string): Promise<number> {
  if (useMemoryOnly || !db) {
    const current = memoryBilling.get(actor_id) || 0;
    const next = current + 1;
    memoryBilling.set(actor_id, next);
    return next;
  }

  const query = `
    INSERT INTO billing (actor_id, scans_used) 
    VALUES ($1, 1) 
    ON CONFLICT (actor_id) 
    DO UPDATE SET scans_used = billing.scans_used + 1 
    RETURNING scans_used
  `;
  try {
    const res = await db.query(query, [actor_id]);
    return res.rows[0].scans_used;
  } catch (e) {
    return 1; // fail safe
  }
}

export async function getSeenCount(content_sha256: string): Promise<number> {
  if (useMemoryOnly || !db) {
    let count = 0;
    for (const receipt of memoryReceipts.values()) {
      if (receipt.content_sha256 === content_sha256) count++;
    }
    return count;
  }

  try {
    const res = await db.query(`SELECT COUNT(*) as count FROM receipts WHERE content_sha256 = $1`, [content_sha256]);
    return parseInt(res.rows[0].count, 10);
  } catch (e) {
    return 0; // fail safe
  }
}

export async function insertReceipt(receipt: any) {
  if (useMemoryOnly || !db) {
    receipt.created_at = new Date().toISOString();
    memoryReceipts.set(receipt.verdict_hash, receipt);
    return;
  }

  const query = `
    INSERT INTO receipts (
      verdict_hash, content_sha256, job_id, prev_receipt_hash, actor_id, action,
      risk_score, confidence, threats, model_version, rules_version, signature, bond_ref
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;
  const values = [
    receipt.verdict_hash,
    receipt.content_sha256,
    receipt.job_id,
    receipt.prev_receipt_hash,
    receipt.actor_id,
    receipt.action,
    receipt.risk_score,
    receipt.confidence,
    JSON.stringify(receipt.threats || []),
    receipt.model_version,
    receipt.rules_version,
    receipt.signature,
    receipt.bond_ref
  ];
  try {
    await db.query(query, values);
  } catch (e) {
    // Silent fail -> allows pipeline to continue without DB
    console.error("DB Insert Error:", e);
  }
}

export async function getReceipt(verdict_hash: string) {
  if (useMemoryOnly || !db) {
    return memoryReceipts.get(verdict_hash) || null;
  }

  try {
    const result = await db.query(`SELECT * FROM receipts WHERE verdict_hash = $1`, [verdict_hash]);
    return result.rows[0];
  } catch (e) {
    console.error("DB getReceipt Error:", e);
    return null;
  }
}

export async function getChain(job_id: string) {
  if (useMemoryOnly || !db) {
    const chain: any[] = [];
    for (const receipt of memoryReceipts.values()) {
      if (receipt.job_id === job_id) {
        chain.push(receipt);
      }
    }
    // Sort by created_at implicitly relies on Map insertion order, but we can sort manually
    return chain.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  try {
    const result = await db.query(`SELECT * FROM receipts WHERE job_id = $1 ORDER BY created_at ASC`, [job_id]);
    return result.rows;
  } catch (e) {
    console.error("DB getChain Error:", e);
    return [];
  }
}

export async function submitDispute(verdict_hash: string, claimant_actor_id: string, evidence_url: string | null, raw_content: string | null = null) {
  if (useMemoryOnly || !db) {
    memoryDisputes.set(verdict_hash, {
      verdict_hash,
      claimant_actor_id,
      evidence_url,
      raw_content,
      status: 'open',
      created_at: new Date().toISOString()
    });
    return;
  }

  const query = `
    INSERT INTO disputes (verdict_hash, claimant_actor_id, evidence_url, raw_content, status)
    VALUES ($1, $2, $3, $4, 'open')
  `;
  try {
    await db.query(query, [verdict_hash, claimant_actor_id, evidence_url, raw_content]);
  } catch (e) {
    console.error("DB submitDispute Error:", e);
    throw e;
  }
}

export async function getDispute(verdict_hash: string) {
  if (useMemoryOnly || !db) {
    return memoryDisputes.get(verdict_hash) || null;
  }

  try {
    const result = await db.query(`SELECT * FROM disputes WHERE verdict_hash = $1`, [verdict_hash]);
    return result.rows[0] || null;
  } catch (e) {
    console.error("DB getDispute Error:", e);
    return null;
  }
}

export async function approveDisputeStatus(verdict_hash: string) {
  if (useMemoryOnly || !db) {
    const disp = memoryDisputes.get(verdict_hash);
    if (disp) {
      disp.status = 'approved';
      disp.resolved_at = new Date().toISOString();
    }
    return;
  }

  try {
    await db.query(`UPDATE disputes SET status = 'approved', resolved_at = now() WHERE verdict_hash = $1`, [verdict_hash]);
  } catch (e) {
    console.error("DB approveDisputeStatus Error:", e);
    throw e;
  }
}

export async function insertDynamicRule(regex: string, description: string) {
  if (useMemoryOnly || !db) {
    memoryDynamicRules.push({ regex, description });
    return;
  }

  try {
    await db.query(`INSERT INTO dynamic_rules (regex, description) VALUES ($1, $2)`, [regex, description]);
  } catch (e) {
    console.error("DB insertDynamicRule Error:", e);
    throw e;
  }
}

export async function getDynamicRules(): Promise<any[]> {
  if (useMemoryOnly || !db) {
    return memoryDynamicRules;
  }

  try {
    const result = await db.query(`SELECT regex, description FROM dynamic_rules`);
    return result.rows;
  } catch (e) {
    console.error("DB getDynamicRules Error:", e);
    return [];
  }
}
