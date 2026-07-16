import crypto from "crypto";
import stringify from "fast-json-stable-stringify";

// Generate a keypair on startup if one isn't provided in ENV
let privateKey: crypto.KeyObject;
export let publicKeyStr: string;

function initKeys() {
  if (process.env.SENTINEL_SIGNING_KEY) {
    // Expecting base64 or hex encoded DER or raw format.
    // For simplicity in the hackathon, we can just generate a new one every restart
    // unless the env var is formatted properly.
    try {
      privateKey = crypto.createPrivateKey(process.env.SENTINEL_SIGNING_KEY);
      const pubKey = crypto.createPublicKey(privateKey);
      publicKeyStr = pubKey.export({ type: "spki", format: "pem" }).toString();
      return;
    } catch (e) {
      console.warn("Failed to parse SENTINEL_SIGNING_KEY, generating ephemeral keys.");
    }
  }

  const keys = crypto.generateKeyPairSync("ed25519");
  privateKey = keys.privateKey;
  publicKeyStr = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
}

initKeys();

export function signReceipt(receiptWithoutSignature: any): { signature: string; payloadHash: string } {
  const canonicalJson = stringify(receiptWithoutSignature);
  const payloadHash = crypto.createHash("sha256").update(canonicalJson).digest("hex");
  
  const signatureBuffer = crypto.sign(null, Buffer.from(payloadHash, "utf8"), privateKey);
  const signature = `ed25519:${signatureBuffer.toString("base64")}`;
  
  return { signature, payloadHash };
}

export function verifyReceipt(receiptWithoutSignature: any, signatureStr: string, pubKeyPem: string): boolean {
  if (!signatureStr.startsWith("ed25519:")) return false;
  const sigBase64 = signatureStr.replace("ed25519:", "");
  
  const canonicalJson = stringify(receiptWithoutSignature);
  const payloadHash = crypto.createHash("sha256").update(canonicalJson).digest("hex");
  
  try {
    const pubKey = crypto.createPublicKey(pubKeyPem);
    return crypto.verify(null, Buffer.from(payloadHash, "utf8"), pubKey, Buffer.from(sigBase64, "base64"));
  } catch (e) {
    return false;
  }
}
