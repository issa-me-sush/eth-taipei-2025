import type { AppProps } from "next/app";
import { PrivyProvider } from '@privy-io/react-auth';
import "../styles/globals.css";
import { privyConfig } from '../lib/privyConfig';
import { AuthProvider } from '../lib/context/AuthContext';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useState } from 'react';

function NavbarComponent() {
  const { login, authenticated, logout, user } = usePrivy();
  const [showDropdown, setShowDropdown] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (user?.wallet?.address) {
      await navigator.clipboard.writeText(user.wallet.address);
      // You could add a toast notification here
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="CashMe Logo"
            width={180}
            height={40}
            priority
          />
        </Link>

        <div className="relative">
          <button
            onClick={() => authenticated ? setShowDropdown(!showDropdown) : login()}
            className="flex items-center justify-center bg-black w-10 h-10 rounded-xl"
          >
            <Image
              src="/wallet.svg"
              alt="Wallet"
              width={20}
              height={20}
              className="invert"
            />
          </button>

          {authenticated && showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Wallet Address</span>
                  <button
                    onClick={copyAddress}
                    className="text-sm text-black hover:text-gray-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-black font-medium">
                  {user?.wallet?.address ? shortenAddress(user.wallet.address) : ''}
                </p>
              </div>
              <div className="border-t border-gray-100 mt-2">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <NavbarComponent />
          <main className="pt-16">
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </PrivyProvider>
  );
}
