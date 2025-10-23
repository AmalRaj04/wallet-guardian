// Trusted Contract Whitelist for Safe Interactions
export interface TrustedContract {
  address: string;
  name: string;
  category: 'dex' | 'stablecoin' | 'defi' | 'bridge' | 'nft' | 'other';
  description: string;
  website?: string;
  verified: boolean;
}

// Comprehensive whitelist of trusted protocols on Ethereum Mainnet
export const TRUSTED_CONTRACTS: Record<string, TrustedContract> = {
  // DEXes
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    name: 'Uniswap V2 Router',
    category: 'dex',
    description: 'Uniswap V2 decentralized exchange router',
    website: 'https://uniswap.org',
    verified: true,
  },
  '0xe592427a0aece92de3edee1f18e0157c05861564': {
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    name: 'Uniswap V3 Router',
    category: 'dex',
    description: 'Uniswap V3 swap router',
    website: 'https://uniswap.org',
    verified: true,
  },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {
    address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    name: 'Uniswap V3 Router 2',
    category: 'dex',
    description: 'Uniswap V3 universal router',
    website: 'https://uniswap.org',
    verified: true,
  },
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': {
    address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    name: 'SushiSwap Router',
    category: 'dex',
    description: 'SushiSwap decentralized exchange router',
    website: 'https://sushi.com',
    verified: true,
  },
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': {
    address: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
    name: '0x Exchange Proxy',
    category: 'dex',
    description: '0x Protocol exchange proxy',
    website: 'https://0x.org',
    verified: true,
  },
  '0x1111111254eeb25477b68fb85ed929f73a960582': {
    address: '0x1111111254EEB25477B68fb85Ed929f73A960582',
    name: '1inch V5 Router',
    category: 'dex',
    description: '1inch aggregation router',
    website: 'https://1inch.io',
    verified: true,
  },

  // Stablecoins
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USDC',
    category: 'stablecoin',
    description: 'USD Coin stablecoin',
    website: 'https://circle.com/usdc',
    verified: true,
  },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    name: 'USDT',
    category: 'stablecoin',
    description: 'Tether USD stablecoin',
    website: 'https://tether.to',
    verified: true,
  },
  '0x6b175474e89094c44da98b954eedeac495271d0f': {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'DAI',
    category: 'stablecoin',
    description: 'Dai stablecoin',
    website: 'https://makerdao.com',
    verified: true,
  },
  '0x6c3ea9036406852006290770bedfcaba0e23a0e8': {
    address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    name: 'PYUSD',
    category: 'stablecoin',
    description: 'PayPal USD stablecoin',
    website: 'https://paypal.com',
    verified: true,
  },
  '0x4fabb145d64652a948d72533023f6e7a623c7c53': {
    address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    name: 'BUSD',
    category: 'stablecoin',
    description: 'Binance USD stablecoin',
    website: 'https://binance.com',
    verified: true,
  },

  // DeFi Protocols
  '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': {
    address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    name: 'Aave V3 Pool',
    category: 'defi',
    description: 'Aave V3 lending pool',
    website: 'https://aave.com',
    verified: true,
  },
  '0xc3d688b66703497daa19211eedff47f25384cdc3': {
    address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    name: 'Compound V3 USDC',
    category: 'defi',
    description: 'Compound V3 USDC market',
    website: 'https://compound.finance',
    verified: true,
  },
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': {
    address: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    name: 'Compound Comptroller',
    category: 'defi',
    description: 'Compound protocol comptroller',
    website: 'https://compound.finance',
    verified: true,
  },

  // Bridges
  '0x8484ef722627bf18ca5ae6bcf031c23e6e922b30': {
    address: '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30',
    name: 'Polygon Bridge',
    category: 'bridge',
    description: 'Polygon PoS bridge',
    website: 'https://polygon.technology',
    verified: true,
  },

  // NFT Marketplaces
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': {
    address: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    name: 'OpenSea Seaport',
    category: 'nft',
    description: 'OpenSea marketplace protocol',
    website: 'https://opensea.io',
    verified: true,
  },
};

export class WhitelistService {
  private static customWhitelist = new Set<string>();

  // Check if contract is whitelisted
  static isWhitelisted(address: string): boolean {
    const normalized = address.toLowerCase();
    return (
      normalized in TRUSTED_CONTRACTS ||
      this.customWhitelist.has(normalized)
    );
  }

  // Get contract info if whitelisted
  static getContractInfo(address: string): TrustedContract | null {
    const normalized = address.toLowerCase();
    return TRUSTED_CONTRACTS[normalized] || null;
  }

  // Add custom whitelist entry
  static addToWhitelist(address: string) {
    this.customWhitelist.add(address.toLowerCase());
  }

  // Remove from custom whitelist
  static removeFromWhitelist(address: string) {
    this.customWhitelist.delete(address.toLowerCase());
  }

  // Get all whitelisted addresses
  static getAllWhitelisted(): string[] {
    return [
      ...Object.keys(TRUSTED_CONTRACTS),
      ...Array.from(this.customWhitelist),
    ];
  }

  // Get whitelisted contracts by category
  static getByCategory(category: TrustedContract['category']): TrustedContract[] {
    return Object.values(TRUSTED_CONTRACTS).filter(
      contract => contract.category === category
    );
  }

  // Search whitelist
  static search(query: string): TrustedContract[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(TRUSTED_CONTRACTS).filter(
      contract =>
        contract.name.toLowerCase().includes(lowerQuery) ||
        contract.address.toLowerCase().includes(lowerQuery) ||
        contract.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Get whitelist stats
  static getStats() {
    const contracts = Object.values(TRUSTED_CONTRACTS);
    return {
      total: contracts.length + this.customWhitelist.size,
      byCategory: {
        dex: contracts.filter(c => c.category === 'dex').length,
        stablecoin: contracts.filter(c => c.category === 'stablecoin').length,
        defi: contracts.filter(c => c.category === 'defi').length,
        bridge: contracts.filter(c => c.category === 'bridge').length,
        nft: contracts.filter(c => c.category === 'nft').length,
        other: contracts.filter(c => c.category === 'other').length,
      },
      custom: this.customWhitelist.size,
    };
  }

  // Export custom whitelist
  static exportCustomWhitelist(): string[] {
    return Array.from(this.customWhitelist);
  }

  // Import custom whitelist
  static importCustomWhitelist(addresses: string[]) {
    addresses.forEach(address => this.addToWhitelist(address));
  }

  // Clear custom whitelist
  static clearCustomWhitelist() {
    this.customWhitelist.clear();
  }
}

export default WhitelistService;