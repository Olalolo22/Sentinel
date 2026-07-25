import React, { useState, useEffect } from "react";
import { Activity, GitCommit, ShieldCheck, ShieldAlert, ArrowDown, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchChain } from "../services/api";
import { ChainHop } from "../types";

export const ChainVisualizer: React.FC = () => {
  const [jobId, setJobId] = useState("job_multi_agent_402");
  const [chain, setChain] = useState<ChainHop[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const handleFetchChain = async (targetId: string) => {
    setLoading(true);
    const { hops, isSimulated: sim } = await fetchChain(targetId);
    setChain(hops);
    setIsSimulated(sim);
    setLoading(false);
  };

  useEffect(() => {
    handleFetchChain(jobId);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              A2MCP PIPELINE TRACER
            </span>
            <span className="text-xs text-slate-400 font-mono">Job Execution Graph</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Multi-Agent Execution Chain Visualizer</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Trace cryptographic trust receipts linked across multi-hop AI agent workflows (`job_id`). Verifies that downstream agents are not compromised by upstream payload injections.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Search Job ID..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleFetchChain(jobId)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Trace Chain"}
          </button>
        </div>
      </div>

      {/* Main Graph Visualization */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-sm font-bold text-slate-200">Execution Trail for Job: </span>
              <span className="text-sm font-mono text-cyan-300 font-bold">{jobId}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Hops: {chain.length}</span>
        </div>

        {chain.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No execution receipts found for job ID: {jobId}
          </div>
        ) : (
          <div className="relative space-y-6 max-w-3xl mx-auto py-4">
            
            {chain.map((hop, idx) => {
              const isLast = idx === chain.length - 1;
              const isRejected = hop.action === "reject";
              const isReview = hop.action === "review";

              return (
                <div key={idx} className="relative flex flex-col items-center">
                  
                  {/* Card Node */}
                  <div className={`w-full p-5 rounded-2xl border transition-all ${
                    isRejected
                      ? "bg-rose-950/30 border-rose-500/50 glow-rose"
                      : isReview
                      ? "bg-amber-950/30 border-amber-500/50 glow-amber"
                      : "bg-slate-900/80 border-slate-800 glow-cyan"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isRejected
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : isReview
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        }`}>
                          #{hop.step}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>Actor:</span>
                            <span className="font-mono text-cyan-300">{hop.actor_id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Timestamp: {new Date(hop.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 self-start sm:self-auto ${
                        isRejected
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : isReview
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      }`}>
                        {isRejected ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>{hop.action.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Hashes & Validity Details */}
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Verdict Hash: </span>
                        <span className="text-slate-300 font-semibold">{hop.verdict_hash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Parent Link: </span>
                        <span className="text-slate-400">{hop.prev_receipt_hash || "ROOT_NODE (Genesis)"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Arrow for Hop */}
                  {!isLast && (
                    <div className="py-3 flex flex-col items-center text-cyan-400/60">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/60 to-cyan-500/20" />
                      <ArrowDown className="w-4 h-4 -mt-1 text-cyan-400 animate-bounce" />
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
};
