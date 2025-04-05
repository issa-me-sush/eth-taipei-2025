import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { SUPPORTED_TOKENS } from '../lib/chains';

// Constants
const ETH_TO_NTD_RATE = 56700; // 1 ETH = $1800 USD = 56,700 NTD

function PaymentIntentContent() {
  const router = useRouter();
  const { user, sendTransaction } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  // Get merchant details and token from URL params
  const { address, brandName, dailyLimit, commissionPercent, token = 'USDC' } = router.query;
  const dailyLimitNum = dailyLimit ? parseInt(dailyLimit as string, 10) : 0;
  const commission = commissionPercent ? parseFloat(commissionPercent as string) : 0;

  // Get token details
  const selectedToken = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS] || SUPPORTED_TOKENS.USDC;

  // Calculate conversions
  const ntdAmount = amount ? parseFloat(amount) * selectedToken.rate : 0;
  const commissionAmount = (ntdAmount * commission) / 100;
  const finalNtdAmount = ntdAmount - commissionAmount;

  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      if (!activeWallet) return;

      const currentChainId = Number(activeWallet.chainId);
      console.log('🔍 Current Network:', {
        currentChainId,
        targetChainId: selectedToken.chain.id,
        needsSwitch: currentChainId !== selectedToken.chain.id
      });

      if (currentChainId !== selectedToken.chain.id) {
        setSwitchingNetwork(true);
        try {
          await activeWallet.switchChain(selectedToken.chain.id);
          console.log('✅ Network Switch Successful');
        } catch (error) {
          console.error('❌ Network Switch Failed:', error);
          setError('Failed to switch network. Please try again.');
        } finally {
          setSwitchingNetwork(false);
        }
      }
    };

    checkAndSwitchNetwork();
  }, [activeWallet, selectedToken.chain.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!activeWallet) {
      setError('No wallet connected');
      return;
    }

    console.log('🔄 Starting Payment Process:', {
      rawAmount: amount,
      parsedAmount: parseFloat(amount),
      ntdEquivalent: ntdAmount,
      dailyLimit: dailyLimitNum,
      merchantAddress: address,
      userAddress: user?.wallet?.address,
      currentChain: activeWallet.chainId,
      targetChain: selectedToken.chain.id
    });

    // Input validation
    if (!amount || parseFloat(amount) <= 0) {
      const error = 'Please enter a valid amount';
      console.error('❌ Validation Error:', error, {
        rawInput: amount,
        parsed: parseFloat(amount)
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

      // Verify we're on the correct network
      const currentChainId = Number(activeWallet.chainId);
      if (currentChainId !== selectedToken.chain.id) {
        setSwitchingNetwork(true);
        try {
          await activeWallet.switchChain(selectedToken.chain.id);
          console.log('✅ Network Switch Successful');
        } catch (switchError) {
          console.error('❌ Network Switch Failed:', switchError);
          throw new Error('Failed to switch network. Please try again.');
        } finally {
          setSwitchingNetwork(false);
        }
      }
      
      console.log('🔍 Pre-conversion checks:', {
        rawAmount: amount,
        isString: typeof amount === 'string',
        hasDecimals: amount.includes('.'),
        numberOfDecimals: amount.includes('.') ? amount.split('.')[1].length : 0
      });

      // Convert amount to Wei
      let weiAmount: string;
      let weiBigNumber: BigNumber;
      try {
        weiBigNumber = parseEther(amount);
        weiAmount = weiBigNumber.toHexString();
        console.log('💱 Wei Conversion Success:', {
          input: amount,
          weiBigNumber: weiBigNumber.toString(),
          weiHex: weiAmount,
          backToOriginal: formatEther(weiBigNumber),
          verifyMatch: formatEther(weiBigNumber) === amount
        });
      } catch (parseError) {
        console.error('❌ Wei Conversion Failed:', {
          input: amount,
          error: parseError
        });
        throw parseError;
      }

      // Verify the value format
      console.log('🔍 Transaction Value Check:', {
        weiAmount,
        isString: typeof weiAmount === 'string',
        hasHexPrefix: weiAmount.startsWith('0x'),
        length: weiAmount.length,
        isValidHex: Boolean(weiAmount && weiAmount.startsWith('0x') && /^0x[0-9a-f]+$/i.test(weiAmount)),
      });
      
      // Prepare transaction
      const txObject = {
        to: address as string,
        value: weiAmount,
      };

      console.log('📝 Final Transaction Object:', {
        ...txObject,
        valueType: typeof txObject.value,
        toType: typeof txObject.to,
        originalAmount: amount,
        convertedWei: weiAmount,
        verificationAmount: formatEther(weiBigNumber),
        chainId: activeWallet.chainId
      });
      
      try {
        const tx = await sendTransaction(txObject);
        console.log('✅ Transaction Sent Successfully:', {
          transaction: tx,
          originalAmount: amount,
          weiAmount,
          to: address,
          chainId: activeWallet.chainId
        });

        // Save transaction
        try {
          const response = await fetch('/api/transactions/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              merchantAddress: address,
              merchantName: brandName,
              amount: finalNtdAmount,
              userAddress: user?.wallet?.address,
              transactionHash: tx.transactionHash,
              token: selectedToken.symbol
            }),
          });

          if (!response.ok) {
            console.error('Failed to save transaction:', await response.text());
          }
        } catch (saveError) {
          console.error('Error saving transaction:', saveError);
        }
        
        // Redirect to success
        router.push({
          pathname: '/payment-success',
          query: {
            amount,
            token: selectedToken.symbol,
            ntdAmount: ntdAmount.toString(),
            commission: commission.toString(),
            finalNtdAmount: finalNtdAmount.toString(),
            merchantName: brandName,
            merchantAddress: address,
            transactionHash: tx.transactionHash,
          }
        });
      } catch (txError) {
        console.error('🔥 Transaction Error:', {
          error: txError,
          message: txError instanceof Error ? txError.message : 'Unknown error',
          code: (txError as any)?.code,
          reason: (txError as any)?.reason,
          data: (txError as any)?.data,
          txObject,
          chainId: activeWallet.chainId
        });
        throw txError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      console.error('❌ Error:', {
        error: err,
        message: errorMessage,
        rawAmount: amount,
        parsedAmount: parseFloat(amount),
        stack: err instanceof Error ? err.stack : undefined,
        errorType: err?.constructor?.name,
        chainId: activeWallet.chainId
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
            Enter the amount in {selectedToken.symbol}. Daily limit: {dailyLimitNum.toLocaleString()} NTD
          </p>
          <p className="text-[#6B7280] text-sm mb-6">
            1 {selectedToken.symbol} = {selectedToken.rate.toLocaleString()} NTD
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-[#F6F6F6] rounded-2xl p-6 mb-6">
              <h2 className="text-[20px] font-black text-black/60 mb-4">Amount to send</h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000000000000000001"
                  className="flex-1 text-[40px] font-bold bg-transparent text-black outline-none placeholder-black/40 min-w-0"
                  disabled={loading || switchingNetwork}
                />
                <div className="relative">
                  <button 
                    type="button" 
                    className="flex items-center gap-2 text-base"
                    onClick={() => setShowTokens(!showTokens)}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedToken.color }}>
                      <span>{selectedToken.icon}</span>
                    </div>
                    <span className="font-black text-black">{selectedToken.symbol}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${showTokens ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="black"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showTokens && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10">
                      {Object.values(SUPPORTED_TOKENS).map((token) => (
                        <button
                          key={token.symbol}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => {
                            router.push({
                              pathname: router.pathname,
                              query: { ...router.query, token: token.symbol }
                            });
                            setShowTokens(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: token.color }}>
                            {token.icon}
                          </div>
                          <span className="font-black text-black">{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversion Details */}
            <div className="bg-[#F6F6F6] rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Amount in NTD</span>
                  <span className="font-medium text-black">{ntdAmount.toLocaleString()} NTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Commission ({commission}%)</span>
                  <span className="font-medium text-red-500">-{commissionAmount.toLocaleString()} NTD</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium text-black">Final Amount</span>
                  <span className="font-bold text-lg text-black">{finalNtdAmount.toLocaleString()} NTD</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || switchingNetwork}
              className="w-full bg-[#FF9938] text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50"
            >
              {switchingNetwork ? 'Switching Network...' : loading ? 'Processing...' : 'Confirm Payment'}
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