ALTER TABLE disputes ADD COLUMN IF NOT EXISTS raw_content TEXT;

CREATE TABLE IF NOT EXISTS dynamic_rules (
  id          BIGSERIAL PRIMARY KEY,
  regex       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
