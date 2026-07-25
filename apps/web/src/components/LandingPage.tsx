import React, { useState } from "react";
import { Shield, ShieldCheck, Play, ArrowRight, Lock, Coins, Code2, Terminal, Cpu, Check, Copy, AlertTriangle, Layers, FileText, CheckCircle2, Zap } from "lucide-react";
import { PRESET_PAYLOADS } from "../data/presets";
import { scanPayload } from "../services/api";
import { ScanResponse, PresetPayload } from "../types";

interface LandingPageProps {
  onLaunchApp: () => void;
  onNavigateTab: (tab: "playground" | "chain" | "verifier" | "dispute" | "analytics") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onNavigateTab }) => {
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
    const code = `import { Sentinel } from "@sentinel/sdk";\n\nconst sentinel = new Sentinel({ apiKey: "sentinel_live_key" });\n\nawait sentinel.verifyBeforeSettlement(jobId, deliverable);`;
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
              <span>A2MCP TRUST INFRASTRUCTURE</span>
            </div>

            {/* Giant Editorial Statement Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              Every autonomous decision <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent italic font-serif">
                deserves proof.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
              AI agents can negotiate contracts, execute code, move funds, and release escrow. Every one of those actions begins with untrusted input. Sentinel verifies every high-risk interaction before an agent acts, then produces a signed Trust Receipt that anyone can verify. Because trust shouldn't disappear once an AI makes a decision.
            </p>

            {/* Hero Primary Interactive Elements (Cyan / Electric Blue) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
                <span>Launch Playground</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab("chain")}
                className="px-6 py-3.5 rounded-2xl bg-slate-900/80 border border-violet-500/30 hover:border-violet-400 text-violet-300 hover:text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-violet-400" />
                View Trust Chain
              </button>

              <a
                href="https://github.com/Olalolo22/Sentinel"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono text-xs flex items-center gap-2 transition-colors"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                GitHub &rarr;
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
                  <span>Trust Receipt Verdict:</span>
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

      {/* ── SOCIAL PROOF / TELEMETRY BAR ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl card-solid-dark grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-white font-mono">&lt;20ms</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Known threats intercepted</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">Ed25519</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Signed Trust Receipts</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">Trust Chains</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Every decision linked</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">X Layer</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Bond-backed guarantees</div>
          </div>
        </div>
      </section>

      {/* ── SECTION ONE: THE PROBLEM ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            01 &mdash; THE PROBLEM
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI agents already have tools. <br />
            <span className="text-slate-400">They still don't have trust.</span>
          </h2>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            The next generation of software won't click buttons. It will negotiate work, review deliverables, release escrow, sign transactions, and coordinate with other agents. But every one of those actions depends on information the agent cannot automatically trust &mdash; a hidden prompt, an invisible Unicode payload, a substituted wallet address, or a manipulated deliverable. Without verification, one malicious message becomes one irreversible action.
          </p>
        </div>
      </section>

      {/* ── SECTION TWO: ONE REQUEST, ONE SIGNED DECISION ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            02 &mdash; VERDICTS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One request. One signed decision.
          </h2>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            Before an agent performs a high-risk action, it asks Sentinel a single question: <em>Can I trust this?</em> Sentinel evaluates the request using deterministic security rules, semantic analysis, and signature verification. It returns one of four decisions:
          </p>
        </div>

        {/* 4 Decision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl card-solid-dark border-l-4 border-l-emerald-400 space-y-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
              ALLOW
            </span>
            <p className="text-sm font-semibold text-slate-200">Safe to continue.</p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark border-l-4 border-l-amber-400 space-y-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
              REVIEW
            </span>
            <p className="text-sm font-semibold text-slate-200">Needs human approval.</p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark border-l-4 border-l-rose-500 space-y-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase">
              REJECT
            </span>
            <p className="text-sm font-semibold text-slate-200">Threat detected.</p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark border-l-4 border-l-cyan-400 space-y-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase">
              HOLD ESCROW
            </span>
            <p className="text-sm font-semibold text-slate-200">Delay settlement until resolved.</p>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400">
          Every decision includes a signed Trust Receipt that can be verified independently.
        </p>
      </section>

      {/* ── SECTION THREE: THE RECEIPT IS THE PRODUCT ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            03 &mdash; THE RECEIPT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The receipt is the product.
          </h2>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            Security tools usually stop after returning a verdict. Sentinel keeps a permanent record. Every Trust Receipt includes the content hash, detected threats, risk score, timestamp, model version, rules version, and signature. The receipt can be verified anywhere with no Sentinel account, no database lookup, and no trust required &mdash; only the public key.
          </p>
        </div>

        {/* Receipt Key Fields Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl card-outlined text-slate-300">&bull; Content Hash</div>
          <div className="p-4 rounded-xl card-outlined text-slate-300">&bull; Detected Threats</div>
          <div className="p-4 rounded-xl card-outlined text-slate-300">&bull; Risk Score &amp; Timestamp</div>
          <div className="p-4 rounded-xl card-outlined text-slate-300">&bull; Ed25519 Signature</div>
        </div>
      </section>

      {/* ── SECTION FOUR: TRUST CHAINS ────────────────────────────────────── */}
      <section id="chain" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            04 &mdash; TRUST CHAINS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trust doesn't happen once. <br />
            <span className="text-slate-400">It happens throughout the workflow.</span>
          </h2>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            A real AI job isn't a single prompt &mdash; it's a sequence of decisions. Sentinel links every receipt into a tamper-evident Trust Chain so that if a decision changes or history is rewritten, the chain immediately reveals it. Instead of asking <em>"Can I trust this result?"</em>, you can inspect every decision that produced it.
          </p>
        </div>

        {/* Visual Workflow Chain Progression */}
        <div className="p-6 rounded-2xl card-solid-dark flex flex-wrap items-center justify-between gap-4 font-mono text-sm">
          <div className="px-4 py-2 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 font-bold">
            Task
          </div>
          <div className="text-cyan-400 text-lg">&rarr;</div>
          <div className="px-4 py-2 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 font-bold">
            Negotiation
          </div>
          <div className="text-cyan-400 text-lg">&rarr;</div>
          <div className="px-4 py-2 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 font-bold">
            Deliverable
          </div>
          <div className="text-cyan-400 text-lg">&rarr;</div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
            Settlement
          </div>
        </div>
      </section>

      {/* ── SECTION FIVE: AUTONOMOUS SYSTEMS (CUT TO 2 SENTENCES) ──────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="space-y-2">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            05 &mdash; AUTONOMOUS SYSTEMS
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Built for autonomous systems. Not chatbots.
          </h2>
        </div>
        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Sentinel is designed specifically for autonomous agents that execute irreversible actions, approve payments, and release escrow. Before executing tools or accepting deliverables, agents make one API call to receive a signed, verifiable record.
        </p>
      </section>

      {/* ── SECTION SIX: DEFENSE PIPELINE (CUT TO 2 SENTENCES) ─────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Soft Radial Glow Cluster in Violet behind Architecture Section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            06 &mdash; DEFENSE PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Every verdict has evidence.
          </h2>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            Your payload passes through four independent security layers before a signed decision is returned. Each stage strips hidden instructions, intercepts known attacks in milliseconds, evaluates semantic intent, and produces verifiable proof.
          </p>
        </div>

        {/* 4 Benefit-Driven Stage Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              00
            </span>
            <h3 className="text-base font-bold text-slate-100">Reveal Hidden Instructions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Normalize invisible Unicode, nested encodings, HTML tricks, and hidden payloads before analysis begins.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              01
            </span>
            <h3 className="text-base font-bold text-slate-100">Stop Known Attacks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic heuristics intercept high-confidence threats in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              02
            </span>
            <h3 className="text-base font-bold text-slate-100">Understand Intent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Semantic analysis evaluates the request against Sentinel's T1–T8 threat taxonomy.
            </p>
          </div>

          <div className="p-6 rounded-2xl card-solid-dark space-y-3">
            <span className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/40">
              03
            </span>
            <h3 className="text-base font-bold text-slate-100">Produce Verifiable Proof</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every verdict becomes a signed Trust Receipt using canonical JSON, SHA-256 hashing, and Ed25519 signatures.
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION SEVEN: ECONOMIC BOND (CUT TO 2 SENTENCES) ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl card-solid-dark border border-amber-500/30 space-y-6 glow-amber">
          
          <div className="space-y-3">
            <div className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              07 &mdash; ECONOMIC BOND
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trust should be accountable.
            </h2>
            <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
              High-confidence ALLOW decisions are backed by an on-chain escrow bond on X Layer. If Sentinel incorrectly clears a malicious request and a dispute is upheld, the bond covers the claim.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">Staked Escrow Contract: <strong className="text-slate-200">SentinelBond.sol</strong></span>
            <span className="text-amber-400 font-bold">50,000 OKB Staked</span>
          </div>

        </div>
      </section>

      {/* ── SECTION EIGHT: ADAPTIVE LEARNING (CUT TO 2 SENTENCES) ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="space-y-2">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            08 &mdash; ADAPTIVE LEARNING
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security should improve after every mistake.
          </h2>
        </div>
        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          When a verified exploit is confirmed through the dispute process, Sentinel fingerprints the attack and deploys a new firewall rule across the network. Every verified incident strengthens the system so future versions of the attack are intercepted instantly.
        </p>
      </section>

      {/* ── SECTION NINE: ONE-LINE INTEGRATION ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            09 &mdash; DEVELOPER SDK
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Integrate in one line.
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
{`import { Sentinel } from "@sentinel/sdk";

await sentinel.verifyBeforeSettlement(jobId, deliverable);`}
          </pre>

          <p className="text-xs text-slate-400 font-mono">
            No custom security pipeline. No prompt engineering. No cryptography. Your agent asks. Sentinel answers.
          </p>
        </div>
      </section>

      {/* ── FINAL SECTION: REPLACED WITH SIMPLE CTA ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Start verifying. Free for the first 50 calls.</h3>
            <p className="text-xs text-slate-300 font-mono">Pay-per-call settlement via OKX Payment SDK (0.05 USDT / scan)</p>
          </div>

          <button
            onClick={onLaunchApp}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Launch Interactive Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
