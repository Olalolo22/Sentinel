import { Redis } from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not set");
    client = new Redis(url, {
      maxRetriesPerRequest: 2,
      // fail closed: a scan must error out fast, never hang, if the cache is down
      connectTimeout: 3000,
      lazyConnect: true,
    });
    client.on("error", (err) => console.error("[redis]", err.message));
  }
  return client;
}

export async function redisHealthy(): Promise<boolean> {
  try {
    const pong = await getRedis().ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}
