/**
 * @sentinel/sdk — Errors
 */

/** Thrown by verifyBeforeSettlement() when the scan returns a non-allow action */
export class SentinelBlocked extends Error {
  readonly action: string;
  readonly risk_score: number;
  readonly verdict_hash: string;
  readonly threats: unknown[];

  constructor(decision: {
    action: string;
    risk_score: number;
    reason: string;
    threats: unknown[];
    trust_receipt: { verdict_hash: string };
  }) {
    super(
      `Sentinel blocked action: ${decision.action} (risk_score=${decision.risk_score}). ` +
        `Reason: ${decision.reason}. ` +
        `Receipt: ${decision.trust_receipt.verdict_hash}`
    );
    this.name = "SentinelBlocked";
    this.action = decision.action;
    this.risk_score = decision.risk_score;
    this.verdict_hash = decision.trust_receipt.verdict_hash;
    this.threats = decision.threats;
  }
}

/** Thrown when the API is unreachable. The SDK never fails open. */
export class SentinelUnreachable extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SentinelUnreachable";
    this.cause = cause;
  }
}

/** Thrown when a receipt's Ed25519 signature fails local verification */
export class SentinelInvalidSignature extends Error {
  readonly verdict_hash: string;

  constructor(verdict_hash: string) {
    super(`Receipt signature verification failed for verdict_hash: ${verdict_hash}`);
    this.name = "SentinelInvalidSignature";
    this.verdict_hash = verdict_hash;
  }
}
