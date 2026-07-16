import { runHeuristics } from "@sentinel/rules";

export function stage1Heuristics(normalizedText: string) {
  const result = runHeuristics(normalizedText);

  // If score is >= 90, short-circuit to reject.
  // The brief states "Score >=90 short-circuits to reject (skip LLM)".
  const shouldShortCircuit = result.score >= 90;

  return {
    score: result.score,
    matches: result.matches,
    shouldShortCircuit,
  };
}
