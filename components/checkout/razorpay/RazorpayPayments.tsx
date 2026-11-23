'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/lib/utils';
import type { CurrencyCode } from '@/generated/graphql';

interface RazorpayPaymentsProps {
  orderCode: string;
  amount: number;
  currencyCode: string | CurrencyCode;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function doesPaymentAmountMatch(
  amountPaidViaRazorpay: number,
  orderAmount: number,
): boolean {
  console.log(
    `Comparing amounts: Razorpay = ${amountPaidViaRazorpay}, Order = ${orderAmount}`,
  );
  return orderAmount === amountPaidViaRazorpay;
}

export function RazorpayPayments({
  orderCode,
  amount,
  currencyCode,
  customerEmail = '',
  customerName = '',
  customerPhone = '',
}: RazorpayPaymentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetcherState, setFetcherState] = useState<'idle' | 'submitting'>('idle');
  const [fetcherData, setFetcherData] = useState<any>(null);
  const [verifyState, setVerifyState] = useState<'idle' | 'submitting'>('idle');
  const [verifyData, setVerifyData] = useState<any>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
      if (!loaded) {
        setError('Failed to load Razorpay script');
      }
    });
  }, [loadRazorpayScript]);

  const generateRazorpayOrderId = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFetcherState('submitting');

    const formData = new FormData();
    formData.append('orderCode', orderCode);

    try {
      const response = await fetch('/api/razorpay-generate-order', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setFetcherData(data);
    } catch (err) {
      setError('Failed to generate order');
      setIsLoading(false);
    } finally {
      setFetcherState('idle');
    }
  }, [orderCode]);

  const openRazorpayPopup = useCallback(
    (razorpayOrderId: string, keyId: string) => {
      try {
        const options = {
          key: keyId,
          order_id: razorpayOrderId,
          amount: Math.round(Number(amount)) || 0,
          currency: currencyCode || 'INR',
          name: 'Kaaikani',
          description: `Payment for order ${orderCode}`,
          prefill: {
            email: customerEmail,
            contact: customerPhone,
            name: customerName,
          },
          config: {
            display: {
              blocks: {
                card: {
                  instruments: [
                    {
                      method: 'card',
                      networks: ['MasterCard', 'Visa', 'RuPay'],
                    },
                  ],
                },
                upi: {
                  name: 'Pay using UPI',
                  instruments: [
                    {
                      method: 'upi',
                      flows: ['collect', 'intent', 'qr'],
                      apps: ['google_pay', 'bhim', 'paytm', 'phonepe'],
                    },
                  ],
                },
                netbanking: {
                  name: 'Pay using netbanking',
                  instruments: [{ method: 'netbanking' }],
                },
                wallet: {
                  name: 'Pay using wallets',
                  instruments: [
                    {
                      method: 'wallet',
                      wallets: ['phonepe', 'freecharge', 'airtelmoney'],
                    },
                  ],
                },
              },
              sequence: [
                'block.card',
                'block.upi',
                'block.netbanking',
                'block.wallet',
              ],
              preferences: { show_default_blocks: false },
            },
          },
          handler: (response: RazorpayPaymentResponse) => {
            console.log('Payment successful:', response);
            onRazorpayPaymentSuccess(response);
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal dismissed');
              setIsLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          console.error('Razorpay payment failed:', response);
          setError(
            `Payment failed: ${response.error?.description || 'Unknown error'}`,
          );
          setIsLoading(false);
        });
        rzp.open();
      } catch (error) {
        console.error('Error opening Razorpay:', error);
        setError('Failed to open payment gateway');
        setIsLoading(false);
      }
    },
    [
      amount,
      currencyCode,
      orderCode,
      customerEmail,
      customerPhone,
      customerName,
    ],
  );

  const onRazorpayPaymentSuccess = useCallback(
    async (response: RazorpayPaymentResponse) => {
      console.log('Processing payment success:', response);

      const formData = new FormData();
      formData.append('razorpay_payment_id', response.razorpay_payment_id);
      formData.append('razorpay_order_id', response.razorpay_order_id);
      formData.append('razorpay_signature', response.razorpay_signature);
      formData.append('orderCode', orderCode);
      formData.append('amount', amount.toString()); // Amount is already in paise from Vendure
      formData.append('currencyCode', currencyCode.toString());

      setVerifyState('submitting');
      try {
        const res = await fetch('/api/razorpay-verify-payment', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setVerifyData(data);
      } catch (err) {
        setError('Failed to verify payment');
        setIsLoading(false);
      } finally {
        setVerifyState('idle');
      }
    },
    [orderCode, amount, currencyCode],
  );

  // Handle order generation response
  useEffect(() => {
    const data = fetcherData as {
      success?: boolean;
      razorpayOrderId?: string;
      keyId?: string;
      error?: string;
    };

    if (fetcherState === 'idle' && data) {
      if (data.success && data.razorpayOrderId && data.keyId) {
        openRazorpayPopup(data.razorpayOrderId, data.keyId);
      } else if (data.error) {
        setError(data.error);
        setIsLoading(false);
      }
    }
  }, [fetcherState, fetcherData, openRazorpayPopup]);

  // Handle payment verification response
  useEffect(() => {
    const data = verifyData as {
      success?: boolean;
      redirectUrl?: string;
      error?: string;
    };

    if (verifyState === 'idle' && data) {
      if (data.success && data.redirectUrl) {
        console.log(
          'Payment verified successfully, redirecting to:',
          data.redirectUrl,
        );
        setIsLoading(false);
        router.replace(data.redirectUrl);
      } else if (data.error) {
        console.error('Payment verification failed:', data.error);
        setError(data.error);
        setIsLoading(false);
      }
    }
  }, [verifyState, verifyData, router]);

  const isProcessing =
    isLoading || fetcherState !== 'idle' || verifyState !== 'idle';

  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md w-full">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={generateRazorpayOrderId}
        disabled={!scriptLoaded || isProcessing}
        className={classNames(
          scriptLoaded && !isProcessing
            ? 'bg-spice border-2 border-spice-700 text-white hover:bg-spice-600'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed',
          'rounded-md py-3 px-4 text-base font-medium w-full transition-colors duration-200',
        )}
      >
        <span>
          {isProcessing
            ? 'Payment Processing'
            : !scriptLoaded
            ? 'Payment Loading'
            : 'Place Order'}
        </span>
        {isProcessing && (
          <svg
            aria-hidden="true"
            className="ml-3 w-4 h-4 text-white animate-spin fill-black"
            viewBox="0 0 100 101"
            fill="none"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C0 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
