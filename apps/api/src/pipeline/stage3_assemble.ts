import { JudgeResponse } from "./stage2_judge.js";
import { signReceipt } from "../receipts/signing.js";
import { RULES_VERSION } from "@sentinel/rules";

export type Stage1Result = {
  score: number;
  matches: string[];
  shouldShortCircuit: boolean;
};

export function stage3Assemble(
  rawText: string,
  stage1: Stage1Result,
  stage2: JudgeResponse | null, // null if short-circuited
  jobId?: string,
  prevReceiptHash?: string,
  actorId: string = "unknown_actor"
) {
  let finalScore = stage1.score;
  let finalConfidence = 1.0;
  let finalThreats: any[] = [];
  let finalReason = "No threats found";

  if (stage2) {
    // Merge scores (heuristic + judge)
    finalScore = Math.max(stage1.score, stage2.risk_score);
    finalConfidence = stage2.confidence;
    finalThreats = stage2.threats;
    finalReason = stage2.reason;
  } else if (stage1.shouldShortCircuit) {
    finalReason = "Short-circuited due to high heuristic threat score.";
    finalThreats = stage1.matches.map(m => ({ type: m, severity: "critical", span: [0, 0], excerpt: "", rationale: "Matched heuristic rule" }));
  }

  let action = "allow";
  if (finalScore >= 90) {
    action = "reject";
  } else if (finalScore >= 60 || finalConfidence <= 0.65) {
    action = "review";
  } else if (finalScore >= 40) {
    action = "hold_escrow";
  }

  const requiresHuman = action === "review";

  const timestamp = Math.floor(Date.now() / 1000);

  const receiptWithoutSignature = {
    content_sha256: "computed_in_route", // Will be replaced in the route
    actor_id: actorId,
    job_id: jobId || null,
    prev_receipt_hash: prevReceiptHash || null,
    model_version: "gemini-1.5-pro",
    rules_version: RULES_VERSION,
    timestamp,
    action,
    bond_ref: action === "allow" && finalConfidence > 0.65 ? "0xMockBondReferenceForHackathon" : null
  };

  return {
    action,
    risk_score: finalScore,
    confidence: finalConfidence,
    requires_human: requiresHuman,
    reason: finalReason,
    threats: finalThreats,
    sanitized_content: null, // Sanitization deferred to polish block
    decode_report: [] as string[], // Supplied by stage0
    seen_count: 0, // Supplied by DB in route
    trust_receipt: receiptWithoutSignature, // Signature will be attached in route
  };
}
