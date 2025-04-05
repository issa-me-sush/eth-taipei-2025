import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BottomNav() {
  const router = useRouter();

  // Don't show bottom nav on payment pages
  if (router.pathname.startsWith('/payment/')) {
    return null;
  }

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white  border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-around h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full">
          <svg className={`w-6 h-6 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`text-xs mt-1 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'}`}>Home</span>
        </Link>

        <Link href="/scan" className="flex flex-col items-center justify-center w-full">
          <svg className={`w-6 h-6 ${isActive('/scan') ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className={`text-xs mt-1 ${isActive('/scan') ? 'text-blue-500' : 'text-gray-500'}`}>Scan</span>
        </Link>

        <Link href="/merchant/dashboard" className="flex flex-col items-center justify-center w-full">
          <svg className={`w-6 h-6 ${isActive('/merchant/dashboard') ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className={`text-xs mt-1 ${isActive('/merchant/dashboard') ? 'text-blue-500' : 'text-gray-500'}`}>Business</span>
        </Link>

        <Link href="/wallet" className="flex flex-col items-center justify-center w-full">
          <svg className={`w-6 h-6 ${isActive('/wallet') ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className={`text-xs mt-1 ${isActive('/wallet') ? 'text-blue-500' : 'text-gray-500'}`}>Wallet</span>
        </Link>
      </div>
    </div>
  );
} 