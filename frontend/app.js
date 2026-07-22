// Cascadex frontend logic — vanilla ethers.js, no build step required.

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function factory() view returns (address)",
];

const FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
];

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
];

let provider, signer, userAddress;
let tokenIn = CASCADEX_CONFIG.tokens[0];
let tokenOut = CASCADEX_CONFIG.tokens[1];

const $ = (id) => document.getElementById(id);

function populateTokenSelects() {
  for (const sel of [$("tokenIn"), $("tokenOut")]) {
    sel.innerHTML = "";
    for (const t of CASCADEX_CONFIG.tokens) {
      const opt = document.createElement("option");
      opt.value = t.symbol;
      opt.textContent = t.symbol;
      sel.appendChild(opt);
    }
  }
  $("tokenIn").value = tokenIn.symbol;
  $("tokenOut").value = tokenOut.symbol;
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.style.display = "none"), 4500);
}

function addLedgerRow(text, ok = true) {
  const rows = $("ledgerRows");
  const row = document.createElement("div");
  row.className = "tape-row";
  row.innerHTML = `<span>${text}</span><span class="${ok ? "ok" : ""}">${ok ? "confirmed" : "pending"}</span>`;
  rows.prepend(row);
  while (rows.children.length > 6) rows.removeChild(rows.lastChild);
}

async function connectWallet() {
  if (!window.ethereum) {
    toast("No wallet found. Install MetaMask or Rabby.");
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  // Ensure we're on Arc Testnet; add it if the wallet doesn't know it yet.
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CASCADEX_CONFIG.chainIdHex }],
    });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CASCADEX_CONFIG.chainIdHex,
          chainName: "Arc Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: [CASCADEX_CONFIG.rpcUrl],
          blockExplorerUrls: [CASCADEX_CONFIG.explorerUrl],
        }],
      });
    } else {
      throw switchErr;
    }
  }

  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  $("netStatus").textContent = `Arc Testnet · ${userAddress.slice(0, 6)}…${userAddress.slice(-4)}`;
  $("actionBtn").textContent = "Swap";
  await refreshAll();
}

async function getReadProvider() {
  return provider || new ethers.JsonRpcProvider(CASCADEX_CONFIG.rpcUrl);
}

async function refreshBalances() {
  const p = await getReadProvider();
  for (const [tok, elId] of [[tokenIn, "balIn"], [tokenOut, "balOut"]]) {
    if (!userAddress) {
      $(elId).textContent = "Balance: —";
      continue;
    }
    try {
      const c = new ethers.Contract(tok.address, ERC20_ABI, p);
      const bal = await c.balanceOf(userAddress);
      $(elId).textContent = `Balance: ${Number(ethers.formatUnits(bal, tok.decimals)).toFixed(4)}`;
    } catch {
      $(elId).textContent = "Balance: —";
    }
  }
}

async function refreshPool() {
  const p = await getReadProvider();
  try {
    const factory = new ethers.Contract(CASCADEX_CONFIG.factory, FACTORY_ABI, p);
    const pairAddr = await factory.getPair(tokenIn.address, tokenOut.address);
    if (pairAddr === ethers.ZeroAddress) {
      $("resA").textContent = "no pool";
      $("resB").textContent = "no pool";
      return;
    }
    const pair = new ethers.Contract(pairAddr, PAIR_ABI, p);
    const [r0, r1] = await pair.getReserves();
    const token0Addr = await pair.token0();
    const [reserveIn, reserveOut] =
      token0Addr.toLowerCase() === tokenIn.address.toLowerCase() ? [r0, r1] : [r1, r0];

    $("resA").textContent = Number(ethers.formatUnits(reserveIn, tokenIn.decimals)).toLocaleString();
    $("resB").textContent = Number(ethers.formatUnits(reserveOut, tokenOut.decimals)).toLocaleString();

    if (reserveIn > 0n) {
      const rate = Number(ethers.formatUnits(reserveOut, tokenOut.decimals)) /
                   Number(ethers.formatUnits(reserveIn, tokenIn.decimals));
      $("rateInfo").textContent = `1 ${tokenIn.symbol} = ${rate.toFixed(6)} ${tokenOut.symbol}`;
    }

    // Subscribe once to Swap events on this pair for the live ledger.
    pair.removeAllListeners("Swap");
    pair.on("Swap", (sender, a0in, a1in, a0out, a1out, to) => {
      const dir = a0in > 0n ? `${tokenIn.symbol}→${tokenOut.symbol}` : `${tokenOut.symbol}→${tokenIn.symbol}`;
      addLedgerRow(`${dir} · ${to.slice(0, 6)}…${to.slice(-4)}`, true);
    });
  } catch (e) {
    console.error(e);
  }
}

async function quote() {
  const amtStr = $("amountIn").value;
  if (!amtStr || Number(amtStr) <= 0) {
    $("amountOut").value = "";
    return;
  }
  const p = await getReadProvider();
  const router = new ethers.Contract(CASCADEX_CONFIG.router, ROUTER_ABI, p);
  try {
    const amountIn = ethers.parseUnits(amtStr, tokenIn.decimals);
    const amounts = await router.getAmountsOut(amountIn, [tokenIn.address, tokenOut.address]);
    $("amountOut").value = ethers.formatUnits(amounts[1], tokenOut.decimals);
  } catch (e) {
    $("amountOut").value = "";
    console.error(e);
  }
}

async function doSwap() {
  if (!signer) return connectWallet();

  const amtStr = $("amountIn").value;
  if (!amtStr || Number(amtStr) <= 0) {
    toast("Enter an amount to swap.");
    return;
  }

  const btn = $("actionBtn");
  btn.disabled = true;

  try {
    const amountIn = ethers.parseUnits(amtStr, tokenIn.decimals);
    const tokenContract = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);

    const allowance = await tokenContract.allowance(userAddress, CASCADEX_CONFIG.router);
    if (allowance < amountIn) {
      btn.textContent = "Approving…";
      const approveTx = await tokenContract.approve(CASCADEX_CONFIG.router, ethers.MaxUint256);
      addLedgerRow(`Approve ${tokenIn.symbol}`, false);
      await approveTx.wait();
    }

    btn.textContent = "Swapping…";
    const router = new ethers.Contract(CASCADEX_CONFIG.router, ROUTER_ABI, signer);
    const amounts = await router.getAmountsOut(amountIn, [tokenIn.address, tokenOut.address]);
    const slippageBps = 50n; // 0.5%
    const minOut = (amounts[1] * (10000n - slippageBps)) / 10000n;
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const tx = await router.swapExactTokensForTokens(
      amountIn, minOut, [tokenIn.address, tokenOut.address], userAddress, deadline
    );
    addLedgerRow(`${tokenIn.symbol}→${tokenOut.symbol} · ${amtStr}`, false);
    await tx.wait();

    toast("Swap confirmed.");
    $("amountIn").value = "";
    $("amountOut").value = "";
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast(e.shortMessage || e.message || "Swap failed.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Swap";
  }
}

async function refreshAll() {
  await Promise.all([refreshBalances(), refreshPool()]);
}

function flipDirection() {
  [tokenIn, tokenOut] = [tokenOut, tokenIn];
  populateTokenSelects();
  $("amountIn").value = "";
  $("amountOut").value = "";
  refreshAll();
}

// --- Wire up events ---
window.addEventListener("DOMContentLoaded", () => {
  populateTokenSelects();
  refreshAll();

  $("actionBtn").addEventListener("click", () => (signer ? doSwap() : connectWallet()));
  $("flipBtn").addEventListener("click", flipDirection);
  $("amountIn").addEventListener("input", quote);

  $("tokenIn").addEventListener("change", (e) => {
    tokenIn = CASCADEX_CONFIG.tokens.find((t) => t.symbol === e.target.value);
    refreshAll();
    quote();
  });
  $("tokenOut").addEventListener("change", (e) => {
    tokenOut = CASCADEX_CONFIG.tokens.find((t) => t.symbol === e.target.value);
    refreshAll();
    quote();
  });

  $("contractsFoot").textContent = `Router: ${CASCADEX_CONFIG.router.slice(0, 10)}…`;
});
