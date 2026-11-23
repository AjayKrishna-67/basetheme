'use client';

import OrderHistoryItem from '@/components/account/OrderHistoryItem';
import { Pagination } from '@/components/Pagination';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

interface OrderHistoryClientProps {
  orders: any[];
  totalItems: number;
  currentPage: number;
  limit: number;
}

export function OrderHistoryClient({
  orders,
  totalItems,
  currentPage,
  limit,
}: OrderHistoryClientProps) {
  const showingFrom = (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalItems);

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <ShoppingBag className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Purchase History
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              View your past orders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-gray-600 italic">
            {totalItems === 0 ? 'No orders found' : 'No more orders to show'}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order: any) => (
                <OrderHistoryItem
                  key={order.code}
                  order={order}
                  isInitiallyExpanded={true}
                  className="bg-gray-50 rounded-lg p-4"
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <span className="text-sm text-gray-600">
                Showing {showingFrom} to {showingTo} of {totalItems} orders
              </span>
              <Pagination
                totalItems={totalItems}
                appliedPaginationPage={currentPage}
                appliedPaginationLimit={limit}
                allowedPaginationLimits={new Set([limit])}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
