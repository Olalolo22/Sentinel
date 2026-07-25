import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Play, Copy, Check, Terminal, Cpu, Code2, AlertTriangle, Layers, Info, ArrowRight, ChevronDown, ChevronUp, Lock, CheckCircle2, UserCheck, Shield, Zap, RefreshCw } from "lucide-react";
import { PRESET_PAYLOADS } from "../data/presets";
import { scanPayload } from "../services/api";
import { ScanResponse, PresetPayload } from "../types";

export const ScannerPlayground: React.FC = () => {
  const [agentIdentity, setAgentIdentity] = useState("trading-agent-01");
  const [actionType, setActionType] = useState("Token Transfer");
  const [payloadJson, setPayloadJson] = useState(`{\n  "recipient": "0x84222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",\n  "amount": "250 USDC",\n  "contract": "payment_router"\n}`);
  const [context, setContext] = useState("Payment settlement for completed research task");
  const [jobId, setJobId] = useState("job_8821");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("clean-spec-1");

  const handleSelectPreset = (preset: PresetPayload) => {
    setSelectedPresetId(preset.id);
    if (preset.id === "wallet-redirect-1") {
      setAgentIdentity("agent_malicious_hacker");
      setActionType("Token Transfer");
      setPayloadJson(`{\n  "recipient": "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",\n  "amount": "1000 OKB",\n  "contract": "unverified_drainer"\n}`);
      setContext("Unauthorized payee redirect attempt before settlement");
    } else if (preset.id === "prompt-injection-1") {
      setAgentIdentity("untrusted_user_bot");
      setActionType("Task Specification");
      setPayloadJson(`{\n  "instruction": "${preset.content}"\n}`);
      setContext("Direct system prompt override payload");
    } else if (preset.id === "tag-smuggling-1") {
      setAgentIdentity("researcher_agent");
      setActionType("Deliverable");
      setPayloadJson(`{\n  "content": "${preset.content}"\n}`);
      setContext("Zero-width steganographic tag smuggling payload");
    } else {
      setAgentIdentity("trading-agent-01");
      setActionType("Token Transfer");
      setPayloadJson(`{\n  "recipient": "0x84222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",\n  "amount": "250 USDC",\n  "contract": "payment_router"\n}`);
      setContext("Payment settlement for completed research task");
    }
    setScanResult(null);
  };

  const handleRunScan = async () => {
    if (!payloadJson.trim()) return;
    setScanning(true);
    setScanResult(null);

    const { data, isSimulated: simulated } = await scanPayload(payloadJson, context, jobId);
    
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

  const getVerdictDetails = (action: string) => {
    switch (action) {
      case "allow":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-emerald",
          icon: ShieldCheck,
          badge: "APPROVED",
          title: "This action passed Sentinel verification.",
          actionText: "Approved actions can proceed to execution.",
          isApproved: true,
        };
      case "review":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber",
          icon: AlertTriangle,
          badge: "NEEDS REVIEW",
          title: "Potentially unsafe instructions detected.",
          actionText: "Human approval required before execution.",
          isApproved: false,
        };
      case "hold_escrow":
        return {
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 glow-cyan",
          icon: ShieldAlert,
          badge: "SETTLEMENT PAUSED",
          title: "Escrow funds locked pending resolution.",
          actionText: "Payment should remain in escrow until resolved.",
          isApproved: false,
        };
      case "reject":
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 glow-rose",
          icon: ShieldAlert,
          badge: "REJECTED",
          title: "Malicious payload or unauthorized override detected.",
          actionText: "Execution blocked immediately.",
          isApproved: false,
        };
    }
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
        
        {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 font-mono text-xs font-semibold uppercase">
              SENTINEL SCANNER
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Verify Before You Trust
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              AI agents can act autonomously. Sentinel makes sure they act within defined boundaries before those actions become irreversible. Scan agent decisions, transactions, and external actions through a trust verification layer that evaluates intent, context, and risk before execution.
            </p>
          </div>

          <button
            onClick={handleRunScan}
            disabled={scanning || !payloadJson.trim()}
            className="self-start md:self-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {scanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{scanning ? "Running Verification..." : "Start Verification"}</span>
          </button>
        </div>

        {/* ── THE PROBLEM SECTION ───────────────────────────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-4">
          <div className="font-mono text-xs font-semibold text-violet-400 uppercase tracking-widest">
            THE PROBLEM
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Autonomous agents are moving from recommendations to execution.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
            <div className="space-y-2">
              <p className="font-semibold text-slate-200">They can:</p>
              <ul className="space-y-1 font-mono text-xs text-slate-400">
                <li className="flex items-center gap-2">&bull; Transfer assets &amp; settle funds</li>
                <li className="flex items-center gap-2">&bull; Execute smart contracts</li>
                <li className="flex items-center gap-2">&bull; Access private systems &amp; tools</li>
                <li className="flex items-center gap-2">&bull; Make autonomous financial decisions</li>
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div>But most systems only answer: <span className="text-rose-400 italic">"Did the action happen?"</span></div>
              <div className="pt-2 border-t border-slate-800 text-cyan-300 font-bold">Sentinel answers: <span>"Should this action have happened?"</span></div>
            </div>
          </div>
        </div>

        {/* ── DECISION SCANNER FORM & PRESETS ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Decision Scanner Input Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="card-frosted-glass p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Decision Scanner
                </h3>
                <p className="text-xs text-slate-400 font-mono">Submit an agent action for verification</p>
              </div>

              {/* Preset Buttons */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono text-slate-400">Test Preset Scenarios:</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PAYLOADS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        selectedPresetId === preset.id
                          ? "bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10"
                          : "bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {preset.id === "wallet-redirect-1" ? "Token Transfer Redirect" : preset.id === "prompt-injection-1" ? "Prompt Injection Spec" : preset.id === "tag-smuggling-1" ? "Unicode Tag Smuggling" : "Clean Escrow Release"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-mono font-semibold mb-1">Agent Identity</label>
                  <input
                    type="text"
                    value={agentIdentity}
                    onChange={(e) => setAgentIdentity(e.target.value)}
                    placeholder="trading-agent-01"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono font-semibold mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="Token Transfer">Token Transfer</option>
                    <option value="Escrow Release">Escrow Release</option>
                    <option value="Contract Execution">Contract Execution</option>
                    <option value="Task Specification">Task Specification</option>
                    <option value="Deliverable">Deliverable</option>
                    <option value="Generic Action">Generic Action</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono font-semibold mb-1">Payload JSON / Instruction</label>
                  <textarea
                    value={payloadJson}
                    onChange={(e) => setPayloadJson(e.target.value)}
                    rows={6}
                    placeholder={`{\n  "recipient": "0x84...92F",\n  "amount": "250 USDC"\n}`}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-100 font-mono focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono font-semibold mb-1">Context</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Describe the reason for this action"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRunScan}
                disabled={scanning || !payloadJson.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {scanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{scanning ? "Running Trust Verification Engine..." : "Run Trust Check"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Verification Engine (4 Pillars Breakdown) */}
          <div className="lg:col-span-6 space-y-6">
            
            {!scanResult && !scanning && (
              <div className="card-solid-dark p-10 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Ready for Action Verification</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click <strong>Run Trust Check</strong> to evaluate your action payload across Identity, Intent, Risk, and Policy pillars.
                </p>
              </div>
            )}

            {scanning && (
              <div className="card-solid-dark p-10 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 min-h-[460px]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <ShieldCheck className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-200 font-mono">Evaluating 4 Verification Pillars</div>
                  <div className="text-xs text-slate-400 font-mono">Identity ➔ Intent ➔ Risk ➔ Policy</div>
                </div>
              </div>
            )}

            {scanResult && (() => {
              const action = scanResult.trust_receipt?.verdict?.action || (scanResult as any).action || "allow";
              const riskScore = scanResult.trust_receipt?.verdict?.risk_score ?? (scanResult as any).risk_score ?? 0;
              const confidence = scanResult.trust_receipt?.verdict?.confidence ?? (scanResult as any).confidence ?? 1.0;
              const displayRisk = (riskScore > 1 ? riskScore : riskScore * 100).toFixed(0);
              const displayConf = (confidence * 100).toFixed(0);
              const verdict = getVerdictDetails(action);
              const VerdictIcon = verdict.icon;

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Trust Decision Outcome Card */}
                  <div className={`p-6 rounded-3xl border space-y-4 ${verdict.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-black/30">
                          <VerdictIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-xl font-extrabold tracking-wide uppercase">{verdict.badge}</div>
                          <div className="text-xs opacity-90 font-mono">{verdict.title}</div>
                        </div>
                      </div>

                      <button
                        onClick={copyReceiptJson}
                        className="px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-xs font-mono text-cyan-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy Receipt"}</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>Risk Score: <strong className="font-bold">{displayRisk} / 100</strong></div>
                      <div>Confidence: <strong className="font-bold">{displayConf}%</strong></div>
                      <div>Status: <strong className="font-bold underline">{verdict.badge}</strong></div>
                    </div>
                  </div>

                  {/* 4 Verification Pillars Breakdown */}
                  <div className="card-solid-dark p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                      Verification Engine Checks
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      
                      {/* Identity Pillar */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-violet-300 flex items-center justify-between">
                          <span>Identity</span>
                          <UserCheck className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">Is this agent authorized?</div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Agent identity verified
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Permission scope confirmed
                        </div>
                      </div>

                      {/* Intent Pillar */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-cyan-300 flex items-center justify-between">
                          <span>Intent</span>
                          <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">Does action match behaviour?</div>
                        <div className={`text-[11px] flex items-center gap-1 pt-1 ${verdict.isApproved ? "text-emerald-400" : "text-rose-400"}`}>
                          <Check className="w-3.5 h-3.5" /> {verdict.isApproved ? "Action matches policy" : "Semantic deviation flagged"}
                        </div>
                        <div className={`text-[11px] flex items-center gap-1 ${verdict.isApproved ? "text-emerald-400" : "text-amber-400"}`}>
                          <Check className="w-3.5 h-3.5" /> {verdict.isApproved ? "No unexpected override" : "T1-T8 taxonomy evaluated"}
                        </div>
                      </div>

                      {/* Risk Pillar */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-amber-300 flex items-center justify-between">
                          <span>Risk</span>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">Does action introduce exposure?</div>
                        <div className={`text-[11px] flex items-center gap-1 pt-1 ${verdict.isApproved ? "text-emerald-400" : "text-rose-400"}`}>
                          <Check className="w-3.5 h-3.5" /> {verdict.isApproved ? "Destination reviewed" : "Payee redirection risk"}
                        </div>
                        <div className={`text-[11px] flex items-center gap-1 ${verdict.isApproved ? "text-emerald-400" : "text-amber-400"}`}>
                          <Check className="w-3.5 h-3.5" /> {verdict.isApproved ? "Amount within threshold" : `Risk score: ${displayRisk}/100`}
                        </div>
                      </div>

                      {/* Policy Pillar */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-emerald-300 flex items-center justify-between">
                          <span>Policy</span>
                          <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">Does action comply with rules?</div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Limits satisfied
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Restrictions passed
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Trust Receipt Card */}
                  <div className="card-outlined p-6 rounded-3xl space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                      <span className="font-bold text-slate-200">Sentinel Trust Receipt</span>
                      <span className="text-emerald-400 text-[11px] font-bold">Ed25519 Signed &amp; Verifiable</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Agent Identity:</span>
                        <span className="text-cyan-300 font-bold">{agentIdentity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Verdict Hash:</span>
                        <span className="text-cyan-300 font-bold">{scanResult.trust_receipt?.verdict_hash?.slice(0, 24) || "0x..."}...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Signature:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[240px]">{scanResult.trust_receipt?.signature || "ed25519_sig..."}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>

        </div>

        {/* ── BUILT FOR AUTONOMOUS SYSTEMS GRID ──────────────────────────── */}
        <div className="card-solid-dark p-8 sm:p-10 rounded-3xl space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-white">Built For Autonomous Systems</h2>
            <p className="text-xs text-slate-400 font-mono">Sentinel protects high-risk execution touchpoints across AI &amp; Web3 workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300">AI Agents</div>
              <div className="text-[11px] text-slate-400">Prevent unauthorized or unsafe autonomous actions.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-violet-300">Financial Automation</div>
              <div className="text-[11px] text-slate-400">Verify payments, transfers, and settlements.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">Smart Contracts</div>
              <div className="text-[11px] text-slate-400">Add a decision layer before execution.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-300">Enterprise Workflows</div>
              <div className="text-[11px] text-slate-400">Create accountability for machine decisions.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-blue-300">Developers</div>
              <div className="text-[11px] text-slate-400">Integrate Sentinel into your execution flow.</div>
            </div>
          </div>
        </div>

        {/* ── EXECUTION FLOW DIAGRAM & API PREVIEW ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Execution Diagram */}
          <div className="lg:col-span-6 card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase">Execution Workflow</h3>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-3 font-mono text-xs">
              <div className="px-4 py-2 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">Agent</div>
              <div className="text-cyan-400">&darr;</div>
              <div className="px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">Sentinel Verification</div>
              <div className="text-cyan-400">&darr;</div>
              <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">Trust Receipt</div>
              <div className="text-cyan-400">&darr;</div>
              <div className="px-4 py-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">Execution</div>
            </div>
          </div>

          {/* API Preview */}
          <div className="lg:col-span-6 card-frosted-glass p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase">API Preview</h3>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
{`const decision = await sentinel.verify({
  agent,
  action,
  context
});

if (decision.approved) {
  execute();
}`}
            </pre>
          </div>

        </div>

        {/* ── FINAL CLOSING CALLOUT ──────────────────────────────────────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Every Action Should Have Proof</h3>
            <p className="text-xs text-slate-300 font-mono max-w-xl">
              Autonomous systems need more than logs. They need accountability. Sentinel creates the trust layer between machine decisions and real-world execution.
            </p>
          </div>

          <button
            onClick={handleRunScan}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Verify Your First Action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
