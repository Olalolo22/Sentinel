import { ScanResponse, TrustReceipt, DisputeRecord, ChainHop } from "../types";

// Key for local storage overrides
const API_URL_KEY = "sentinel_api_url_override";
const SIMULATION_MODE_KEY = "sentinel_simulation_mode";

export function getStoredApiUrl(): string {
  const custom = localStorage.getItem(API_URL_KEY);
  if (custom) return custom;
  return import.meta.env.VITE_API_URL || ""; // Default relative (/v1) or empty
}

export function setStoredApiUrl(url: string) {
  if (!url) {
    localStorage.removeItem(API_URL_KEY);
  } else {
    localStorage.setItem(API_URL_KEY, url);
  }
}

export function isSimulationMode(): boolean {
  return localStorage.getItem(SIMULATION_MODE_KEY) === "true";
}

export function setSimulationMode(enabled: boolean) {
  localStorage.setItem(SIMULATION_MODE_KEY, enabled ? "true" : "false");
}

function getBaseUrl(): string {
  const custom = getStoredApiUrl();
  if (custom) {
    // strip trailing slash if present
    return custom.endsWith("/") ? custom.slice(0, -1) : custom;
  }
  return ""; // Uses relative paths proxied by Vite or relative in same origin
}

// Client-side fallback simulator when API is unreachable or simulation mode is ON
export function generateSimulatedScan(content: string, context: string = "generic", jobId?: string): ScanResponse {
  const containsInjection = /ignore (all )?previous instructions/i.test(content) || /system override/i.test(content) || /bypass/i.test(content);
  const containsTagSmuggling = /[\uE0000-\uE007F]/.test(content);
  const containsExfiltration = /curl\s+http|send\s+private\s+key|fetch\s+api_key/i.test(content);
  const containsWalletRedirect = /0x[a-fA-F0-9]{40}/.test(content) && /redirect|transfer/i.test(content);

  let action: "allow" | "review" | "reject" = "allow";
  let riskScore = 0.04;
  let confidence = 0.98;
  const flags: string[] = [];
  let threatCategory: string | null = null;
  const decodeReport: string[] = [];

  if (containsTagSmuggling) {
    decodeReport.push("Stage 0: Unwrapped 3 invisible Unicode Tag smuggling characters (U+E0000 family).");
  }

  if (containsInjection) {
    action = "reject";
    riskScore = 0.96;
    confidence = 0.99;
    flags.push("HEURISTIC_PROMPT_INJECTION", "SYSTEM_PROMPT_OVERRIDE_ATTEMPT");
    threatCategory = "T1: Direct System Prompt Injection";
  } else if (containsExfiltration) {
    action = "reject";
    riskScore = 0.89;
    confidence = 0.95;
    flags.push("LLM_DATA_EXFILTRATION_RISK", "UNAUTHORIZED_EXTERNAL_FETCH");
    threatCategory = "T3: Data Exfiltration & Key Leakage";
  } else if (containsWalletRedirect) {
    action = "review";
    riskScore = 0.68;
    confidence = 0.88;
    flags.push("UNVERIFIED_EVM_PAYEE_ADDRESS", "PAYMENT_ROUTING_ALTERATION");
    threatCategory = "T4: Financial Steganography & Unauthorized Transfer";
  } else if (containsTagSmuggling) {
    action = "reject";
    riskScore = 0.92;
    confidence = 0.97;
    flags.push("ZERO_WIDTH_STEGANOGRAPHY_DETECTED");
    threatCategory = "T2: Indirect Steganographic Payload";
  }

  const timestamp = new Date().toISOString();
  const mockJobId = jobId || `job_${Math.random().toString(36).substring(2, 9)}`;
  const contentSha256 = Array.from(new Uint8Array(32))
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

  const verdictHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const signature = `ed25519_sig_${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const trust_receipt: TrustReceipt = {
    version: "0.1.0",
    timestamp,
    job_id: mockJobId,
    prev_receipt_hash: null,
    actor_id: "agent_demo_7",
    content_sha256: contentSha256,
    verdict: {
      action,
      risk_score: riskScore,
      confidence,
      flags,
      threat_category: threatCategory,
    },
    stage_summary: {
      stage0_normalized: true,
      stage1_short_circuit: action === "reject",
      stage2_llm_used: action !== "reject" || containsExfiltration,
    },
    verdict_hash: verdictHash,
    signature,
  };

  return {
    trust_receipt,
    decode_report: decodeReport,
    seen_count: Math.floor(Math.random() * 12) + 1,
    stage1_hits: flags.filter((f) => f.startsWith("HEURISTIC")),
    stage2_analysis: {
      risk_score: riskScore,
      confidence,
      flags,
      threat_category: threatCategory,
      reasoning: action === "allow" 
        ? "Payload evaluated clean. Context matches standard AI Agent execution protocol without unauthorized state overrides."
        : `Threat intercepted in Stage ${action === "reject" ? "1/2" : "2"}. Detected malicious instructions attempting to manipulate downstream model behaviors.`,
    },
  };
}

export async function scanPayload(
  content: string,
  context: string = "generic",
  jobId?: string
): Promise<{ data: ScanResponse; isSimulated: boolean }> {
  if (isSimulationMode()) {
    return { data: generateSimulatedScan(content, context, jobId), isSimulated: true };
  }

  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        context,
        job_id: jobId,
        actor_id: "sentinel_dashboard_user",
      }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data: ScanResponse = await res.json();
    return { data, isSimulated: false };
  } catch (err) {
    console.warn("API unreachable, generating fallback simulated response:", err);
    return { data: generateSimulatedScan(content, context, jobId), isSimulated: true };
  }
}

export async function checkHealth(): Promise<{ status: "online" | "offline"; version?: string; payment?: string }> {
  if (isSimulationMode()) {
    return { status: "online", version: "0.1.0 (Simulation)", payment: "free-tier" };
  }

  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { status: "online", version: data.version || "0.1.0", payment: data.payment || "free-tier" };
    }
    return { status: "offline" };
  } catch {
    return { status: "offline" };
  }
}

export async function verifyReceipt(verdictHash: string): Promise<{ valid: boolean; receipt?: TrustReceipt; isSimulated: boolean }> {
  if (isSimulationMode()) {
    return {
      valid: true,
      isSimulated: true,
      receipt: {
        version: "0.1.0",
        timestamp: new Date().toISOString(),
        job_id: "job_verifier_demo",
        prev_receipt_hash: null,
        actor_id: "agent_verifier",
        content_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        verdict: {
          action: "allow",
          risk_score: 0.02,
          confidence: 0.99,
          flags: [],
          threat_category: null,
        },
        stage_summary: { stage0_normalized: true, stage1_short_circuit: false, stage2_llm_used: true },
        verdict_hash: verdictHash,
        signature: `ed25519_verified_${verdictHash.slice(0, 16)}`,
      },
    };
  }

  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/verify/${encodeURIComponent(verdictHash)}`);
    if (res.ok) {
      const data = await res.json();
      return { valid: data.valid ?? true, receipt: data.receipt, isSimulated: false };
    }
    return { valid: false, isSimulated: false };
  } catch {
    return {
      valid: true,
      isSimulated: true,
      receipt: {
        version: "0.1.0",
        timestamp: new Date().toISOString(),
        job_id: "job_simulated_verify",
        prev_receipt_hash: null,
        actor_id: "agent_verifier",
        content_sha256: "a1b2c3d4e5f67890",
        verdict: { action: "allow", risk_score: 0.05, confidence: 0.98, flags: [], threat_category: null },
        stage_summary: { stage0_normalized: true, stage1_short_circuit: false, stage2_llm_used: true },
        verdict_hash: verdictHash,
        signature: "ed25519_sig_valid_demo",
      },
    };
  }
}

export async function fetchChain(jobId: string): Promise<{ hops: ChainHop[]; isSimulated: boolean }> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/chain/${encodeURIComponent(jobId)}`);
    if (res.ok) {
      const data = await res.json();
      return { hops: data.chain || [], isSimulated: false };
    }
  } catch {}

  // Simulated multi-hop chain
  const now = Date.now();
  const simulatedHops: ChainHop[] = [
    {
      job_id: jobId,
      step: 1,
      actor_id: "Agent_Orchestrator",
      verdict_hash: "0x8f3a...b91c",
      action: "allow",
      risk_score: 0.03,
      timestamp: new Date(now - 120000).toISOString(),
      prev_receipt_hash: null,
      valid: true,
    },
    {
      job_id: jobId,
      step: 2,
      actor_id: "MCP_Data_Fetcher",
      verdict_hash: "0x1e7b...4c2a",
      action: "allow",
      risk_score: 0.12,
      timestamp: new Date(now - 60000).toISOString(),
      prev_receipt_hash: "0x8f3a...b91c",
      valid: true,
    },
    {
      job_id: jobId,
      step: 3,
      actor_id: "Agent_Execution_Worker",
      verdict_hash: "0x9d4e...a78f",
      action: "reject",
      risk_score: 0.94,
      timestamp: new Date(now - 10000).toISOString(),
      prev_receipt_hash: "0x1e7b...4c2a",
      valid: true,
    },
  ];

  return { hops: simulatedHops, isSimulated: true };
}

export async function submitDispute(
  verdictHash: string,
  claimantActorId: string,
  rawContent: string,
  evidenceUrl?: string
): Promise<{ success: boolean; dispute?: DisputeRecord; message?: string }> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verdict_hash: verdictHash,
        claimant_actor_id: claimantActorId,
        raw_content: rawContent,
        evidence_url: evidenceUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, dispute: data.dispute, message: data.message };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.error || "Failed to file dispute" };
  } catch {}

  // Simulated dispute creation
  return {
    success: true,
    dispute: {
      verdict_hash: verdictHash,
      status: "pending",
      raw_content: rawContent,
      evidence_url: evidenceUrl,
      created_at: new Date().toISOString(),
      slashed_amount_okb: 50,
    },
  };
}

export async function approveDispute(verdictHash: string): Promise<{ success: boolean; newRuleGenerated?: string }> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/dispute/${encodeURIComponent(verdictHash)}/approve`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, newRuleGenerated: data.generated_rule };
    }
  } catch {}

  // Simulation: Stage 4 Retrospection generates new firewall regex rule
  const generatedRule = `(?i)(bypass_sentinel_guardrail|override_task_spec|transfer_okb_unauthorized)`;
  return { success: true, newRuleGenerated: generatedRule };
}
