# Cascadex — DEX trên Arc Testnet

Constant-product AMM (kiểu Uniswap V2, phí 0.3%) deploy trên **Arc Testnet**
(Circle's stablecoin-native L1), kèm frontend swap UI đơn giản (không cần build step).

```
arcswap/
├── contracts/
│   ├── src/
│   │   ├── CascadexFactory.sol   # tạo & track pools
│   │   ├── CascadexPair.sol      # pool AMM (x*y=k) + LP token
│   │   ├── CascadexRouter.sol    # addLiquidity / swap cho user
│   │   └── TestToken.sol        # ERC20 test token có faucet
│   ├── script/Deploy.s.sol      # script deploy Foundry
│   └── foundry.toml
└── frontend/
    ├── index.html
    ├── app.js
    └── config.js                # điền địa chỉ contract vào đây sau khi deploy
```

## 1. Cài Foundry (trên máy Mac, không chạy được trong sandbox này)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

cd arcswap/contracts
forge install foundry-rs/forge-std --no-commit
forge build   # kiểm tra compile trước khi deploy
```

## 2. Deploy contracts lên Arc Testnet

```bash
cd arcswap/contracts

# Lấy testnet USDC (gas token) cho ví deployer tại:
# https://faucet.circle.com  (chọn Arc Testnet)

export PRIVATE_KEY=0xYOUR_PRIVATE_KEY   # ví burner riêng, KHÔNG dùng ví chính

forge script script/Deploy.s.sol:DeployCascadex \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Script sẽ tự động:
1. Deploy `CascadexFactory` + `CascadexRouter`
2. Deploy 2 test token: **ARCT** và **DEMO** (mint 1,000,000 mỗi loại cho deployer)
3. Tạo pool ARCT/DEMO và seed 100,000 mỗi bên thanh khoản ban đầu

Copy 5 địa chỉ in ra ở cuối log (Factory, Router, ARCT, DEMO, Pair).

## 3. Điền địa chỉ vào frontend

Mở `frontend/config.js`, thay các giá trị `0xYOUR_..._ADDRESS` bằng địa chỉ thật vừa deploy.

## 4. Host frontend

Frontend là static site thuần (HTML/JS/CSS), không cần build:

```bash
# Test local
cd frontend && npx serve .

# Hoặc deploy lên Vercel/GitHub Pages như mcpswap.xyz — chỉ cần push
# 3 file index.html, app.js, config.js lên 1 repo và bật Pages/Vercel.
```

## 5. Verify contract trên ArcScan (để chứng minh source code, tăng uy tín Builder)

```bash
forge verify-contract <FACTORY_ADDRESS> src/CascadexFactory.sol:CascadexFactory \
  --rpc-url https://rpc.testnet.arc.network \
  --verifier blockscout \
  --verifier-url https://testnet.arcscan.app/api
```
(ArcScan chạy Blockscout — nếu lệnh trên lỗi, verify thủ công qua UI testnet.arcscan.app.)

## 6. Sau khi có link live

1. Test vài giao dịch swap thật trên testnet (tạo on-chain activity)
2. Post link demo + vài dòng giới thiệu lên Arc Discord (channel show-and-tell) hoặc X, tag `@arc`
3. Xin role Builder theo hướng dẫn cộng đồng Arc

## Lưu ý bảo mật

- `TestToken.faucet()` cho phép mint tự do (tối đa 10,000/lần) — **chỉ dùng cho testnet**, không bao giờ deploy pattern này lên mainnet.
- Dùng ví burner riêng để deploy/test, không dùng ví chính (0x25fc...ca7) hay ví có tiền thật.
- Contract chưa audit — đây là bản demo để claim Builder role, không dùng để quản lý tài sản thật.
