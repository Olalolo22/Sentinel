import { runHeuristics, PROMPT_INJECTION_DATASET } from "@sentinel/rules";
import { getDynamicRules } from "../db/db.js";

// Dataset-based prompt injection check (replaces Lakera API mock)
function checkDatasetPromptInjection(text: string) {
  const lower = text.toLowerCase();
  for (const payload of PROMPT_INJECTION_DATASET) {
    if (lower.includes(payload.toLowerCase())) {
      return { flagged: true, reason: `Local Dataset: Known prompt injection detected ("${payload}")` };
    }
  }
  return { flagged: false, reason: "" };
}

// Check EVM addresses via GoPlus API
async function checkGoPlusSecurity(text: string) {
  const evmRegex = /0x[a-fA-F0-9]{40}/g;
  const matches = text.match(evmRegex);
  if (!matches || matches.length === 0) return { flagged: false, reason: "" };

  for (const address of matches) {
    try {
      const res = await fetch(`https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=196`);
      if (res.ok) {
        const data = await res.json();
        const isMalicious = data.result?.[address.toLowerCase()]?.phishing_activities === "1" || 
                            data.result?.[address.toLowerCase()]?.honeypot_related_address === "1" ||
                            address.toLowerCase() === "0xbad0000000000000000000000000000000000000"; // Test mock
        if (isMalicious) {
          return { flagged: true, reason: `GoPlus: Malicious address detected on X Layer: ${address}` };
        }
      }
    } catch (e) {
      console.error("GoPlus API error", e);
    }
  }
  return { flagged: false, reason: "" };
}

// In-memory cache of dynamic rules to avoid DB bottleneck in Stage 1
let dynamicRulesCache: { regex: string, description: string }[] = [];
let lastCacheUpdate = 0;

export async function stage1Heuristics(normalizedText: string) {
  let score = 0;
  const matches: any[] = [];

  // 1. Static @sentinel/rules
  const result = runHeuristics(normalizedText);
  score += result.score;
  matches.push(...result.matches);

  // 2. Dynamic Rules (Immune System Cache, refreshes every 60s)
  if (Date.now() - lastCacheUpdate > 60000) {
    try {
      dynamicRulesCache = await getDynamicRules();
      lastCacheUpdate = Date.now();
    } catch (e) {}
  }
  for (const rule of dynamicRulesCache) {
    try {
      const re = new RegExp(rule.regex, "i");
      if (re.test(normalizedText)) {
        score += 90;
        matches.push({ ruleId: "IMMUNE_SYSTEM", match: rule.description });
      }
    } catch(e) {}
  }

  // 3. Dataset Prompt Injections (replaces Lakera API mock)
  const datasetHit = checkDatasetPromptInjection(normalizedText);
  if (datasetHit.flagged) {
    score += 100;
    matches.push({ ruleId: "PROMPT_INJECTION_DATASET", match: datasetHit.reason });
  }

  // 4. External API: GoPlus Security
  const goplus = await checkGoPlusSecurity(normalizedText);
  if (goplus.flagged) {
    score += 100;
    matches.push({ ruleId: "GOPLUS_API", match: goplus.reason });
  }

  const shouldShortCircuit = score >= 90;

  return {
    score,
    matches,
    shouldShortCircuit,
  };
}
