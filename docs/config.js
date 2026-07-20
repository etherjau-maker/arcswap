// Fill these in after running `forge script script/Deploy.s.sol --broadcast`
// (addresses are printed at the end of the deploy script output).
const ARCSWAP_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x" + (5042002).toString(16),
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",

  factory: "0xe95e5D71056A28d5DCB983E22D960542f474Bfcf",
  router: "0xf59c4eFC182970b7c6e796A9D134a91B76a3c8c1",

  tokens: [
    { symbol: "ARCT", name: "ArcSwap Token", address: "0x4820CED1A913355bCE255463123328A38CcAE78c", decimals: 18 },
    { symbol: "DEMO", name: "Demo Token", address: "0x46c789977EEfe78ae9E1fE419a75217503532a7b", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x3600000000000000000000000000000000000000", decimals: 6 },
    { symbol: "EURC", name: "Euro Coin", address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", decimals: 6 },
    { symbol: "cirBTC", name: "Circle Wrapped Bitcoin", address: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF", decimals: 8 },
  ],
};
