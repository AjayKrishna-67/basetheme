'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon, CreditCardIcon, MapPin, Truck, Wallet, ShieldCheck } from 'lucide-react';
import { CartContents } from '@/components/cart/CartContents';
import { CartTotals } from '@/components/cart/CartTotals';
import { ShippingAddressSelector } from '@/components/checkout/ShippingAddressSelector';
import { ShippingMethodSelector } from '@/components/checkout/ShippingMethodSelector';
import { RazorpayPayments } from '@/components/checkout/razorpay/RazorpayPayments';
import { OrderInstructions } from '@/components/checkout/OrderInstructions';
import { ApplyLoyaltyPoints } from '@/components/account/ApplyLoyaltyPoints';
import { GoogleLoginButton } from '@/components/Google/GoogleLoginButton';
import { CouponModal } from '@/components/couponcode/CouponModal';
import ToastNotification from '@/components/ToastNotification';
import { useActiveOrder } from '@/hooks/use-active-order';
import { classNames } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CheckoutPageClientProps {
  needsLogin: boolean;
  activeOrder: any;
  data: {
    availableCountries: any;
    eligibleShippingMethods: any;
    eligiblePaymentMethods: any;
    activeCustomer: any;
    collections: any[];
    couponCodes: any[];
    loyaltyPoints: number | null;
    pointsPerRupee: number;
    orderInstructions: string;
    customerGroups: Array<{ id: string; name: string }>;
  } | null;
}

export function CheckoutPageClient({
  needsLogin,
  activeOrder: initialOrder,
  data,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { activeOrder: liveOrder, adjustOrderLine, removeItem, refresh, error: orderError } = useActiveOrder();
  const activeOrder = liveOrder ?? initialOrder;
  const { t } = useTranslation();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'razorpay-payment' | 'offline' | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [showAllCartItems, setShowAllCartItems] = useState(false);
  const [showAddressToast, setShowAddressToast] = useState(false);
  const [autoRemovedCouponMsg, setAutoRemovedCouponMsg] = useState('');
  const [autoAddedVariantIds, setAutoAddedVariantIds] = useState<string[]>([]);
  const [isNavigatingToHome, setIsNavigatingToHome] = useState(false);
  const [orderErrorToast, setOrderErrorToast] = useState<string | null>(null);

  const customer = activeOrder?.customer;
  const shippingAddress = activeOrder?.shippingAddress;
  const isSignedIn = !!data?.activeCustomer?.id;
  const addresses = data?.activeCustomer?.addresses ?? [];

  const appliedPointsAmount = Math.abs(
    (activeOrder?.surcharges ?? [])
      .filter((s: any) => s.price < 0)
      .reduce((acc: number, s: any) => acc + s.price, 0),
  );

  const isShippingMethodSelected = !!activeOrder?.shippingLines?.[0]?.shippingMethod;
  const appliedCouponCode = activeOrder?.couponCodes?.[0];
  const appliedCouponDetails = appliedCouponCode
    ? data?.couponCodes.find((c: any) => c.couponCode === appliedCouponCode)
    : null;

  useEffect(() => {
    if (orderError?.errorCode && orderError.errorCode !== 'NO_ACTIVE_ORDER_ERROR') {
      const msg = orderError.errorCode === 'ORDER_INTERCEPTOR_ERROR'
        ? orderError.interceptorError || orderError.message
        : orderError.message;
      if (msg) setOrderErrorToast(msg);
    }
  }, [orderError]);

  useEffect(() => {
    if (isSignedIn && addresses.length && !shippingAddress?.streetLine1) {
      const defaultAddr = addresses.find((a: any) => a.defaultShippingAddress) || addresses[0];
      if (defaultAddr) {
        submitSelectedAddress(addresses.indexOf(defaultAddr));
      }
    }
  }, [isSignedIn, addresses.length]);

  useEffect(() => {
    const lines = activeOrder?.lines ?? [];
    if (lines.length === 0) {
      setIsNavigatingToHome(true);
      const timer = setTimeout(() => router.push('/'), 500);
      return () => clearTimeout(timer);
    }
  }, [activeOrder, activeOrder?.lines?.length, router]);

  const submitSelectedAddress = (index: number) => {
    const selectedAddress = data?.activeCustomer?.addresses?.[index];
    if (selectedAddress) {
      setSelectedAddressIndex(index);
      const formData = new FormData();
      Object.keys(selectedAddress).forEach((key) =>
        formData.append(key, (selectedAddress as any)[key]),
      );
      formData.append('countryCode', selectedAddress.country.code);
      formData.append('action', 'setCheckoutShipping');
      fetch('/api/active-order', { method: 'POST', body: formData }).then(() => refresh());
    }
  };

  const submitSelectedShippingMethod = (value?: string) => {
    if (!isSignedIn || !addresses.length) {
      setShowAddressToast(true);
      return;
    }
    if (value) {
      const formData = new FormData();
      formData.append('action', 'setShippingMethod');
      formData.append('shippingMethodId', value);
      fetch('/api/active-order', { method: 'POST', body: formData }).then(() => refresh());
    }
  };

  function triggerCouponValidation() {
    if (appliedCouponCode) {
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validateCoupons' }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.couponValid === false && data.message) {
            setAutoRemovedCouponMsg(data.message);
          }
        })
        .catch(() => {});
    }
  }

  function handleRemoveItem(lineId: string) {
    removeItem(lineId);
    setTimeout(() => triggerCouponValidation(), 500);
  }

  function handleAdjustOrderLine(lineId: string, quantity: number) {
    adjustOrderLine(lineId, quantity);
    setTimeout(() => triggerCouponValidation(), 500);
  }

  function handleRemoveCoupon() {
    if (!appliedCouponCode) return;
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'removeCoupon',
        couponCode: appliedCouponCode,
        autoAddedVariantIds,
      }),
    })
      .then((r) => r.json())
      .then(() => setAutoAddedVariantIds([]))
      .catch(() => {});
  }

  function handleOfflinePayment() {
    fetch('/api/checkout-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodCode: 'offline',
        paymentNonce: JSON.stringify({
          method: 'offline',
          status: 'pending',
          amount: activeOrder?.totalWithTax || 0,
          currencyCode: activeOrder?.currencyCode || 'INR',
          orderCode: activeOrder?.code || '',
        }),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.redirectUrl) router.push(data.redirectUrl);
      })
      .catch(() => {});
  }

  if (isNavigatingToHome) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-primary mx-auto mb-4" />
          <p className="text-text-secondary">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  // Guest login gate
  if (needsLogin) {
    return (
      <div className="mt-20">
        <div className="lg:max-w-7xl max-w-2xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-8">
          <h1 className="text-center mb-10 text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              <div className="bg-surface rounded-2xl shadow-sm border border-border-theme p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Sign in to continue</h2>
                <p className="text-sm text-text-secondary mb-6">Sign in with your Google account to complete your order.</p>
                <div className="flex justify-center mb-6">
                  <GoogleLoginButton redirectTo="/checkout" size="large" text="signin_with" width={300} />
                </div>
                <div className="mt-8 border-t border-border-theme pt-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">What happens next?</h3>
                  <ol className="space-y-3 text-sm text-text-secondary">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-btn-primary text-btn-primary-text flex items-center justify-center text-xs font-bold">1</span>
                      <span>Sign in securely with Google</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-btn-primary text-btn-primary-text flex items-center justify-center text-xs font-bold">2</span>
                      <span>Choose your delivery address</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-btn-primary text-btn-primary-text flex items-center justify-center text-xs font-bold">3</span>
                      <span>Select shipping and payment method</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border-theme">
                <h2 className="text-lg font-semibold text-text-primary mb-6">Order Summary</h2>
                <CartContents orderLines={activeOrder?.lines ?? []} currencyCode={activeOrder?.currencyCode ?? 'INR'} editable={false} />
                <CartTotals order={activeOrder} editable={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allLines = activeOrder?.lines ?? [];
  const visibleLines = showAllCartItems ? allLines : allLines.slice(0, 3);

  return (
    <div className="mt-20">
      <div className="lg:max-w-7xl max-w-2xl mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column — 7 cols */}
          <div className="lg:col-span-7 space-y-5">

            {/* 1. Delivery Address */}
            <section className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-theme bg-surface-hover">
                <MapPin className="w-5 h-5 text-btn-primary" />
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Delivery Address</h2>
                {isSignedIn && addresses.length > 0 && (
                  <Link href="/account/addresses" className="ml-auto text-xs font-medium text-btn-primary hover:underline">
                    Edit
                  </Link>
                )}
              </div>
              <div className="px-5 py-4">
                {isSignedIn && addresses.length ? (
                  (() => {
                    const defaultShippingAddress = addresses.find((addr: any) => addr.defaultShippingAddress);
                    const addressToShow = defaultShippingAddress || addresses[0];
                    return (
                      <div className="text-sm text-text-secondary leading-relaxed">
                        <p className="font-semibold text-text-primary">
                          {addressToShow?.fullName} &bull; {addressToShow?.phoneNumber}
                        </p>
                        <p className="mt-1">
                          {[addressToShow?.streetLine1, addressToShow?.streetLine2, addressToShow?.city, addressToShow?.province, addressToShow?.postalCode, addressToShow?.country?.name].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <div>
                    <p className="text-sm text-text-secondary mb-3">You have no saved address yet.</p>
                    <Link
                      href="/account/addresses?redirectTo=/checkout"
                      className="inline-block bg-btn-primary text-btn-primary-text px-4 py-2 rounded-xl hover:bg-btn-primary-hover text-sm font-medium transition-colors"
                    >
                      Add Address
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Order Instructions */}
            {activeOrder?.id && (
              <OrderInstructions orderId={activeOrder.id} initialValue={data?.orderInstructions ?? ''} disabled={false} />
            )}

            {/* 3. Shipping Method */}
            {data && (
              <section className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border-theme bg-surface-hover">
                  <Truck className="w-5 h-5 text-btn-primary" />
                  <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Shipping Method</h2>
                </div>
                <div className="px-5 py-4">
                  <ShippingMethodSelector
                    eligibleShippingMethods={data.eligibleShippingMethods}
                    currencyCode={activeOrder?.currencyCode}
                    shippingMethodId={activeOrder?.shippingLines?.[0]?.shippingMethod?.id ?? ''}
                    onChange={submitSelectedShippingMethod}
                  />
                </div>
              </section>
            )}

            {/* 4. Payment Method */}
            <section className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-theme bg-surface-hover">
                <Wallet className="w-5 h-5 text-btn-primary" />
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Payment Method</h2>
              </div>
              <div className="px-5 py-4">
                <RadioGroup value={paymentMode} onChange={setPaymentMode}>
                  <div className="space-y-3">
                    <RadioGroup.Option
                      value="razorpay-payment"
                      className={({ checked }) =>
                        classNames(
                          'relative flex cursor-pointer rounded-xl p-4 border-2 transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-btn-primary',
                          checked
                            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 shadow-sm'
                            : 'bg-surface border-border-theme hover:border-amber-400',
                        )
                      }
                    >
                      {({ checked }) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <CreditCardIcon className={classNames('h-6 w-6', checked ? 'text-amber-600' : 'text-text-muted')} />
                            <div>
                              <RadioGroup.Label as="span" className={classNames('block text-sm font-semibold', checked ? 'text-amber-700 dark:text-amber-400' : 'text-text-primary')}>
                                Online Payment
                              </RadioGroup.Label>
                              <RadioGroup.Description as="span" className={classNames('text-xs', checked ? 'text-amber-600 dark:text-amber-500' : 'text-text-tertiary')}>
                                UPI, Cards, Net Banking, etc.
                              </RadioGroup.Description>
                            </div>
                          </div>
                          {checked && <CheckCircleIcon className="h-5 w-5 text-amber-500" />}
                        </div>
                      )}
                    </RadioGroup.Option>
                  </div>
                </RadioGroup>
              </div>
            </section>

            {/* 5. Place Order */}
            <section className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-theme bg-surface-hover">
                <ShieldCheck className="w-5 h-5 text-btn-primary" />
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Review & Place Order</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
                  By placing your order, you confirm that you have read and accept our Terms of Use, Terms of Sale, Returns Policy and Privacy Policy.
                </p>

                {(activeOrder as any)?.validationStatus?.isValid === false && (
                  <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {(activeOrder as any).validationStatus.message || 'Your order has validation issues. Please update your cart.'}
                    </p>
                  </div>
                )}

                {isShippingMethodSelected && paymentMode && (activeOrder as any)?.validationStatus?.isValid !== false && (
                  <>
                    {data?.eligiblePaymentMethods
                      ?.filter((method: any) => method.code === paymentMode)
                      .map((method: any) => (
                        <div key={method.id}>
                          {method.code === 'razorpay-payment' ? (
                            <RazorpayPayments
                              orderCode={activeOrder?.code ?? ''}
                              amount={activeOrder?.totalWithTax ?? 0}
                              currencyCode={activeOrder?.currencyCode ?? 'INR'}
                              customerEmail={customer?.emailAddress ?? ''}
                              customerName={`${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim()}
                              customerPhone={shippingAddress?.phoneNumber ?? ''}
                            />
                          ) : method.code === 'offline' ? (
                            <button
                              type="button"
                              onClick={handleOfflinePayment}
                              className="w-full bg-btn-primary rounded-xl py-3 px-4 text-base font-semibold text-btn-primary-text hover:bg-btn-primary-hover transition-colors shadow-md"
                            >
                              Place Order
                            </button>
                          ) : (
                            <p className="text-sm text-text-tertiary">Payment method &ldquo;{method.code}&rdquo; not supported</p>
                          )}
                        </div>
                      ))}

                    {data?.eligiblePaymentMethods && !data.eligiblePaymentMethods.find((m: any) => m.code === paymentMode) && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          {paymentMode === 'razorpay-payment' ? 'Online payment is not available.' : 'Offline payment is not available.'} Please contact support.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {(!isShippingMethodSelected || !paymentMode) && (
                  <div className="text-center py-2">
                    <p className="text-sm text-text-muted">
                      {!isShippingMethodSelected && !paymentMode
                        ? 'Select a shipping and payment method to continue'
                        : !isShippingMethodSelected
                          ? 'Select a shipping method to continue'
                          : 'Select a payment method to continue'}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {data?.eligibleShippingMethods?.length === 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-400">No shipping methods available. Please contact support.</p>
              </div>
            )}
          </div>

          {/* Right Column — 5 cols, sticky */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-28 space-y-5">

              {/* Order Summary Card */}
              <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border-theme bg-surface-hover">
                  <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Order Summary
                  </h2>
                </div>

                <div className="px-5 py-4">
                  {/* Loyalty Points */}
                  {data?.loyaltyPoints && activeOrder?.id ? (
                    <ApplyLoyaltyPoints
                      availablePoints={data.loyaltyPoints}
                      orderId={activeOrder.id}
                      pointsPerRupee={data.pointsPerRupee}
                      appliedPointsAmount={appliedPointsAmount}
                    />
                  ) : null}

                  <CartTotals order={activeOrder} />
                </div>
              </div>

              {/* Cart Items Card */}
              <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border-theme bg-surface-hover flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Items ({allLines.length})
                  </h2>
                </div>

                <div className="px-4 py-4">
                  <CartContents
                    orderLines={visibleLines}
                    currencyCode={activeOrder?.currencyCode ?? 'INR'}
                    editable={true}
                    removeItem={handleRemoveItem}
                    adjustOrderLine={handleAdjustOrderLine}
                  />

                  {allLines.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCartItems(!showAllCartItems)}
                      className="w-full mt-3 py-2 text-sm font-medium text-btn-primary hover:text-btn-primary-hover transition-colors"
                    >
                      {showAllCartItems ? 'Show Less' : `Show All Items (${allLines.length})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden">
                <div className="px-5 py-4">
                  {appliedCouponCode && appliedCouponDetails ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            {appliedCouponDetails.name || appliedCouponCode}
                          </p>
                          <p className="text-xs text-text-muted">&ldquo;{appliedCouponCode}&rdquo; applied</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTimeout(() => setIsCouponModalOpen(true), 50)}
                      className="w-full py-2.5 text-sm font-semibold text-btn-primary border-2 border-dashed border-btn-primary/40 rounded-xl hover:border-btn-primary hover:bg-btn-primary/5 transition-all"
                    >
                      Have a coupon code? Apply here
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupons={(data?.couponCodes ?? []) as any}
        activeOrder={activeOrder}
        appliedCoupon={activeOrder?.couponCodes?.[0] || null}
        customerGroups={data?.customerGroups ?? []}
        onApplied={(ids) => setAutoAddedVariantIds(ids)}
      />

      {/* Toasts */}
      <ToastNotification show={showAddressToast} type="error" title="Address Required" message="Address is required to place an order." onClose={() => setShowAddressToast(false)} />
      <ToastNotification show={!!autoRemovedCouponMsg} type="warning" title="Coupon Removed" message={autoRemovedCouponMsg} onClose={() => setAutoRemovedCouponMsg('')} autoDismiss={true} dismissDuration={5000} />
      <ToastNotification show={!!orderErrorToast} type="error" title="Order Error" message={orderErrorToast || ''} onClose={() => setOrderErrorToast(null)} autoDismiss={true} dismissDuration={5000} />
    </div>
  );
}
