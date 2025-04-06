import type { AppProps } from "next/app";
import { PrivyProvider } from '@privy-io/react-auth';
import "../styles/globals.css";
import { privyConfig } from '../lib/privyConfig';
import { AuthProvider } from '../lib/context/AuthContext';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

function NavbarComponent() {
  const { login, authenticated  } = usePrivy();

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

        <button
          onClick={login}
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
