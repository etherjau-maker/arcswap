# Cascadex — DEX on Arc Testnet

A constant-product AMM (Uniswap V2 style, 0.3% fee) deployed on **Arc Testnet** (Circle's stablecoin-native L1), with a simple swap frontend (no build step required). Trades the official Arc Testnet **USDC** and **EURC** tokens.

## Structure
## 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

cd contracts
forge install foundry-rs/forge-std --no-commit
forge build
```

## 2. Deploy to Arc Testnet

```bash
export PRIVATE_KEY=0xyourprivatekey

forge script script/Deploy.s.sol:DeployCascadex \
  --rpc-url https://rpc.testnet.arc.network \
  --broadcast
```

This deploys `CascadexFactory` and `CascadexRouter`, and creates an (empty) USDC/EURC pool. Copy the printed addresses into `frontend/config.js`.

## 3. Add liquidity

Get testnet USDC and EURC from the [Circle Faucet](https://faucet.circle.com) (select Arc Testnet), then approve and seed the pool. Because Arc enforces its blocklist precompile at runtime, `forge script`'s local simulation can fail here — use `cast send` instead, which broadcasts directly:

```bash
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" <ROUTER_ADDRESS> 10000000 \
  --rpc-url https://rpc.testnet.arc.network --private-key $PRIVATE_KEY

cast send 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a \
  "approve(address,uint256)" <ROUTER_ADDRESS> 10000000 \
  --rpc-url https://rpc.testnet.arc.network --private-key $PRIVATE_KEY

cast send <ROUTER_ADDRESS> \
  "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)" \
  0x3600000000000000000000000000000000000000 \
  0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a \
  10000000 10000000 0 0 <YOUR_ADDRESS> $(($(date +%s) + 3600)) \
  --rpc-url https://rpc.testnet.arc.network --private-key $PRIVATE_KEY
```

## 4. Run the frontend

Static site, no build step:

```bash
cd frontend && npx serve .
```

Or deploy to GitHub Pages / Vercel — just push the 3 files (`index.html`, `app.js`, `config.js`) with the pool addresses filled in.

## 5. Verify contracts on ArcScan

```bash
forge verify-contract <FACTORY_ADDRESS> src/CascadexFactory.sol:CascadexFactory \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier blockscout \
  --verifier-url https://testnet.arcscan.app/api
```

## Security notes

- Contracts are unaudited — this is a testnet demo, not production-ready.
- Use a dedicated test wallet for deploying and testing, never a wallet holding real funds.
- Token addresses (USDC, EURC) are Arc's official testnet contracts — see [docs.arc.io/arc/references/contract-addresses](https://docs.arc.io/arc/references/contract-addresses).
