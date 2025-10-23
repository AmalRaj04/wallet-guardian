// Sepolia Testnet Token Addresses
// These are common test tokens available on Sepolia for testing swaps

export const SEPOLIA_TOKENS = {
  // Wrapped ETH on Sepolia
  WETH: {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  // USDC on Sepolia (Circle's test token)
  USDC: {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  // DAI on Sepolia
  DAI: {
    address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  // UNI on Sepolia
  UNI: {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
  },
};

// Mainnet Token Addresses
export const MAINNET_TOKENS = {
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  PYUSD: {
    address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    symbol: 'PYUSD',
    name: 'PayPal USD',
    decimals: 6,
  },
};

// Get tokens for a specific chain
export function getTokensForChain(chainId: number) {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return MAINNET_TOKENS;
    case 11155111: // Sepolia
      return SEPOLIA_TOKENS;
    default:
      return MAINNET_TOKENS;
  }
}

// Uniswap V3 Router addresses (same on both networks)
export const UNISWAP_V3_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Uniswap V3 Factory addresses
export const UNISWAP_V3_FACTORY = {
  MAINNET: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  SEPOLIA: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
};

// Get factory address for chain
export function getFactoryAddress(chainId: number): string {
  return chainId === 11155111 ? UNISWAP_V3_FACTORY.SEPOLIA : UNISWAP_V3_FACTORY.MAINNET;
}
