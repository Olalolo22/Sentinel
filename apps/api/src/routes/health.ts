import { Hono } from "hono";
import { RULES_VERSION } from "@sentinel/rules";
import { MODEL_VERSION, API_VERSION } from "../version.js";
import { publicKeyStr } from "../receipts/signing.js";
import { dbHealthy } from "../db/client.js";
import { redisHealthy } from "../cache/redis.js";

export const health = new Hono();

health.get("/", async (c) => {
  let signerPubkey: string | null = null;
  try {
    signerPubkey = publicKeyStr;
  } catch {
    // key not configured — report it, paid routes will refuse to run
  }
  const [db, redis] = await Promise.all([
    process.env.DATABASE_URL ? dbHealthy() : Promise.resolve(false),
    process.env.REDIS_URL ? redisHealthy() : Promise.resolve(false),
  ]);
  return c.json({
    status: "ok",
    api_version: API_VERSION,
    model_version: MODEL_VERSION,
    rules_version: RULES_VERSION,
    signer_pubkey: signerPubkey ? `ed25519:${signerPubkey}` : null,
    deps: { postgres: db, redis },
    timestamp: Math.floor(Date.now() / 1000),
  });
});
