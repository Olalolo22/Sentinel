import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, Activity, Settings, Lock, Coins } from "lucide-react";
import { checkHealth, isSimulationMode } from "../services/api";
import { ApiSettingsModal } from "./ApiSettingsModal";

export type TabType = "playground" | "chain" | "verifier" | "dispute" | "analytics";

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
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("playground")}>
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
                  Cryptographic Trust Layer for AI Agents
                </div>
              </div>
            </div>

            {/* Live Badges: X Layer Escrow & Ed25519 Key Status */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Escrow Bond Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">X Layer Bond:</span>
                <span className="font-mono font-semibold text-amber-300">50,000 OKB</span>
              </div>

              {/* Ed25519 Active Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Signatures:</span>
                <span className="font-mono font-semibold text-emerald-300">Ed25519 Native</span>
              </div>

              {/* API Status Badge */}
              <div
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                  simMode
                    ? "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50"
                    : apiStatus === "online"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${simMode ? "bg-purple-400 animate-pulse" : apiStatus === "online" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                <span>{simMode ? "Simulation Engine" : apiStatus === "online" ? "API Live" : "Offline (Fallback)"}</span>
              </div>
            </div>

            {/* Action Buttons & Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Configure Backend API Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/40">
            <button
              onClick={() => setActiveTab("playground")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "playground"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Interactive Scanner & Pipeline
            </button>

            <button
              onClick={() => setActiveTab("chain")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "chain"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Activity className="w-4 h-4" />
              A2MCP Chain Visualizer
            </button>

            <button
              onClick={() => setActiveTab("verifier")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "verifier"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Lock className="w-4 h-4" />
              Receipt Verifier
            </button>

            <button
              onClick={() => setActiveTab("dispute")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "dispute"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Coins className="w-4 h-4" />
              Disputes & Slashable Escrow
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Activity className="w-4 h-4" />
              Analytics & Threat Intel
            </button>
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
