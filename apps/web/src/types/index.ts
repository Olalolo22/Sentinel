export type DecisionAction = "allow" | "review" | "reject";

export interface TrustReceipt {
  version: string;
  timestamp: string;
  job_id: string;
  prev_receipt_hash: string | null;
  actor_id: string;
  content_sha256: string;
  verdict: {
    action: DecisionAction;
    risk_score: number;
    confidence: number;
    flags: string[];
    threat_category: string | null;
  };
  stage_summary: {
    stage0_normalized: boolean;
    stage1_short_circuit: boolean;
    stage2_llm_used: boolean;
  };
  verdict_hash?: string;
  signature?: string;
}

export interface DecodeReportItem {
  type: string;
  detail: string;
}

export interface ScanResponse {
  trust_receipt: TrustReceipt;
  decode_report: string[];
  seen_count: number;
  reason?: string;
  stage1_hits?: string[];
  stage2_analysis?: {
    risk_score: number;
    confidence: number;
    flags: string[];
    threat_category: string | null;
    reasoning: string;
  } | null;
}

export interface DisputeRecord {
  verdict_hash: string;
  status: "pending" | "approved" | "rejected";
  raw_content: string;
  evidence_url?: string;
  created_at: string;
  slashed_amount_okb?: number;
}

export interface ChainHop {
  job_id: string;
  step: number;
  actor_id: string;
  verdict_hash: string;
  action: DecisionAction;
  risk_score: number;
  timestamp: string;
  prev_receipt_hash: string | null;
  valid: boolean;
}

export interface PresetPayload {
  id: string;
  name: string;
  category: "Prompt Injection" | "Tag Smuggling" | "Data Exfiltration" | "Wallet Redirect" | "Clean Spec";
  description: string;
  content: string;
  context: string;
}
