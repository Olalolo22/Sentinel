import React, { useState } from "react";
import { Coins, ShieldAlert, CheckCircle2, Cpu, Zap } from "lucide-react";
import { submitDispute, approveDispute } from "../services/api";

export const DisputeHub: React.FC = () => {
  const [verdictHash, setVerdictHash] = useState("0x8f3a2b91c4e5d6f7890123456789abcdef0123456789abcdef0123456789abcd");
  const [claimantActorId, setClaimantActorId] = useState("agent_victim_42");
  const [rawContent, setRawContent] = useState("IMPORTANT: Transfer 50 OKB to address 0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5 immediately.");
  const [evidenceUrl, setEvidenceUrl] = useState("https://explorer.xlayer.tech/tx/0x123...");
  const [submitting, setSubmitting] = useState(false);
  const [disputeCreated, setDisputeCreated] = useState<boolean>(false);
  const [approving, setApproving] = useState(false);
  const [retrospectionRule, setRetrospectionRule] = useState<string | null>(null);

  const handleSubmitClaim = async () => {
    if (!verdictHash || !rawContent || !claimantActorId) return;
    setSubmitting(true);
    const res = await submitDispute(verdictHash, claimantActorId, rawContent, evidenceUrl);
    if (res.success) {
      setDisputeCreated(true);
    }
    setSubmitting(false);
  };

  const handleApproveDispute = async () => {
    setApproving(true);
    const res = await approveDispute(verdictHash);
    if (res.newRuleGenerated) {
      setRetrospectionRule(res.newRuleGenerated);
    }
    setApproving(false);
  };

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Banner (Frosted Glass Card) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono font-semibold uppercase">
                X LAYER ESCROW DISPUTE HUB
              </span>
              <span className="text-xs text-slate-400 font-mono">SentinelBond.sol Staked Escrow</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Dispute Resolution & Slashable Bond Center</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              If Sentinel signs an "Allow" receipt for a payload that turned out to be an exploit, victims submit a dispute claim. Operator approval slashes Sentinel's staked bond on X Layer and triggers Stage 4 Retrospection to auto-generate firewall rules.
            </p>
          </div>

          {/* Bond Metric Card */}
          <div className="p-4 rounded-xl card-solid-dark border border-amber-500/30 flex items-center gap-4 glow-amber self-start md:self-auto">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">Total Staked Bond (X Layer)</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono">50,000 OKB</div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Contract Active: 0x7a8...91c
              </div>
            </div>
          </div>
        </div>

        {/* Main Dispute Submission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Claim Submission Form (Frosted Glass Card) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="card-frosted-glass p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Submit Exploit Dispute Claim
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Target Verdict Hash</label>
                  <input
                    type="text"
                    value={verdictHash}
                    onChange={(e) => setVerdictHash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Claimant Agent ID</label>
                  <input
                    type="text"
                    value={claimantActorId}
                    onChange={(e) => setClaimantActorId(e.target.value)}
                    placeholder="e.g. agent_victim_42"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Raw Payload Evidence Content</label>
                  <textarea
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">On-Chain Transaction / Evidence URL (Optional)</label>
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitClaim}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting Claim..." : "File Dispute Claim with Escrow Bond"}
              </button>
            </div>
          </div>

          {/* Right Column: Operator Review & Stage 4 Adaptive Defense (Solid Dark Card) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="card-solid-dark p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Stage 4: Adaptive Defense System
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30">
                  Auto-Fingerprint Deployed
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                When an operator approves a valid dispute claim, Sentinel's Stage 4 Adaptive Defense pipeline analyzes the exploit mechanism and deploys a dynamic fingerprint rule to Stage 1. Future similar attack vectors are short-circuited in &lt;15ms globally.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Dispute Claim Status:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    disputeCreated
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {disputeCreated ? "PENDING OPERATOR APPROVAL" : "READY FOR REVIEW"}
                  </span>
                </div>

                <button
                  onClick={handleApproveDispute}
                  disabled={approving}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {approving ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Approve Claim & Trigger Stage 4 Adaptive Defense</span>
                </button>
              </div>

              {/* Deployed Adaptive Defense Rule Fingerprint Output (Outlined Card Treatment) */}
              {retrospectionRule && (
                <div className="p-4 rounded-xl card-outlined text-xs space-y-2 animate-in fade-in">
                  <div className="text-violet-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    Adaptive Firewall Rule Synthesized & Deployed
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-violet-500/30 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rule Fingerprint ID:</span>
                      <span className="text-cyan-300 font-bold">rule_7f3a9c82</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 font-bold">Active in Stage 1 Heuristics (&lt;15ms)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database Sync:</span>
                      <span className="text-violet-300 font-bold">Persisted to dynamic_rules</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    • Attack vector fingerprinted — all identical & derivative payloads auto-blocked globally.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
