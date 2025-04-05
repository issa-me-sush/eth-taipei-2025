import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  // Show loading state while checking auth
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-black" style={{ fontFamily: 'var(--font-pixel)' }}>TaiPay</h1>
        <svg className="w-6 h-6 text-black font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>

      <div className="space-y-4">
        {/* Exchange Card */}
        <button
          onClick={authenticated ? () => router.push('/discover') : login}
          className="w-full bg-[#EDEDED] rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <Image src="/exchange.png" alt="Exchange" width={32} height={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-black">Want to exchanging crypto for cash?</h2>
          <div className="flex items-center justify-center text-black font-black">
            Look for an exchange
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Merchant Card */}
        <button
          onClick={authenticated ? () => router.push('/merchant/dashboard') : login}
          className="w-full bg-[#EDEDED] rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <Image src="/store.png" alt="Store" width={32} height={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-black">Set up your shop to provide exchange service</h2>
          <div className="flex items-center justify-center text-black font-black">
            Set up your shop
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );

  return renderContent();
}
