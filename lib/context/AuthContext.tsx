import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';

interface AuthContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  hasWallet: boolean;
  walletAddress: string | null;
  login: () => void;
  connectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 Auth Provider Rendered');
  const { ready, authenticated, login, connectWallet: privyConnectWallet, user } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Log the full Privy state
  console.log('👤 Privy User:', user);
  console.log('👛 Privy Wallets:', wallets);

  console.log('🔑 Auth Provider State:', {
    ready,
    authenticated,
    wallets: wallets?.length,
    linkedAccounts: user?.linkedAccounts,
    walletAddress,
    path: router.pathname
  });

  useEffect(() => {
    if (user) {
      console.log('🔍 Checking user accounts:', {
        linkedAccounts: user.linkedAccounts,
        walletAddresses: user.wallet?.address
      });
    }
  }, [user]);

  useEffect(() => {
    // Check both embedded wallet and connected wallets
    const embeddedWalletAddress = user?.wallet?.address;
    const connectedWalletAddress = wallets?.[0]?.address;

    console.log('💳 Wallet Check:', {
      embedded: embeddedWalletAddress,
      connected: connectedWalletAddress
    });

    if (embeddedWalletAddress || connectedWalletAddress) {
      console.log('✅ Setting wallet address:', embeddedWalletAddress || connectedWalletAddress);
      setWalletAddress(embeddedWalletAddress || connectedWalletAddress);
    } else {
      setWalletAddress(null);
    }
  }, [wallets, user]);

  // Enhanced wallet connection that handles errors
  const handleConnectWallet = async () => {
    console.log('🔌 Attempting to connect wallet...');
    try {
      await privyConnectWallet();
      console.log('✅ Wallet connection initiated');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  };

  const value = {
    isReady: ready,
    isAuthenticated: authenticated,
    hasWallet: Boolean(walletAddress || user?.wallet?.address || wallets?.length),
    walletAddress,
    login,
    connectWallet: handleConnectWallet,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 