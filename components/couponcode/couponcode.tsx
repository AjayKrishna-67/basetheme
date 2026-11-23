'use client';

import { useState } from 'react';

// Note: The loader and action functions have been removed.
// Data fetching and mutations should be done via API routes in Next.js.

interface Order {
  __typename: 'Order';
  total: number;
}

interface CouponCodeInvalidError {
  __typename: 'CouponCodeInvalidError';
  message: string;
}
interface CouponsComponentProps {
  couponCodes: string[];
  appliedCoupon?: string | null;
}

export default function CouponsComponent({
  couponCodes,
  appliedCoupon,
}: CouponsComponentProps) {
  const [couponError, setCouponError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('', { method: 'POST', body: formData });
      const data = await res.json();
      if (data?.couponError) {
        setCouponError(data.couponError);
      } else {
        setCouponError(undefined);
      }
    } catch {
      setCouponError('An error occurred');
    }
  };

  return (
    <div className="mt-4 bg-black w-80 p-3 rounded-md shadow border border-gray-200 text-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-3">
        Coupon Codes
      </h3>

      {couponError && (
        <div className="mb-3 px-2 py-1.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-300">
          {couponError}
        </div>
      )}

      {couponCodes?.length > 0 ? (
        <ul className="space-y-2">
          {couponCodes.map((code) => {
            const isApplied = appliedCoupon === code;

            return (
              <li
                key={code}
                className={`p-2 rounded border flex justify-between items-center ${
                  isApplied
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <span className="text-xs font-medium text-gray-800">
                  {code}
                </span>
                <form method="post" className="ml-2" onSubmit={handleSubmit}>
                  <input
                    type="hidden"
                    name="actionType"
                    value={isApplied ? 'remove' : 'apply'}
                  />
                  <input type="hidden" name="couponCode" value={code} />
                  <button
                    type="submit"
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      isApplied
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isApplied ? 'Remove' : 'Apply'}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 mt-3 text-center">
          No coupon codes available at the moment.
        </p>
      )}
    </div>
  );
}
