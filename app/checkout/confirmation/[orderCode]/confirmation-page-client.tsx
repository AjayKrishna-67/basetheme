'use client';

import Link from 'next/link';

interface ConfirmationPageClientProps {
  order: any;
}

export function ConfirmationPageClient({ order }: ConfirmationPageClientProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Order Confirmed!
      </h1>
      <p className="text-text-secondary mb-2">
        Thank you for your order.
      </p>
      <p className="text-lg font-semibold text-foreground mb-2">
        Order Code: {order.code}
      </p>
      {order.customFields?.invoiceNo != null && (
        <p className="text-text-secondary mb-8">
          Invoice No: {order.customFields.invoiceNo}
        </p>
      )}

      <div className="bg-surface rounded-xl p-6 border text-left mb-8">
        <h2 className="font-semibold text-foreground mb-4">
          Order Details
        </h2>
        {order.lines.map((line: any) => (
          <div
            key={line.id}
            className="flex justify-between py-2 border-b last:border-0"
          >
            <div>
              <p className="font-medium">{line.productVariant.name}</p>
              <p className="text-sm text-text-tertiary">Qty: {line.quantity}</p>
            </div>
            <p className="font-medium">
              {(line.linePriceWithTax / 100).toFixed(2)}
            </p>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-bold text-foreground">
          <span>Total</span>
          <span>
            {order.currencyCode} {(order.totalWithTax / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-navy-dark"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account/history"
          className="px-6 py-3 border border-navy text-foreground rounded-lg font-semibold"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
