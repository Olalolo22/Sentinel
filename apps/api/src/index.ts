import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";

const port = Number(process.env.PORT ?? 3000);

async function main() {
  if (process.env.DATABASE_URL) {
    try {
      await migrate();
    } catch (err) {
      // fail closed on scan, but keep /v1/health alive so ops can see the problem
      console.error("[migrate] failed:", err);
    }
  }
  serve({ fetch: createApp().fetch, port }, (info) => {
    console.log(`sentinel api listening on :${info.port}`);
  });
}

main();
