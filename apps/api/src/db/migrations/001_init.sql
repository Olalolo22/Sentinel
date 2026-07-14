CREATE TABLE IF NOT EXISTS receipts (
  id                BIGSERIAL,
  verdict_hash      TEXT PRIMARY KEY,
  content_sha256    TEXT NOT NULL,
  job_id            TEXT,
  prev_receipt_hash TEXT,
  actor_id          TEXT NOT NULL,
  action            TEXT NOT NULL CHECK (action IN ('allow','review','reject','hold_escrow')),
  risk_score        INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  confidence        DOUBLE PRECISION NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  threats           JSONB NOT NULL DEFAULT '[]',
  model_version     TEXT NOT NULL,
  rules_version     TEXT NOT NULL,
  signature         TEXT NOT NULL,
  bond_ref          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS receipts_job_id_idx ON receipts (job_id, created_at) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS receipts_actor_idx ON receipts (actor_id, created_at);

CREATE TABLE IF NOT EXISTS billing (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    TEXT NOT NULL,
  endpoint    TEXT NOT NULL,
  amount_usdt NUMERIC(12,6) NOT NULL DEFAULT 0,
  cached      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_actor_idx ON billing (actor_id, created_at);

DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open','approved','denied','escalated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS disputes (
  id                 BIGSERIAL PRIMARY KEY,
  verdict_hash       TEXT NOT NULL REFERENCES receipts(verdict_hash),
  claimant_actor_id  TEXT NOT NULL,
  evidence_url       TEXT,
  status             dispute_status NOT NULL DEFAULT 'open',
  payout_usdt        NUMERIC(12,6),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at        TIMESTAMPTZ
);
