export const RULES_VERSION = "1.0.0";

// Basic threat taxonomy patterns
export const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /forget (all )?previous instructions/i,
  /you are now an/i,
  /system prompt/i,
  /disregard previous/i,
  /print previous instructions/i,
  /output your instructions/i,
];

// T4: Payment redirection — "send * to <address>", "transfer funds", etc.
export const PAYMENT_REDIRECTION_PATTERNS = [
  /send (all )?funds to/i,
  /transfer (all )?(funds|tokens|eth|usdt|btc) to/i,
  /send .{0,30} to 0x[a-fA-F0-9]{6,}/i,
  /pay .{0,20} to 0x[a-fA-F0-9]{6,}/i,
  /redirect .{0,20}payment/i,
  /change .{0,20}(wallet|address|recipient)/i,
  /new (wallet|payment|recipient) address/i,
];

// Look for cryptocurrency addresses (EVM full 40-hex, or partial ≥6, BTC, TRON)
export const WALLET_REGEX =
  /(0x[a-fA-F0-9]{6,40})|([13][a-km-zA-HJ-NP-Z1-9]{25,34})|(T[A-Za-z1-9]{33})/;

// Look for zero-width characters often used for steganography/obfuscation
export const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;

export function runHeuristics(text: string) {
  let score = 0;
  const matches = [];

  // 1. Injection grammar (T1) — +40 each, cap contribution at 40
  let injectionHit = false;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      injectionHit = true;
      matches.push("prompt_injection_pattern");
      break; // one hit is enough to score the category
    }
  }
  if (injectionHit) score += 40;

  // 2. Payment redirection (T4) — +40
  let paymentHit = false;
  for (const pattern of PAYMENT_REDIRECTION_PATTERNS) {
    if (pattern.test(text)) {
      paymentHit = true;
      matches.push("payment_redirection_pattern");
      break;
    }
  }
  if (paymentHit) score += 40;

  // 3. Wallet address present — +20
  if (WALLET_REGEX.test(text)) {
    score += 20;
    matches.push("wallet_address_found");
  }

  // 4. Zero-width chars — +30
  if (ZERO_WIDTH_REGEX.test(text)) {
    score += 30;
    matches.push("zero_width_chars");
  }

  return {
    score: Math.min(score, 100),
    matches,
  };
}

