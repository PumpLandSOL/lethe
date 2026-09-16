# STYX — sUSD on Arc

**The coin for the crossing.** sUSD is a private, fractional-algorithmic stablecoin: struck from USDC collateral plus a burned $STYX share, shielded into notes encrypted only to you, sent with amount and parties hidden.

Arc (chainId 4663, EVM). Dependency-free Node ≥18. `node server/index.js` (port 8206).

Env: `PORT`, `DATA_PATH`, `STYX_MINT` ($STYX token on Arc — lights the CA bar and reads the live price from Arc pools), `TICK_SEC`.

Rite I: real privacy primitives (x25519-encrypted notes, commitments, nullifiers, Merkle root) with the peg and ledger kept off-chain. Algorithmic stablecoins are high-risk.

MIT.
