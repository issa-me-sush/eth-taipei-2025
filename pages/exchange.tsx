import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function ExchangeContent() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Exchange</h1>
          <p className="text-gray-600 mb-6">
            Enter the amount you want to exchange and find a merchant near you.
          </p>

          {/* Currency Input */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">You sell</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 text-4xl font-bold bg-transparent outline-none"
              />
              <button className="flex items-center gap-2 text-lg font-medium">
                <span className="w-6 h-6 rounded-full bg-black"></span>
                {selectedCurrency}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Find merchants near you</h2>
            <div className="aspect-video w-full bg-[#EBEBEB] rounded-xl"></div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/discover')}
            className="w-full bg-black text-white rounded-full py-4 font-medium hover:opacity-90 transition-opacity"
          >
            Find merchants
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default function Exchange() {
  return (
    <ProtectedRoute>
      <ExchangeContent />
    </ProtectedRoute>
  );
} 