import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { formatEther } from 'ethers/lib/utils';
import { SUPPORTED_TOKENS } from '../lib/chains';

interface TransactionDetails {
  amount: string;
  token: string;
  ntdAmount: number;
  commission: number;
  finalNtdAmount: number;
  merchantName: string;
  merchantAddress: string;
  transactionHash: string;
  timestamp: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDetails = async () => {
      console.log('🔄 Initializing payment success page with query:', router.query);

      const {
        amount,
        token = 'USDC',
        ntdAmount,
        commission,
        finalNtdAmount,
        merchantName,
        merchantAddress,
        transactionHash,
      } = router.query;

      if (!amount || !transactionHash) {
        console.error('❌ Missing required parameters:', { amount, transactionHash });
        setError('Missing transaction details');
        setLoading(false);
        return;
      }

      try {
        // Get token details
        const tokenDetails = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS] || SUPPORTED_TOKENS.USDC;
        console.log('💰 Token details:', {
          token,
          chain: tokenDetails.chain.name,
          chainId: tokenDetails.chain.id
        });

        setDetails({
          amount: amount as string,
          token: token as string,
          ntdAmount: parseFloat(ntdAmount as string),
          commission: parseFloat(commission as string),
          finalNtdAmount: parseFloat(finalNtdAmount as string),
          merchantName: merchantName as string,
          merchantAddress: merchantAddress as string,
          transactionHash: transactionHash as string,
          timestamp: new Date().toLocaleString(),
        });

        console.log('✅ Transaction details set successfully');
      } catch (err) {
        console.error('❌ Error setting transaction details:', err);
        setError('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      initializeDetails();
    }
  }, [router.isReady, router.query]);

  const getExplorerUrl = (hash: string, token: string) => {
    const tokenDetails = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS];
    if (!tokenDetails) return '';
    
    const baseUrl = tokenDetails.chain.blockExplorers?.default?.url;
    return baseUrl ? `${baseUrl}/tx/${hash}` : '';
  };

  const downloadReceipt = () => {
    if (!details) return;

    const tokenDetails = SUPPORTED_TOKENS[details.token as keyof typeof SUPPORTED_TOKENS];
    console.log('📄 Generating receipt for:', {
      token: details.token,
      chain: tokenDetails?.chain.name,
      explorer: tokenDetails?.chain.blockExplorers?.default?.name
    });

    const receiptContent = `
PAYMENT RECEIPT
--------------
Date: ${details.timestamp}

Transaction Details:
------------------
Transaction Hash: ${details.transactionHash}
Network: ${tokenDetails?.chain.name}
Merchant: ${details.merchantName}
Merchant Address: ${details.merchantAddress}

Payment Details:
--------------
Amount Sent: ${details.amount} ${details.token}
NTD Equivalent: ${details.ntdAmount.toLocaleString()} NTD
Commission (${details.commission}%): ${(details.ntdAmount - details.finalNtdAmount).toLocaleString()} NTD
Final Amount: ${details.finalNtdAmount.toLocaleString()} NTD

This receipt serves as proof of payment on the ${tokenDetails?.chain.name}.
Transaction can be verified at: ${getExplorerUrl(details.transactionHash, details.token)}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-receipt-${details.transactionHash.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    console.log('✅ Receipt downloaded successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9938] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600">{error || 'Failed to load transaction details'}</p>
          <button
            onClick={() => router.push('/discover')}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  const tokenDetails = SUPPORTED_TOKENS[details.token as keyof typeof SUPPORTED_TOKENS];
  const explorerUrl = getExplorerUrl(details.transactionHash, details.token);

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-[32px] font-black text-black mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been processed successfully on {tokenDetails?.chain.name}.</p>
          </div>

          {/* Transaction Details Card */}
          <div className="bg-[#F6F6F6] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-[17px] font-medium text-black mb-4">Transaction Details</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-600 text-sm sm:text-base">Amount Sent</span>
                <span className="font-medium text-black text-base sm:text-lg">
                  {details.amount} {details.token}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-600 text-sm sm:text-base">NTD Equivalent</span>
                <span className="font-medium text-black text-base sm:text-lg">{details.ntdAmount.toLocaleString()} NTD</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-600 text-sm sm:text-base">Commission ({details.commission}%)</span>
                <span className="font-medium text-black text-red-500 text-base sm:text-lg">
                  -{(details.ntdAmount - details.finalNtdAmount).toLocaleString()} NTD
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-3 sm:pt-4 border-t">
                <span className="font-medium text-black text-sm sm:text-base">Final Amount</span>
                <span className="font-bold text-lg sm:text-xl text-black">{details.finalNtdAmount.toLocaleString()} NTD</span>
              </div>
            </div>
          </div>

          {/* Merchant Details Card */}
          <div className="bg-[#F6F6F6] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-[17px] font-medium text-black mb-4">Merchant Details</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-600 text-sm sm:text-base">Name</span>
                <span className="font-medium text-black text-base sm:text-lg">{details.merchantName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 text-sm sm:text-base">Address</span>
                <span className="font-medium text-black text-sm sm:text-base break-all">{details.merchantAddress}</span>
              </div>
            </div>
          </div>

          {/* Transaction Hash Card */}
          <div className="bg-[#F6F6F6] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-[17px] font-medium text-black mb-4">Transaction Hash</h2>
            <div className="space-y-2">
              <p className="font-mono text-xs sm:text-sm break-all text-black">{details.transactionHash}</p>
              {explorerUrl && (
                <a 
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0052FF] text-sm mt-2 inline-block hover:underline"
                >
                  View on {tokenDetails?.chain.blockExplorers?.default?.name} →
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={downloadReceipt}
              className="w-full bg-[#FF9938] text-white rounded-2xl py-3 sm:py-4 font-bold text-base sm:text-lg hover:bg-[#FF8920] transition-colors"
            >
              Download Receipt
            </button>
            <button
              onClick={() => router.push('/discover')}
              className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 sm:py-4 font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors"
            >
              Back to Discover
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function PaymentSuccess() {
  return <PaymentSuccessContent />;
} 