import pg from "pg";

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sentinel",
});

export async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS receipts (
      id SERIAL PRIMARY KEY,
      verdict_hash VARCHAR(255) UNIQUE NOT NULL,
      content_sha256 VARCHAR(255) NOT NULL,
      job_id VARCHAR(255),
      prev_receipt_hash VARCHAR(255),
      actor_id VARCHAR(255) NOT NULL,
      action VARCHAR(50) NOT NULL,
      risk_score INTEGER NOT NULL,
      confidence DOUBLE PRECISION NOT NULL,
      threats JSONB NOT NULL DEFAULT '[]'::jsonb,
      model_version VARCHAR(100),
      rules_version VARCHAR(100),
      signature TEXT NOT NULL,
      bond_ref VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS billing (
      actor_id VARCHAR(255) PRIMARY KEY,
      scans_used INTEGER DEFAULT 1
    );
  `);
  console.log("DB Initialized");
}

export async function incrementBilling(actor_id: string): Promise<number> {
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
  try {
    const res = await db.query(`SELECT COUNT(*) as count FROM receipts WHERE content_sha256 = $1`, [content_sha256]);
    return parseInt(res.rows[0].count, 10);
  } catch (e) {
    return 0; // fail safe
  }
}

export async function insertReceipt(receipt: any) {
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
  await db.query(query, values);
}

export async function getReceipt(verdict_hash: string) {
  try {
    const result = await db.query(`SELECT * FROM receipts WHERE verdict_hash = $1`, [verdict_hash]);
    return result.rows[0];
  } catch (e) {
    console.error("DB getReceipt Error:", e);
    return null;
  }
}

export async function getChain(job_id: string) {
  try {
    const result = await db.query(`SELECT * FROM receipts WHERE job_id = $1 ORDER BY created_at ASC`, [job_id]);
    return result.rows;
  } catch (e) {
    console.error("DB getChain Error:", e);
    return [];
  }
}
