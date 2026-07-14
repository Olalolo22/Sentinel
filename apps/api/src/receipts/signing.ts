/**
 * Ed25519 receipt signing. Key material comes from SENTINEL_SIGNING_KEY
 * (64 hex chars = 32-byte seed). The public key is published at /v1/health
 * so anyone can verify receipts without trusting this server.
 */
import { createPrivateKey, createPublicKey, sign, verify, createHash, KeyObject } from "node:crypto";

// PKCS8 prefix for an Ed25519 private key (RFC 8410)
const PKCS8_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");
// SPKI prefix for an Ed25519 public key
const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

let cachedKey: { priv: KeyObject; pub: KeyObject; pubHex: string } | null = null;

export function loadSigningKey(): { priv: KeyObject; pub: KeyObject; pubHex: string } {
  if (cachedKey) return cachedKey;
  const hex = process.env.SENTINEL_SIGNING_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("SENTINEL_SIGNING_KEY must be 64 hex chars (32-byte ed25519 seed)");
  }
  const seed = Buffer.from(hex, "hex");
  const priv = createPrivateKey({
    key: Buffer.concat([PKCS8_PREFIX, seed]),
    format: "der",
    type: "pkcs8",
  });
  const pub = createPublicKey(priv);
  const spki = pub.export({ format: "der", type: "spki" });
  const pubHex = Buffer.from(spki.subarray(SPKI_PREFIX.length)).toString("hex");
  cachedKey = { priv, pub, pubHex };
  return cachedKey;
}

/** Deterministic JSON: sorted keys, no whitespace. Arrays keep order. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** signature covers sha256(canonical_json(receipt_without_signature)) */
export function signReceipt(receiptWithoutSignature: Record<string, unknown>): string {
  const { priv } = loadSigningKey();
  const digest = Buffer.from(sha256Hex(canonicalJson(receiptWithoutSignature)), "hex");
  const sig = sign(null, digest, priv);
  return `ed25519:${sig.toString("hex")}`;
}

export function verifyReceiptSignature(
  receiptWithoutSignature: Record<string, unknown>,
  signature: string,
  pubkeyHex: string,
): boolean {
  if (!signature.startsWith("ed25519:")) return false;
  try {
    const pub = createPublicKey({
      key: Buffer.concat([SPKI_PREFIX, Buffer.from(pubkeyHex, "hex")]),
      format: "der",
      type: "spki",
    });
    const digest = Buffer.from(sha256Hex(canonicalJson(receiptWithoutSignature)), "hex");
    return verify(null, digest, pub, Buffer.from(signature.slice("ed25519:".length), "hex"));
  } catch {
    return false;
  }
}
