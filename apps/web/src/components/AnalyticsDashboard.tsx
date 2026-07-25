import React, { useState } from "react";
import { Activity, ShieldCheck, ShieldAlert, BarChart3, TrendingUp, AlertTriangle, Cpu, Users, ArrowRight, Code2, Clock, Check } from "lucide-react";

export const AnalyticsDashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState("trading-agent-01");

  return (
    <div className="bg-dot-grid min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
        
        {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl card-frosted-glass border border-cyan-500/30 glow-cyan">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 font-mono text-xs font-semibold uppercase">
              SENTINEL ANALYTICS
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Understand How Autonomous Systems Behave
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Trust is not created by a single decision. It is created by observing thousands of decisions over time. Sentinel Analytics gives teams visibility into agent behaviour, risk patterns, policy compliance, and decision quality across their autonomous systems.
            </p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
            className="self-start md:self-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <BarChart3 className="w-5 h-5" />
            <span>View Analytics Dashboard</span>
          </button>
        </div>

        {/* ── TRUST OVERVIEW METRICS ─────────────────────────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">Trust Overview</h2>
            <span className="text-xs font-mono text-slate-400">Agent Health At A Glance</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center font-mono">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Active Agents</div>
              <div className="text-3xl font-extrabold text-white">24</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Verified Decisions</div>
              <div className="text-3xl font-extrabold text-cyan-300">128,492</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Blocked Actions</div>
              <div className="text-3xl font-extrabold text-rose-400">347</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Average Trust Score</div>
              <div className="text-3xl font-extrabold text-emerald-400">96 / 100</div>
            </div>
          </div>
        </div>

        {/* ── DECISION PERFORMANCE & DISTRIBUTION ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Decision Performance */}
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Decision Performance</h3>
              <p className="text-xs font-mono text-slate-400">How Are Your Agents Performing?</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Decisions:</span>
                <strong className="text-slate-200 text-sm">128,492</strong>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>Approved:</span>
                <strong className="font-bold">94.8%</strong>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>Review Required:</span>
                <strong className="font-bold">4.1%</strong>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span>Blocked:</span>
                <strong className="font-bold">1.1%</strong>
              </div>
            </div>
          </div>

          {/* Decision Distribution Bars */}
          <div className="card-solid-dark p-8 rounded-3xl space-y-4 font-mono text-xs">
            <h3 className="text-lg font-bold text-white">Decision Distribution</h3>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>APPROVED</span>
                  <span>94.8%</span>
                </div>
                <div className="text-emerald-400 text-sm tracking-tighter">██████████████████░░</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>REVIEW</span>
                  <span>4.1%</span>
                </div>
                <div className="text-amber-400 text-sm tracking-tighter">██░░░░░░░░░░░░░░░░</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-rose-400 font-bold">
                  <span>BLOCKED</span>
                  <span>1.1%</span>
                </div>
                <div className="text-rose-400 text-sm tracking-tighter">█░░░░░░░░░░░░░░░░░</div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RISK INTELLIGENCE ──────────────────────────────────────────── */}
        <div className="card-solid-dark p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Risk Intelligence</h3>
            <p className="text-xs font-mono text-slate-400">Identify Threats Before They Become Incidents &bull; Sentinel continuously analyzes:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-cyan-300 text-sm">Behaviour Changes</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Detect unexpected changes in agent patterns.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[11px] italic">
                Example: Agent normally executes payments under $500. New request: $25,000 transfer.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-violet-300 text-sm">Policy Violations</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Track and log enforcement friction:
              </p>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div className="text-rose-400">&bull; Failed policy checks</div>
                <div className="text-rose-400">&bull; Permission scope conflicts</div>
                <div className="text-rose-400">&bull; Unauthorized state actions</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-amber-300 text-sm">Emerging Risks</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Identify systemic anomalies:
              </p>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div className="text-amber-400">&bull; Increasing failure rates</div>
                <div className="text-amber-400">&bull; Suspicious destinations</div>
                <div className="text-amber-400">&bull; Abnormal execution patterns</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── AGENT REPUTATION & AGENT COMPARISON TABLE ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Agent Reputation Timeline */}
          <div className="lg:col-span-5 card-solid-dark p-8 rounded-3xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-mono uppercase">Agent Reputation</h3>
              <p className="text-xs font-mono text-slate-400">Trust Score Over Time &bull; {selectedAgent}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400">Current Score:</span>
                <span className="text-emerald-400 font-bold text-lg">94 / 100</span>
              </div>

              <div className="space-y-2">
                <div className="text-slate-400 text-[11px] uppercase">History:</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Day 1</span>
                    <span className="text-cyan-300 font-bold">82</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Day 7</span>
                    <span className="text-cyan-300 font-bold">88</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Day 14</span>
                    <span className="text-cyan-300 font-bold">92</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Day 30</span>
                    <span className="text-emerald-400 font-bold">94</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Comparison Table */}
          <div className="lg:col-span-7 card-solid-dark p-8 rounded-3xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-mono uppercase">Agent Comparison</h3>
              <p className="text-xs font-mono text-slate-400">Compare Autonomous Systems</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Agent</th>
                    <th className="pb-3 font-semibold">Decisions</th>
                    <th className="pb-3 font-semibold">Trust Score</th>
                    <th className="pb-3 font-semibold">Blocked Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr
                    onClick={() => setSelectedAgent("Trading Agent")}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 text-cyan-300 font-bold">Trading Agent</td>
                    <td className="py-3.5">54,291</td>
                    <td className="py-3.5 text-emerald-400 font-bold">94</td>
                    <td className="py-3.5 text-rose-400">18</td>
                  </tr>
                  <tr
                    onClick={() => setSelectedAgent("Payment Agent")}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 text-cyan-300 font-bold">Payment Agent</td>
                    <td className="py-3.5">32,104</td>
                    <td className="py-3.5 text-emerald-400 font-bold">98</td>
                    <td className="py-3.5 text-rose-400">4</td>
                  </tr>
                  <tr
                    onClick={() => setSelectedAgent("Research Agent")}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 text-cyan-300 font-bold">Research Agent</td>
                    <td className="py-3.5">42,097</td>
                    <td className="py-3.5 text-emerald-400 font-bold">91</td>
                    <td className="py-3.5 text-rose-400">27</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── POLICY ANALYTICS & INCIDENT TIMELINE ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Policy Analytics */}
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Policy Analytics</h3>
            <p className="text-xs font-mono text-slate-400">Are Your Rules Working? &bull; Monitor policy triggers &amp; human escalations.</p>

            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 font-mono text-xs space-y-3 glow-cyan">
              <div className="text-slate-400 uppercase text-[11px]">Most Triggered Policy:</div>
              <div className="text-lg font-bold text-cyan-300">Maximum Transfer Limit</div>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-slate-300">
                <div>Triggered: <strong className="text-amber-400 font-bold">142 times</strong></div>
                <div>Prevented Exposure: <strong className="text-emerald-400 font-bold">$824,000</strong></div>
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">Incident Timeline</h3>
            <p className="text-xs font-mono text-slate-400">Track Important Events &bull; Real-Time Audit Stream</p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">22:04</span>
                <span className="text-rose-400">Blocked suspicious withdrawal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">21:48</span>
                <span className="text-cyan-300">New agent registered</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">21:20</span>
                <span className="text-violet-300">Policy updated</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">20:55</span>
                <span className="text-amber-400">High-risk contract interaction reviewed</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── FROM LOGS TO INTELLIGENCE & DEVELOPER API ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-solid-dark p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-extrabold text-white">From Logs To Intelligence</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-0.5">
                <div className="text-slate-500 uppercase">Traditional monitoring tells you:</div>
                <div className="text-rose-400 font-bold font-mono">"Something happened."</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-200 space-y-0.5 glow-cyan">
                <div className="text-slate-500 uppercase">Sentinel Analytics tells you:</div>
                <div className="text-cyan-300 font-bold font-mono">"This is how your autonomous system is behaving."</div>
              </div>
            </div>
          </div>

          {/* Developer API Preview */}
          <div className="card-frosted-glass p-8 rounded-3xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-300 font-semibold uppercase">Developer API</span>
              <h3 className="text-lg font-extrabold text-white">Access Trust Metrics Programmatically</h3>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto">
{`const analytics = await sentinel.analytics.getAgent({
  id: "trading-agent-01"
});`}
            </pre>

            <div className="text-xs font-mono text-slate-400">Returns:</div>
            <pre className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-[11px] text-emerald-400 font-mono leading-relaxed overflow-x-auto max-h-36">
{`{
  "trustScore": 94,
  "decisions": 2481,
  "blocked": 7,
  "riskTrend": "stable"
}`}
            </pre>
          </div>

        </div>

        {/* ── FINAL CLOSING CALLOUT ──────────────────────────────────────── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-cyan">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">The Future Of AI Oversight</h3>
            <p className="text-xs text-slate-300 font-mono max-w-xl">
              As autonomous systems scale, organizations will need more than execution. They will need visibility, accountability, and historical intelligence. Sentinel Analytics turns agent activity into actionable trust signals.
            </p>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Explore Your Agent Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
