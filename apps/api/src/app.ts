import { Hono } from "hono";
import { cors } from "hono/cors";
import { health } from "./routes/health.js";

export function createApp() {
  const app = new Hono();
  app.use("*", cors());
  app.route("/v1/health", health);
  app.get("/", (c) =>
    c.json({
      service: "sentinel",
      docs: "https://github.com/sentinel — pay-per-call trust layer for AI agents",
      endpoints: ["/v1/health", "/v1/scan", "/v1/scan/batch", "/v1/verify/{verdict_hash}", "/v1/chain/{job_id}"],
    }),
  );
  return app;
}
