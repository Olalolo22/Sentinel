ALTER TABLE receipts ADD COLUMN IF NOT EXISTS job_id TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS prev_receipt_hash TEXT;
CREATE INDEX IF NOT EXISTS receipts_job_id_idx ON receipts (job_id, created_at) WHERE job_id IS NOT NULL;
