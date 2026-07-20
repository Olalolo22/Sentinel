/**
 * Sentinel x402 Payment Middleware
 *
 * Wraps POST /v1/scan and POST /v1/scan/batch with x402 pay-per-call gating.
 * Built on @x402/hono (Coinbase x402 protocol, EVM implementation).
 *
 * Activation:
 *   Set PAYMENT_ENABLED=true in env to enforce payment.
 *   Without it, the middleware is a no-op — routes stay open (free demo mode).
 *   This matches the spec's fallback: "free listing for eligibility if SDK stalls".
 *
 * Pricing (spec §4.4):
 *   /v1/scan        → 0.05 USDT per call
 *   /v1/scan/batch  → 0.04 USDT per call (item-level discount tracked in billing)
 *
 * Network:  X Layer mainnet (EVM chain ID 196, CAIP-2: eip155:196)
 * Token:    USDT on X Layer (6 decimals)
 * Scheme:   "exact" — fixed-price EIP-3009 transfer
 *
 * Environment variables:
 *   PAYMENT_ENABLED            "true" to enforce
 *   SENTINEL_PAYMENT_ADDRESS   Operator's EVM wallet on X Layer (receives USDT)
 *   X402_FACILITATOR_URL       Optional — custom facilitator (defaults to Coinbase's)
 */

import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import type { MiddlewareHandler } from "hono";
import type { RouteConfig } from "@x402/core/server";

// ─── X Layer config ───────────────────────────────────────────────────────────

/** CAIP-2 / x402 network identifier for X Layer mainnet */
const X_LAYER_NETWORK = "eip155:196" as const;

// ─── Build middleware ──────────────────────────────────────────────────────────

/**
 * Build the x402 Hono middleware if PAYMENT_ENABLED=true.
 * Returns null (no-op) if payment is not configured — safe to call on every
 * startup; routes remain open until the operator is ready to enable billing.
 */
export function buildPaymentMiddleware(): MiddlewareHandler | null {
  if (process.env.PAYMENT_ENABLED !== "true") {
    console.log("[x402] PAYMENT_ENABLED not set — routes open (free demo mode)");
    return null;
  }

  const payTo = process.env.SENTINEL_PAYMENT_ADDRESS;
  if (!payTo) {
    console.warn(
      "[x402] PAYMENT_ENABLED=true but SENTINEL_PAYMENT_ADDRESS is not set — " +
        "disabling payment enforcement to avoid locking out all callers."
    );
    return null;
  }

  // Optional custom facilitator (e.g. OKX's). Falls back to Coinbase's public one.
  const facilitatorUrl = process.env.X402_FACILITATOR_URL;
  const facilitatorClient = facilitatorUrl
    ? new HTTPFacilitatorClient({ url: facilitatorUrl })
    : undefined;

  if (facilitatorUrl) {
    console.log(`[x402] Using custom facilitator: ${facilitatorUrl}`);
  }

  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    X_LAYER_NETWORK,
    new ExactEvmScheme()
  );

  /**
   * PaymentOption shape (from @x402/core RouteConfig):
   *   scheme  — "exact" for fixed-price EIP-3009
   *   payTo   — operator's EVM address on X Layer
   *   price   — amount string, e.g. "$0.05" or "0.05" (parsed as USD cents)
   *   network — CAIP-2 chain identifier
   */
  const scanOption = {
    scheme: "exact",
    payTo,
    price: "$0.05",
    network: X_LAYER_NETWORK,
    maxTimeoutSeconds: 300,
  };

  const batchOption = {
    scheme: "exact",
    payTo,
    price: "$0.04",
    network: X_LAYER_NETWORK,
    maxTimeoutSeconds: 300,
  };

  const routes: Record<string, RouteConfig> = {
    "/v1/scan": {
      accepts: scanOption,
      description: "Sentinel trust check — single content scan (0.05 USDT)",
      mimeType: "application/json",
    },
    "/v1/scan/batch": {
      accepts: batchOption,
      description: "Sentinel trust check — batch scan up to 20 items (0.04 USDT, 20% discount)",
      mimeType: "application/json",
    },
  };

  console.log(
    `[x402] Payment enforcement active on X Layer (${X_LAYER_NETWORK}). payTo: ${payTo}`
  );

  return paymentMiddleware(routes, resourceServer);
}
