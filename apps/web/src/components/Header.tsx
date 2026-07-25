import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, Activity, Settings, Lock, Coins, Layers, Play, FileText, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";
import { checkHealth, isSimulationMode } from "../services/api";
import { ApiSettingsModal } from "./ApiSettingsModal";

export type TabType = "overview" | "playground" | "chain" | "verifier" | "dispute" | "analytics";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [apiStatus, setApiStatus] = useState<"online" | "offline">("online");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [simMode, setSimMode] = useState(isSimulationMode());

  const refreshHealth = async () => {
    const health = await checkHealth();
    setApiStatus(health.status);
    setSimMode(isSimulationMode());
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a12]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Logo, Badges, Launch Scanner CTA */}
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/40 glow-cyan">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                    SENTINEL
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold uppercase tracking-wider">
                    A2MCP
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Trust Infrastructure For Autonomous Systems
                </div>
              </div>
            </div>

            {/* Live Badges: X Layer Testnet Bond & API Mode Status */}
            <div className="hidden lg:flex items-center gap-3">
              
              {/* Testnet Escrow Bond Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">X Layer Testnet Bond:</span>
                <span className="font-mono font-semibold text-amber-300">50,000 Mock OKB</span>
              </div>

              {/* Ed25519 Active Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Signatures:</span>
                <span className="font-mono font-semibold text-emerald-300">Ed25519 Native</span>
              </div>

              {/* Explicit API / Simulation Status Badge */}
              <div
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                  simMode
                    ? "bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60 shadow-md shadow-amber-500/10"
                    : apiStatus === "online"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/50"
                }`}
                title="Click to configure backend API settings"
              >
                <span className={`w-2 h-2 rounded-full ${simMode ? "bg-amber-400 animate-pulse" : apiStatus === "online" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                <span>{simMode ? "Demo Mode (Client Engine)" : apiStatus === "online" ? "API Live (Hono Backend)" : "Offline"}</span>
              </div>
            </div>

            {/* Primary Action Button: Launch Scanner */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Configure Backend API Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab("playground")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Scanner</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Navigation Bar Tabs with Purpose Titles */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/40">
            <button
              onClick={() => setActiveTab("overview")}
              title="Overview & Architecture"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              title="Verify Before Execution — Evaluate agent actions before they become irreversible."
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "playground"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab("chain")}
              title="Track Every Decision — Explore the complete history of autonomous activity."
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "chain"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Chain</span>
            </button>

            <button
              onClick={() => setActiveTab("verifier")}
              title="Verify Trust Proofs — Confirm that decisions were evaluated and recorded correctly."
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "verifier"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Receipts</span>
            </button>

            <button
              onClick={() => setActiveTab("dispute")}
              title="Challenge Decisions — Review, contest, and resolve questionable outcomes."
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "dispute"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Disputes</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              title="Understand Agent Behaviour — Monitor performance, risk, and trust over time."
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <a
              href="https://github.com/Olalolo22/Sentinel#readme"
              target="_blank"
              rel="noopener noreferrer"
              title="Build With Sentinel — Integrate verification into autonomous systems."
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all ml-auto"
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>Docs</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>
        </div>
      </header>

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={refreshHealth}
      />
    </>
  );
};
