/**
 * @sentinel/sdk — Local Ed25519 receipt verifier
 *
 * Mirrors the signing logic in apps/api/src/receipts/signing.ts exactly so
 * verification works offline without trusting the server's own /verify endpoint.
 *
 * Signing spec:
 *   payload  = sha256(canonical_json(receipt_without_signature))
 *   signature = ed25519_sign(payload_as_utf8_string)
 *   stored   = "ed25519:" + base64(signature_bytes)
 */

import { createHash, createPublicKey, verify as cryptoVerify } from "crypto";
import stableStringify from "./stable-stringify.js";
import { TrustReceipt } from "./types.js";
import { SentinelInvalidSignature } from "./errors.js";

/**
 * Verify a trust receipt's Ed25519 signature locally.
 *
 * @param receipt   - The full TrustReceipt (including signature field)
 * @param pubKeyPem - The signer's public key in PEM (SPKI) format.
 *                    Fetch once from GET /v1/health and cache it.
 * @throws SentinelInvalidSignature if the signature is invalid or malformed.
 * @returns true if the signature is valid
 */
export function verifyReceiptLocal(
  receipt: TrustReceipt,
  pubKeyPem: string
): true {
  if (!receipt.signature?.startsWith("ed25519:")) {
    throw new SentinelInvalidSignature(receipt.verdict_hash);
  }

  const sigBase64 = receipt.signature.slice("ed25519:".length);

  // Reconstruct the exact object that was signed (without the signature field)
  const { signature: _sig, verdict_hash: _vh, ...receiptWithoutSignature } =
    receipt as TrustReceipt & { [k: string]: unknown };

  const canonicalJson = stableStringify(receiptWithoutSignature);
  const payloadHash = createHash("sha256")
    .update(canonicalJson)
    .digest("hex");

  let isValid: boolean;
  try {
    const pubKey = createPublicKey(pubKeyPem);
    isValid = cryptoVerify(
      null,
      Buffer.from(payloadHash, "utf8"),
      pubKey,
      Buffer.from(sigBase64, "base64")
    );
  } catch {
    throw new SentinelInvalidSignature(receipt.verdict_hash);
  }

  if (!isValid) {
    throw new SentinelInvalidSignature(receipt.verdict_hash);
  }

  return true;
}
