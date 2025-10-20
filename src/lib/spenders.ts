// Common DeFi protocol spender addresses (mainnet & testnet)
export const COMMON_SPENDERS = {
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
  SEAPORT: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
};

export function getDefaultSpenderList(): string[] {
  return Object.values(COMMON_SPENDERS);
}

export interface SpenderInfo {
  address: string;
  name: string;
  type: "dex" | "aggregator" | "lending" | "nft" | "bridge" | "unknown";
}

export function getSpenderInfo(address: string): SpenderInfo {
  const addr = address.toLowerCase();

  const mapping: Record<string, SpenderInfo> = {
    [COMMON_SPENDERS.UNISWAP_V2_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.UNISWAP_V2_ROUTER,
      name: "Uniswap V2",
      type: "dex",
    },
    [COMMON_SPENDERS.UNISWAP_V3_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.UNISWAP_V3_ROUTER,
      name: "Uniswap V3",
      type: "dex",
    },
    [COMMON_SPENDERS.UNISWAP_UNIVERSAL_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.UNISWAP_UNIVERSAL_ROUTER,
      name: "Uniswap Universal Router",
      type: "dex",
    },
    [COMMON_SPENDERS.ONEINCH_V5_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.ONEINCH_V5_ROUTER,
      name: "1inch V5",
      type: "aggregator",
    },
    [COMMON_SPENDERS.ZEROX_EXCHANGE.toLowerCase()]: {
      address: COMMON_SPENDERS.ZEROX_EXCHANGE,
      name: "0x Exchange",
      type: "aggregator",
    },
    [COMMON_SPENDERS.CURVE_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.CURVE_ROUTER,
      name: "Curve Router",
      type: "dex",
    },
    [COMMON_SPENDERS.SUSHI_ROUTER.toLowerCase()]: {
      address: COMMON_SPENDERS.SUSHI_ROUTER,
      name: "SushiSwap",
      type: "dex",
    },
    [COMMON_SPENDERS.AAVE_POOL.toLowerCase()]: {
      address: COMMON_SPENDERS.AAVE_POOL,
      name: "Aave V3",
      type: "lending",
    },
    [COMMON_SPENDERS.COMPOUND_COMET.toLowerCase()]: {
      address: COMMON_SPENDERS.COMPOUND_COMET,
      name: "Compound V3",
      type: "lending",
    },
    [COMMON_SPENDERS.SEAPORT.toLowerCase()]: {
      address: COMMON_SPENDERS.SEAPORT,
      name: "OpenSea Seaport",
      type: "nft",
    },
  };

  return (
    mapping[addr] || {
      address,
      name: `Contract ${address.slice(0, 6)}...${address.slice(-4)}`,
      type: "unknown",
    }
  );
}
