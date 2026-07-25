import React, { useState } from "react";
import { Shield, ShieldCheck, Play, ArrowRight, Lock, Coins, Code2, Terminal, Cpu, Check, Copy, AlertTriangle, Layers, FileText } from "lucide-react";
import { PRESET_PAYLOADS } from "../data/presets";
import { scanPayload } from "../services/api";
import { ScanResponse, PresetPayload } from "../types";

interface LandingPageProps {
  onLaunchApp: () => void;
  onNavigateTab: (tab: "playground" | "chain" | "verifier" | "dispute" | "analytics") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [heroPayload, setHeroPayload] = useState<PresetPayload>(PRESET_PAYLOADS[0]);
  const [heroScanning, setHeroScanning] = useState(false);
  const [heroResult, setHeroResult] = useState<ScanResponse | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);

  const handleRunHeroScan = async (preset: PresetPayload) => {
    setHeroPayload(preset);
    setHeroScanning(true);
    setHeroResult(null);

    const { data } = await scanPayload(preset.content, preset.context, "hero_demo_job");
    setHeroResult(data);
    setHeroScanning(false);
  };

  const copyReceipt = () => {
    if (!heroResult) return;
    navigator.clipboard.writeText(JSON.stringify(heroResult.trust_receipt, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const copySdkCode = () => {
    const code = `import { SentinelClient } from "@sentinel/sdk";\n\nconst sentinel = new SentinelClient({ apiKey: "sentinel_live_key" });\n\n// Before an AI agent acts on untrusted content:\nconst decision = await sentinel.verifyBeforeSettlement({\n  jobId: "job_987",\n  content: untrustedMessage,\n  actorId: "agent_42"\n});\n\nif (decision.action === "reject") {\n  console.log("Threat intercepted. Settlement halted.");\n}`;
    navigator.clipboard.writeText(code);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  return (
    <div className="space-y-24 pb-16 animate-in fade-in duration-300">
      
      {/* ── HERO SECTION WITH SUBTLE DOT-GRID CSS & CYAN RADIAL GLOW ──────── */}
      <section className="relative pt-12 pb-16 overflow-hidden bg-dot-grid">
        
        {/* Soft Radial Glow Cluster in Cyan behind Hero Headline */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Hero Header & Statement Typography */}
          <div className="max-w-4xl space-y-6">
            
            {/* Secondary Informational Eyebrow Badge (Violet/Indigo Accent) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 font-mono text-xs font-semibold uppercase tracking-widest shadow-lg shadow-violet-500/10">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>01 — A2MCP CRYPTOGRAPHIC TRUST LAYER · OKX.AI HACKATHON</span>
            </div>

            {/* Giant Editorial Statement Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              Evaluate payloads. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent italic font-serif">
                Sign trust receipts.
              </span> <br />
              Halt exploits before settlement.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Sentinel is a pay-per-call cryptographic trust layer for autonomous AI agents. Before an agent acts on untrusted specifications or tool outputs, Sentinel evaluates threats in &lt;18ms and issues Ed25519 mathematically verifiable Trust Receipts backed by slashable escrow bonds on X Layer.
            </p>

            {/* Hero Primary Interactive Elements (Cyan / Electric Blue) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
                <span>Launch Interactive Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#pipeline"
                className="px-6 py-3.5 rounded-2xl bg-slate-900/80 border border-violet-500/30 hover:border-violet-400 text-violet-300 hover:text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-violet-400" />
                Explore 4-Stage Pipeline
              </a>

              <a
                href="https://github.com/Olalolo22/Sentinel"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono text-xs flex items-center gap-2 transition-colors"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                GitHub Repository
              </a>
            </div>

          </div>

          {/* ── INTERACTIVE HERO SCANNER PREVIEW CARD (FROSTED GLASS TREATMENT) ── */}
          <div className="card-frosted-glass p-6 sm:p-8 rounded-3xl space-y-6 glow-cyan shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Interactive Live Pipeline Demonstrator</h3>
                  <p className="text-xs text-slate-400">Click a preset attack vector to watch Sentinel evaluate and sign in real time</p>
                </div>
              </div>

              {/* Preset Buttons (Cyan Interactive Accents) */}
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_PAYLOADS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleRunHeroScan(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                      heroPayload.id === preset.id
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Live Output Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Box: Payload Input */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Untrusted Payload Spec:</span>
                  <span className="text-violet-400 font-bold">{heroPayload.category}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-200 min-h-[140px] leading-relaxed overflow-x-auto">
                  {heroPayload.content}
                </div>
                <button
                  onClick={() => handleRunHeroScan(heroPayload)}
                  disabled={heroScanning}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {heroScanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>Run Live Security Pipeline Scan</span>
                </button>
              </div>

              {/* Right Box: Live Output Verdict (OUTLINED CARD TREATMENT) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Ed25519 Trust Receipt Verdict:</span>
                  {heroResult && (() => {
                    const action = heroResult.trust_receipt?.verdict?.action || (heroResult as any).action || "allow";
                    return (
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
                        action === "reject"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : action === "review"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      }`}>
                        {action}
                      </span>
                    );
                  })()}
                </div>

                {!heroResult && !heroScanning && (
                  <div className="p-6 rounded-xl card-outlined min-h-[180px] flex flex-col items-center justify-center text-center space-y-2">
                    <Shield className="w-6 h-6 text-slate-600" />
                    <div className="text-xs text-slate-400 font-mono">Click any attack preset above to execute real-time evaluation</div>
                  </div>
                )}

                {heroScanning && (
                  <div className="p-6 rounded-xl card-outlined min-h-[180px] flex flex-col items-center justify-center text-center space-y-2">
                    <Cpu className="w-6 h-6 text-cyan-400 animate-spin" />
                    <div className="text-xs text-slate-300 font-mono">Stage 0 Normalize ➔ Stage 1 Heuristics ➔ Stage 2 Judge ➔ Stage 3 Sign</div>
                  </div>
                )}

                {/* Outlined Receipt Display Box */}
                {heroResult && (() => {
                  const riskScore = heroResult.trust_receipt?.verdict?.risk_score ?? (heroResult as any).risk_score ?? 0;
                  const displayRisk = (riskScore > 1 ? riskScore : riskScore * 100).toFixed(0);
                  const isHighRisk = Number(displayRisk) >= 60;
                  return (
                    <div className="p-4 rounded-xl card-outlined space-y-3 font-mono text-xs animate-in fade-in">
                      <div className="flex items-center justify-between text-slate-300 border-b border-cyan-500/20 pb-2">
                        <span className="text-slate-400">Verdict Hash:</span>
                        <span className="text-cyan-300 font-bold">{heroResult.trust_receipt?.verdict_hash?.slice(0, 24) || "0x..."}...</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 border-b border-cyan-500/20 pb-2">
                        <span className="text-slate-400">Ed25519 Signature:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[240px]">{heroResult.trust_receipt?.signature || "ed25519_sig..."}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">Risk Score:</span>
                        <span className={`font-bold ${isHighRisk ? "text-rose-400" : "text-emerald-400"}`}>{displayRisk}%</span>
                        <button
                          onClick={copyReceipt}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-[11px] text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedReceipt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedReceipt ? "Copied" : "Copy Receipt"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE TELEMETRY BAR (SOLID DARK CARD TREATMENT) ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl card-solid-dark grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Scans Evaluated</div>
            <div className="text-3xl font-extrabold text-white font-mono">14,290+</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Stage 1 Heuristics SLA</div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">&lt;18ms</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Staked Escrow Bond</div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">50,000 OKB</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Adaptive Rules Deployed</div>
            <div className="text-3xl font-extrabold text-violet-400 font-mono">27 Active</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 01: THREAT LANDSCAPE VS GUARANTEES (SOLID DARK CARDS) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            01 &mdash; THE THREAT LANDSCAPE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why autonomous AI agents fail without cryptographic verification
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            When autonomous agents consume untrusted data from web scrapers, user specifications, or external APIs, traditional security filters miss LLM-native exploits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl card-solid-dark space-y-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Direct System Prompt Hijacks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attacker payloads override system prompts, forcing downstream worker agents to dump secret keys or ignore original safety boundaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-4">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 w-fit border border-violet-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Unicode Tag Smuggling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Invisible zero-width characters (U+E0000 family) hidden inside seemingly clean text payloads that trigger hidden LLM behaviors without human visibility.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Financial Payment Hijacking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Malicious task specifications that tamper with x402 payment headers or substitute EVM payee addresses before transaction settlement.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Unverifiable Agent Hops</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-agent chains where a compromised middle hop passes corrupted outputs downstream without cryptographic proof of origin.
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 02: THE 4-STAGE PIPELINE (VIOLET RADIAL GLOW & SOLID CARDS) ── */}
      <section id="pipeline" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Soft Radial Glow Cluster in Violet behind Architecture Section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            02 &mdash; VERIFIABLE PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Sentinel evaluates and signs every agent request
          </h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              00
            </span>
            <h3 className="text-base font-bold text-slate-100">Stage 0: Normalization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strips zero-width characters, bidi overrides, homoglyphs, and unwraps recursive Base64/Hex/URL encodings.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              01
            </span>
            <h3 className="text-base font-bold text-slate-100">Stage 1: Fast Heuristics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Runs deterministic SPML rules and GoPlus address checks in &lt;18ms. Short-circuits known threats instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              02
            </span>
            <h3 className="text-base font-bold text-slate-100">Stage 2: LLM Threat Judge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates complex semantic intent against a strict T1-T8 threat taxonomy using Llama 3.3 70B / Sonnet.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              03
            </span>
            <h3 className="text-base font-bold text-slate-100">Stage 3: Ed25519 Signing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assembles canonical JSON receipt, hashes with SHA-256, and signs natively with ed25519 private key.
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 03: ECONOMIC BOND & STAGE 4 ADAPTIVE DEFENSE ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl card-solid-dark border border-amber-500/30 space-y-8 glow-amber">
          
          <div className="space-y-3">
            <div className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              03 &mdash; ECONOMIC SKIN-IN-THE-GAME & STAGE 4 ADAPTIVE DEFENSE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Backed by slashable escrow bonds on X Layer
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              To prove that Sentinel's "Allow" receipts can be trusted, Sentinel locks funds in <code className="font-mono text-amber-300">SentinelBond.sol</code> on X Layer. If a signed receipt allows an exploit payload, victim agents file a dispute claim to slash our staked bond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">Staked Escrow Contract</div>
              <div className="text-base font-bold text-slate-100 font-mono">SentinelBond.sol</div>
              <div className="text-xs text-amber-400 font-mono font-semibold">50,000 OKB Locked</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">Stage 4 Adaptive Defense</div>
              <div className="text-base font-bold text-slate-100 font-mono font-bold">Auto-Rule Synthesis</div>
              <div className="text-xs text-violet-400 font-mono">Llama 3.3 70B Exploit Analysis</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400">Immune System Propagation</div>
              <div className="text-base font-bold text-slate-100 font-mono">Stage 1 Sync (&lt;60s)</div>
              <div className="text-xs text-emerald-400 font-mono">Global Node Short-Circuit</div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 04: DEVELOPER SDK INTEGRATION (FROSTED GLASS CARD) ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            04 &mdash; DEVELOPER SDK
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Integrate Sentinel with 1 line of TypeScript
          </h2>
        </div>

        <div className="card-frosted-glass p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <span className="text-xs font-mono text-violet-300 font-semibold">@sentinel/sdk (NPM Package)</span>
            <button
              onClick={copySdkCode}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-xs font-mono text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSdk ? "Copied SDK Snippet" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950/90 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`import { SentinelClient } from "@sentinel/sdk";

const sentinel = new SentinelClient({ apiKey: "sentinel_live_key" });

// Before an AI agent acts on untrusted content:
const decision = await sentinel.verifyBeforeSettlement({
  jobId: "job_987",
  content: untrustedMessage,
  actorId: "agent_42"
});

if (decision.action === "reject") {
  console.log("Threat intercepted. Settlement halted.");
}`}
          </pre>
        </div>
      </section>

      {/* ── FOOTER CTA BANNER ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-extrabold text-white">Ready to secure your AI Agent workflows?</h3>
            <p className="text-xs text-slate-300 font-mono">Built for OKX.AI Genesis Hackathon & Stablecoin Commerce Stack Challenge</p>
          </div>

          <button
            onClick={onLaunchApp}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Launch Interactive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
