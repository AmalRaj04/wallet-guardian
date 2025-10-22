(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/multicall.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeAllowanceResult",
    ()=>decodeAllowanceResult,
    "encodeAllowanceCall",
    ()=>encodeAllowanceCall,
    "multicall",
    ()=>multicall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
;
// Multicall3 is deployed at this address on most networks
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL3_ABI = [
    "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)"
];
async function multicall(provider, calls) {
    const multicall = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    // Validate & normalize targets. Skip invalid/null targets to avoid provider errors.
    const formattedCalls = [];
    for (const call of calls){
        try {
            if (!(call === null || call === void 0 ? void 0 : call.target)) {
                console.warn("Skipping multicall entry with missing target", call);
                continue;
            }
            // normalize / validate address
            const normalized = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].getAddress(call.target);
            var _call_allowFailure;
            formattedCalls.push({
                target: normalized,
                allowFailure: (_call_allowFailure = call.allowFailure) !== null && _call_allowFailure !== void 0 ? _call_allowFailure : true,
                callData: call.callData
            });
        } catch (err) {
            console.warn("Skipping multicall entry with invalid target:", call === null || call === void 0 ? void 0 : call.target, err);
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
            if ((err === null || err === void 0 ? void 0 : err.code) === "UNSUPPORTED_OPERATION" || /sendTransaction/i.test(err === null || err === void 0 ? void 0 : err.message)) {
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
    const iface = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Interface([
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
        const iface = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Interface([
            "function allowance(address owner, address spender) view returns (uint256)"
        ]);
        const decoded = iface.decodeFunctionResult("allowance", data);
        return decoded[0];
    } catch (e) {
        return BigInt(0);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/spenders.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
        name: "Contract ".concat(address.slice(0, 6), "...").concat(address.slice(-4)),
        type: "unknown"
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
async function getTokenPrice(contractAddress) {
    let chainId = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
    // If no contract address provided, bail out early
    if (!contractAddress) return null;
    const normalized = contractAddress.toLowerCase();
    const cacheKey = "".concat(chainId, "-").concat(normalized);
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
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=".concat(coinGeckoId, "&vs_currencies=usd&include_24hr_change=true"));
        if (!response.ok) {
            console.warn("CoinGecko API error: ".concat(response.status));
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
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=".concat(idsParam, "&vs_currencies=usd&include_24hr_change=true"));
        if (!response.ok) {
            console.warn("CoinGecko batch API error: ".concat(response.status));
            return results;
        }
        const data = await response.json();
        // Map results back to addresses
        for (const token of tokens){
            const id = addressToId.get(token.address.toLowerCase());
            if (id && data[id]) {
                results.set(token.address.toLowerCase(), data[id]);
                // Cache individual results
                const cacheKey = "".concat(token.chainId, "-").concat(token.address.toLowerCase());
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
        var _data_ethereum;
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        const price = ((_data_ethereum = data.ethereum) === null || _data_ethereum === void 0 ? void 0 : _data_ethereum.usd) || 2500;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/allowances.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateAllowanceRiskScore",
    ()=>calculateAllowanceRiskScore,
    "scanAllowances",
    ()=>scanAllowances
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/multicall.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/spenders.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-client] (ecmascript)");
;
;
;
;
const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const UNLIMITED_THRESHOLD = MAX_UINT256 / BigInt(2); // Consider > 50% of max as unlimited
async function scanAllowances(provider, ownerAddress, tokens, chainId, spenderList) {
    const spenders = spenderList || (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultSpenderList"])();
    const allowances = [];
    // Build multicall array
    const calls = [];
    const callMetadata = [];
    for (const token of tokens){
        for (const spender of spenders){
            calls.push({
                target: token.address,
                callData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encodeAllowanceCall"])(ownerAddress, spender),
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
        const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["multicall"])(provider, calls);
        // Process results
        for(let i = 0; i < results.length; i++){
            const result = results[i];
            const metadata = callMetadata[i];
            if (!result.success) continue;
            const allowance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$multicall$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeAllowanceResult"])(result.returnData);
            // Only include non-zero allowances
            if (allowance > BigInt(0)) {
                const isUnlimited = allowance >= UNLIMITED_THRESHOLD;
                const formatted = isUnlimited ? "Unlimited" : __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(allowance, metadata.tokenDecimals);
                allowances.push({
                    tokenAddress: metadata.tokenAddress,
                    tokenName: metadata.tokenName,
                    tokenSymbol: metadata.tokenSymbol,
                    tokenDecimals: metadata.tokenDecimals,
                    spender: metadata.spender,
                    spenderInfo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$spenders$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSpenderInfo"])(metadata.spender),
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
            const price = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenPrice"])(allowance.tokenAddress, chainId);
            if (price && !allowance.isUnlimited) {
                const amount = Number(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(allowance.allowance, allowance.tokenDecimals));
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
            warnings.push("Unlimited approval for ".concat(allowance.tokenSymbol, " to ").concat(allowance.spenderInfo.name));
        }
        // High USD value approvals
        if (allowance.usdValue && allowance.usdValue > 10000) {
            score += 2;
            warnings.push("High value approval: $".concat(allowance.usdValue.toFixed(0), " of ").concat(allowance.tokenSymbol, " to ").concat(allowance.spenderInfo.name));
        } else if (allowance.usdValue && allowance.usdValue > 1000) {
            score += 1;
        }
        // Unknown/unverified spenders are more risky
        if (allowance.spenderInfo.type === "unknown") {
            score += 2;
            warnings.push("Approval to unknown contract: ".concat(allowance.spenderInfo.name));
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$hooks$2f$useAccount$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/wagmi/dist/esm/hooks/useAccount.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-client] (ecmascript) <export default as ArrowUpRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownLeft$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/arrow-down-left.js [app-client] (ecmascript) <export default as ArrowDownLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/coins.js [app-client] (ecmascript) <export default as Coins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/@rainbow-me/rainbowkit/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/allowances.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Documents/GitHub/wallet-guardian/src/lib/prices.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
function Dashboard() {
    var _walletData_approvals, _walletData_riskWarnings;
    _s();
    const { address, isConnected, chain } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$hooks$2f$useAccount$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAccount"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [walletData, setWalletData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("tokens");
    const [ethPrice, setEthPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2500); // Default ETH price
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Get Blockscout API URL based on chain
    const getBlockscoutUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[getBlockscoutUrl]": ()=>{
            if ((chain === null || chain === void 0 ? void 0 : chain.id) === 1) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth.blockscout.com/api/v2";
            } else if ((chain === null || chain === void 0 ? void 0 : chain.id) === 11155111) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth-sepolia.blockscout.com/api/v2";
            }
            // Default to Sepolia if chain not recognized
            return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BLOCKSCOUT_API_URL || "https://eth-sepolia.blockscout.com/api/v2";
        }
    }["Dashboard.useCallback[getBlockscoutUrl]"], [
        chain
    ]);
    const fetchWalletData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[fetchWalletData]": async (walletAddress)=>{
            setLoading(true);
            try {
                var _priceData_ethereum, _txData_items, _nftData_items;
                const blockscoutUrl = getBlockscoutUrl();
                // Fetch ETH price from CoinGecko
                const priceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
                const priceData = await priceResponse.json();
                const currentEthPrice = ((_priceData_ethereum = priceData.ethereum) === null || _priceData_ethereum === void 0 ? void 0 : _priceData_ethereum.usd) || 2500;
                setEthPrice(currentEthPrice);
                // Fetch address info
                const addressResponse = await fetch("".concat(blockscoutUrl, "/addresses/").concat(walletAddress));
                const addressData = await addressResponse.json();
                // Fetch token balances
                const tokensResponse = await fetch("".concat(blockscoutUrl, "/addresses/").concat(walletAddress, "/token-balances"));
                const tokensData = await tokensResponse.json();
                // Fetch recent transactions
                const txResponse = await fetch("".concat(blockscoutUrl, "/addresses/").concat(walletAddress, "/transactions"));
                const txData = await txResponse.json();
                // Fetch NFTs
                const nftResponse = await fetch("".concat(blockscoutUrl, "/addresses/").concat(walletAddress, "/nft?type=ERC-721,ERC-404,ERC-1155"));
                const nftData = await nftResponse.json();
                // Calculate total value with real token prices
                const ethBalance = parseFloat(addressData.coin_balance || "0") / 1e18;
                let totalValue = ethBalance * currentEthPrice;
                // Fetch real token prices and calculate total value
                const tokenBalances = tokensData || [];
                for (const token of tokenBalances){
                    var _token_token, _token_token1;
                    // Defensive checks: ensure token structure exists
                    const tokenAddress = token === null || token === void 0 ? void 0 : (_token_token = token.token) === null || _token_token === void 0 ? void 0 : _token_token.address;
                    const tokenDecimals = (token === null || token === void 0 ? void 0 : (_token_token1 = token.token) === null || _token_token1 === void 0 ? void 0 : _token_token1.decimals) || "18";
                    if (!tokenAddress) {
                        continue;
                    }
                    const balance = parseFloat(token.value) / Math.pow(10, parseInt(tokenDecimals));
                    // Fetch real price from CoinGecko
                    const priceData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$prices$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenPrice"])(tokenAddress, (chain === null || chain === void 0 ? void 0 : chain.id) || 1);
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
                    const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].BrowserProvider(ethereum);
                    // Prepare token list for allowance scanning
                    const tokensForScan = tokenBalances.map({
                        "Dashboard.useCallback[fetchWalletData].tokensForScan": (t)=>({
                                address: t.token.address,
                                name: t.token.name,
                                symbol: t.token.symbol,
                                decimals: parseInt(t.token.decimals)
                            })
                    }["Dashboard.useCallback[fetchWalletData].tokensForScan"]);
                    // Scan allowances
                    allowances = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scanAllowances"])(provider, walletAddress, tokensForScan, (chain === null || chain === void 0 ? void 0 : chain.id) || 1);
                    // Calculate risk score
                    const riskData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$src$2f$lib$2f$allowances$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAllowanceRiskScore"])(allowances);
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
                    transactions: ((_txData_items = txData.items) === null || _txData_items === void 0 ? void 0 : _txData_items.slice(0, 10)) || [],
                    nfts: ((_nftData_items = nftData.items) === null || _nftData_items === void 0 ? void 0 : _nftData_items.slice(0, 20)) || [],
                    approvals: allowances,
                    riskScore,
                    riskWarnings
                });
            } catch (error) {
                console.error("Error fetching wallet data:", error);
            } finally{
                setLoading(false);
            }
        }
    }["Dashboard.useCallback[fetchWalletData]"], [
        getBlockscoutUrl,
        chain === null || chain === void 0 ? void 0 : chain.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            if (!isConnected) {
                router.push("/");
                return;
            }
            if (address) {
                fetchWalletData(address);
            }
        }
    }["Dashboard.useEffect"], [
        address,
        isConnected,
        router,
        fetchWalletData
    ]);
    // mark mounted to ensure certain client-only computations (dates, randoms)
    // don't cause server/client HTML mismatches during hydration
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            setMounted(true);
        }
    }["Dashboard.useEffect"], []);
    // Removed client-only random values - now using real data from allowance scanner
    // During SSR the component should render the same HTML as initial client
    // to avoid hydration mismatch. We show the same deterministic loading
    // placeholder until the component has mounted on the client.
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-lg",
                        children: "Loading wallet data..."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 259,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                lineNumber: 253,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 252,
            columnNumber: 7
        }, this);
    }
    if (!isConnected || !address) {
        return null;
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 277,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-lg",
                        children: "Loading wallet data..."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                        lineNumber: 278,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                lineNumber: 272,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 271,
            columnNumber: 7
        }, this);
    }
    const approvalCount = (walletData === null || walletData === void 0 ? void 0 : (_walletData_approvals = walletData.approvals) === null || _walletData_approvals === void 0 ? void 0 : _walletData_approvals.length) || 0;
    const approvalWarnings = (walletData === null || walletData === void 0 ? void 0 : (_walletData_riskWarnings = walletData.riskWarnings) === null || _walletData_riskWarnings === void 0 ? void 0 : _walletData_riskWarnings.length) || 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-4 md:p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-9 h-9 rounded-md bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "18",
                                        height: "18",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 1L3 5V11C3 17 7 22 12 23C17 22 21 17 21 11V5L12 1Z",
                                            stroke: "white",
                                            strokeWidth: "1.2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 301,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 293,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "font-semibold text-lg",
                                    children: "WalletGuard"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 310,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 292,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f40$rainbow$2d$me$2f$rainbowkit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ConnectButton"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 315,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 291,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Total Value"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 328,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            className: "w-5 h-5 text-green-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 329,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 327,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: [
                                        "$",
                                        walletData === null || walletData === void 0 ? void 0 : walletData.totalValue.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 331,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm ".concat((walletData === null || walletData === void 0 ? void 0 : walletData.weeklyChange) && walletData.weeklyChange >= 0 ? "text-green-400" : "text-red-400"),
                                    children: [
                                        (walletData === null || walletData === void 0 ? void 0 : walletData.weeklyChange) && walletData.weeklyChange >= 0 ? "+" : "",
                                        walletData === null || walletData === void 0 ? void 0 : walletData.weeklyChange.toFixed(2),
                                        "% this week"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 338,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 326,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Active Approvals"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                            className: "w-5 h-5 text-orange-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 356,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: approvalCount
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-orange-400",
                                    children: [
                                        approvalWarnings,
                                        " ",
                                        approvalWarnings === 1 ? "warning" : "warnings"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 359,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 353,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-gray-400 text-sm",
                                            children: "Risk Score"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 368,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                            className: "w-5 h-5 text-green-400"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 369,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-3xl font-bold mb-1",
                                    children: walletData === null || walletData === void 0 ? void 0 : walletData.riskScore
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 371,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-green-400",
                                    children: "No critical threats"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 374,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 320,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-6",
                            children: "Wallet Portfolio"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 385,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg w-fit",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("tokens"),
                                    className: "px-4 py-2 rounded-lg transition-all flex items-center gap-2 ".concat(activeTab === "tokens" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 397,
                                            columnNumber: 15
                                        }, this),
                                        "Tokens"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 389,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("nfts"),
                                    className: "px-4 py-2 rounded-lg transition-all flex items-center gap-2 ".concat(activeTab === "nfts" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 408,
                                            columnNumber: 15
                                        }, this),
                                        "NFTs"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 400,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("approvals"),
                                    className: "px-4 py-2 rounded-lg transition-all flex items-center gap-2 ".concat(activeTab === "approvals" ? "bg-slate-700/70 text-white" : "text-gray-400 hover:text-white"),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 419,
                                            columnNumber: 15
                                        }, this),
                                        "Approvals"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 411,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 388,
                            columnNumber: 11
                        }, this),
                        activeTab === "tokens" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: (walletData === null || walletData === void 0 ? void 0 : walletData.tokenBalances) && walletData.tokenBalances.length > 0 ? walletData.tokenBalances.map((token, index)=>{
                                const balance = parseFloat(token.value) / Math.pow(10, parseInt(token.token.decimals));
                                const symbol = token.token.symbol;
                                let usdValue = 0;
                                let changePercent = 0;
                                // Simplified token pricing - in production use real-time price APIs
                                if (symbol === "USDC" || symbol === "USDT") {
                                    usdValue = balance;
                                    changePercent = (Math.random() - 0.5) * 2; // Small random change for stablecoins
                                } else if (symbol === "LINK") {
                                    usdValue = balance * 15; // Approximate LINK price
                                    changePercent = (Math.random() - 0.5) * 20;
                                } else if (symbol === "UNI") {
                                    usdValue = balance * 8; // Approximate UNI price
                                    changePercent = (Math.random() - 0.5) * 15;
                                } else {
                                    // For unknown tokens, show balance without USD value
                                    usdValue = 0;
                                    changePercent = 0;
                                }
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                                    className: "flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coins$3e$__["Coins"], {
                                                        className: "w-5 h-5 text-purple-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 463,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-semibold",
                                                            children: token.token.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 466,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm text-gray-400",
                                                            children: symbol
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 469,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 461,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-semibold",
                                                    children: usdValue > 0 ? "$".concat(usdValue.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })) : "".concat(balance.toFixed(4), " ").concat(symbol)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm ".concat(changePercent >= 0 ? "text-green-400" : "text-red-400"),
                                                    children: usdValue > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            changePercent >= 0 ? "+" : "",
                                                            changePercent.toFixed(1),
                                                            "%"
                                                        ]
                                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-400",
                                                        children: "Price unavailable"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 481,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 472,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 454,
                                    columnNumber: 21
                                }, this);
                            }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-400",
                                children: "No tokens found"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 504,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 426,
                            columnNumber: 13
                        }, this),
                        activeTab === "nfts" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                            children: (walletData === null || walletData === void 0 ? void 0 : walletData.nfts) && walletData.nfts.length > 0 ? walletData.nfts.map((nft, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative",
                                            children: nft.image_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: nft.image_url,
                                                alt: nft.token.name,
                                                fill: true,
                                                className: "object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 525,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                className: "w-12 h-12 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 532,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 523,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-semibold text-sm truncate",
                                                    children: nft.token.name
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 536,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-gray-400",
                                                    children: [
                                                        "#",
                                                        nft.id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 539,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 535,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 516,
                                    columnNumber: 19
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-span-full text-center py-8 text-gray-400",
                                children: "No NFTs found"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 544,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 513,
                            columnNumber: 13
                        }, this),
                        activeTab === "approvals" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-gray-400 mb-4",
                                    children: "Active token approvals allow contracts to spend your tokens. Review regularly."
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 554,
                                    columnNumber: 15
                                }, this),
                                (walletData === null || walletData === void 0 ? void 0 : walletData.approvals) && walletData.approvals.length > 0 ? walletData.approvals.map((approval, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 rounded-full flex items-center justify-center ".concat(approval.isUnlimited ? "bg-red-500/20" : "bg-orange-500/20"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                            className: "w-5 h-5 ".concat(approval.isUnlimited ? "text-red-400" : "text-orange-400")
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 575,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 568,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-semibold",
                                                                children: [
                                                                    approval.tokenSymbol,
                                                                    " → ",
                                                                    approval.spenderInfo.name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                lineNumber: 584,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm text-gray-400",
                                                                children: [
                                                                    approval.isUnlimited ? "Unlimited" : approval.allowanceFormatted,
                                                                    approval.usdValue && approval.usdValue !== Infinity && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "ml-2",
                                                                        children: [
                                                                            "($",
                                                                            approval.usdValue.toFixed(2),
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                        lineNumber: 593,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                lineNumber: 587,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 583,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 567,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm",
                                                children: "Revoke"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                lineNumber: 600,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, "".concat(approval.tokenAddress, "-").concat(approval.spender), true, {
                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                        lineNumber: 560,
                                        columnNumber: 19
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-8 text-gray-400",
                                    children: "No active approvals found. Your tokens are safe!"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 606,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 553,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 379,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-bold",
                                    children: "Recent Transactions"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 622,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-blue-400 hover:text-blue-300 text-sm",
                                    children: "View All"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 623,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 621,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: (walletData === null || walletData === void 0 ? void 0 : walletData.transactions) && walletData.transactions.length > 0 ? walletData.transactions.map((tx, index)=>{
                                var _tx_to, _tx_to1;
                                const isIncoming = ((_tx_to = tx.to) === null || _tx_to === void 0 ? void 0 : _tx_to.hash.toLowerCase()) === address.toLowerCase();
                                const value = parseFloat(tx.value) / 1e18;
                                const usdValue = value * ethPrice;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-4 flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 rounded-full flex items-center justify-center ".concat(isIncoming ? "bg-green-500/20" : "bg-blue-500/20"),
                                                    children: isIncoming ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownLeft$3e$__["ArrowDownLeft"], {
                                                        className: "w-5 h-5 text-green-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 651,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                                        className: "w-5 h-5 text-blue-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                        lineNumber: 653,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 645,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold",
                                                                    children: [
                                                                        isIncoming ? "From" : "To",
                                                                        " ",
                                                                        isIncoming ? tx.from.hash.slice(0, 10) : ((_tx_to1 = tx.to) === null || _tx_to1 === void 0 ? void 0 : _tx_to1.hash.slice(0, 10)) || "Contract",
                                                                        "..."
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 658,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: "https://eth-sepolia.blockscout.com/tx/".concat(tx.hash),
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    className: "opacity-0 group-hover:opacity-100 transition-opacity",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                        className: "w-4 h-4 text-gray-400 hover:text-white"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                        lineNumber: 671,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 665,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 657,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm text-gray-400 flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                                    lineNumber: 675,
                                                                    columnNumber: 27
                                                                }, this),
                                                                relativeTimeFromISOString(tx.timestamp)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                            lineNumber: 674,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 656,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 644,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-semibold ".concat(isIncoming ? "text-green-400" : "text-white"),
                                                    children: [
                                                        isIncoming ? "+" : "",
                                                        value.toFixed(4),
                                                        " ETH"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 681,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm ".concat(tx.result === "success" ? "text-green-400" : "text-orange-400"),
                                                    children: [
                                                        "$",
                                                        usdValue.toFixed(2)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                                    lineNumber: 689,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                            lineNumber: 680,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                    lineNumber: 637,
                                    columnNumber: 19
                                }, this);
                            }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-400",
                                children: "No recent transactions"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                                lineNumber: 703,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                            lineNumber: 628,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
                    lineNumber: 615,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
            lineNumber: 289,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Documents/GitHub/wallet-guardian/src/app/dashboard/page.tsx",
        lineNumber: 288,
        columnNumber: 5
    }, this);
}
_s(Dashboard, "lZJ226Ex4vQJ1f1B9zc0INuWAm8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$wagmi$2f$dist$2f$esm$2f$hooks$2f$useAccount$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAccount"],
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Documents$2f$GitHub$2f$wallet$2d$guardian$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Dashboard;
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
        if (minutes < 60) return "".concat(minutes, " mins ago");
        if (hours < 24) return "".concat(hours, " hours ago");
        return "".concat(days, " days ago");
    } catch (e) {
        return "";
    }
}
var _c;
__turbopack_context__.k.register(_c, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=OneDrive_Documents_GitHub_wallet-guardian_src_51133ea4._.js.map