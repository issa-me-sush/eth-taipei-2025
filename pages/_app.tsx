import type { AppProps } from "next/app";
import { PrivyProvider } from '@privy-io/react-auth';
import "../styles/globals.css";
import { privyConfig } from '../lib/privyConfig';
import { AuthProvider } from '../lib/context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </PrivyProvider>
  );
}
