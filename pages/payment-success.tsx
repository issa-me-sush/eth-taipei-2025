import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { formatEther } from 'ethers/lib/utils';

interface TransactionDetails {
  ethAmount: string;
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

  useEffect(() => {
    // Get transaction details from router query
    const {
      ethAmount,
      ntdAmount,
      commission,
      finalNtdAmount,
      merchantName,
      merchantAddress,
      transactionHash,
    } = router.query;

    if (ethAmount) {
      setDetails({
        ethAmount: ethAmount as string,
        ntdAmount: parseFloat(ntdAmount as string),
        commission: parseFloat(commission as string),
        finalNtdAmount: parseFloat(finalNtdAmount as string),
        merchantName: merchantName as string,
        merchantAddress: merchantAddress as string,
        transactionHash: transactionHash as string,
        timestamp: new Date().toLocaleString(),
      });
    }
  }, [router.query]);

  const downloadReceipt = () => {
    if (!details) return;

    const receiptContent = `
PAYMENT RECEIPT
--------------
Date: ${details.timestamp}

Transaction Details:
------------------
Transaction Hash: ${details.transactionHash}
Merchant: ${details.merchantName}
Merchant Address: ${details.merchantAddress}

Payment Details:
--------------
Amount Sent: ${details.ethAmount} ETH
NTD Equivalent: ${details.ntdAmount.toLocaleString()} NTD
Commission (${details.commission}%): ${(details.ntdAmount - details.finalNtdAmount).toLocaleString()} NTD
Final Amount: ${details.finalNtdAmount.toLocaleString()} NTD

This receipt serves as proof of payment on the Ethereum Sepolia network.
Transaction can be verified at: https://sepolia.etherscan.io/tx/${details.transactionHash}
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
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9938] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>

          {/* Transaction Details Card */}
          <div className="bg-[#F6F6F6] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-[17px] font-medium text-black mb-4">Transaction Details</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-600 text-sm sm:text-base">Amount Sent</span>
                <span className="font-medium text-black text-base sm:text-lg">{details.ethAmount} ETH</span>
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
              <a 
                href={`https://sepolia.etherscan.io/tx/${details.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0052FF] text-sm mt-2 inline-block hover:underline"
              >
                View on Etherscan →
              </a>
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