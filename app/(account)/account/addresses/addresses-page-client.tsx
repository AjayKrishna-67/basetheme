'use client';

import { useState, useRef } from 'react';
import EditAddressCard from '@/components/account/EditAddressCard';
import { HighlightedButton } from '@/components/HighlightedButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';
import CustomerAddressForm from '@/components/account/CustomerAddressForm';
import type { Address } from '@/generated/graphql';

interface AddressesPageClientProps {
  addresses: any[];
  activeCustomer?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export function AddressesPageClient({
  addresses,
  activeCustomer,
}: AddressesPageClientProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const newFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const handleCreateSubmit = async () => {
    if (!newFormRef.current) return;
    const formData = new FormData(newFormRef.current);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setShowNewForm(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormRef.current) return;
    const formData = new FormData(editFormRef.current);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setEditingAddress(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-md border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <MapPin className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Addresses
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Manage your shipping and billing addresses
                </CardDescription>
              </div>
            </div>
            <HighlightedButton
              type="button"
              className="h-10 px-4 bg-spice hover:bg-spice-600 text-white"
              onClick={() => setShowNewForm(true)}
            >
              Add New Address
            </HighlightedButton>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!addresses || addresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Addresses Found
              </h3>
              <p className="text-gray-600">Add an address to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map((address: any) => (
                <EditAddressCard
                  key={address.id}
                  address={address}
                  className="bg-gray-50 rounded-lg p-4"
                  onEdit={() => setEditingAddress(address)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Address Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 mx-4">
            <button
              onClick={() => setShowNewForm(false)}
              className="absolute right-4 top-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto">
              <CustomerAddressForm
                formRef={newFormRef}
                submit={handleCreateSubmit}
                isEditing={false}
                activeCustomer={activeCustomer}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 mx-4">
            <button
              onClick={() => setEditingAddress(null)}
              className="absolute right-4 top-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto">
              <CustomerAddressForm
                address={editingAddress}
                formRef={editFormRef}
                submit={handleEditSubmit}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
