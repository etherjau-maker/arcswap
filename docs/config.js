// Cascadex — Arc Testnet contract config
// (addresses are printed at the end of the deploy script output).
const CASCADEX_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x" + (5042002).toString(16),
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",

  factory: "0x05Ef1f0Cb4D7a4Ed225c7441c50c87b1bB447cA4",
  router: "0x161e0c438eeb6310f9cfb8124bb8d1ed003c8d07",

  pair: "0x26d0adee2ed996d99b4688c71c2ff09c70c28e34",

  tokens: [
    { symbol: "USDC", name: "USD Coin", address: "0x3600000000000000000000000000000000000000", decimals: 6 },
    { symbol: "EURC", name: "Euro Coin", address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", decimals: 6 },
  ],
};
