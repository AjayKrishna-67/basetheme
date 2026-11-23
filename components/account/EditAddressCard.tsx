'use client';

import {
  ArrowPathIcon,
  CreditCardIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useState } from 'react';
import { Address, ErrorResult } from '@/generated/graphql';
import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { HighlightedButton } from '../HighlightedButton';
import Modal from '../modal/Modal';
import { useTranslation } from 'react-i18next';

type EditAddressProps = {
  address: Address;
  isActive?: boolean;
  className?: string;
  onEdit?: () => void;
};

export default function EditAddressCard({
  address,
  isActive = false,
  className,
  onEdit,
}: EditAddressProps) {
  const [setShippingState, setSetShippingState] = useState<'idle' | 'submitting'>('idle');
  const [setBillingState, setSetBillingState] = useState<'idle' | 'submitting'>('idle');
  const [deleteState, setDeleteState] = useState<'idle' | 'submitting'>('idle');
  const [deleteData, setDeleteData] = useState<ErrorResult | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const { t } = useTranslation();

  const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteState('submitting');
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'deleteAddress', id: address.id }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else if (data?.error) {
        setDeleteData({ message: data.error } as any);
      }
    } finally {
      setDeleteState('idle');
      setDeleteModalVisible(false);
    }
  };

  const handleSetShipping = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSetShippingState('submitting');
    try {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'setDefaultShipping', id: address.id }),
      });
      window.location.reload();
    } finally {
      setSetShippingState('idle');
    }
  };

  const handleSetBilling = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSetBillingState('submitting');
    try {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'setDefaultBilling', id: address.id }),
      });
      window.location.reload();
    } finally {
      setSetBillingState('idle');
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalVisible}
        close={() =>
          setDeleteModalVisible(deleteState === 'idle' ? false : true)
        }
      >
        <form method="post" onSubmit={handleDeleteSubmit}>
          <Modal.Title>{t('address.deleteModal.title')}</Modal.Title>
          <Modal.Body>
            <div className="space-y-4 my-4">
              {t('address.deleteModal.confirmation')}
              <input type="hidden" name="id" value={address.id} />
              {deleteData && (
                <ErrorMessage
                  heading={t('address.deleteModal.error')}
                  message={
                    deleteData?.message ?? t('common.defaultError')
                  }
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              onClick={() => setDeleteModalVisible(false)}
              disabled={deleteState !== 'idle'}
            >
              {t('common.cancel')}
            </Button>
            <HighlightedButton
              type="submit"
              name="_action"
              value="deleteAddress"
              disabled={deleteState !== 'idle'}
              isSubmitting={deleteState !== 'idle'}
            >
              {t('common.yes')}
            </HighlightedButton>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Address Card */}
      <div
        className={clsx(
          'border rounded-xl shadow-sm p-6 bg-white min-h-[220px] flex flex-col justify-between transition-all hover:shadow-md',
          {
            'border-navy': isActive,
            'border-gray-200': !isActive,
          },
          className,
        )}
      >
        <div className="flex justify-between gap-4">
          {/* Address Info */}
          <div className="space-y-1 text-sm text-gray-800">
            <p className="font-semibold text-base">{address.fullName}</p>
            {address.company && <p>{address.company}</p>}
            <div className="text-gray-600">
              <p>
                {address.streetLine1}
                {address.streetLine2 && `, ${address.streetLine2}`}
              </p>
              <p>
                {address.postalCode}, {address.city}
              </p>
              <p>
                {address.province && `${address.province}, `}
                {address.country?.code?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Default Labels */}
          {(address.defaultShippingAddress ||
            address.defaultBillingAddress) && (
            <div className="text-end text-xs uppercase text-gray-400 font-semibold leading-tight">
              <p className="text-sm text-gray-500">{t('common.default')}</p>
              <p className="mt-1">
                {address.defaultShippingAddress && t('common.shipping')}
                {address.defaultShippingAddress &&
                  address.defaultBillingAddress && <br />}
                {address.defaultBillingAddress && t('common.billing')}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-700">
          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center gap-2 hover:text-navy transition-colors"
              onClick={onEdit}
            >
              <PencilIcon className="w-4 h-4" />
              {t('common.edit')}
            </button>

            <button
              type="button"
              title="Delete this address"
              className="flex items-center gap-2 hover:text-destructive transition-colors"
              disabled={deleteState !== 'idle'}
              onClick={() => setDeleteModalVisible(true)}
            >
              {deleteState === 'idle' ? (
                <TrashIcon className="w-4 h-4" />
              ) : (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              )}
              {t('common.remove')}
            </button>
          </div>

          {/* Shipping/Billing buttons if not already default */}
          {(!address.defaultShippingAddress ||
            !address.defaultBillingAddress) && (
            <div className="flex gap-4 mt-2 sm:mt-0">
              {!address.defaultShippingAddress && (
                <form method="post" onSubmit={handleSetShipping}>
                  <input type="hidden" name="id" value={address.id} />
                  <button
                    name="_action"
                    value="setDefaultShipping"
                    type="submit"
                    className="flex items-center gap-2 hover:text-navy transition-colors"
                    disabled={setShippingState !== 'idle'}
                  >
                    {setShippingState === 'idle' ? (
                      <TruckIcon className="w-4 h-4" />
                    ) : (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    )}
                    {t('common.shipping')}
                  </button>
                </form>
              )}

              {!address.defaultBillingAddress && (
                <form method="post" onSubmit={handleSetBilling}>
                  <input type="hidden" name="id" value={address.id} />
                  <button
                    name="_action"
                    value="setDefaultBilling"
                    type="submit"
                    className="flex items-center gap-2 hover:text-navy transition-colors"
                    disabled={setBillingState !== 'idle'}
                  >
                    {setBillingState === 'idle' ? (
                      <CreditCardIcon className="w-4 h-4" />
                    ) : (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    )}
                    {t('common.billing')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
