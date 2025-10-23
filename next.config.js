/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'assets.coingecko.com',
      'coin-images.coingecko.com',
      'static.coingecko.com',
      'blockscout.com'
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for WalletConnect and MetaMask SDK
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore optional dependencies
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    BLOCKSCOUT_API_KEY: process.env.BLOCKSCOUT_API_KEY,
  },
}

module.exports = nextConfig