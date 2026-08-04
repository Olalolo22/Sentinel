import { Hono } from "hono";
import { cors } from "hono/cors";
import { health } from "./routes/health.js";
import { scan } from "./routes/scan.js";
import { batchScan } from "./routes/batch.js";
import { bootstrapTrust, bootstrapTrustInfo } from "./routes/bootstrap.js";
import { verify } from "./routes/verify.js";
import { chain } from "./routes/chain.js";
import { createDispute, checkDispute, approveDispute } from "./routes/dispute.js";
import { buildPaymentMiddleware } from "./payment/x402.js";
import { API_VERSION } from "./version.js";

export function createApp() {
  const app = new Hono();

  // Global: CORS on everything
  app.use("*", cors());

  // A2A Agent Card — OKX and A2A-compliant platforms ping this to verify the agent is online.
  // Must be served at /.well-known/agent.json per the A2A v1 spec.
  const agentCard = {
    protocolVersion: "1.0",
    name: "Sentinel",
    description:
      "Pay-per-call AI trust layer. Scans contracts and agent outputs for vulnerabilities, bias, and prompt injection. Returns cryptographically-signed trust verdicts.",
    url: process.env.AGENT_URL ?? "",
    provider: { organization: "Sentinel", url: "https://github.com/Olalolo22/Sentinel" },
    version: API_VERSION,
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    skills: [
      {
        id: "scan",
        name: "Contract / Output Scan",
        description: "Scan a smart contract or agent output for security vulnerabilities, bias, and prompt injection. Returns a signed trust verdict.",
        inputModes: ["application/json"],
        outputModes: ["application/json"],
        tags: ["security", "trust", "scan", "smart-contract"],
      },
      {
        id: "bootstrap-trust",
        name: "Bootstrap Trust",
        description: "Run a full trust assessment pipeline and return a signed receipt for agent-to-agent trust bootstrapping.",
        inputModes: ["application/json"],
        outputModes: ["application/json"],
        tags: ["trust", "receipt", "bootstrap"],
      },
    ],
    authentication: process.env.PAYMENT_ENABLED === "true"
      ? { schemes: ["x402"] }
      : { schemes: [] },
  };

  app.get("/.well-known/agent.json", (c) => c.json(agentCard));
  // Legacy path — some older A2A implementations use this
  app.get("/.well-known/agent-card.json", (c) => c.json(agentCard));

  // Free routes — no payment required
  app.route("/v1/health", health);
  app.get("/v1/verify/:verdict_hash", verify);
  app.get("/v1/chain/:job_id", chain);
  app.post("/v1/dispute", createDispute);
  app.get("/v1/dispute/:verdict_hash", checkDispute);
  app.post("/v1/dispute/:verdict_hash/approve", approveDispute);

  // GET Info / Probe routes for A2MCP (responds to quote/probe GET requests)
  app.get("/v1/bootstrap-trust", bootstrapTrustInfo);
  app.get("/v1/a2mcp/bootstrap-trust", bootstrapTrustInfo);
  app.get("/v1/a2mcp/scan", bootstrapTrustInfo);

  // Paid routes — optionally gated by x402 middleware
  // When PAYMENT_ENABLED=true: agents must attach an X-Payment header.
  // When PAYMENT_ENABLED is unset: routes are open (free demo / free-tier mode).
  const paymentMw = buildPaymentMiddleware();
  if (paymentMw) {
    app.use("/v1/scan", paymentMw);
    app.use("/v1/scan/batch", paymentMw);
    app.use("/v1/bootstrap-trust", paymentMw);
    app.use("/v1/a2mcp/bootstrap-trust", paymentMw);
    app.use("/v1/a2mcp/scan", paymentMw);
  }

  app.post("/v1/scan", scan);
  app.post("/v1/scan/batch", batchScan);
  app.post("/v1/bootstrap-trust", bootstrapTrust);
  app.post("/v1/a2mcp/bootstrap-trust", bootstrapTrust);
  app.post("/v1/a2mcp/scan", bootstrapTrust);

  app.get("/", (c) =>
    c.json({
      service: "sentinel",
      version: "0.1.0",
      payment: process.env.PAYMENT_ENABLED === "true" ? "x402/enabled" : "free-tier",
      docs: "https://github.com/Olalolo22/Sentinel — pay-per-call trust layer for AI agents",
      endpoints: [
        "/v1/health",
        "/v1/scan",
        "/v1/scan/batch",
        "/v1/bootstrap-trust",
        "/v1/a2mcp/bootstrap-trust",
        "/v1/a2mcp/scan",
        "/v1/verify/{verdict_hash}",
        "/v1/chain/{job_id}",
        "/v1/dispute",
      ],
    }),
  );
  return app;
}
