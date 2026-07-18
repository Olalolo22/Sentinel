/**
 * Stage 0 — Normalize. Pure functions, no I/O.
 *
 * Turns untrusted content into canonical text that Stage 1 patterns and the
 * Stage 2 judge can't be evaded around. Everything an attacker can hide in —
 * zero-width chars, bidi overrides, homoglyphs, base64/hex/URL/entity layers,
 * HTML comments/alt-text/CSS-hidden nodes — is surfaced here and recorded in
 * a decode report.
 */
import { parse as parseHtml, HTMLElement, Node, NodeType } from "node-html-parser";

export type ContentType = "text" | "html" | "markdown" | "file-b64";

export interface DecodeEvent {
  /** what kind of obfuscation was unwrapped */
  kind:
    | "zero-width"
    | "bidi-override"
    | "homoglyph"
    | "base64"
    | "hex"
    | "url-encoding"
    | "html-entity"
    | "html-comment"
    | "html-hidden"
    | "html-attr-text"
    | "tag-chars"
    | "variation-selector"
    | "file-b64";
  /** [start, end) span in the text of the layer where it was found */
  span: [number, number];
  /** 0 = raw input, 1..3 = nested decode layers */
  depth: number;
  note?: string;
}

export interface NormalizeResult {
  /** canonical text: extracted, NFKC'd, de-obfuscated, decoded */
  canonical: string;
  decodeReport: DecodeEvent[];
  flags: {
    hadZeroWidth: boolean;
    hadBidiOverride: boolean;
    homoglyphCount: number;
    /** chars of decoded payload / chars of canonical output (0..1) */
    encodedRatio: number;
    hadHiddenHtml: boolean;
  };
}

const MAX_DECODE_DEPTH = 3;

// ---------------------------------------------------------------------------
// invisible characters
// ---------------------------------------------------------------------------

// zero-width & format chars used to split trigger words / hide payloads
// (escaped so the source file itself contains no invisible characters)
const ZERO_WIDTH_RE = new RegExp("[\\u200B\\u200C\\u200D\\u2060\\uFEFF\\u00AD\\u180E\\u034F]", "g");
// bidi controls used to visually reorder text (RLO attacks etc.)
const BIDI_RE = new RegExp("[\\u202A-\\u202E\\u2066-\\u2069\\u061C\\u200E\\u200F]", "g");

// ---------------------------------------------------------------------------
// homoglyph folding — curated confusables map (Cyrillic/Greek/misc → Latin).
// NFKC handles fullwidth/mathematical variants; this covers cross-script
// lookalikes NFKC deliberately leaves alone.
// ---------------------------------------------------------------------------

const CONFUSABLES: Record<string, string> = {
  // Cyrillic lowercase
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c",
  "у": "y", "х": "x", "і": "i", "ѕ": "s", "ј": "j",
  "һ": "h", "ԁ": "d", "ԛ": "q", "ѡ": "w", "к": "k",
  "м": "m", "т": "t", "н": "h", "в": "b", "г": "r",
  "ь": "b", "з": "3", "ч": "4",
  // Cyrillic uppercase
  "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H",
  "І": "I", "Ј": "J", "К": "K", "М": "M", "О": "O",
  "Р": "P", "Ѕ": "S", "Т": "T", "Х": "X", "У": "Y",
  // Greek lowercase
  "α": "a", "ε": "e", "ο": "o", "ρ": "p", "υ": "u",
  "ν": "v", "ι": "i", "κ": "k", "τ": "t", "χ": "x",
  "σ": "s",
  // Greek uppercase
  "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H",
  "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O",
  "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
  // misc lookalikes
  "ı": "i", // dotless i
  "ł": "l", // l with stroke
  // NOTE: typographic quotes/dashes (’ “ – —) are intentionally NOT folded —
  // they are ordinary punctuation in legitimate text and folding them would
  // flag benign content as homoglyph evasion. NFKC leaves them as-is.
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Chars Stage 0 itself strips/decodes — neutral for the plausibility test,
 *  so a payload that hides its tail in tag/invisible chars still reads as text. */
function isNormalizedAway(c: number): boolean {
  return (
    (c >= 0x200b && c <= 0x200f) || (c >= 0x202a && c <= 0x202e) ||
    (c >= 0x2060 && c <= 0x2064) || (c >= 0x2066 && c <= 0x2069) ||
    c === 0xfeff || c === 0x00ad || c === 0x180e || c === 0x034f || c === 0x061c ||
    (c >= 0xfe00 && c <= 0xfe0f) || (c >= 0xe0000 && c <= 0xe01ef)
  );
}

/** Is a decoded byte string plausibly human/agent-readable text? */
export function isPlausibleText(s: string): boolean {
  let printable = 0;
  let letters = 0;
  let effectiveLen = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (isNormalizedAway(c)) continue; // neutral: neither for nor against
    effectiveLen++;
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c < 127)) printable++;
    else if (c >= 0x00a0 && c <= 0x2fff) printable++; // common non-ASCII text
    else if (c >= 0x3000 && c <= 0x9fff) { printable++; letters++; continue; } // CJK
    if (/[a-zA-ZЀ-ӿ]/.test(ch)) letters++;
  }
  if (effectiveLen < 4) return false;
  const printableRatio = printable / effectiveLen;
  const letterRatio = letters / effectiveLen;
  return printableRatio >= 0.9 && letterRatio >= 0.35;
}

function decodeBase64(candidate: string): string | null {
  // reject non-canonical padding early
  if (candidate.length % 4 === 1) return null;
  try {
    const buf = Buffer.from(candidate, "base64");
    // round-trip check: Buffer.from is lenient, make sure it consumed everything
    const reencoded = buf.toString("base64").replace(/=+$/, "");
    if (reencoded !== candidate.replace(/=+$/, "")) return null;
    const text = buf.toString("utf8");
    if (text.includes("�")) return null; // invalid UTF-8
    return isPlausibleText(text) ? text : null;
  } catch {
    return null;
  }
}

function decodeHex(candidate: string): string | null {
  const clean = candidate.startsWith("0x") ? candidate.slice(2) : candidate;
  if (clean.length % 2 !== 0) return null;
  try {
    const text = Buffer.from(clean, "hex").toString("utf8");
    if (text.includes("�")) return null;
    return isPlausibleText(text) ? text : null;
  } catch {
    return null;
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  sol: "/", colon: ":", period: ".", num: "#", dollar: "$",
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]{1,6});/g, (_, h) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d{1,7});/g, (_, d) => safeFromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]{2,8});/g, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function safeFromCodePoint(cp: number): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return "";
  return String.fromCodePoint(cp);
}

// ---------------------------------------------------------------------------
// HTML / Markdown text extraction
// ---------------------------------------------------------------------------

const HIDDEN_STYLE_RE =
  /display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:[^.\d]|$)|font-size\s*:\s*0/i;

interface ExtractResult {
  text: string;
  events: DecodeEvent[];
}

/** Extract ALL text from HTML — visible, hidden, comments, alt/title/aria. */
export function extractHtmlText(html: string): ExtractResult {
  const events: DecodeEvent[] = [];
  const root = parseHtml(html, { comment: true });
  const parts: string[] = [];

  const walk = (node: Node, insideHidden: boolean) => {
    if (node.nodeType === NodeType.COMMENT_NODE) {
      const text = node.rawText.trim();
      if (text) {
        parts.push(text);
        events.push({ kind: "html-comment", span: [0, text.length], depth: 0, note: "text inside HTML comment" });
      }
      return;
    }
    if (node.nodeType === NodeType.TEXT_NODE) {
      const text = node.rawText;
      if (text.trim()) {
        parts.push(text);
        if (insideHidden) {
          events.push({ kind: "html-hidden", span: [0, text.trim().length], depth: 0, note: "text in CSS-hidden or hidden-attribute node" });
        }
      }
      return;
    }
    if (node instanceof HTMLElement) {
      const tag = node.rawTagName?.toLowerCase() ?? "";
      if (tag === "script" || tag === "style") {
        // style/script bodies are not rendered text, but scan them anyway —
        // attackers stash payloads there
        const body = node.rawText.trim();
        if (body) parts.push(body);
        return;
      }
      let hidden = insideHidden;
      const style = node.getAttribute("style");
      if ((style && HIDDEN_STYLE_RE.test(style)) || node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") {
        hidden = true;
      }
      // attribute text agents often ingest
      for (const attr of ["alt", "title", "aria-label", "placeholder", "data-content"]) {
        const v = node.getAttribute(attr);
        if (v && v.trim()) {
          parts.push(v);
          events.push({ kind: "html-attr-text", span: [0, v.length], depth: 0, note: `text in ${attr} attribute` });
        }
      }
      for (const child of node.childNodes) walk(child, hidden);
    }
  };

  walk(root, false);
  return { text: parts.join(" ").replace(/\s+/g, " ").trim(), events };
}

/** Flatten Markdown to text, keeping alt text and link targets visible. */
export function extractMarkdownText(md: string): ExtractResult {
  const events: DecodeEvent[] = [];
  let text = md;
  // images: keep alt AND url — both are attack surface
  text = text.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_m, alt, url) => `${alt} ${url}`);
  // links: keep label AND url
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_m, label, url) => `${label} ${url}`);
  // strip emphasis/code markers without touching content
  text = text.replace(/[*_~`]{1,3}/g, "");
  // markdown can embed raw HTML — extract it too
  if (/<[a-zA-Z!/][^>]*>/.test(text)) {
    const inner = extractHtmlText(text);
    events.push(...inner.events);
    text = inner.text;
  }
  return { text: text.replace(/[ \t]+/g, " ").trim(), events };
}

// ---------------------------------------------------------------------------
// per-layer normalization pass
// ---------------------------------------------------------------------------

interface PassResult {
  text: string;
  events: DecodeEvent[];
  homoglyphCount: number;
  decodedChars: number;
}

// Unicode Tags block (U+E0000–U+E007F): invisible, but LLMs can read the
// smuggled ASCII. U+E0020–U+E007E map to printable ASCII (cp − 0xE0000);
// U+E0001 (language tag) and U+E007F (cancel) are control-only. We DECODE the
// printable ones to reveal the payload to Stage 1 + the judge, and strip the
// controls — then flag the whole thing as an invisible-smuggling attempt.
const TAG_RUN_RE = /[\u{E0000}-\u{E007F}]+/gu;
// variation selectors + more invisible format chars used to hide/split payloads
const VARIATION_RE = /[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]/gu;
const EXTRA_INVISIBLE_RE = /[⁡-⁤ᅟᅠㅤﾠ឴឵]/g;

function decodeTagChar(cp: number): string {
  if (cp === 0xe0020) return " ";
  if (cp >= 0xe0021 && cp <= 0xe007e) return String.fromCharCode(cp - 0xe0000);
  return ""; // language/cancel tags and anything else: strip
}

/** One pass: NFKC → decode tag smuggling → strip invisibles → fold homoglyphs → unwrap encodings. */
function normalizePass(input: string, depth: number): PassResult {
  const events: DecodeEvent[] = [];
  let text = input.normalize("NFKC");

  // Unicode Tag smuggling → decode to visible ASCII so downstream stages see it
  TAG_RUN_RE.lastIndex = 0;
  let tm: RegExpExecArray | null;
  while ((tm = TAG_RUN_RE.exec(text)) !== null) {
    const decoded = [...tm[0]].map((ch) => decodeTagChar(ch.codePointAt(0)!)).join("");
    events.push({ kind: "tag-chars", span: [tm.index, tm.index + tm[0].length], depth, note: decoded ? `hidden tag text: "${decoded.slice(0, 40)}"` : "tag control chars" });
  }
  text = text.replace(TAG_RUN_RE, (run) => [...run].map((ch) => decodeTagChar(ch.codePointAt(0)!)).join(""));

  // variation selectors → strip
  VARIATION_RE.lastIndex = 0;
  while ((tm = VARIATION_RE.exec(text)) !== null) {
    events.push({ kind: "variation-selector", span: [tm.index, tm.index + tm[0].length], depth, note: `U+${tm[0].codePointAt(0)!.toString(16).toUpperCase()}` });
  }
  text = text.replace(VARIATION_RE, "").replace(EXTRA_INVISIBLE_RE, "");

  // zero-width
  ZERO_WIDTH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ZERO_WIDTH_RE.exec(text)) !== null) {
    events.push({ kind: "zero-width", span: [m.index, m.index + m[0].length], depth, note: `U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}` });
  }
  text = text.replace(ZERO_WIDTH_RE, "");

  // bidi
  BIDI_RE.lastIndex = 0;
  while ((m = BIDI_RE.exec(text)) !== null) {
    events.push({ kind: "bidi-override", span: [m.index, m.index + m[0].length], depth, note: `U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}` });
  }
  text = text.replace(BIDI_RE, "");

  // homoglyphs
  let homoglyphCount = 0;
  let folded = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const rep = CONFUSABLES[ch];
    if (rep !== undefined) {
      homoglyphCount++;
      // only report the first few to keep the report readable
      if (homoglyphCount <= 10) {
        events.push({ kind: "homoglyph", span: [i, i + 1], depth, note: `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")} → "${rep}"` });
      }
      folded += rep;
    } else {
      folded += ch;
    }
  }
  text = folded;

  let decodedChars = 0;

  // HTML entities (only when they actually occur)
  if (/&(#\d{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z]{2,8});/.test(text)) {
    const decoded = decodeHtmlEntities(text);
    if (decoded !== text) {
      events.push({ kind: "html-entity", span: [0, text.length], depth });
      decodedChars += Math.abs(text.length - decoded.length) + 1;
      text = decoded;
    }
  }

  // URL-encoding: require a run of ≥3 %xx to avoid mangling ordinary URLs
  if (/(?:%[0-9a-fA-F]{2}){3,}/.test(text)) {
    text = text.replace(/(?:%[0-9a-fA-F]{2}){3,}/g, (run, offset: number) => {
      try {
        const decoded = decodeURIComponent(run);
        if (isPlausibleText(decoded) || decoded.length >= 3) {
          events.push({ kind: "url-encoding", span: [offset, offset + run.length], depth });
          decodedChars += decoded.length;
          return decoded;
        }
      } catch { /* malformed — leave as-is */ }
      return run;
    });
  }

  // hex blobs (≥12 bytes, so EVM addresses [20 bytes] are candidates but only
  // replaced when they decode to plausible TEXT — addresses never do)
  text = text.replace(/\b(?:0x)?(?:[0-9a-fA-F]{2}){12,}\b/g, (run, offset: number) => {
    const decoded = decodeHex(run);
    if (decoded !== null) {
      events.push({ kind: "hex", span: [offset, offset + run.length], depth, note: "hex-encoded text" });
      decodedChars += decoded.length;
      return decoded;
    }
    return run;
  });

  // base64 runs (≥16 chars). Only replace when the payload is plausible text.
  text = text.replace(/[A-Za-z0-9+/]{16,}={0,2}/g, (run, offset: number) => {
    // skip runs that are pure hex (handled above) or pure alpha single-case
    // long words — cheap false-positive guards
    if (/^[0-9a-fA-F]+$/.test(run)) return run;
    if (/^[a-z]+$/.test(run) || /^[A-Z]+$/.test(run)) return run;
    const decoded = decodeBase64(run);
    if (decoded !== null) {
      events.push({ kind: "base64", span: [offset, offset + run.length], depth, note: "base64-encoded text" });
      decodedChars += decoded.length;
      return decoded;
    }
    return run;
  });

  return { text, events, homoglyphCount, decodedChars };
}

// ---------------------------------------------------------------------------
// entry point
// ---------------------------------------------------------------------------

export function normalize(content: string, contentType: ContentType = "text"): NormalizeResult {
  const allEvents: DecodeEvent[] = [];
  let text = content;
  let hadHiddenHtml = false;

  if (contentType === "file-b64") {
    // whole payload is base64 — decode the envelope (not subject to the
    // plausible-text gate: caller asserted it's base64)
    try {
      const buf = Buffer.from(content.replace(/\s+/g, ""), "base64");
      const decoded = buf.toString("utf8");
      if (!decoded.includes("�")) {
        allEvents.push({ kind: "file-b64", span: [0, content.length], depth: 0, note: "file envelope decoded" });
        text = decoded;
      }
    } catch { /* fall through, scan raw */ }
    // decoded file may itself be HTML
    if (/<\s*(html|body|div|p|img|a)\b/i.test(text)) {
      const ex = extractHtmlText(text);
      allEvents.push(...ex.events);
      hadHiddenHtml = ex.events.some((e) => e.kind === "html-hidden");
      text = ex.text;
    }
  } else if (contentType === "html") {
    const ex = extractHtmlText(text);
    allEvents.push(...ex.events);
    hadHiddenHtml = ex.events.some((e) => e.kind === "html-hidden");
    text = ex.text;
  } else if (contentType === "markdown") {
    const ex = extractMarkdownText(text);
    allEvents.push(...ex.events);
    hadHiddenHtml = ex.events.some((e) => e.kind === "html-hidden");
    text = ex.text;
  }

  let totalHomoglyphs = 0;
  let totalDecodedChars = 0;

  for (let depth = 0; depth < MAX_DECODE_DEPTH; depth++) {
    const pass = normalizePass(text, depth);
    allEvents.push(...pass.events);
    totalHomoglyphs += pass.homoglyphCount;
    totalDecodedChars += pass.decodedChars;
    const changed = pass.text !== text;
    text = pass.text;
    if (!changed) break;
  }

  const canonical = text;
  return {
    canonical,
    decodeReport: allEvents,
    flags: {
      // tag/variation smuggling is invisible-char evasion → same +40 signal
      hadZeroWidth: allEvents.some((e) => e.kind === "zero-width" || e.kind === "tag-chars" || e.kind === "variation-selector"),
      hadBidiOverride: allEvents.some((e) => e.kind === "bidi-override"),
      homoglyphCount: totalHomoglyphs,
      encodedRatio: canonical.length > 0 ? Math.min(1, totalDecodedChars / canonical.length) : 0,
      hadHiddenHtml,
    },
  };
}

/** Human-readable decode report lines for the Decision object. */
export function decodeReportStrings(events: DecodeEvent[]): string[] {
  return events.map((e) => {
    const at = `at [${e.span[0]},${e.span[1]}]`;
    const layer = e.depth > 0 ? ` (layer ${e.depth})` : "";
    return `${e.kind} ${at}${layer}${e.note ? ` — ${e.note}` : ""}`;
  });
}
