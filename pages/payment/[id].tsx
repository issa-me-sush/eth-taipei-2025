import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { QRCodeSVG } from 'qrcode.react';

function PaymentContent() {
  const router = useRouter();
  const { id, amount } = router.query;
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed'>('pending');

  // Mock merchant data
  const merchant = {
    id: id as string,
    brandName: 'Rouhe Pork bun',
    address: 'Raohe St, Songshan District, Taipei City',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    commissionPercent: 5
  };

  const handleStatusChange = () => {
    if (status === 'pending') {
      setStatus('processing');
      setTimeout(() => setStatus('completed'), 2000);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Payment Details</h1>
            <p className="text-gray-600">
              Scan the QR code or copy the address to complete your payment
            </p>
          </div>

          {/* Merchant Info */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">{merchant.brandName}</h2>
            <p className="text-gray-600">{merchant.address}</p>
          </div>

          {/* Payment Amount */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold">{amount} USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commission ({merchant.commissionPercent}%)</span>
              <span className="text-lg">
                {((parseFloat(amount as string) || 0) * (merchant.commissionPercent / 100)).toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-6 mb-6 text-center">
            <QRCodeSVG
              value={merchant.walletAddress}
              size={200}
              level="H"
              className="mx-auto mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Send exactly {amount} USDC to:
            </p>
            <div className="bg-[#EBEBEB] rounded-xl p-4">
              <p className="text-sm font-mono break-all">{merchant.walletAddress}</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <h3 className="font-medium mb-4">Transaction Status</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-[#EBEBEB] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-black transition-all duration-500 ${
                    status === 'pending' ? 'w-0' :
                    status === 'processing' ? 'w-1/2' :
                    'w-full'
                  }`}
                />
              </div>
              <span className="text-sm capitalize">{status}</span>
            </div>
          </div>

          {/* Action Button */}
          {status === 'pending' && (
            <button
              onClick={handleStatusChange}
              className="w-full bg-black text-white rounded-full py-4 font-medium hover:opacity-90 transition-opacity"
            >
              I have sent the payment
            </button>
          )}

          {status === 'completed' && (
            <div className="text-center">
              <p className="text-lg font-medium mb-4">Payment Completed!</p>
              <button
                onClick={() => router.push('/discover')}
                className="text-black underline"
              >
                Back to discover
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function Payment() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  );
} 