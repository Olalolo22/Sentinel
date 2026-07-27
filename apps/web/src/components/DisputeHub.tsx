import React, { useState } from "react";
import { AlertCircle, Scale, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Code2, Clock, Coins, ArrowRight, Check } from "lucide-react";
import { submitDispute } from "../services/api";

export const DisputeHub: React.FC = () => {
  const [receiptId, setReceiptId] = useState(() => {
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
  const [reason, setReason] = useState("Incorrect risk assessment");
  const [evidence, setEvidence] = useState("Agent executed transfer immediately before policy update was propagated.");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitDispute = async () => {
    if (!receiptId.trim() || !evidence.trim()) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    await submitDispute(receiptId, "agent_claimant", evidence);

    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
        
        {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl card-frosted-glass border border-amber-500/30 glow-amber">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold uppercase">
              SENTINEL DISPUTE HUB
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              When Machines Decide, Someone Must Be Able To Challenge The Outcome
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous systems will make mistakes. Policies will change. Context will be misunderstood. A trust layer is incomplete if decisions can only be accepted &mdash; not questioned. Sentinel Dispute Hub provides a transparent process for reviewing, challenging, and resolving agent decisions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-right font-mono text-xs space-y-1 shrink-0">
            <div className="text-slate-400">X Layer Testnet Escrow Pool:</div>
            <div className="text-amber-400 font-bold text-lg">Mock 50,000 OKB Staked</div>
            <div className="text-[11px] text-slate-500">10× Fee Refund Guarantee (Testnet)</div>
          </div>
        </div>

        {/* ── FORM & ACTIVE DISPUTES SPLIT GRID ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Challenge A Decision Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-frosted-glass p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Challenge A Decision</h3>
                <p className="text-xs text-slate-400 font-mono">Submit a Sentinel Receipt for Review</p>
              </div>

              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5"><Check className="w-4 h-4" /> Dispute Claim Submitted</div>
                  <div className="text-[11px] opacity-90">Case opened for receipt {receiptId}. Reviewers assigned.</div>
                </div>
              )}

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Receipt ID</label>
                  <input
                    type="text"
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    placeholder="SL-8F92A1"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason For Dispute</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Incorrect risk assessment">Incorrect risk assessment</option>
                    <option value="Unauthorized action">Unauthorized action</option>
                    <option value="Policy violation">Policy violation</option>
                    <option value="Missing context">Missing context</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Additional Evidence</label>
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={5}
                    placeholder="Describe the issue..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitDispute}
                disabled={submitting || !receiptId.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Scale className="w-4 h-4" />
                <span>{submitting ? "Filing Review..." : "Submit Review"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Disputes Stream */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Active Disputes</h3>
              <span className="text-xs font-mono text-slate-400">Sample Active Reviews (Demonstration Data)</span>
            </div>

            <div className="space-y-4">
              
              {/* Dispute Card 1 (Unauthorized Transaction) */}
              <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-rose-500 space-y-3 glow-rose">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    🔴 Unauthorized Transaction
                  </span>
                  <span className="text-slate-400 text-[11px]">Opened 2 hours ago</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div>Receipt: <strong className="text-cyan-300">SL-82D91B</strong></div>
                  <div>Agent: <strong className="text-violet-300">payment-agent-04</strong></div>
                  <div>Action: <strong className="text-slate-200">Transfer 5,000 USDC</strong></div>
                  <div>Status: <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Under Investigation</span></div>
                </div>
              </div>

              {/* Dispute Card 2 (Context Mismatch) */}
              <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-amber-400 space-y-3 glow-amber">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    🟡 Context Mismatch
                  </span>
                  <span className="text-slate-400 text-[11px]">Opened 5 hours ago</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div>Receipt: <strong className="text-cyan-300">SL-91FA22</strong></div>
                  <div>Agent: <strong className="text-violet-300">trading-agent-01</strong></div>
                  <div>Action: <strong className="text-slate-200">Execute market swap</strong></div>
                  <div>Status: <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Awaiting Evidence</span></div>
                </div>
              </div>

              {/* Dispute Card 3 (Resolved) */}
              <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-emerald-400 space-y-3 glow-emerald">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    🟢 Resolved
                  </span>
                  <span className="text-slate-400 text-[11px]">Resolved Yesterday</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div>Receipt: <strong className="text-cyan-300">SL-72BC11</strong></div>
                  <div>Decision: <strong className="text-rose-400">Blocked</strong></div>
                  <div>Resolution: <strong className="text-emerald-400">Correct Decision</strong></div>
                  <div>Status: <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Upheld &amp; Closed</span></div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── DISPUTE LIFECYCLE DIAGRAM ─────────────────────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Dispute Lifecycle</h3>
            <p className="text-xs font-mono text-slate-400">Every challenge follows a transparent process</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-center">
            <div className="px-4 py-2.5 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">Decision Made</div>
            <div className="text-amber-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">Dispute Submitted</div>
            <div className="text-amber-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">Evidence Collected</div>
            <div className="text-amber-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">Review Performed</div>
            <div className="text-amber-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">Resolution Recorded</div>
            <div className="text-amber-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">Trust History Updated</div>
          </div>
        </div>

        {/* ── EVIDENCE LAYER & RESOLUTION RECORD EXAMPLE ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Evidence Layer */}
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Evidence Layer</h3>
            <p className="text-xs text-slate-300 font-mono">Every Claim Needs Context &bull; Disputes are evaluated using:</p>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <div className="font-bold text-cyan-300">Original Decision</div>
                <div className="text-slate-400 text-[11px]">The exact action Sentinel reviewed.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <div className="font-bold text-violet-300">Verification Data</div>
                <div className="text-slate-400 text-[11px]">The checks performed during evaluation.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <div className="font-bold text-amber-300">Additional Context</div>
                <div className="text-slate-400 text-[11px]">New information submitted after the decision.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <div className="font-bold text-emerald-300">Resolution Outcome</div>
                <div className="text-slate-400 text-[11px]">The final determination and reasoning.</div>
              </div>
            </div>
          </div>

          {/* Resolution Record Example */}
          <div className="card-outlined p-8 rounded-3xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <span className="font-bold text-amber-400 uppercase tracking-wider">DISPUTE RESOLUTION RECORD</span>
              <span className="text-slate-400 text-[11px]">Case SL-82D91B</span>
            </div>

            <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
              <div>Receipt: <strong className="text-cyan-300">SL-82D91B</strong></div>
              <div>Original Decision: <strong className="text-emerald-400">APPROVED</strong></div>
              <div>Final Decision: <strong className="text-rose-400 font-bold">REVERSED</strong></div>
              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-300 italic">
                Reason: Agent exceeded updated spending policy limit prior to transaction execution.
              </div>
              <div>Reviewer: <strong className="text-violet-300">Sentinel Governance &amp; Arbitration</strong></div>
              <div>Timestamp: <strong className="text-slate-200">2026-07-25 22:15 UTC</strong></div>
            </div>
          </div>

        </div>

        {/* ── TRUST IMPROVES THROUGH ACCOUNTABILITY ────────────────────── */}
        <div className="card-solid-dark p-8 sm:p-10 rounded-3xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Trust Improves Through Accountability</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              A mistake hidden in a log disappears. A mistake reviewed through a transparent process becomes intelligence. Sentinel uses dispute outcomes to improve:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300">Agent Reputation</div>
              <div className="text-[11px] text-slate-400">Dynamic score adjustments for historical accuracy.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-violet-300">Policy Enforcement</div>
              <div className="text-[11px] text-slate-400">Automatic policy bounds calibration.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">Risk Models</div>
              <div className="text-[11px] text-slate-400">Feedback loops for Stage 2 LLM threat judge.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-300">Stage 4 Retrospection</div>
              <div className="text-[11px] text-slate-400">Instant regex firewall rule synthesis.</div>
            </div>
          </div>
        </div>

        {/* ── DEVELOPER INTEGRATION CODE & FOR AUTONOMOUS SYSTEMS ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Build Agents That Can Be Held Accountable</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              The future is not: <span className="text-slate-500 italic font-bold">"AI makes decisions."</span>
            </p>
            <p className="text-xs font-mono font-bold text-amber-300">
              The future is: "AI makes decisions that can be verified, challenged, and understood."
            </p>
          </div>

          <div className="card-frosted-glass p-8 rounded-3xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-300 font-semibold uppercase">Developer Integration</span>
              <h3 className="text-lg font-extrabold text-white">Create Dispute Workflows</h3>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
{`await sentinel.disputes.create({
  receiptId,
  reason,
  evidence
});

const dispute = await sentinel.disputes.get({ id });`}
            </pre>
          </div>

        </div>

        {/* ── FINAL CLOSING CALLOUT ──────────────────────────────────────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-amber">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Trust Requires Recourse</h3>
            <p className="text-xs text-slate-300 font-mono max-w-xl">
              Verification proves what happened. Disputes determine what should happen next. Sentinel creates the accountability layer for autonomous decisions.
            </p>
          </div>

          <button
            onClick={handleSubmitDispute}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Review A Decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
