import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log('🛡️ Protected Route Rendered');
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log('🔑 Protected Route State:', { 
    isReady, 
    isAuthenticated, 
    path: router.pathname 
  });

  useEffect(() => {
    if (isReady && !isAuthenticated && router.pathname !== '/') {
      console.log('🔒 Protected Route: Not authenticated, redirecting to home');
      router.push('/?from=protected');
    }
  }, [isReady, isAuthenticated, router]);

  // Show loading state while checking auth
  if (!isReady) {
    console.log('⌛ Protected Route Loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    console.log('🚫 Protected Route: Not authenticated, not rendering');
    return null;
  }

  console.log('✅ Protected Route: Rendering protected content');
  return <>{children}</>;
} 