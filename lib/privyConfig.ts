import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'wallet', 'google', 'sms', 'instagram', 'twitter'],
  appearance: {
    theme: 'light',
    accentColor: '#00B900', // LINE's brand color
    showWalletLoginFirst: false, // This ensures social logins are shown prominently
  },
  embeddedWallets: {
   createOnLogin : 'users-without-wallets'
},
  defaultChain: {
    id: 11155111, // Sepolia testnet
    name: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      public: { http: [`https://sepolia.gateway.tenderly.co`] },
      default: { http: [`https://sepolia.gateway.tenderly.co`] },
    },
  },
};