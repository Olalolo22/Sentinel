import React, { useState } from "react";
import { Header, TabType } from "./components/Header";
import { ScannerPlayground } from "./components/ScannerPlayground";
import { ChainVisualizer } from "./components/ChainVisualizer";
import { ReceiptVerifier } from "./components/ReceiptVerifier";
import { DisputeHub } from "./components/DisputeHub";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Shield, GitBranch, Github, ExternalLink } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>("playground");

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Navbar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === "playground" && <ScannerPlayground />}
        {activeTab === "chain" && <ChainVisualizer />}
        {activeTab === "verifier" && <ReceiptVerifier />}
        {activeTab === "dispute" && <DisputeHub />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05080e] py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200 font-mono">SENTINEL A2MCP TRUST LAYER</div>
              <div className="text-[11px] text-slate-400">Built for OKX.AI Genesis Hackathon & Stablecoin Commerce Stack Challenge</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-mono text-[11px]">
            <a
              href="https://github.com/Olalolo22/Sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
            <span className="text-slate-800">•</span>
            <span>Ed25519 Native</span>
            <span className="text-slate-800">•</span>
            <span>X Layer Escrow</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
