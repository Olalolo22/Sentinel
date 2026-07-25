import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Play, Copy, Check, Terminal, Cpu, Code2, AlertTriangle, Layers, Info, ArrowRight, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { PRESET_PAYLOADS } from "../data/presets";
import { scanPayload } from "../services/api";
import { ScanResponse, PresetPayload } from "../types";

export const ScannerPlayground: React.FC = () => {
  const [content, setContent] = useState(PRESET_PAYLOADS[0].content);
  const [context, setContext] = useState("task_spec");
  const [jobId, setJobId] = useState("job_8821");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_PAYLOADS[0].id);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleSelectPreset = (preset: PresetPayload) => {
    setSelectedPresetId(preset.id);
    setContent(preset.content);
    setContext(preset.context || "task_spec");
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
          title: "Approved",
          subtext: "No T1–T8 threats detected. Trust Receipt generated.",
          actionText: "Safe to continue execution.",
        };
      case "review":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber",
          icon: AlertTriangle,
          title: "Needs Review",
          subtext: "Potentially unsafe instructions detected.",
          actionText: "Human approval required before continuing.",
        };
      case "hold_escrow":
        return {
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 glow-cyan",
          icon: ShieldAlert,
          title: "Settlement Paused",
          subtext: "Payment or deliverable ambiguity detected.",
          actionText: "Payment should remain in escrow until the payload is resolved.",
        };
      case "reject":
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 glow-rose",
          icon: ShieldAlert,
          title: "Rejected",
          subtext: "Malicious payload or system override detected.",
          actionText: "Settlement blocked.",
        };
    }
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Page Header (Frosted Glass Card) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono font-semibold uppercase">
                DEVELOPER SANDBOX
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payload Scanner
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Test how Sentinel responds to untrusted content before integrating the SDK into your agent.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || !content.trim()}
            className="self-start md:self-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {scanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Scan Payload</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Section: Example Payloads */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Example Payloads
              </label>
              <p className="text-xs text-slate-400">Test Sentinel against common attack scenarios.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PRESET_PAYLOADS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              let displayName = preset.name;
              if (preset.id === "prompt-injection-1") displayName = "Prompt Injection";
              if (preset.id === "tag-smuggling-1") displayName = "Unicode Smuggling";
              if (preset.id === "data-exfil-1") displayName = "Hidden Markdown";
              if (preset.id === "wallet-redirect-1") displayName = "Wallet Redirection";
              if (preset.id === "clean-spec-1") displayName = "Benign Task";

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
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{displayName}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{preset.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form & Results Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Section (Frosted Glass Card) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="card-frosted-glass p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Payload Input
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payload</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Paste the content your agent is about to process..."
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Context</label>
                    <span className="text-[11px] text-slate-400 font-mono">Tell Sentinel where this payload appears.</span>
                  </div>
                  <select
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="task_spec">Task Specification</option>
                    <option value="negotiation_msg">Negotiation</option>
                    <option value="deliverable">Deliverable</option>
                    <option value="payment_settlement">Settlement</option>
                    <option value="generic">Generic</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Job ID</label>
                    <span className="text-[11px] text-slate-400 font-mono">Optional. Links scan into Trust Chain.</span>
                  </div>
                  <input
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="job_8821"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleScan}
                disabled={scanning || !content.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {scanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{scanning ? "Scanning..." : content.trim() ? "Scan Payload" : "Enter a payload to continue"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Scan Results View */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Empty State */}
            {!scanResult && !scanning && (
              <div className="card-solid-dark p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No scan yet.</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Paste a payload or choose an example to generate a signed Trust Receipt.
                </p>
              </div>
            )}

            {/* Progress Animation (Benefit-Driven Steps) */}
            {scanning && (
              <div className="card-solid-dark p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <ShieldCheck className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                </div>

                <div className="space-y-3 max-w-xs text-xs font-mono">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Normalizing payload</span>
                  </div>
                  <div className="text-cyan-400/60 pl-6">&darr;</div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Checking known threats</span>
                  </div>
                  <div className="text-cyan-400/60 pl-6">&darr;</div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Evaluating intent</span>
                  </div>
                  <div className="text-cyan-400/60 pl-6">&darr;</div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Signing receipt</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results View */}
            {scanResult && (
              <div className="space-y-5 animate-in fade-in duration-300">
                
                {/* Verdict Header Banner */}
                {(() => {
                  const action = scanResult.trust_receipt?.verdict?.action || (scanResult as any).action || "allow";
                  const riskScore = scanResult.trust_receipt?.verdict?.risk_score ?? (scanResult as any).risk_score ?? 0;
                  const confidence = scanResult.trust_receipt?.verdict?.confidence ?? (scanResult as any).confidence ?? 1.0;
                  const displayRisk = (riskScore > 1 ? riskScore : riskScore * 100).toFixed(0);
                  const displayConf = (confidence * 100).toFixed(0);

                  const verdict = getVerdictBadge(action);
                  const VerdictIcon = verdict.icon;
                  return (
                    <div className={`p-5 rounded-2xl border space-y-3 ${verdict.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-black/20">
                            <VerdictIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-lg font-extrabold tracking-wide uppercase">{verdict.title}</div>
                            <div className="text-xs opacity-90 font-mono">{verdict.subtext}</div>
                          </div>
                        </div>

                        <button
                          onClick={copyReceiptJson}
                          className="px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-xs font-mono font-medium flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy Receipt JSON"}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono opacity-90">
                        <div>Risk Score: <strong className="font-bold">{displayRisk}</strong></div>
                        <div>Confidence: <strong className="font-bold">{displayConf}%</strong></div>
                        <div>Action: <strong className="font-bold underline">{verdict.actionText}</strong></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Simulation Disclaimer if fallback engine used */}
                {isSimulated && (
                  <div className="px-4 py-2 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-2 font-mono">
                    <Info className="w-4 h-4 shrink-0 text-violet-400" />
                    <span>Evaluated using Sentinel client-side simulation engine (Zero Latency Offline Mode).</span>
                  </div>
                )}

                {/* Findings Card */}
                <div className="card-solid-dark p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                    Findings
                  </h4>

                  {scanResult.trust_receipt?.verdict?.flags?.length ? (
                    <div className="space-y-2 text-xs font-mono">
                      {scanResult.trust_receipt.verdict.flags.map((flag, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-rose-300 space-y-1">
                          <div className="font-bold text-rose-400">&bull; {flag}</div>
                          <div className="text-slate-400 text-[11px]">
                            {scanResult.trust_receipt?.verdict?.threat_category 
                              ? `Classification: ${scanResult.trust_receipt.verdict.threat_category}` 
                              : "Flagged by Stage 1 Heuristics"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>No T1–T8 threats detected. Payload clean.</span>
                    </div>
                  )}
                </div>

                {/* Normalization Report Card */}
                <div className="card-solid-dark p-5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                    Normalization
                  </h4>

                  <div className="text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    {scanResult.decode_report.length > 0 ? (
                      scanResult.decode_report.map((rep, idx) => <div key={idx}>&bull; {rep}</div>)
                    ) : (
                      <span className="text-slate-500">&bull; No hidden Unicode characters, bidi overrides, or nested encodings found.</span>
                    )}
                  </div>
                </div>

                {/* Receipt Card */}
                <div className="card-outlined p-5 rounded-2xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <span className="font-bold text-slate-200">Trust Receipt</span>
                    <a
                      href="#verify"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Verify Receipt &rarr;
                    </a>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Content Hash:</span>
                      <span className="text-slate-200 font-bold">{scanResult.trust_receipt?.content_sha256?.slice(0, 20)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verdict Hash:</span>
                      <span className="text-cyan-300 font-bold">{scanResult.trust_receipt?.verdict_hash?.slice(0, 20)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Signed At:</span>
                      <span className="text-slate-300">{scanResult.trust_receipt?.timestamp || "Just now"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Signature:</span>
                      <span className="text-emerald-400 font-bold truncate max-w-[220px]">{scanResult.trust_receipt?.signature || "ed25519_sig..."}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Chain Card */}
                {jobId && (
                  <div className="p-4 rounded-xl card-solid-dark border border-violet-500/30 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="font-bold text-violet-300">Trust Chain</div>
                      <div className="text-[11px] text-slate-400">This payload will link as step for job <strong className="text-cyan-300">{jobId}</strong>.</div>
                    </div>
                    <span className="text-cyan-400 text-[11px] font-bold">View Chain &rarr;</span>
                  </div>
                )}

                {/* Collapsible API Response JSON */}
                <div className="card-solid-dark p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">API Response</span>
                    <button
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>{showRawJson ? "Hide JSON" : "View JSON"}</span>
                    </button>
                  </div>

                  {showRawJson && (
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-60 leading-relaxed animate-in fade-in">
                      {JSON.stringify(scanResult, null, 2)}
                    </pre>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Small Footer Copy */}
        <div className="pt-6 border-t border-slate-800/80 text-center text-xs font-mono text-slate-400">
          Every scan produces a portable Trust Receipt that can be verified independently using Sentinel's public key.
        </div>

      </div>
    </div>
  );
};
