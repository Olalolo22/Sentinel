import React, { useState } from "react";
import { X, Server, Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { getStoredApiUrl, setStoredApiUrl, isSimulationMode, setSimulationMode, checkHealth } from "../services/api";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [apiUrl, setApiUrl] = useState(getStoredApiUrl());
  const [simMode, setSimMode] = useState(isSimulationMode());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setStoredApiUrl(apiUrl.trim());
    setSimulationMode(simMode);
    onSettingsChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Temp save to test
    setStoredApiUrl(apiUrl.trim());
    setSimulationMode(simMode);

    const health = await checkHealth();
    if (health.status === "online") {
      setTestResult({ status: "success", message: `Connected! Sentinel API v${health.version}` });
    } else {
      setTestResult({ status: "error", message: "Could not reach API. Standalone fallback mode will be used." });
    }
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel bg-[#0d1320]/95 border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">API Endpoint & Environment Settings</h3>
              <p className="text-xs text-slate-400">Configure live backend URL for Vercel/Railway deployment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Backend API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. https://sentinel-api.up.railway.app or http://localhost:3000"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Leave blank to use relative proxy `/v1` or configured `VITE_API_URL`.
            </p>
          </div>

          {/* Simulation Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Force In-Browser Simulation Engine</div>
                <div className="text-xs text-slate-400">Use zero-latency client-side engine for offline demos</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simMode}
                onChange={(e) => setSimMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.status === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            Test Connection
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
