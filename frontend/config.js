// Fill these in after running `forge script script/Deploy.s.sol --broadcast`
// (addresses are printed at the end of the deploy script output).
const ARCSWAP_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x" + (5042002).toString(16),
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",

  factory: "0xYOUR_FACTORY_ADDRESS",
  router: "0xYOUR_ROUTER_ADDRESS",

  tokens: [
    { symbol: "ARCT", name: "ArcSwap Token", address: "0xYOUR_ARCT_ADDRESS", decimals: 18 },
    { symbol: "DEMO", name: "Demo Token", address: "0xYOUR_DEMO_ADDRESS", decimals: 18 },
  ],
};
