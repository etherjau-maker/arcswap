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
  ],
};
