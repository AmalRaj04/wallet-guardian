import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getEthereumProvider, 
  requestAccounts, 
  getAccounts, 
  getNetwork,
  getETHBalance,
  formatTokenBalance,
  ERC20_ABI,
  TOKEN_ADDRESSES,
  isValidAddress
} from '@/lib/web3';
import { coinGeckoAPI } from '@/lib/coingecko';
import { toast } from 'sonner';

// Alchemy API for token balances (using public endpoint for demo)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo';
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const accounts = await getAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          const network = await getNetwork();
          setChainId(network);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();

    // Listen for account changes
    const provider = getEthereumProvider();
    if (provider) {
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });

      provider.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (provider) {
        provider.removeAllListeners('accountsChanged');
        provider.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Fetch token balances using Alchemy API
  const fetchTokenBalances = async (walletAddress) => {
    if (!walletAddress) return [];

    try {
      // Get ETH balance
      const ethBalance = await getETHBalance(walletAddress);
      const ethFormatted = formatTokenBalance(ethBalance, 18);

      // Get ERC-20 token balances using Alchemy
      const response = await fetch(ALCHEMY_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          params: [walletAddress]
        })
      });

      const data = await response.json();
      const tokenBalances = data.result?.tokenBalances || [];

      // Filter out zero balances and get token metadata
      const nonZeroBalances = tokenBalances.filter(token => 
        token.tokenBalance && token.tokenBalance !== '0x0'
      );

      // Get token metadata for each token
      const tokensWithMetadata = await Promise.all(
        nonZeroBalances.slice(0, 20).map(async (token) => { // Limit to 20 tokens
          try {
            // Get token metadata from Alchemy
            const metadataResponse = await fetch(ALCHEMY_BASE_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'alchemy_getTokenMetadata',
                params: [token.contractAddress]
              })
            });

            const metadataData = await metadataResponse.json();
            const metadata = metadataData.result;

            if (!metadata) return null;

            const balance = parseInt(token.tokenBalance, 16);
            const decimals = metadata.decimals || 18;
            const balanceFormatted = formatTokenBalance(balance.toString(), decimals);

            return {
              address: token.contractAddress,
              symbol: metadata.symbol || 'UNKNOWN',
              name: metadata.name || 'Unknown Token',
              decimals,
              balance: balance.toString(),
              balanceFormatted,
              logo: metadata.logo || '',
              price: 0, // Will be fetched separately
              value: 0,
              change24h: 0
            };
          } catch (error) {
            console.error(`Error fetching metadata for ${token.contractAddress}:`, error);
            return null;
          }
        })
      );

      // Add ETH as first token
      const tokens = [
        {
          address: 'ETH',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          balance: ethBalance,
          balanceFormatted: ethFormatted,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          price: 0,
          value: 0,
          change24h: 0
        },
        ...tokensWithMetadata.filter(Boolean)
      ];

      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  };

  // Fetch prices for tokens
  const fetchTokenPrices = async (tokens) => {
    if (!tokens || tokens.length === 0) return tokens;

    try {
      // Get addresses for price lookup (excluding ETH)
      const tokenAddresses = tokens
        .filter(token => token.address !== 'ETH' && isValidAddress(token.address))
        .map(token => token.address);

      // Get prices from CoinGecko
      const prices = await coinGeckoAPI.getTokenPrices(tokenAddresses);

      // Get ETH price separately
      const ethPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
      );
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum?.usd || 0;
      const ethChange = ethPriceData.ethereum?.usd_24h_change || 0;

      // Update tokens with prices
      return tokens.map(token => {
        if (token.address === 'ETH') {
          return {
            ...token,
            price: ethPrice,
            value: token.balanceFormatted * ethPrice,
            change24h: ethChange
          };
        }

        const priceData = prices[token.address.toLowerCase()];
        const price = priceData?.usd || 0;
        const change24h = priceData?.usd_24h_change || 0;

        return {
          ...token,
          price,
          value: token.balanceFormatted * price,
          change24h
        };
      });
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return tokens;
    }
  };

  // React Query for token data
  const { data: tokens = [], isLoading: tokensLoading, refetch: refetchTokens } = useQuery({
    queryKey: ['wallet-tokens', address],
    queryFn: async () => {
      if (!address) return [];
      
      const balances = await fetchTokenBalances(address);
      const tokensWithPrices = await fetchTokenPrices(balances);
      return tokensWithPrices;
    },
    enabled: !!address && isConnected,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Calculate total portfolio value
  const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const accounts = await requestAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        const network = await getNetwork();
        setChainId(network);
        
        if (network !== 1) {
          toast.warning('Please switch to Ethereum Mainnet for full functionality');
        }
        
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setChainId(null);
    toast.success('Wallet disconnected');
  }, []);

  return {
    isConnected,
    address,
    chainId,
    tokens,
    totalValue,
    isLoading: isLoading || tokensLoading,
    connectWallet,
    disconnect,
    refetchTokens
  };
}