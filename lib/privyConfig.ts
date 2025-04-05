import { PrivyClientConfig } from '@privy-io/react-auth';
import { supportedChains } from './chains';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'wallet', 'google', 'sms', 'instagram', 'twitter'],
  appearance: {
    theme: 'light',
    accentColor: '#00B900', // LINE's brand color
    showWalletLoginFirst: false, // This ensures social logins are shown prominently
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    noPromptOnSignature: false // Show signature prompts for better UX
  },
  supportedChains,
  defaultChain: supportedChains[0], // Sepolia remains default
};