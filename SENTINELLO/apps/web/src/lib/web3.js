// Web3 utilities for wallet connection and blockchain interactions

// ERC-20 ABI for token balance queries
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];

// Common token addresses on Ethereum mainnet
export const TOKEN_ADDRESSES = {
  USDC: '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  PYUSD: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
};

// Uniswap V3 Router address
export const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Helper function to format token balance
export const formatTokenBalance = (balance, decimals) => {
  if (!balance || !decimals) return 0;
  return parseFloat(balance.toString()) / Math.pow(10, decimals);
};

// Helper function to parse token balance to wei
export const parseTokenBalance = (balance, decimals) => {
  if (!balance || !decimals) return '0';
  return (parseFloat(balance) * Math.pow(10, decimals)).toString();
};

// Check if address is valid Ethereum address
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Shorten address for display
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get Ethereum provider from window
export const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum;
  }
  return null;
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  const provider = getEthereumProvider();
  return provider && provider.isMetaMask;
};

// Request account access
export const requestAccounts = async () => {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found. Please install MetaMask.');
  }
  
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    throw new Error('User rejected the request.');
  }
};

// Get current accounts
export const getAccounts = async () => {
  const provider = getEthereumProvider();
  if (!provider) return [];
  
  try {
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
};

// Get current network
export const getNetwork = async () => {
  const provider = getEthereumProvider();
  if (!provider) return null;
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

// Switch to Ethereum mainnet
export const switchToMainnet = async () => {
  const provider = getEthereumProvider();
  if (!provider) throw new Error('No Ethereum provider found');
  
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // Ethereum mainnet
    });
  } catch (error) {
    throw new Error('Failed to switch to Ethereum mainnet');
  }
};

// Get ETH balance
export const getETHBalance = async (address) => {
  const provider = getEthereumProvider();
  if (!provider || !address) return '0';
  
  try {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    return balance;
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    return '0';
  }
};

// Create contract call data
export const createContractCall = (address, abi, method, params = []) => {
  return {
    to: address,
    data: encodeMethodCall(abi, method, params)
  };
};

// Simple ABI encoder for basic method calls
export const encodeMethodCall = (abi, methodName, params = []) => {
  const method = abi.find(item => item.name === methodName && item.type === 'function');
  if (!method) throw new Error(`Method ${methodName} not found in ABI`);
  
  // This is a simplified encoder - in production, use ethers.js or web3.js
  const methodSignature = `${methodName}(${method.inputs.map(input => input.type).join(',')})`;
  const methodId = keccak256(methodSignature).slice(0, 10);
  
  // For now, return just the method ID - full encoding would require more complex logic
  return methodId;
};

// Simple keccak256 implementation (placeholder - use proper crypto library in production)
const keccak256 = (data) => {
  // This is a placeholder - use proper keccak256 implementation
  return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
};