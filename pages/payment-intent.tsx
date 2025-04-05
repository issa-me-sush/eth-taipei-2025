import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

// Constants
const ETH_TO_NTD_RATE = 56700; // 1 ETH = $1800 USD = 56,700 NTD

function PaymentIntentContent() {
  const router = useRouter();
  const { user, sendTransaction } = usePrivy();
  const [ethAmount, setEthAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get merchant details from URL params
  const { address, brandName, dailyLimit, commissionPercent } = router.query;
  const dailyLimitNum = dailyLimit ? parseInt(dailyLimit as string, 10) : 0;
  const commission = commissionPercent ? parseFloat(commissionPercent as string) : 0;

  // Calculate conversions
  const ntdAmount = ethAmount ? parseFloat(ethAmount) * ETH_TO_NTD_RATE : 0;
  const commissionAmount = (ntdAmount * commission) / 100;
  const finalNtdAmount = ntdAmount - commissionAmount;

  useEffect(() => {
    console.log('💰 Payment Intent Initialized:', {
      merchantAddress: address,
      merchantName: brandName,
      dailyLimit: dailyLimitNum,
      commission: commission,
      userWallet: user?.wallet?.address
    });
  }, [address, brandName, dailyLimitNum, commission, user]);

  useEffect(() => {
    if (ethAmount) {
      console.log('💱 Conversion Details:', {
        ethAmount,
        ntdAmount: ntdAmount.toLocaleString(),
        commission: `${commission}%`,
        commissionAmount: commissionAmount.toLocaleString(),
        finalNtdAmount: finalNtdAmount.toLocaleString(),
        conversionRate: `1 ETH = ${ETH_TO_NTD_RATE.toLocaleString()} NTD`
      });
    }
  }, [ethAmount, ntdAmount, commission, commissionAmount, finalNtdAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log('🔄 Starting Payment Process:', {
      rawEthAmount: ethAmount,
      parsedEthAmount: parseFloat(ethAmount),
      ntdEquivalent: ntdAmount,
      dailyLimit: dailyLimitNum,
      merchantAddress: address,
      userAddress: user?.wallet?.address
    });

    // Input validation
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      const error = 'Please enter a valid amount';
      console.error('❌ Validation Error:', error, {
        rawInput: ethAmount,
        parsed: parseFloat(ethAmount)
      });
      setError(error);
      return;
    }

    if (!address) {
      const error = 'Invalid merchant address';
      console.error('❌ Validation Error:', error, {
        receivedAddress: address
      });
      setError(error);
      return;
    }

    // Check daily limit in NTD
    if (ntdAmount > dailyLimitNum) {
      const error = `Amount exceeds merchant's daily limit of ${dailyLimitNum.toLocaleString()} NTD`;
      console.error('❌ Validation Error:', error, {
        attempted: ntdAmount,
        limit: dailyLimitNum,
        difference: ntdAmount - dailyLimitNum
      });
      setError(error);
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Pre-conversion checks:', {
        rawEthAmount: ethAmount,
        isString: typeof ethAmount === 'string',
        hasDecimals: ethAmount.includes('.'),
        numberOfDecimals: ethAmount.includes('.') ? ethAmount.split('.')[1].length : 0
      });

      // Convert ETH amount to Wei and then to hex
      let weiAmount: string;
      let weiBigNumber: BigNumber;
      try {
        weiBigNumber = parseEther(ethAmount);
        weiAmount = weiBigNumber.toHexString(); // ethers BigNumber already includes '0x' prefix
        console.log('💱 Wei Conversion Success:', {
          input: ethAmount,
          weiBigNumber: weiBigNumber.toString(),
          weiHex: weiAmount,
          backToEth: formatEther(weiBigNumber),
          verifyMatch: formatEther(weiBigNumber) === ethAmount
        });
      } catch (parseError) {
        console.error('❌ Wei Conversion Failed:', {
          input: ethAmount,
          error: parseError
        });
        throw parseError;
      }

      // Verify the value is in correct format
      console.log('🔍 Transaction Value Check:', {
        weiAmount,
        isString: typeof weiAmount === 'string',
        hasHexPrefix: weiAmount.startsWith('0x'),
        length: weiAmount.length,
        isValidHex: Boolean(weiAmount && weiAmount.startsWith('0x') && /^0x[0-9a-f]+$/i.test(weiAmount)),
      });
      
      // Prepare transaction object
      const txObject = {
        to: address as string,
        value: weiAmount,
      };

      console.log('📝 Final Transaction Object:', {
        ...txObject,
        valueType: typeof txObject.value,
        toType: typeof txObject.to,
        originalEth: ethAmount,
        convertedWei: weiAmount,
        verificationEth: formatEther(weiBigNumber)
      });
      
      // Create transaction through Privy
      console.log('🚀 Sending Transaction...', {
        sendTransaction: typeof sendTransaction,
        hasFunction: Boolean(sendTransaction),
        txObject
      });
      
      try {
        const tx = await sendTransaction(txObject);
        console.log('✅ Transaction Sent Successfully:', {
          transaction: tx,
          originalAmount: ethAmount,
          weiAmount: weiAmount,
          to: address
        });
        
        // Redirect to success page
        router.push('/payment-success');
      } catch (txError) {
        console.error('🔥 Privy Transaction Error:', {
          error: txError,
          message: txError instanceof Error ? txError.message : 'Unknown error',
          code: (txError as any)?.code,
          reason: (txError as any)?.reason,
          data: (txError as any)?.data,
          txObject
        });
        throw txError;  // Re-throw to be caught by outer catch
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      console.error('❌ Transaction Error:', {
        error: err,
        message: errorMessage,
        rawEthAmount: ethAmount,
        parsedEthAmount: parseFloat(ethAmount),
        stack: err instanceof Error ? err.stack : undefined,
        errorType: err?.constructor?.name
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-[32px] font-black text-black mb-2">Payment to {brandName}</h1>
          <p className="text-black mb-2">
            Enter the amount in ETH. Daily limit: {dailyLimitNum.toLocaleString()} NTD
          </p>
          <p className="text-[#6B7280] text-sm mb-6">
            1 ETH = {ETH_TO_NTD_RATE.toLocaleString()} NTD
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
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000000000000000001"
                  className="flex-1 text-[40px] font-bold bg-transparent outline-none placeholder-black/40 min-w-0"
                  disabled={loading}
                />
                <button type="button" className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center">
                    <span className="text-white">Ξ</span>
                  </div>
                  <span className="font-medium">ETH</span>
                </button>
              </div>
            </div>

            {/* Conversion Details */}
            <div className="bg-[#F6F6F6] rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Amount in NTD</span>
                  <span className="font-medium">{ntdAmount.toLocaleString()} NTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Commission ({commission}%)</span>
                  <span className="font-medium text-red-500">-{commissionAmount.toLocaleString()} NTD</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Final Amount</span>
                  <span className="font-bold text-lg">{finalNtdAmount.toLocaleString()} NTD</span>
                </div>
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