import { Groq } from "groq-sdk";
import { insertDynamicRule } from "../db/db.js";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function stage4Retrospection(rawContent: string, verdictHash: string) {
  if (!rawContent) return;

  if (!groq) {
    console.log("[Stage 4] No Groq API Key, skipping retrospection immune system for", verdictHash);
    return;
  }

  const prompt = `
You are the Sentinel Immune System (Stage 4 Retrospection).
A malicious payload successfully bypassed our defenses.
Analyze the following payload, determine the core exploit mechanism (e.g., prompt injection, encoded instructions), and write a strict, robust JavaScript Regular Expression to catch similar patterns in the future.

Only output valid JSON matching this schema:
{
  "regex": "string (the raw regex pattern, e.g. 'ignore\\\\s+all\\\\s+previous\\\\s+instructions')",
  "description": "string (brief explanation of what this regex blocks)"
}

Malicious Payload:
"""
${rawContent}
"""
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a security analysis API. You only output valid JSON matching the requested schema."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.regex && parsed.description) {
        console.log(`[Stage 4] Immune System generated new rule: ${parsed.regex} (${parsed.description})`);
        await insertDynamicRule(parsed.regex, parsed.description);
      }
    }
  } catch (error) {
    console.error("Stage 4 Retrospection Error:", error);
  }
}
