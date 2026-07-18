# SentinelBond

The staked bond behind high-confidence `allow` decisions. If SENTINEL clears
content that was actually an attack, an upheld dispute pays the caller from this
pool (flat, capped — 5 USDT/incident, 25 USDT/claimant/week).

Deliberately minimal: **custody + payout, not judgment.** Claims are filed and
adjudicated off-chain (`disputes` table; escalation → OKX arbitration). The
operator (or arbitration) calls `approveClaim`. `withdraw` is timelocked 7 days
so the pool can't vanish mid-dispute.

## Build & test

```bash
# install foundry: https://getfoundry.sh
forge install foundry-rs/forge-std
forge test -vvv
```

## Deploy to X Layer

```bash
export PRIVATE_KEY=0x...
export USDT_ADDRESS=0x...      # USDT on X Layer
export OPERATOR_ADDRESS=0x...  # SENTINEL operator
forge script script/Deploy.s.sol --rpc-url xlayer_testnet --broadcast
```

X Layer: mainnet chainId **196**, testnet **195**.

After deploy, set `SENTINEL_BOND_ADDRESS` in the API env so `allow` receipts
reference the bond via `bond_ref`.
