import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Token, Portfolio } from "@/types";
import { AlchemyAPI } from "@/lib/alchemy";
import { CoinGeckoAPI } from "@/lib/coingecko";
import toast from "react-hot-toast";

export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Fetch complete portfolio with Alchemy
  const {
    data: alchemyTokens,
    isLoading: isLoadingTokens,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: ["alchemyPortfolio", address, chain?.id],
    queryFn: async () => {
      if (!address || !chain) return [];

      try {
        if (!AlchemyAPI.isConfigured()) {
          console.warn("Alchemy not configured, using mock data");
          return [];
        }

        const tokens = await AlchemyAPI.getCompletePortfolio(address, chain.id);
        return tokens;
      } catch (error) {
        console.error("Error fetching Alchemy portfolio:", error);
        toast.error("Failed to fetch token balances");
        return [];
      }
    },
    enabled: isConnected && !!address && !!chain,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  // Fetch prices for all tokens
  useEffect(() => {
    if (!isConnected || !address) {
      setPortfolio(null);
      return;
    }

    const fetchPortfolioWithPrices = async () => {
      setIsLoadingPortfolio(true);

      try {
        const tokens: Token[] = [];
        let totalValue = 0;

        // Add ETH
        if (ethBalance) {
          try {
            const ethPriceData = await CoinGeckoAPI.getCoinPrices(["ethereum"]);
            const ethPrice = ethPriceData.ethereum?.usd || 0;
            const ethValue = parseFloat(ethBalance.formatted) * ethPrice;

            const ethToken: Token = {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              name: "Ethereum",
              decimals: 18,
              balance: ethBalance.value.toString(),
              balanceFormatted: parseFloat(ethBalance.formatted),
              price: ethPrice,
              value: ethValue,
              change24h: ethPriceData.ethereum?.usd_24h_change || 0,
            };

            tokens.push(ethToken);
            totalValue += ethValue;
          } catch (error) {
            console.error("Error fetching ETH price:", error);
          }
        }

        // Add ERC-20 tokens from Alchemy
        if (alchemyTokens && alchemyTokens.length > 0) {
          for (const token of alchemyTokens) {
            try {
              // Search for token on CoinGecko
              const searchResults = await CoinGeckoAPI.searchCoins(
                token.symbol
              );

              if (searchResults.length > 0) {
                const coinId = searchResults[0].id;
                const priceData = await CoinGeckoAPI.getCoinPrices([coinId]);
                const price = priceData[coinId]?.usd || 0;
                const change24h = priceData[coinId]?.usd_24h_change || 0;
                const value = token.balanceFormatted * price;

                tokens.push({
                  ...token,
                  price,
                  value,
                  change24h,
                });

                totalValue += value;
              } else {
                // Token not found on CoinGecko, add without price
                tokens.push(token);
              }
            } catch (error) {
              console.error(`Error fetching price for ${token.symbol}:`, error);
              tokens.push(token);
            }
          }
        }

        // Calculate 24h change
        const totalChange24h = tokens.reduce((sum, token) => {
          if (token.value && token.change24h) {
            return sum + (token.value * token.change24h) / 100;
          }
          return sum;
        }, 0);

        const totalChangePercentage24h =
          totalValue > 0
            ? (totalChange24h / (totalValue - totalChange24h)) * 100
            : 0;

        const newPortfolio: Portfolio = {
          totalValue,
          totalChange24h,
          totalChangePercentage24h,
          tokens,
          lastUpdated: new Date(),
        };

        setPortfolio(newPortfolio);
      } catch (error) {
        console.error("Error building portfolio:", error);
        toast.error("Failed to load portfolio data");
      } finally {
        setIsLoadingPortfolio(false);
      }
    };

    fetchPortfolioWithPrices();
  }, [isConnected, address, ethBalance, alchemyTokens]);

  const refreshPortfolio = async () => {
    await refetchTokens();
  };

  return {
    address,
    isConnected,
    isConnecting,
    disconnect,
    portfolio,
    isLoadingPortfolio: isLoadingPortfolio || isLoadingTokens,
    ethBalance: ethBalance ? parseFloat(ethBalance.formatted) : 0,
    refreshPortfolio,
  };
}
