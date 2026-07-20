import { select, confirm } from "@inquirer/prompts";
import pg from "pg";
import { ethers } from "ethers";
import { config } from "dotenv";
import { SentinelBondABI } from "./abi.js";
import path from "path";
import fs from "fs";

// Load .env from root or local
const rootEnv = path.resolve(process.cwd(), "../../.env");
if (fs.existsSync(rootEnv)) {
  config({ path: rootEnv });
} else {
  config();
}

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/sentinel";
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || "0x0123456789012345678901234567890123456789012345678901234567890123";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const RPC_URL = process.env.RPC_URL || "https://testnetrpc.xlayer.tech"; // X Layer Testnet
const API_URL = process.env.API_URL || "http://localhost:3000";

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function getOpenDisputes() {
  const res = await pool.query(`SELECT * FROM disputes WHERE status = 'open' ORDER BY created_at DESC`);
  return res.rows;
}

async function approveOnChain(verdictHash: string, claimantActorId: string) {
  console.log(`\n[X Layer] Initiating transaction for verdict ${verdictHash}...`);
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SentinelBondABI, wallet);

    // Hardcode claimant address for hackathon demo if claimantActorId isn't a valid hex address
    const claimantAddress = ethers.isAddress(claimantActorId) ? claimantActorId : "0x1111111111111111111111111111111111111111";
    
    // Amount is 5 USDT (6 decimals)
    const amount = 5000000; 

    // Convert string hash to bytes32. If verdictHash is a sha256 hex string, we can use it.
    let hashBytes32 = verdictHash.startsWith("0x") ? verdictHash : "0x" + verdictHash;
    if (hashBytes32.length < 66) {
      hashBytes32 = hashBytes32.padEnd(66, "0"); // simple pad if it's not full 32 bytes
    }

    // Attempt the TX (will fail gracefully if contract isn't deployed properly for local testing)
    console.log(`[X Layer] Calling approveClaim(${claimantAddress}, ${amount}, ${hashBytes32})`);
    
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.log(`[X Layer] SKIPPED: Contract address is zero address (Mock mode)`);
    } else {
      const tx = await contract.approveClaim(claimantAddress, amount, hashBytes32);
      console.log(`[X Layer] Transaction sent! Hash: ${tx.hash}`);
      await tx.wait();
      console.log(`[X Layer] Transaction confirmed!`);
    }
  } catch (error: any) {
    console.log(`[X Layer] Transaction failed or skipped (Demo mode fallback). Error: ${error.message}`);
  }
}

async function triggerImmuneSystem(verdictHash: string) {
  console.log(`\n[API] Triggering Stage 4 Retrospection Immune System...`);
  try {
    const res = await fetch(`${API_URL}/v1/dispute/${verdictHash}/approve`, {
      method: "POST"
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`[API] Success! DB status updated to approved. Retrospection triggered.`);
    } else {
      console.log(`[API] Failed to trigger API: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`[API] Could not connect to API at ${API_URL}`);
  }
}

async function main() {
  console.log("================================================");
  console.log("       Sentinel X Layer Arbitration Bot         ");
  console.log("================================================\n");

  while (true) {
    const disputes = await getOpenDisputes();
    
    if (disputes.length === 0) {
      console.log("No open disputes found. Waiting 5 seconds...");
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const choices = disputes.map(d => ({
      name: `Dispute [${d.verdict_hash.substring(0, 8)}] - Claimant: ${d.claimant_actor_id} - Created: ${d.created_at}`,
      value: d
    }));

    choices.push({ name: "Exit", value: null as any });

    const selectedDispute = await select({
      message: "Select an open dispute to review:",
      choices
    });

    if (!selectedDispute) {
      console.log("Exiting...");
      break;
    }

    console.log(`\n--- Dispute Details ---`);
    console.log(`Verdict Hash: ${selectedDispute.verdict_hash}`);
    console.log(`Claimant: ${selectedDispute.claimant_actor_id}`);
    console.log(`Evidence URL: ${selectedDispute.evidence_url}`);
    console.log(`Raw Content (Attack Payload):`);
    console.log(`> ${selectedDispute.raw_content}`);
    console.log(`-----------------------\n`);

    const action = await select({
      message: "Action:",
      choices: [
        { name: "Approve (Payout on X Layer & Trigger Immune System)", value: "approve" },
        { name: "Deny (Mark as Invalid)", value: "deny" },
        { name: "Skip for now", value: "skip" }
      ]
    });

    if (action === "approve") {
      const confirmed = await confirm({ message: "Are you sure you want to approve this claim?" });
      if (confirmed) {
        await approveOnChain(selectedDispute.verdict_hash, selectedDispute.claimant_actor_id);
        await triggerImmuneSystem(selectedDispute.verdict_hash);
      }
    } else if (action === "deny") {
      console.log("Deny feature is pending API implementation.");
    }
  }

  await pool.end();
}

main().catch(console.error);
