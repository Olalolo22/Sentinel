/**
 * @sentinel/sdk
 *
 * Official SDK for the Sentinel A2MCP trust layer.
 *
 * @example
 * ```ts
 * import { Sentinel, SentinelBlocked } from "@sentinel/sdk";
 *
 * const sentinel = new Sentinel({
 *   actorId: "erc8004:xlayer:0x...",
 *   baseUrl: "https://sentinel-api.up.railway.app",
 * });
 *
 * // Scan arbitrary content
 * const decision = await sentinel.scan(content, { context: "deliverable" });
 *
 * // Gate escrow release
 * try {
 *   await sentinel.verifyBeforeSettlement("job_8821", deliverableContent);
 *   // Safe to release escrow
 * } catch (err) {
 *   if (err instanceof SentinelBlocked) {
 *     console.error("Blocked:", err.action, err.verdict_hash);
 *   }
 * }
 * ```
 */

export { Sentinel } from "./client.js";
export { SentinelBlocked, SentinelUnreachable, SentinelInvalidSignature } from "./errors.js";
export { verifyReceiptLocal } from "./verify.js";

export type {
  SentinelConfig,
  ScanOptions,
  Decision,
  TrustReceipt,
  Threat,
  ThreatType,
  ThreatSeverity,
  Action,
  ContentType,
  ScanContext,
  Chain,
  ChainLink,
  VerifyResponse,
} from "./types.js";
