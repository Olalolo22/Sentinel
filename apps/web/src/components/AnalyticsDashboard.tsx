import React from "react";
import { Activity, ShieldAlert, Clock, Coins, Flame, Layers, Lock, Cpu } from "lucide-react";

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              REAL-TIME THREAT INTEL
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Metrics & Taxonomy</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Sentinel Threat Intelligence & Analytics</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Live telemetry on intercepted AI Agent attack vectors, Stage 1 heuristic short-circuits, Ed25519 trust receipts, and immune system dynamic rule generation.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Scans Evaluated</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">14,290</div>
          <div className="text-[11px] text-emerald-400 font-mono">+12.4% vs last 24h</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Threat Interception Rate</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">99.4%</div>
          <div className="text-[11px] text-slate-400 font-mono">312 Attack Vectors Blocked</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Avg Stage 1 Short-Circuit</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">18.2 ms</div>
          <div className="text-[11px] text-slate-400 font-mono">&lt;20ms SLA Maintained</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Immune Rules Synthesized</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">27 Rules</div>
          <div className="text-[11px] text-purple-300 font-mono">Stage 4 Active</div>
        </div>

      </div>

      {/* Threat Taxonomy Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
          Threat Taxonomy Distribution (T1 - T8 Categories)
        </h3>

        <div className="space-y-4">
          {[
            { tag: "T1", name: "Direct System Prompt Hijack", count: 142, percentage: 45, color: "bg-rose-500" },
            { tag: "T2", name: "Zero-Width Steganography & Tag Smuggling", count: 88, percentage: 28, color: "bg-purple-500" },
            { tag: "T3", name: "Data Exfiltration & Secret Leakage", count: 48, percentage: 15, color: "bg-amber-500" },
            { tag: "T4", name: "Financial Settlement & Payee Redirection", count: 24, percentage: 8, color: "bg-cyan-500" },
            { tag: "T5", name: "Bidi Override & Formatting Attack", count: 10, percentage: 4, color: "bg-emerald-500" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">{item.tag}: {item.name}</span>
                <span className="text-slate-400">{item.count} Intercepted ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
