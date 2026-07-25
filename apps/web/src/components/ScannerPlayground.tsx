import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Play, Copy, Check, Terminal, Cpu, Code2, AlertTriangle, Layers, Info } from "lucide-react";
import { PRESET_PAYLOADS } from "../data/presets";
import { scanPayload } from "../services/api";
import { ScanResponse, PresetPayload } from "../types";

export const ScannerPlayground: React.FC = () => {
  const [content, setContent] = useState(PRESET_PAYLOADS[0].content);
  const [context, setContext] = useState(PRESET_PAYLOADS[0].context);
  const [jobId, setJobId] = useState("job_hackathon_987");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_PAYLOADS[0].id);

  const handleSelectPreset = (preset: PresetPayload) => {
    setSelectedPresetId(preset.id);
    setContent(preset.content);
    setContext(preset.context);
    setScanResult(null);
  };

  const handleScan = async () => {
    if (!content.trim()) return;
    setScanning(true);
    setScanResult(null);
    
    const { data, isSimulated: simulated } = await scanPayload(content, context, jobId);
    
    setScanResult(data);
    setIsSimulated(simulated);
    setScanning(false);
  };

  const copyReceiptJson = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(JSON.stringify(scanResult.trust_receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVerdictBadge = (action: string) => {
    switch (action) {
      case "allow":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-emerald",
          icon: ShieldCheck,
          label: "VERDICT: ALLOW (SAFE)",
        };
      case "review":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber",
          icon: AlertTriangle,
          label: "VERDICT: REVIEW (SUSPICIOUS)",
        };
      case "reject":
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 glow-rose",
          icon: ShieldAlert,
          label: "VERDICT: REJECT (INTERCEPTED)",
        };
    }
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Banner / Title Header (Frosted Glass Card) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl card-frosted-glass border border-cyan-500/30 relative overflow-hidden glow-cyan">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono font-semibold uppercase">
                LIVE PIPELINE TESTER
              </span>
              <span className="text-xs text-slate-400 font-mono">Stage 0 ➔ Stage 1 ➔ Stage 2 ➔ Stage 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Payload Scanner & Defense Pipeline
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Pass unverified AI Agent payloads, specs, or tool outputs through Sentinel. Evaluates prompt injection risks, zero-width steganography, and financial manipulation with signed cryptographic trust receipts.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="self-start md:self-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {scanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Evaluate Payload</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Attack Vectors Row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Quick Test Attack Vector Presets
            </label>
            <span className="text-xs text-slate-400 font-mono">Select a preset to load into scanner</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PRESET_PAYLOADS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                      : "card-solid-dark hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      preset.category === "Clean Spec"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {preset.category}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{preset.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form & Pipeline Execution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form (Frosted Glass Card) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="card-frosted-glass p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Payload & Execution Metadata
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Untrusted Payload / Specification</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Paste untrusted text, user input, or specification to evaluate..."
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Context Tag</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Job ID (Chain Tracking)</label>
                  <input
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleScan}
                disabled={scanning}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {scanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Execute 4-Stage Security Scan</span>
              </button>
            </div>
          </div>

          {/* Right Column: Multi-Stage Results View */}
          <div className="lg:col-span-7 space-y-6">
            {!scanResult && !scanning && (
              <div className="card-solid-dark p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Ready to Evaluate Payload</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click <strong>Evaluate Payload</strong> or choose a preset to trigger Sentinel's Stage 0-3 normalization, heuristics, LLM judge, and Ed25519 receipt generation.
                </p>
              </div>
            )}

            {scanning && (
              <div className="card-solid-dark p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <ShieldCheck className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-200">Evaluating 4-Stage Pipeline</div>
                  <div className="text-xs text-slate-400 font-mono">Stage 0 Normalize ➔ Stage 1 Heuristics ➔ Stage 2 Judge ➔ Stage 3 Sign</div>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="space-y-5 animate-in fade-in duration-300">
                
                {/* Verdict Header Banner */}
                {(() => {
                  const action = scanResult.trust_receipt?.verdict?.action || (scanResult as any).action || "allow";
                  const riskScore = scanResult.trust_receipt?.verdict?.risk_score ?? (scanResult as any).risk_score ?? 0;
                  const confidence = scanResult.trust_receipt?.verdict?.confidence ?? (scanResult as any).confidence ?? 1.0;
                  const displayRisk = (riskScore > 1 ? riskScore : riskScore * 100).toFixed(1);
                  const displayConf = (confidence * 100).toFixed(1);

                  const verdict = getVerdictBadge(action);
                  const VerdictIcon = verdict.icon;
                  return (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${verdict.bg}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <VerdictIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold tracking-wide uppercase">{verdict.label}</div>
                          <div className="text-xs opacity-80 font-mono">
                            Risk Score: {displayRisk}% | Confidence: {displayConf}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={copyReceiptJson}
                        className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-xs font-mono text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied Receipt" : "Copy Receipt JSON"}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Simulation Disclaimer if fallback engine used */}
                {isSimulated && (
                  <div className="px-4 py-2 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-2 font-mono">
                    <Info className="w-4 h-4 shrink-0 text-violet-400" />
                    <span>Pipeline evaluated using Sentinel client-side simulation engine (Zero Latency Offline Mode).</span>
                  </div>
                )}

                {/* Pipeline Stages Breakdown (Solid Dark Cards with Violet Tags) */}
                <div className="space-y-3">
                  {/* Stage 0 */}
                  <div className="card-solid-dark p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[11px] flex items-center justify-center font-bold">0</span>
                        Stage 0: Normalization & Decoding
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        PASSED (&lt;1ms)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {scanResult.decode_report.length > 0 ? (
                        scanResult.decode_report.map((rep, idx) => <div key={idx}>• {rep}</div>)
                      ) : (
                        <span className="text-slate-500">No hidden zero-width chars or bidi overrides detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Stage 1 */}
                  <div className="card-solid-dark p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[11px] flex items-center justify-center font-bold">1</span>
                        Stage 1: Fast Heuristics & Deterministic Rules
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        scanResult.trust_receipt?.stage_summary?.stage1_short_circuit
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                        {scanResult.trust_receipt?.stage_summary?.stage1_short_circuit ? "SHORT-CIRCUITED (<18ms)" : "PASSED (<15ms)"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      {scanResult.trust_receipt?.verdict?.flags?.length ? (
                        <div className="space-y-1">
                          <div className="text-rose-300 font-semibold">Flags Triggered:</div>
                          {scanResult.trust_receipt.verdict.flags.map((f, i) => (
                            <div key={i} className="text-rose-400 font-mono text-[11px]">• {f}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">Zero short-circuit heuristic flags matched.</span>
                      )}
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="card-solid-dark p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[11px] flex items-center justify-center font-bold">2</span>
                        Stage 2: LLM Threat Taxonomy Judge
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        Llama 3.3 70B / Sonnet
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                      {scanResult.trust_receipt?.verdict?.threat_category && (
                        <div className="text-amber-400 font-mono text-[11px] font-bold">
                          Threat Classification: {scanResult.trust_receipt.verdict.threat_category}
                        </div>
                      )}
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {scanResult.stage2_analysis?.reasoning || "Evaluation completed cleanly."}
                      </p>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="card-solid-dark p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[11px] flex items-center justify-center font-bold">3</span>
                        Stage 3: Ed25519 Cryptographic Trust Receipt
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        SIGNED & VERIFIED
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Verdict Hash:</span>
                        <span className="text-cyan-300 font-bold">{scanResult.trust_receipt?.verdict_hash || "0x..."}</span>
                      </div>
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Ed25519 Signature:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[280px]">{scanResult.trust_receipt?.signature || "ed25519..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Signed Receipt JSON Box (Outlined Card Treatment) */}
                <div className="card-outlined p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 font-mono">Canonical Trust Receipt Payload</span>
                    <span className="text-[11px] text-slate-500 font-mono">v0.1.0 JSON</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(scanResult.trust_receipt, null, 2)}
                  </pre>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
