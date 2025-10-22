module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/multicall.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeAllowanceResult",
    ()=>decodeAllowanceResult,
    "encodeAllowanceCall",
    ()=>encodeAllowanceCall,
    "multicall",
    ()=>multicall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-ssr] (ecmascript) <export * as ethers>");
;
// Multicall3 is deployed at this address on most networks
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL3_ABI = [
    "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)"
];
async function multicall(provider, calls) {
    const multicall = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    // Validate & normalize targets. Skip invalid/null targets to avoid provider errors.
    const formattedCalls = [];
    for (const call of calls){
        try {
            if (!call?.target) {
                console.warn("Skipping multicall entry with missing target", call);
                continue;
            }
            // normalize / validate address
            const normalized = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].getAddress(call.target);
            formattedCalls.push({
                target: normalized,
                allowFailure: call.allowFailure ?? true,
                callData: call.callData
            });
        } catch (err) {
            console.warn("Skipping multicall entry with invalid target:", call?.target, err);
            continue;
        }
    }
    if (formattedCalls.length === 0) return [];
    try {
        // Try normal contract call first
        let results;
        try {
            results = await multicall.aggregate3(formattedCalls);
        } catch (err) {
            // Fallback for runners that don't support sending txs (e.g. BrowserProvider)
            if (err?.code === "UNSUPPORTED_OPERATION" || /sendTransaction/i.test(err?.message)) {
                // encode the call and use a provider.call (read-only)
                const data = multicall.interface.encodeFunctionData("aggregate3", [
                    formattedCalls
                ]);
                const raw = await provider.call({
                    to: MULTICALL3_ADDRESS,
                    data
                });
                const decoded = multicall.interface.decodeFunctionResult("aggregate3", raw);
                results = decoded[0]; // ABI returns the array as the first tuple element
            } else {
                throw err;
            }
        }
        return results.map((result)=>({
                success: result.success,
                returnData: result.returnData
            }));
    } catch (error) {
        console.error("Multicall failed:", error);
        throw error;
    }
}
function encodeAllowanceCall(owner, spender) {
    const iface = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Interface([
        "function allowance(address owner, address spender) view returns (uint256)"
    ]);
    return iface.encodeFunctionData("allowance", [
        owner,
        spender
    ]);
}
function decodeAllowanceResult(data) {
    if (data === "0x" || !data) return BigInt(0);
    try {
        const iface = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Interface([
            "function allowance(address owner, address spender) view returns (uint256)"
        ]);
        const decoded = iface.decodeFunctionResult("allowance", data);
        return decoded[0];
    } catch  {
        return BigInt(0);
    }
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/spenders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Common DeFi protocol spender addresses (mainnet & testnet)
__turbopack_context__.s([
    "COMMON_SPENDERS",
    ()=>COMMON_SPENDERS,
    "getDefaultSpenderList",
    ()=>getDefaultSpenderList,
    "getSpenderInfo",
    ()=>getSpenderInfo
]);
const COMMON_SPENDERS = {
    // Uniswap
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    UNISWAP_UNIVERSAL_ROUTER: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    // 1inch
    ONEINCH_V5_ROUTER: "0x1111111254EEB25477B68fb85Ed929f73A960582",
    // 0x Protocol
    ZEROX_EXCHANGE: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    // Curve
    CURVE_ROUTER: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    // SushiSwap
    SUSHI_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    // Aave
    AAVE_POOL: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    // Compound
    COMPOUND_COMET: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
    // OpenSea Seaport
    SEAPORT: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"
};
function getDefaultSpenderList() {
    return Object.values(COMMON_SPENDERS);
}
function getSpenderInfo(address) {
    const addr = address.toLowerCase();
    const mapping = {
        [COMMON_SPENDERS.UNISWAP_V2_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.UNISWAP_V2_ROUTER,
            name: "Uniswap V2",
            type: "dex"
        },
        [COMMON_SPENDERS.UNISWAP_V3_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.UNISWAP_V3_ROUTER,
            name: "Uniswap V3",
            type: "dex"
        },
        [COMMON_SPENDERS.UNISWAP_UNIVERSAL_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.UNISWAP_UNIVERSAL_ROUTER,
            name: "Uniswap Universal Router",
            type: "dex"
        },
        [COMMON_SPENDERS.ONEINCH_V5_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.ONEINCH_V5_ROUTER,
            name: "1inch V5",
            type: "aggregator"
        },
        [COMMON_SPENDERS.ZEROX_EXCHANGE.toLowerCase()]: {
            address: COMMON_SPENDERS.ZEROX_EXCHANGE,
            name: "0x Exchange",
            type: "aggregator"
        },
        [COMMON_SPENDERS.CURVE_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.CURVE_ROUTER,
            name: "Curve Router",
            type: "dex"
        },
        [COMMON_SPENDERS.SUSHI_ROUTER.toLowerCase()]: {
            address: COMMON_SPENDERS.SUSHI_ROUTER,
            name: "SushiSwap",
            type: "dex"
        },
        [COMMON_SPENDERS.AAVE_POOL.toLowerCase()]: {
            address: COMMON_SPENDERS.AAVE_POOL,
            name: "Aave V3",
            type: "lending"
        },
        [COMMON_SPENDERS.COMPOUND_COMET.toLowerCase()]: {
            address: COMMON_SPENDERS.COMPOUND_COMET,
            name: "Compound V3",
            type: "lending"
        },
        [COMMON_SPENDERS.SEAPORT.toLowerCase()]: {
            address: COMMON_SPENDERS.SEAPORT,
            name: "OpenSea Seaport",
            type: "nft"
        }
    };
    return mapping[addr] || {
        address,
        name: `Contract ${address.slice(0, 6)}...${address.slice(-4)}`,
        type: "unknown"
    };
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Token price lookup via CoinGecko API (free tier)
__turbopack_context__.s([
    "getEthPrice",
    ()=>getEthPrice,
    "getTokenPrice",
    ()=>getTokenPrice,
    "getTokenPrices",
    ()=>getTokenPrices
]);
// In-memory cache for prices (TTL: 5 minutes)
const priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Common token contract -> CoinGecko ID mapping (mainnet)
const TOKEN_ID_MAP = {
    // Stablecoins
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "usd-coin",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "tether",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "dai",
    // DeFi tokens
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "uniswap",
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": "aave-token",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": "chainlink",
    "0xc00e94Cb662C3520282E6f5717214004A7f26888": "compound-coin",
    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": "maker",
    "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2": "sushi",
    // Wrapped tokens
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "weth",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "wrapped-bitcoin",
    // Layer 2 & scaling
    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": "matic-network",
    "0x4200000000000000000000000000000000000042": "optimism"
};
// Sepolia testnet tokens (map to mainnet equivalents for price estimation)
const SEPOLIA_TOKEN_MAP = {
    "0x779877A7B0D9E8603169DdbD7836e478b4624789": "chainlink",
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "usd-coin"
};
/**
 * Get CoinGecko ID for a token contract address
 */ function getCoinGeckoId(contractAddress, chainId) {
    if (chainId === 11155111) {
        // Sepolia testnet - use mapping to mainnet equivalent
        return SEPOLIA_TOKEN_MAP[contractAddress] || null;
    }
    return TOKEN_ID_MAP[contractAddress] || null;
}
async function getTokenPrice(contractAddress, chainId = 1) {
    // If no contract address provided, bail out early
    if (!contractAddress) return null;
    const normalized = contractAddress.toLowerCase();
    const cacheKey = `${chainId}-${normalized}`;
    // Check cache
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.price;
    }
    const coinGeckoId = getCoinGeckoId(contractAddress, chainId);
    if (!coinGeckoId) {
        return null;
    }
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`);
        if (!response.ok) {
            console.warn(`CoinGecko API error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        const price = data[coinGeckoId];
        if (price) {
            // Cache the result
            priceCache.set(cacheKey, {
                price,
                timestamp: Date.now()
            });
            return price;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch token price:", error);
        return null;
    }
}
async function getTokenPrices(tokens) {
    const results = new Map();
    // Get unique CoinGecko IDs
    const coinGeckoIds = new Set();
    const addressToId = new Map();
    for (const token of tokens){
        const id = getCoinGeckoId(token.address, token.chainId);
        if (id) {
            coinGeckoIds.add(id);
            addressToId.set(token.address.toLowerCase(), id);
        }
    }
    if (coinGeckoIds.size === 0) {
        return results;
    }
    try {
        const idsParam = Array.from(coinGeckoIds).join(",");
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`);
        if (!response.ok) {
            console.warn(`CoinGecko batch API error: ${response.status}`);
            return results;
        }
        const data = await response.json();
        // Map results back to addresses
        for (const token of tokens){
            const id = addressToId.get(token.address.toLowerCase());
            if (id && data[id]) {
                results.set(token.address.toLowerCase(), data[id]);
                // Cache individual results
                const cacheKey = `${token.chainId}-${token.address.toLowerCase()}`;
                priceCache.set(cacheKey, {
                    price: data[id],
                    timestamp: Date.now()
                });
            }
        }
        return results;
    } catch (error) {
        console.error("Failed to batch fetch token prices:", error);
        return results;
    }
}
async function getEthPrice() {
    const cacheKey = "eth-price";
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.price.usd;
    }
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        const price = data.ethereum?.usd || 2500;
        priceCache.set(cacheKey, {
            price: {
                usd: price
            },
            timestamp: Date.now()
        });
        return price;
    } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        return 2500; // Fallback
    }
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/allowances.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAllowanceRiskScore",
    ()=>calculateAllowanceRiskScore,
    "scanAllowances",
    ()=>scanAllowances
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-ssr] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/multicall.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/spenders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-ssr] (ecmascript)");
;
;
;
;
const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const UNLIMITED_THRESHOLD = MAX_UINT256 / BigInt(2); // Consider > 50% of max as unlimited
async function scanAllowances(provider, ownerAddress, tokens, chainId, spenderList) {
    const spenders = spenderList || (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultSpenderList"])();
    const allowances = [];
    // Build multicall array
    const calls = [];
    const callMetadata = [];
    for (const token of tokens){
        for (const spender of spenders){
            calls.push({
                target: token.address,
                callData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeAllowanceCall"])(ownerAddress, spender),
                allowFailure: true
            });
            callMetadata.push({
                tokenAddress: token.address,
                tokenName: token.name,
                tokenSymbol: token.symbol,
                tokenDecimals: token.decimals,
                spender
            });
        }
    }
    if (calls.length === 0) {
        return [];
    }
    try {
        // Execute multicall
        const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["multicall"])(provider, calls);
        // Process results
        for(let i = 0; i < results.length; i++){
            const result = results[i];
            const metadata = callMetadata[i];
            if (!result.success) continue;
            const allowance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeAllowanceResult"])(result.returnData);
            // Only include non-zero allowances
            if (allowance > BigInt(0)) {
                const isUnlimited = allowance >= UNLIMITED_THRESHOLD;
                const formatted = isUnlimited ? "Unlimited" : __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(allowance, metadata.tokenDecimals);
                allowances.push({
                    tokenAddress: metadata.tokenAddress,
                    tokenName: metadata.tokenName,
                    tokenSymbol: metadata.tokenSymbol,
                    tokenDecimals: metadata.tokenDecimals,
                    spender: metadata.spender,
                    spenderInfo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSpenderInfo"])(metadata.spender),
                    allowance,
                    allowanceFormatted: formatted,
                    isUnlimited
                });
            }
        }
        // Fetch USD values for allowances
        await enrichWithUsdValues(allowances, chainId);
        return allowances;
    } catch (error) {
        console.error("Failed to scan allowances:", error);
        return [];
    }
}
/**
 * Enrich allowances with USD value estimates
 */ async function enrichWithUsdValues(allowances, chainId) {
    try {
        // For each token, fetch price individually (can be optimized with batch)
        for (const allowance of allowances){
            const price = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTokenPrice"])(allowance.tokenAddress, chainId);
            if (price && !allowance.isUnlimited) {
                const amount = Number(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(allowance.allowance, allowance.tokenDecimals));
                allowance.usdValue = amount * price.usd;
            } else if (allowance.isUnlimited) {
                allowance.usdValue = Infinity;
            }
        }
    } catch (error) {
        console.error("Failed to enrich allowances with USD values:", error);
    }
}
function calculateAllowanceRiskScore(allowances) {
    let score = 0;
    const warnings = [];
    for (const allowance of allowances){
        // Unlimited approvals are risky
        if (allowance.isUnlimited) {
            score += 3;
            warnings.push(`Unlimited approval for ${allowance.tokenSymbol} to ${allowance.spenderInfo.name}`);
        }
        // High USD value approvals
        if (allowance.usdValue && allowance.usdValue > 10000) {
            score += 2;
            warnings.push(`High value approval: $${allowance.usdValue.toFixed(0)} of ${allowance.tokenSymbol} to ${allowance.spenderInfo.name}`);
        } else if (allowance.usdValue && allowance.usdValue > 1000) {
            score += 1;
        }
        // Unknown/unverified spenders are more risky
        if (allowance.spenderInfo.type === "unknown") {
            score += 2;
            warnings.push(`Approval to unknown contract: ${allowance.spenderInfo.name}`);
        }
    }
    // Determine risk level
    let level;
    if (score === 0) {
        level = "Very Low";
    } else if (score <= 3) {
        level = "Low";
    } else if (score <= 6) {
        level = "Medium";
    } else if (score <= 10) {
        level = "High";
    } else {
        level = "Critical";
    }
    return {
        score,
        level,
        warnings
    };
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/useTokenPrices.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTokenPrices",
    ()=>useTokenPrices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
// keep a small history length for sparklines / short-term change detection
const HISTORY_LENGTH = 6; // e.g., last 6 samples (15s * 6 = 90s default)
function useTokenPrices(tokens, opts) {
    const prevHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const queryKey = [
        "tokenPrices",
        tokens.map((t)=>`${t.chainId}-${t.address.toLowerCase()}`)
    ];
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey,
        queryFn: async ()=>{
            const prices = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTokenPrices"])(tokens);
            const result = {};
            for (const [addr, data] of prices.entries()){
                result[addr.toLowerCase()] = data || null;
            }
            return result;
        },
        refetchInterval: opts?.refetchInterval ?? 15000,
        staleTime: 10000
    });
    // maintain a tiny in-memory history per address for client-side sparklines
    const prices = query.data || {};
    for (const addr of Object.keys(prices)){
        const key = addr.toLowerCase();
        const val = prices[addr]?.usd ?? null;
        if (val === null) continue;
        const arr = prevHistory.current.get(key) || [];
        arr.push(val);
        if (arr.length > HISTORY_LENGTH) arr.shift();
        prevHistory.current.set(key, arr);
    }
    return {
        ...query,
        prices,
        history: prevHistory.current
    };
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TokenRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/recharts/es6/chart/LineChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
"use client";
;
;
function TokenRow({ name, symbol, price, history, balance, alertEnabled, onToggleAlert, threshold, onThresholdChange }) {
    const latest = price ?? 0;
    const first = history && history.length > 0 ? history[0] : latest;
    const change = first ? (latest - first) / Math.max(first, 1e-8) * 100 : 0;
    const data = (history || []).map((v, i)=>({
            x: i,
            y: v
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between p-3 bg-slate-900/30 rounded-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-medium",
                            children: symbol?.slice(0, 3)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-semibold",
                                children: name
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-gray-400",
                                children: symbol
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 mx-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: 120,
                        height: 40
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: "100%",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineChart"], {
                            data: data,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: "y",
                                stroke: change >= 0 ? "#34D399" : "#FB7185",
                                dot: false,
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                            lineNumber: 48,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right w-40 flex flex-col items-end gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-semibold",
                        children: price ? `$${price.toFixed(2)}` : "—"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-sm ${change >= 0 ? "text-green-400" : "text-red-400"}`,
                        children: [
                            change >= 0 ? "+" : "",
                            change.toFixed(2),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mt-1 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: !!alertEnabled,
                                        onChange: (e)=>onToggleAlert && onToggleAlert(e.target.checked)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                        lineNumber: 62,
                                        columnNumber: 13
                                    }, this),
                                    "Alerts"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                className: "w-16 bg-slate-900/20 rounded px-1 text-xs",
                                value: threshold ?? 7,
                                onChange: (e)=>onThresholdChange && onThresholdChange(Number(e.target.value))
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/usePriceAlerts.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePriceAlerts",
    ()=>usePriceAlerts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
const COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes cooldown per token
function usePriceAlerts(latest, history, settings, opts) {
    const lastFired = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!latest) return;
        for (const [addr, data] of Object.entries(latest)){
            const curPrice = data?.usd;
            if (!curPrice) continue;
            const key = addr.toLowerCase();
            const setting = settings[key] || {
                enabled: true,
                thresholdPercent: 7
            };
            if (!setting.enabled) continue;
            const hist = history.get(key) || [];
            const first = hist.length > 0 ? hist[0] : curPrice;
            const change = (curPrice - first) / Math.max(first, 1e-8) * 100;
            if (Math.abs(change) >= setting.thresholdPercent) {
                const now = Date.now();
                const last = lastFired.current.get(key) || 0;
                if (now - last > COOLDOWN_MS) {
                    // Fire toast
                    const verb = change > 0 ? "risen" : "fallen";
                    const message = `${key} has ${verb} ${change.toFixed(1)}% — consider reviewing your position.`;
                    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(message);
                    // system notification if allowed and requested
                    if (opts?.useSystem && typeof Notification !== "undefined" && Notification.permission === "granted") {
                        try {
                            new Notification("WalletGuard — Token alert", {
                                body: `${key} ${verb} ${change.toFixed(1)}%`
                            });
                        } catch (e) {
                        // ignore
                        }
                    }
                    lastFired.current.set(key, now);
                }
            }
        }
    }, [
        latest,
        history,
        settings
    ]);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/useTokenAlertSettings.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTokenAlertSettings",
    ()=>useTokenAlertSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const STORAGE_KEY = "wg-token-alerts-v1";
function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch  {
        return {};
    }
}
function writeStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch  {}
}
function useTokenAlertSettings(addresses) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return {};
        //TURBOPACK unreachable
        ;
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // ensure entries exist with defaults for provided addresses
        const copy = {
            ...state
        };
        let changed = false;
        for (const a of addresses){
            const key = a.toLowerCase();
            if (!copy[key]) {
                copy[key] = {
                    enabled: true,
                    thresholdPercent: 7
                };
                changed = true;
            }
        }
        if (changed) {
            setState(copy);
            writeStorage(copy);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        addresses.join(",")
    ]);
    function setAlert(address, enabled) {
        const key = address.toLowerCase();
        const next = {
            ...state,
            [key]: {
                ...state[key] || {
                    enabled: true,
                    thresholdPercent: 7
                },
                enabled
            }
        };
        setState(next);
        writeStorage(next);
    }
    function setThreshold(address, thresholdPercent) {
        const key = address.toLowerCase();
        const next = {
            ...state,
            [key]: {
                ...state[key] || {
                    enabled: true,
                    thresholdPercent: 7
                },
                thresholdPercent
            }
        };
        setState(next);
        writeStorage(next);
    }
    return {
        settings: state,
        setAlert,
        setThreshold
    };
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TokenInsights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$useTokenPrices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/useTokenPrices.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$components$2f$TokenInsights$2f$TokenRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$usePriceAlerts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/usePriceAlerts.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$useTokenAlertSettings$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/hooks/useTokenAlertSettings.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function TokenInsights({ tokens, chainId }) {
    const tokenInputs = tokens.map((t)=>({
            address: t.address,
            chainId
        }));
    const { prices, history, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$useTokenPrices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTokenPrices"])(tokenInputs, {
        refetchInterval: 15_000
    });
    // per-token settings stored in localStorage
    const addresses = tokenInputs.map((t)=>t.address.toLowerCase());
    const { settings, setAlert, setThreshold } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$useTokenAlertSettings$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTokenAlertSettings"])(addresses);
    const [useSystem, setUseSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // conservative alerts - will show a toast with cooldown and respect settings
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$hooks$2f$usePriceAlerts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePriceAlerts"])(prices, history, settings, {
        useSystem
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastContainer"], {
                position: "top-right",
                autoClose: 8000
            }, void 0, false, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "px-3 py-1 bg-blue-600 rounded text-sm",
                        onClick: async ()=>{
                            if (typeof Notification !== "undefined") {
                                const permission = await Notification.requestPermission();
                                setUseSystem(permission === "granted");
                            }
                        },
                        children: "Enable system notifications"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-400",
                        children: "System notifications are optional; toasts will still appear."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-gray-400",
                children: "Loading prices..."
            }, void 0, false, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                lineNumber: 48,
                columnNumber: 21
            }, this),
            tokens.map((t)=>{
                const addr = t.address.toLowerCase();
                const price = prices[addr]?.usd;
                const hist = history.get(addr) || [];
                const s = settings[addr] || {
                    enabled: true,
                    thresholdPercent: 7
                };
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$components$2f$TokenInsights$2f$TokenRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    name: t.name,
                    symbol: t.symbol,
                    price: price,
                    history: hist,
                    alertEnabled: s.enabled,
                    onToggleAlert: (v)=>setAlert(addr, v),
                    threshold: s.thresholdPercent,
                    onThresholdChange: (n)=>setThreshold(addr, n)
                }, addr, false, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$hooks$2f$useAccount$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/wagmi/dist/esm/hooks/useAccount.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-ssr] (ecmascript) <export default as ArrowUpRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownLeft$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/arrow-down-left.js [app-ssr] (ecmascript) <export default as ArrowDownLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/shield.js [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/coins.js [app-ssr] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/@rainbow-me/rainbowkit/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-ssr] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/allowances.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$components$2f$TokenInsights$2f$TokenInsights$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/components/TokenInsights/TokenInsights.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
function Dashboard() {
    const { address, isConnected, chain } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$hooks$2f$useAccount$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAccount"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [walletData, setWalletData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("tokens");
    const [ethPrice, setEthPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(2500); // Default ETH price
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Get Blockscout API URL based on chain
    const getBlockscoutUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (chain?.id === 1) {
            return process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth.blockscout.com/api/v2";
        } else if (chain?.id === 11155111) {
            return process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth-sepolia.blockscout.com/api/v2";
        }
        // Default to Sepolia if chain not recognized
        return process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth-sepolia.blockscout.com/api/v2";
    }, [
        chain
    ]);
    const fetchWalletData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (walletAddress)=>{
        setLoading(true);
        try {
            const blockscoutUrl = getBlockscoutUrl();
            // Fetch ETH price from CoinGecko
            const priceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
            const priceData = await priceResponse.json();
            const currentEthPrice = priceData.ethereum?.usd || 2500;
            setEthPrice(currentEthPrice);
            // Fetch address info
            const addressResponse = await fetch(`${blockscoutUrl}/addresses/${walletAddress}`);
            const addressData = await addressResponse.json();
            // Fetch token balances
            const tokensResponse = await fetch(`${blockscoutUrl}/addresses/${walletAddress}/token-balances`);
            const tokensData = await tokensResponse.json();
            // Fetch recent transactions
            const txResponse = await fetch(`${blockscoutUrl}/addresses/${walletAddress}/transactions`);
            const txData = await txResponse.json();
            // Fetch NFTs
            const nftResponse = await fetch(`${blockscoutUrl}/addresses/${walletAddress}/nft?type=ERC-721,ERC-404,ERC-1155`);
            const nftData = await nftResponse.json();
            // Calculate total value with real token prices
            const ethBalance = parseFloat(addressData.coin_balance || "0") / 1e18;
            let totalValue = ethBalance * currentEthPrice;
            // Fetch real token prices in a single batched call and calculate total value
            const tokenBalances = tokensData || [];
            // prepare list for batched price lookup
            const tokensForPrices = tokenBalances.map((t)=>({
                    address: t.token.address,
                    chainId: chain?.id || 1
                })).filter((t)=>!!t.address);
            // Batch fetch prices to reduce per-token network calls
            const pricesMap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTokenPrices"])(tokensForPrices);
            for (const token of tokenBalances){
                const tokenAddress = token?.token?.address;
                const tokenDecimals = token?.token?.decimals || "18";
                if (!tokenAddress) continue;
                const balance = parseFloat(token.value) / Math.pow(10, parseInt(tokenDecimals));
                const priceData = pricesMap.get(tokenAddress.toLowerCase());
                if (priceData && typeof priceData.usd === "number") {
                    totalValue += balance * priceData.usd;
                }
            }
            // Calculate weekly change from historical data (for now, use price change as proxy)
            const weeklyChange = 0; // TODO: implement portfolio history tracking
            // Scan real on-chain allowances
            let allowances = [];
            let riskScore = "Very Low";
            let riskWarnings = [];
            try {
                // Get provider from wagmi
                const ethereum = window.ethereum;
                if (!ethereum) throw new Error("No ethereum provider");
                const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].BrowserProvider(ethereum);
                // Prepare token list for allowance scanning
                const tokensForScan = tokenBalances.map((t)=>({
                        address: t.token.address,
                        name: t.token.name,
                        symbol: t.token.symbol,
                        decimals: parseInt(t.token.decimals)
                    }));
                // Scan allowances
                allowances = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scanAllowances"])(provider, walletAddress, tokensForScan, chain?.id || 1);
                // Calculate risk score
                const riskData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateAllowanceRiskScore"])(allowances);
                riskScore = riskData.level;
                riskWarnings = riskData.warnings;
            } catch (error) {
                console.error("Failed to scan allowances:", error);
            // Continue with empty allowances if scanning fails
            }
            setWalletData({
                totalValue,
                weeklyChange,
                tokenBalances: tokenBalances.slice(0, 10),
                transactions: txData.items?.slice(0, 10) || [],
                nfts: nftData.items?.slice(0, 20) || [],
                approvals: allowances,
                riskScore,
                riskWarnings
            });
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally{
            setLoading(false);
        }
    }, [
        getBlockscoutUrl,
        chain?.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isConnected) {
            router.push("/");
            return;
        }
        if (address) {
            fetchWalletData(address);
        }
    }, [
        address,
        isConnected,
        router,
        fetchWalletData
    ]);
    // mark mounted to ensure certain client-only computations (dates, randoms)
    // don't cause server/client HTML mismatches during hydration
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    // Removed client-only random values - now using real data from allowance scanner
    // During SSR the component should render the same HTML as initial client
    // to avoid hydration mismatch. We show the same deterministic loading
    // placeholder until the component has mounted on the client.
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.9
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 266,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-lg",
                        children: "Loading wallet data..."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                lineNumber: 261,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 260,
            columnNumber: 7
        }, this);
    }
    if (!isConnected || !address) {
        return null;
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.9
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 285,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-lg",
                        children: "Loading wallet data..."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 286,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                lineNumber: 280,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 279,
            columnNumber: 7
        }, this);
    }
    const approvalCount = walletData?.approvals?.length || 0;
    const approvalWarnings = walletData?.riskWarnings?.length || 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-4 md:p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-9 h-9 rounded-md bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "18",
                                        height: "18",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 1L3 5V11C3 17 7 22 12 23C17 22 21 17 21 11V5L12 1Z",
                                            stroke: "white",
                                            strokeWidth: "1.2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 309,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                        lineNumber: 302,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 301,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "font-semibold text-lg",
                                    children: "WalletGuard"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 318,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 300,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ConnectButton"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 323,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 299,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: -20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Total Value"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            className: "w-5 h-5 text-green-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 337,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 335,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: [
                                        "$",
                                        walletData?.totalValue.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 339,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `text-sm ${walletData?.weeklyChange && walletData.weeklyChange >= 0 ? "text-green-400" : "text-red-400"}`,
                                    children: [
                                        walletData?.weeklyChange && walletData.weeklyChange >= 0 ? "+" : "",
                                        walletData?.weeklyChange.toFixed(2),
                                        "% this week"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 346,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 334,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Active Approvals"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 363,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                            className: "w-5 h-5 text-orange-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 364,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: approvalCount
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 366,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-orange-400",
                                    children: [
                                        approvalWarnings,
                                        " ",
                                        approvalWarnings === 1 ? "warning" : "warnings"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 361,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Risk Score"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 376,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                            className: "w-5 h-5 text-green-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 375,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: walletData?.riskScore
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 379,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-green-400",
                                    children: "No critical threats"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 382,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 374,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 328,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: 0.1
                    },
                    className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-6",
                            children: "Wallet Portfolio"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 393,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg w-fit",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("tokens"),
                                    className: `px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === "tokens" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 405,
                                            columnNumber: 15
                                        }, this),
                                        "Tokens"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 397,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("nfts"),
                                    className: `px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === "nfts" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 416,
                                            columnNumber: 15
                                        }, this),
                                        "NFTs"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 408,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("approvals"),
                                    className: `px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === "approvals" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 427,
                                            columnNumber: 15
                                        }, this),
                                        "Approvals"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 419,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 396,
                            columnNumber: 11
                        }, this),
                        activeTab === "tokens" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: walletData?.tokenBalances && walletData.tokenBalances.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$components$2f$TokenInsights$2f$TokenInsights$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                tokens: walletData.tokenBalances.map((t)=>({
                                        address: t.token.address,
                                        name: t.token.name,
                                        symbol: t.token.symbol
                                    })),
                                chainId: chain?.id || 1
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 437,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-400",
                                children: "No tokens found"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 446,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 434,
                            columnNumber: 13
                        }, this),
                        activeTab === "nfts" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                            children: walletData?.nfts && walletData.nfts.length > 0 ? walletData.nfts.map((nft, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.9
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    transition: {
                                        delay: index * 0.05
                                    },
                                    className: "bg-slate-900/30 rounded-xl overflow-hidden hover:bg-slate-900/50 transition-all",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative",
                                            children: nft.image_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                src: nft.image_url,
                                                alt: nft.token.name,
                                                fill: true,
                                                className: "object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 465,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                className: "w-12 h-12 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 472,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 463,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-semibold text-sm truncate",
                                                    children: nft.token.name
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-gray-400",
                                                    children: [
                                                        "#",
                                                        nft.id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 479,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 475,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 456,
                                    columnNumber: 19
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-full text-center py-8 text-gray-400",
                                children: "No NFTs found"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 484,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 453,
                            columnNumber: 13
                        }, this),
                        activeTab === "approvals" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-gray-400 mb-4",
                                    children: "Active token approvals allow contracts to spend your tokens. Review regularly."
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 494,
                                    columnNumber: 15
                                }, this),
                                walletData?.approvals && walletData.approvals.length > 0 ? walletData.approvals.map((approval, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            x: -20
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        transition: {
                                            delay: index * 0.05
                                        },
                                        className: "flex items-center justify-between p-4 bg-slate-900/30 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-10 h-10 rounded-full flex items-center justify-center ${approval.isUnlimited ? "bg-red-500/20" : "bg-orange-500/20"}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                            className: `w-5 h-5 ${approval.isUnlimited ? "text-red-400" : "text-orange-400"}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 515,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 508,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-semibold",
                                                                children: [
                                                                    approval.tokenSymbol,
                                                                    " → ",
                                                                    approval.spenderInfo.name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                lineNumber: 524,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm text-gray-400",
                                                                children: [
                                                                    approval.isUnlimited ? "Unlimited" : approval.allowanceFormatted,
                                                                    approval.usdValue && approval.usdValue !== Infinity && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "ml-2",
                                                                        children: [
                                                                            "($",
                                                                            approval.usdValue.toFixed(2),
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                        lineNumber: 533,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                lineNumber: 527,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 523,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 507,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm",
                                                children: "Revoke"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 540,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, `${approval.tokenAddress}-${approval.spender}`, true, {
                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 19
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-8 text-gray-400",
                                    children: "No active approvals found. Your tokens are safe!"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 546,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 493,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 387,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: 0.2
                    },
                    className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold",
                                    children: "Recent Transactions"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 562,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-blue-400 hover:text-blue-300 text-sm",
                                    children: "View All"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 563,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 561,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: walletData?.transactions && walletData.transactions.length > 0 ? walletData.transactions.map((tx, index)=>{
                                const isIncoming = tx.to?.hash.toLowerCase() === address.toLowerCase();
                                const value = parseFloat(tx.value) / 1e18;
                                const usdValue = value * ethPrice;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: -20
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    transition: {
                                        delay: index * 0.05
                                    },
                                    className: "flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-4 flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-10 h-10 rounded-full flex items-center justify-center ${isIncoming ? "bg-green-500/20" : "bg-blue-500/20"}`,
                                                    children: isIncoming ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownLeft$3e$__["ArrowDownLeft"], {
                                                        className: "w-5 h-5 text-green-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 591,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                                        className: "w-5 h-5 text-blue-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 593,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold",
                                                                    children: [
                                                                        isIncoming ? "From" : "To",
                                                                        " ",
                                                                        isIncoming ? tx.from.hash.slice(0, 10) : tx.to?.hash.slice(0, 10) || "Contract",
                                                                        "..."
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 598,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: `https://eth-sepolia.blockscout.com/tx/${tx.hash}`,
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    className: "opacity-0 group-hover:opacity-100 transition-opacity",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                        className: "w-4 h-4 text-gray-400 hover:text-white"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                        lineNumber: 611,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 605,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 597,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm text-gray-400 flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 615,
                                                                    columnNumber: 27
                                                                }, this),
                                                                relativeTimeFromISOString(tx.timestamp)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 614,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 596,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 584,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `font-semibold ${isIncoming ? "text-green-400" : "text-white"}`,
                                                    children: [
                                                        isIncoming ? "+" : "",
                                                        value.toFixed(4),
                                                        " ETH"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 621,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `text-sm ${tx.result === "success" ? "text-green-400" : "text-orange-400"}`,
                                                    children: [
                                                        "$",
                                                        usdValue.toFixed(2)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 629,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 620,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 577,
                                    columnNumber: 19
                                }, this);
                            }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-400",
                                children: "No recent transactions"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 643,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 568,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 555,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 297,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
        lineNumber: 296,
        columnNumber: 5
    }, this);
}
// Client-only helper to format relative time so server render stays deterministic
function relativeTimeFromISOString(iso) {
    try {
        const d = new Date(iso);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes} mins ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    } catch  {
        return "";
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e975148d._.js.map