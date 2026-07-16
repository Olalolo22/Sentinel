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

// Look for cryptocurrency addresses
export const WALLET_REGEX = /(0x[a-fA-F0-9]{40})|([13][a-km-zA-HJ-NP-Z1-9]{25,34})|(T[A-Za-z1-9]{33})/;

// Look for zero-width characters often used for steganography/obfuscation
export const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;

export function runHeuristics(text: string) {
  let score = 0;
  const matches = [];

  // 1. Injection grammar
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      score += 40;
      matches.push("prompt_injection_pattern");
    }
  }

  // 2. Wallet addresses
  if (WALLET_REGEX.test(text)) {
    score += 20;
    matches.push("wallet_address_found");
  }

  // 3. Zero-width
  if (ZERO_WIDTH_REGEX.test(text)) {
    score += 30;
    matches.push("zero_width_chars");
  }

  return {
    score: Math.min(score, 100),
    matches,
  };
}
