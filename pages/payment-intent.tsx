import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function PaymentIntentContent() {
  const router = useRouter();
  const { user, sendTransaction } = usePrivy();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get merchant details from URL params
  const { address, brandName, dailyLimit } = router.query;
  const dailyLimitNum = dailyLimit ? parseInt(dailyLimit as string, 10) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!address) {
      setError('Invalid merchant address');
      return;
    }

    // Check daily limit
    if (parseFloat(amount) > dailyLimitNum) {
      setError(`Amount exceeds merchant's daily limit of ${dailyLimitNum} USDC`);
      return;
    }

    try {
      setLoading(true);
      
      // Create transaction through Privy
      await sendTransaction({
        to: address as string,
        value: parseFloat(amount), // This should be properly formatted for the blockchain
      });

      // Redirect to success page or show success message
      router.push('/payment-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-[32px] font-black text-black mb-2">Payment to {brandName}</h1>
          <p className="text-black mb-6">
            Enter the amount you want to send. Daily limit: {dailyLimitNum} USDC
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-[#F6F6F6] rounded-2xl p-6 mb-6">
              <h2 className="text-[17px] font-medium text-black mb-4">Amount to send</h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-[40px] font-bold bg-transparent outline-none placeholder-black/40 min-w-0"
                  disabled={loading}
                />
                <button type="button" className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center">
                    <span className="text-white">$</span>
                  </div>
                  <span className="font-medium">USDC</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF9938] text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default function PaymentIntent() {
  return (
    <ProtectedRoute>
      <PaymentIntentContent />
    </ProtectedRoute>
  );
} 