import { defineChain } from 'viem';
import { addRpcUrlOverrideToChain } from '@privy-io/chains';
import { sepolia } from 'viem/chains';

// Define base chains
const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  network: 'citrea-testnet',
  nativeCurrency: { name: 'CBTC', symbol: 'CBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
});

const rootstockTestnet = defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  network: 'rootstock-testnet',
  nativeCurrency: { name: 'RSK', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.rootstock.io/KzaDaZZeCNSfhXK9l4ruLINy3e79Ru-T'] },
  },
  blockExplorers: {
    default: { name: 'RSK Explorer', url: 'https://explorer.testnet.rsk.co' },
  },
});

const flowTestnet = defineChain({
  id: 545,
  name: 'Flow Testnet',
  network: 'flow-testnet',
  nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'Flow Explorer', url: 'https://evm.flowscan.io/' },
  },
});

// Create chain overrides with custom RPC URLs
const sepoliaOverride = addRpcUrlOverrideToChain(sepolia, 'https://rpc.sepolia.org');
const citreaOverride = addRpcUrlOverrideToChain(citreaTestnet, 'https://rpc.testnet.citrea.xyz');
const rootstockOverride = addRpcUrlOverrideToChain(rootstockTestnet, 'https://rpc.testnet.rootstock.io/KzaDaZZeCNSfhXK9l4ruLINy3e79Ru-T');
const flowOverride = addRpcUrlOverrideToChain(flowTestnet, 'https://testnet.evm.nodes.onflow.org');

// Export supported chains for Privy configuration
export const supportedChains = [
  sepoliaOverride,
  citreaOverride,
  rootstockOverride,
  flowOverride
];

// Token configurations
export const SUPPORTED_TOKENS = {
  USDC: {
    symbol: 'USDC',
    icon: '$',
    color: '#0052FF',
    rate: 30, // 1 USDC = 30 NTD
    chain: sepoliaOverride,
    decimals: 18
  },
  CBTC: {
    symbol: 'CBTC',
    icon: '₿',
    color: '#F7931A',
    rate: 2748918, // 1 BTC = 2,748,918 NTD
    chain: citreaOverride,
    decimals: 18
  },
  RBTC: {
    symbol: 'TRBTC',
    icon: '₿',
    color: '#FF9938',
    rate: 2748918, // 1 BTC = 2,748,918 NTD
    chain: rootstockOverride,
    decimals: 18
  },
  FLOW: {
    symbol: 'FLOW',
    icon: 'F',
    color: '#00EF8B',
    rate: 12, // 1 FLOW = 12 NTD
    chain: flowOverride,
    decimals: 18
  }
}; 