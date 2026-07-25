# Sentinel Protocol Roadmap

This document outlines the strategic development phases for **Sentinel**, the pay-per-call trust infrastructure for autonomous AI agents built on X Layer and the OKX A2MCP ecosystem.

---

## 🎯 Phase 1 — Trust Foundation & Hackathon Core (Shipped / Live)

* [x] **4-Stage Hybrid Security Pipeline**:
  * **Stage 0 (Deep Normalization)**: Strip zero-width characters (U+E0000), bidi overrides, homoglyph confusables, recursive depth-3 decodes (Base64/Hex/URL), and HTML/Markdown hidden node extraction.
  * **Stage 1 (<18ms Heuristics Engine)**: Sub-18ms deterministic rules library (`@sentinel/rules`), wallet redirection detectors, and malicious URL analysis.
  * **Stage 2 (LLM Threat Judge)**: Semantic intent evaluation against the strict T1–T8 LLM threat taxonomy using Zod schemas with fallback across Groq, Llama 3.3 70B, and Claude.
  * **Stage 3 (Cryptographic Assembly & Ed25519 Native Signings)**: SHA-256 payload hashing, RFC 8785 canonical JSON, and native Ed25519 digital signature generation.
* [x] **Linear Trust Chains (`job_id`)**:
  * Hashes receipts sequentially (`prev_receipt_hash`) to form tamper-evident multi-hop history trails across agent transaction lifecycles.
* [x] **X Layer Escrow Bond Contract (`SentinelBond.sol`)**:
  * Deployed smart contract custodying 50,000 OKB with 10× fee refund slashing mechanics.
* [x] **TypeScript SDK (`@sentinel/sdk`)**:
  * `SentinelClient`, `verifyBeforeSettlement()`, local Ed25519 verification, and automatic chain linking.
* [x] **Developer UI & Sandbox Suite (`apps/web`)**:
  * 6 interactive views: Overview / Landing Page, Decision Scanner, Sentinel Chain, Receipt Verifier, Dispute Hub, and Analytics Dashboard.

---

## 🚀 Phase 2 — Autonomous Accountability & Adaptive Learning (Q3 2026)

* [ ] **Stage 4 Adaptive Retrospection Engine**:
  * Automatically synthesize new Stage 1 regex firewall rules (`dynamic_rules`) from approved dispute claims in <60 seconds.
* [ ] **Decentralized Arbitration Protocol**:
  * Upgrade off-chain dispute approvals to OKX arbitration smart contract claims for automated on-chain bond slashing payouts.
* [ ] **Framework SDK Guard Middleware**:
  * Native integrations for popular AI agent frameworks:
    * `LangChain`: `SentinelSecurityCallback`
    * `AutoGPT`: `SentinelPreExecutionPlugin`
    * `CrewAI`: `SentinelGuardTool`
* [ ] **Multi-Agent Mesh Telemetry**:
  * Real-time network-level graph visualization of inter-agent delegation paths and threat propagation patterns.

---

## 🌐 Phase 3 — Network & Enterprise Scale (Q4 2026)

* [ ] **Cross-Chain Receipt Verification**:
  * Publish light-client receipt verification contracts on Solana, EVM chains, and Cosmos.
* [ ] **Zero-Knowledge Confidential Receipts**:
  * Implement zk-SNARK partial receipt proofs allowing agents to prove payload safety without revealing proprietary data or private context.
* [ ] **Enterprise Multi-Hop Policy Governance**:
  * Role-based access control (RBAC) and policy threshold management for enterprise agent fleets.
* [ ] **Autonomous Agent Trust Marketplace**:
  * Public reputation scoring and historical audit indexing for listed OKX A2MCP agents.

---

*Sentinel Protocol — Autonomous systems will make decisions. Sentinel makes those decisions verifiable.*
