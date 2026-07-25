import React, { useState } from "react";
import { Lock, CheckCircle2, XCircle, Search, ShieldCheck, Copy, Check, FileCode } from "lucide-react";
import { verifyReceipt } from "../services/api";
import { TrustReceipt } from "../types";

export const ReceiptVerifier: React.FC = () => {
  const [hashInput, setHashInput] = useState("0x8f3a2b91c4e5d6f7890123456789abcdef0123456789abcdef0123456789abcd");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    receipt?: TrustReceipt;
    isSimulated: boolean;
  } | null>(null);

  const handleVerify = async () => {
    if (!hashInput.trim()) return;
    setLoading(true);
    const result = await verifyReceipt(hashInput.trim());
    setVerificationResult(result);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              ED25519 VERIFIER
            </span>
            <span className="text-xs text-slate-400 font-mono">Zero-Trust Cryptographic Proof</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Cryptographic Trust Receipt Verifier</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Input a `verdict_hash` to independently audit Ed25519 native signatures and confirm payload integrity before settling smart contract transactions.
          </p>
        </div>
      </div>

      {/* Input Box & Action */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Verdict Hash or Receipt Payload
        </label>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Paste verdict hash (e.g. 0x8f3a...) or Ed25519 signature..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 whitespace-nowrap flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying Proof..." : "Verify Ed25519 Signature"}
          </button>
        </div>
      </div>

      {/* Verification Result Display */}
      {verificationResult && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-in fade-in duration-300">
          
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            verificationResult.valid
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 glow-emerald"
              : "bg-rose-500/10 border-rose-500/40 text-rose-400 glow-rose"
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/20">
                {verificationResult.valid ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-rose-400" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-wide uppercase">
                  {verificationResult.valid ? "Cryptographic Signature Verified" : "Signature Verification Failed"}
                </h3>
                <p className="text-xs opacity-80 font-mono">
                  {verificationResult.valid
                    ? "Ed25519 signature is authentic and matches Sentinel Private Key. Zero payload tampering detected."
                    : "The provided verdict hash does not match an authentic signed receipt payload."}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Verification Checks Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-mono">Cryptographic Algorithm:</div>
              <div className="text-slate-200 font-bold font-mono">Ed25519 (Node.js Native Crypto)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-mono">Canonical Stringification:</div>
              <div className="text-emerald-400 font-bold font-mono">Deterministic RFC 8785 JSON</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-mono">Smart Contract Settlement:</div>
              <div className="text-amber-400 font-bold font-mono">Eligible for SentinelBond.sol</div>
            </div>
          </div>

          {/* Receipt Payload JSON */}
          {verificationResult.receipt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Decoded Verified Receipt Payload:</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto">
                {JSON.stringify(verificationResult.receipt, null, 2)}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
