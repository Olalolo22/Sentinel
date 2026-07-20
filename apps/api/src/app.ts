import { Hono } from "hono";
import { cors } from "hono/cors";
import { health } from "./routes/health.js";
import { scan } from "./routes/scan.js";
import { batchScan } from "./routes/batch.js";
import { verify } from "./routes/verify.js";
import { chain } from "./routes/chain.js";
import { buildPaymentMiddleware } from "./payment/x402.js";

export function createApp() {
  const app = new Hono();

  // Global: CORS on everything
  app.use("*", cors());

  // Free routes — no payment required
  app.route("/v1/health", health);
  app.get("/v1/verify/:verdict_hash", verify);
  app.get("/v1/chain/:job_id", chain);

  // Paid routes — optionally gated by x402 middleware
  // When PAYMENT_ENABLED=true: agents must attach an X-Payment header.
  // When PAYMENT_ENABLED is unset: routes are open (free demo / free-tier mode).
  const paymentMw = buildPaymentMiddleware();
  if (paymentMw) {
    app.use("/v1/scan", paymentMw);
    app.use("/v1/scan/batch", paymentMw);
  }

  app.post("/v1/scan", scan);
  app.post("/v1/scan/batch", batchScan);

  app.get("/", (c) =>
    c.json({
      service: "sentinel",
      version: "0.1.0",
      payment: process.env.PAYMENT_ENABLED === "true" ? "x402/enabled" : "free-tier",
      docs: "https://github.com/Olalolo22/Sentinel — pay-per-call trust layer for AI agents",
      endpoints: ["/v1/health", "/v1/scan", "/v1/scan/batch", "/v1/verify/{verdict_hash}", "/v1/chain/{job_id}"],
    }),
  );
  return app;
}
