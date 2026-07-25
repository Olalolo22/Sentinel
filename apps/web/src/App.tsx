import React, { useState } from "react";
import { Header, TabType } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { ScannerPlayground } from "./components/ScannerPlayground";
import { ChainVisualizer } from "./components/ChainVisualizer";
import { ReceiptVerifier } from "./components/ReceiptVerifier";
import { DisputeHub } from "./components/DisputeHub";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Shield, Github, ExternalLink } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Navbar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === "overview" && (
          <LandingPage
            onLaunchApp={() => setActiveTab("playground")}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "playground" && <ScannerPlayground />}
        {activeTab === "chain" && <ChainVisualizer />}
        {activeTab === "verifier" && <ReceiptVerifier />}
        {activeTab === "dispute" && <DisputeHub />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05080e] py-12 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Branding & Global Statement */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-100 font-mono text-base tracking-wider">SENTINEL</span>
              </div>
              <div className="text-sm font-semibold text-slate-300">
                Trust Infrastructure For Autonomous Systems
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Autonomous systems will make decisions. Sentinel makes those decisions verifiable.
              </p>
            </div>

            {/* Navigation & Developer Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 font-mono text-xs">
              
              {/* Navigation Links */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Navigation</div>
                <ul className="space-y-1.5 text-slate-400">
                  <li>
                    <button onClick={() => setActiveTab("playground")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                      Scanner
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab("chain")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                      Chain
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab("verifier")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                      Receipts
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab("dispute")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                      Disputes
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab("analytics")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                      Analytics
                    </button>
                  </li>
                </ul>
              </div>

              {/* Developer Links */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Developer</div>
                <ul className="space-y-1.5 text-slate-400">
                  <li><a href="https://github.com/Olalolo22/Sentinel" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">API Specification</a></li>
                  <li><a href="https://github.com/Olalolo22/Sentinel/tree/main/packages/sdk" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">@sentinel/sdk</a></li>
                  <li><a href="https://github.com/Olalolo22/Sentinel" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Github className="w-3 h-3" /> GitHub Repo</a></li>
                  <li><a href="https://github.com/Olalolo22/Sentinel#readme" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
                </ul>
              </div>

              {/* Protocols */}
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Infrastructure</div>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="text-emerald-400 font-semibold">&bull; Ed25519 Native Signatures</li>
                  <li className="text-amber-400 font-semibold">&bull; X Layer Escrow Pool</li>
                  <li className="text-cyan-400 font-semibold">&bull; OKX A2MCP Standard</li>
                </ul>
              </div>

            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div>&copy; 2026 Sentinel Trust Infrastructure. Built for OKX.AI Genesis Hackathon.</div>
            <div className="flex items-center gap-4">
              <span>RFC 8785 Canonical JSON</span>
              <span>&bull;</span>
              <span>SHA-256 Hashed Receipts</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
