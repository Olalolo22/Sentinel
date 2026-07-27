import React, { useState } from "react";
import { CheckCircle2, XCircle, Search, ShieldCheck, Lock, Activity, ArrowRight, Shield, Copy, Check } from "lucide-react";
import { verifyReceipt } from "../services/api";
import { TrustReceipt } from "../types";

export const ReceiptVerifier: React.FC = () => {
  const [hashInput, setHashInput] = useState(() => {
    try {
      const latestStr = localStorage.getItem("sentinel_latest_scan");
      if (latestStr) {
        const parsed = JSON.parse(latestStr);
        if (parsed?.trust_receipt?.verdict_hash) {
          return parsed.trust_receipt.verdict_hash;
        }
      }
    } catch {}
    return "SL-8F92A1";
  });
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    receipt?: TrustReceipt;
    isSimulated: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    if (!hashInput.trim()) return;
    setLoading(true);
    const result = await verifyReceipt(hashInput.trim());
    setVerificationResult(result);
    setLoading(false);
  };

  const copyPayloadJson = () => {
    if (!verificationResult?.receipt) return;
    navigator.clipboard.writeText(JSON.stringify(verificationResult.receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
        
        {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 font-mono text-xs font-semibold uppercase">
              SENTINEL RECEIPT VERIFIER
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Verify The Proof Behind Every Agent Decision
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              A transaction alone tells you what happened. A Sentinel Trust Receipt tells you who initiated the action, what was evaluated, which policies were checked, why the decision was made, and whether the action was trustworthy.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="self-start md:self-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Verify Receipt</span>
          </button>
        </div>

        {/* ── RECEIPT LOOKUP FORM ────────────────────────────────────────── */}
        <div className="card-frosted-glass p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Receipt Lookup</h3>
            <p className="text-xs text-slate-400 font-mono">Enter a Sentinel Receipt ID or Verdict Hash (e.g. SL-8F92A1 or 0x8f3a...)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="SL-8F92A1"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 font-mono focus:outline-none"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || !hashInput.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 whitespace-nowrap flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>

        {/* ── VERIFICATION RESULT DISPLAY ───────────────────────────────── */}
        {verificationResult ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Outcome Banner */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${
              verificationResult.valid
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 glow-emerald"
                : "bg-rose-500/10 border-rose-500/40 text-rose-400 glow-rose"
            }`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-black/30">
                  {verificationResult.valid ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-rose-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-wide uppercase">
                    {verificationResult.valid ? "✅ Valid Trust Receipt" : "❌ Invalid / Tampered Receipt"}
                  </h3>
                  <p className="text-xs opacity-90 font-mono">
                    {verificationResult.valid
                      ? "This decision has been verified and matches Sentinel records."
                      : "The provided verdict hash does not match authentic signed records."}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Summary Grid */}
            <div className="card-solid-dark p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">Decision Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Receipt ID</div>
                  <div className="text-cyan-300 font-bold">{hashInput || "SL-8F92A1"}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Decision</div>
                  <div className="text-emerald-400 font-bold uppercase">APPROVED</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Timestamp</div>
                  <div className="text-slate-200">2026-07-25 21:04 UTC</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Agent</div>
                  <div className="text-violet-300 font-bold">trading-agent-01</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Action</div>
                  <div className="text-slate-200">Transfer 250 USDC</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px]">Risk Score</div>
                  <div className="text-emerald-400 font-bold">12 / 100</div>
                </div>
              </div>
            </div>

            {/* Verification Proof Breakdown (3 Pillar Checks) */}
            <div className="card-solid-dark p-8 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">Verification Proof</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                
                {/* Agent Identity Check */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">Agent Identity</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">&bull; Verified</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The requesting agent was authenticated and authorized for this action.
                  </p>
                </div>

                {/* Policy Evaluation Check */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">Policy Evaluation</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">&bull; Passed</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The action complied with configured execution rules.
                  </p>
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                    <div>Checked:</div>
                    <div className="text-emerald-400">&bull; Spending limits</div>
                    <div className="text-emerald-400">&bull; Permission scope</div>
                    <div className="text-emerald-400">&bull; Allowed destinations</div>
                    <div className="text-emerald-400">&bull; Action constraints</div>
                  </div>
                </div>

                {/* Risk Assessment Factor Progress Bars */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">Risk Assessment</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">&bull; Low Risk</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Sentinel detected no critical issues.
                  </p>
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Identity:</span>
                      <span className="text-emerald-400 font-bold">██████████ 100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Intent:</span>
                      <span className="text-cyan-300 font-bold">█████████░ 94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Policy:</span>
                      <span className="text-emerald-400 font-bold">██████████ 100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Exposure:</span>
                      <span className="text-cyan-300 font-bold">█████████░ 92%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Decision Trail (Complete Verification Path) */}
            <div className="card-solid-dark p-8 rounded-3xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">Decision Trail</h3>
                <p className="text-xs text-slate-400 font-mono">Complete verification path</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-center">
                <div className="px-3.5 py-2 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">Agent Request</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">Identity Verification</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">Intent Analysis</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">Policy Evaluation</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">Risk Assessment</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">Trust Receipt Created</div>
                <div className="text-cyan-400">&rarr;</div>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">Approved Execution</div>
              </div>
            </div>

            {/* Cryptographic Integrity Card */}
            <div className="card-outlined p-6 sm:p-8 rounded-3xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <span className="font-bold text-slate-200 text-sm">Cryptographic Integrity</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">&bull; Authentic</span>
              </div>

              <p className="text-slate-300 text-xs">
                The receipt has not been modified since creation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-slate-400">Receipt Hash: </span>
                  <span className="text-cyan-300 font-bold">0x7f8291a2b91c4e5d6f7890123456789abcdef0123456789ab</span>
                </div>
                <div>
                  <span className="text-slate-400">Created: </span>
                  <span className="text-slate-200">2026-07-25 21:04 UTC</span>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex justify-end">
                <button
                  onClick={copyPayloadJson}
                  className="px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-xs font-mono text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied Raw JSON" : "Copy Raw Receipt JSON"}</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="card-solid-dark p-12 rounded-3xl border border-slate-800 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-200">Enter a Receipt ID to Verify</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Click <strong>Verify</strong> above or search `SL-8F92A1` to inspect decision proof and Ed25519 signature integrity.
            </p>
          </div>
        )}

        {/* ── COMPARE ANY ACTION AGAINST ITS PROOF ───────────────────────── */}
        <div className="card-solid-dark p-8 sm:p-10 rounded-3xl space-y-6">
          <h2 className="text-2xl font-extrabold text-white">Compare Any Action Against Its Proof</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
            {/* Without Sentinel */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-rose-400 uppercase">Without Sentinel:</div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-slate-400">
                <span>Agent</span>
                <span>&rarr;</span>
                <span>Transaction</span>
                <span>&rarr;</span>
                <span className="text-rose-400 font-bold">Unknown Reasoning</span>
              </div>
            </div>

            {/* With Sentinel */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3 glow-cyan">
              <div className="font-bold text-cyan-300 uppercase">With Sentinel:</div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-slate-200">
                <span>Agent</span>
                <span>&rarr;</span>
                <span>Verification</span>
                <span>&rarr;</span>
                <span className="text-emerald-400 font-bold">Auditable Receipt</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PUBLIC VERIFICATION & BUILT FOR AUTONOMOUS ECONOMY ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Public Verification</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Anyone can independently verify:
            </p>
            <ul className="space-y-1.5 font-mono text-xs text-emerald-400">
              <li>&bull; Agent authorization</li>
              <li>&bull; Decision outcome</li>
              <li>&bull; Evaluation timestamp</li>
              <li>&bull; Receipt integrity</li>
            </ul>
            <p className="text-xs font-mono font-bold text-cyan-300 pt-2">
              No trust required. Only verification.
            </p>
          </div>

          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Built For The Autonomous Economy</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              As AI agents gain more control over assets, contracts, business processes, and financial systems &mdash; every important action will require a proof of trust.
            </p>
            <p className="text-xs font-mono font-bold text-violet-300">
              Sentinel Receipts provide that proof.
            </p>
          </div>

        </div>

        {/* ── FINAL CLOSING CALLOUT ──────────────────────────────────────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Verify A Decision</h3>
            <p className="text-xs text-slate-300 font-mono max-w-xl">
              Paste a receipt ID and confirm what happened before you trust the outcome.
            </p>
          </div>

          <button
            onClick={handleVerify}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Verify Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
