import React, { useState, useEffect } from "react";
import { GitCommit, ShieldCheck, ShieldAlert, ArrowDown, Search, Activity, CheckCircle2, AlertTriangle, XCircle, Code2, Clock, Filter, ArrowRight } from "lucide-react";
import { fetchChain } from "../services/api";
import { ChainHop } from "../types";

export const ChainVisualizer: React.FC = () => {
  const [jobId, setJobId] = useState("job_multi_agent_402");
  const [chain, setChain] = useState<ChainHop[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleFetchChain = async (targetId: string) => {
    setLoading(true);
    const { hops } = await fetchChain(targetId);
    setChain(hops);
    setLoading(false);
  };

  useEffect(() => {
    handleFetchChain(jobId);
  }, []);

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
        
        {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 font-mono text-xs font-semibold uppercase">
              SENTINEL CHAIN
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              See Every Decision. Verify Every Action.
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous systems need more than execution logs. They need a transparent history of why an agent acted, what was evaluated, and whether that decision could be trusted. Sentinel Chain creates an immutable timeline of agent decisions, verification events, and trust receipts.
            </p>
          </div>

          {/* Job Search Input */}
          <div className="flex flex-col sm:flex-row items-center gap-2 self-start md:self-auto w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Search Job ID (e.g. job_8821)..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleFetchChain(jobId)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Tracing Chain..." : "Explore Trust Chain"}
            </button>
          </div>
        </div>

        {/* ── AGENT ACTIVITY TIMELINE SUMMARY BAR ────────────────────────── */}
        <div className="p-6 rounded-3xl card-solid-dark grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Agent Identity</div>
            <div className="text-xl font-extrabold text-cyan-300">trading-agent-01</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Status</div>
            <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Trust Score</div>
            <div className="text-xl font-extrabold text-violet-300">94 / 100</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Verified Actions</div>
            <div className="text-xl font-extrabold text-amber-400">2,481</div>
          </div>
        </div>

        {/* ── RECENT DECISIONS (ACTION CARDS GRID) ───────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">Recent Agent Decisions</h2>
            <span className="text-xs font-mono text-slate-400">Sample Demonstration Trace Data &bull; Live Stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Approved Card */}
            <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-emerald-400 space-y-4 glow-emerald">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                </span>
                <span className="text-[11px] font-mono text-slate-400">2 minutes ago</span>
              </div>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="font-bold text-slate-200 text-sm">Automated Payment</div>
                <div className="text-slate-400">Agent: <strong className="text-cyan-300">trading-agent-01</strong></div>
                <div className="text-slate-400">Action: <strong className="text-slate-200">Transfer 250 USDC</strong></div>
                <div className="text-slate-400">Destination: <strong className="text-slate-300">0x84...92F</strong></div>
                <div className="text-slate-400">Risk: <strong className="text-emerald-400 font-bold">Low</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Receipt: <strong className="text-cyan-400">SL-8F92A1</strong></span>
                <span className="text-emerald-400 font-bold">Verified</span>
              </div>
            </div>

            {/* Review Required Card */}
            <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-amber-400 space-y-4 glow-amber">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> REVIEW REQUIRED
                </span>
                <span className="text-[11px] font-mono text-slate-400">18 minutes ago</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="font-bold text-slate-200 text-sm">Contract Interaction</div>
                <div className="text-slate-400">Agent: <strong className="text-cyan-300">trading-agent-01</strong></div>
                <div className="text-slate-400">Action: <strong className="text-slate-200">Approve token allowance</strong></div>
                <div className="text-slate-400">Contract: <strong className="text-slate-300">0x72...31A</strong></div>
                <div className="text-slate-400">Risk: <strong className="text-amber-400 font-bold">Medium</strong></div>
                <div className="text-amber-300 text-[11px] italic">Reason: Unusual permission scope detected</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Receipt: <strong className="text-amber-300">SL-7B21C0</strong></span>
                <span className="text-amber-400 font-bold">Awaiting Review</span>
              </div>
            </div>

            {/* Blocked Card */}
            <div className="p-6 rounded-3xl card-solid-dark border-l-4 border-l-rose-500 space-y-4 glow-rose">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> BLOCKED
                </span>
                <span className="text-[11px] font-mono text-slate-400">1 hour ago</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="font-bold text-slate-200 text-sm">External Transfer</div>
                <div className="text-slate-400">Agent: <strong className="text-cyan-300">trading-agent-01</strong></div>
                <div className="text-slate-400">Action: <strong className="text-slate-200">Transfer 10,000 USDC</strong></div>
                <div className="text-slate-400">Destination: <strong className="text-rose-400 font-bold">Unknown address</strong></div>
                <div className="text-slate-400">Risk: <strong className="text-rose-400 font-bold">Critical</strong></div>
                <div className="text-rose-400 text-[11px] italic">Reason: Outside approved spending policy</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Receipt: <strong className="text-rose-400">SL-1E94D8</strong></span>
                <span className="text-rose-400 font-bold">Rejected</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── TRUST GRAPH (FOLLOW THE DECISION PATH) ─────────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Trust Graph</h3>
            <p className="text-xs font-mono text-slate-400">Follow The Decision Path &bull; Every autonomous action is connected</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-center">
            <div className="px-4 py-2.5 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">
              Agent Identity
            </div>
            <div className="text-cyan-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              Intent Submitted
            </div>
            <div className="text-cyan-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">
              Sentinel Evaluation
            </div>
            <div className="text-cyan-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              Trust Receipt Generated
            </div>
            <div className="text-cyan-400">&rarr;</div>
            <div className="px-4 py-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              Execution / Rejection
            </div>
          </div>
        </div>

        {/* ── DECISION HISTORY FILTER & EVENT LOG TABLE ───────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h3 className="text-xl font-extrabold text-white">Decision History</h3>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1 mr-1"><Filter className="w-3.5 h-3.5" /> Filter by:</span>
              {["All", "Agent", "Action", "Risk Level", "Status"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    activeFilter === f
                      ? "bg-cyan-500/20 border border-cyan-500/60 text-cyan-300"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Event Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Agent</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Decision</th>
                  <th className="pb-3 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3.5 text-slate-400">21:04</td>
                  <td className="py-3.5 text-cyan-300 font-bold">Trading Agent</td>
                  <td className="py-3.5">Payment (250 USDC)</td>
                  <td className="py-3.5"><span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Approved</span></td>
                  <td className="py-3.5 text-emerald-400">Low</td>
                </tr>
                <tr>
                  <td className="py-3.5 text-slate-400">20:52</td>
                  <td className="py-3.5 text-cyan-300 font-bold">Trading Agent</td>
                  <td className="py-3.5">Swap (1.5 ETH &rarr; USDC)</td>
                  <td className="py-3.5"><span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Approved</span></td>
                  <td className="py-3.5 text-emerald-400">Low</td>
                </tr>
                <tr>
                  <td className="py-3.5 text-slate-400">20:31</td>
                  <td className="py-3.5 text-cyan-300 font-bold">Trading Agent</td>
                  <td className="py-3.5">Contract Call (Approve Allowance)</td>
                  <td className="py-3.5"><span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Review</span></td>
                  <td className="py-3.5 text-amber-400">Medium</td>
                </tr>
                <tr>
                  <td className="py-3.5 text-slate-400">19:48</td>
                  <td className="py-3.5 text-cyan-300 font-bold">Trading Agent</td>
                  <td className="py-3.5">Withdrawal (10,000 USDC)</td>
                  <td className="py-3.5"><span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Blocked</span></td>
                  <td className="py-3.5 text-rose-400 font-bold">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── WHY THE CHAIN MATTERS ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Why The Chain Matters</h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-1">
                <div className="text-slate-500 uppercase">Traditional systems record:</div>
                <div className="text-rose-400 font-bold">"The transaction happened."</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-200 space-y-1 glow-cyan">
                <div className="text-slate-500 uppercase">Sentinel records:</div>
                <div className="text-cyan-300 font-bold">"This agent made this decision, under these conditions, after passing these checks."</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              That difference creates accountability.
            </p>
          </div>

          {/* Developer API Preview */}
          <div className="card-frosted-glass p-8 rounded-3xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-violet-300 font-semibold uppercase">For Developers</span>
              <h3 className="text-lg font-extrabold text-white">Query Any Agent History</h3>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
{`const history = await sentinel.chain.getAgent({
  id: "trading-agent-01"
});`}
            </pre>

            <div className="text-xs font-mono text-slate-400">Returns:</div>
            <pre className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-[11px] text-emerald-400 font-mono leading-relaxed overflow-x-auto max-h-36">
{`{
  "agent": "trading-agent-01",
  "trustScore": 94,
  "decisions": 2481,
  "blockedActions": 7,
  "receipts": [...]
}`}
            </pre>
          </div>
        </div>

        {/* ── TRUST IS BUILT OVER TIME ──────────────────────────────────── */}
        <div className="card-solid-dark p-8 sm:p-10 rounded-3xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Trust Is Built Over Time</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              A single approval means little. Thousands of verified decisions create a reputation trail. Sentinel Chain gives autonomous systems:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300">Historical Accountability</div>
              <div className="text-[11px] text-slate-400">Audit-ready ledger of every past decision.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-violet-300">Behaviour Monitoring</div>
              <div className="text-[11px] text-slate-400">Detect scope creep &amp; anomaly deviations.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-300">Decision Transparency</div>
              <div className="text-[11px] text-slate-400">Complete visibility into intent &amp; risk factors.</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">Audit-Ready Records</div>
              <div className="text-[11px] text-slate-400">Cryptographically hash-linked for compliance.</div>
            </div>
          </div>
        </div>

        {/* ── FINAL CLOSING CALLOUT ──────────────────────────────────────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">The Future Of Agent Accountability</h3>
            <p className="text-xs text-slate-300 font-mono max-w-xl">
              Agents will not only need the ability to act. They will need a verifiable history proving how they acted.
            </p>
          </div>

          <button
            onClick={() => handleFetchChain(jobId)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Verify An Agent</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
