import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();

  // Don't show header on payment pages
  if (router.pathname.startsWith('/payment/')) {
    return null;
  }

  return (
    <header className="bg-white  border-b border-gray-200 dark:border-gray-700">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center">
          {router.pathname !== '/' && (
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            TaiPay
          </h1>
        </div>
        <Link href="/" className="text-gray-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div>
    </header>
  );
} 