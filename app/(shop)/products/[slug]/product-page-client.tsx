'use client';

import { useState, useEffect } from 'react';
import { useActiveOrder } from '@/hooks/use-active-order';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Price } from '@/components/products/Price';
import { StockLevelLabel } from '@/components/products/StockLevelLabel';
import { ScrollableContainer } from '@/components/products/ScrollableContainer';
import { RecentOrders } from '@/components/products/RecentOrders';
import { SignInPromptModal } from '@/components/modal/SignInPromptModal';
import Alert from '@/components/Alert';
import {
  CheckIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ProductPageClientProps {
  product: any;
  isSignedIn: boolean;
  isFavorite: boolean;
  activeCustomer: any;
  frequentlyOrdered: any[];
}

export function ProductPageClient({
  product,
  isSignedIn: initialIsSignedIn,
  isFavorite: initialIsFavorite,
  activeCustomer,
  frequentlyOrdered,
}: ProductPageClientProps) {
  const { activeOrder, addItemToOrder, adjustOrderLine, removeItem } =
    useActiveOrder();
  const { t } = useTranslation();

  const [isSignedIn] = useState(initialIsSignedIn);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorite);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Extract option groups from product variants using group.name as key
  const optionGroups = (() => {
    const groupMap = new Map<string, { id: string; name: string; options: Map<string, { id: string; name: string }> }>();
    for (const variant of product.variants) {
      for (const opt of (variant.options ?? []) as any[]) {
        const groupName = opt.group?.name || '';
        if (!groupName) continue;
        if (!groupMap.has(groupName)) {
          groupMap.set(groupName, { id: groupName, name: groupName, options: new Map() });
        }
        const optKey = opt.name || '';
        if (!groupMap.get(groupName)!.options.has(optKey)) {
          groupMap.get(groupName)!.options.set(optKey, { id: optKey, name: opt.name });
        }
      }
    }
    return Array.from(groupMap.values()).map((g) => ({
      ...g,
      options: Array.from(g.options.values()),
    }));
  })();

  const hasMultipleOptions = optionGroups.length > 0 && (optionGroups.length > 1 || optionGroups[0].options.length > 1);

  // Pre-select the first variant's options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const firstVariant = product.variants[0];
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const groupName = opt.group?.name || '';
        if (groupName) initial[groupName] = opt.name;
      }
    }
    return initial;
  });

  // Get variants matching partial selections
  const getFilteredVariants = (selections: Record<string, string>) => {
    return product.variants.filter((v: any) => {
      const vOpts = v.options ?? [];
      return Object.entries(selections).every(([groupName, optName]) => {
        return vOpts.some((o: any) => (o.group?.name || '') === groupName && o.name === optName);
      });
    });
  };

  // Get available options for a group given other group selections
  const getAvailableOptionsForGroup = (groupName: string) => {
    const otherSelections = { ...selectedOptions };
    delete otherSelections[groupName];
    const filtered = getFilteredVariants(otherSelections);
    const availableOpts = new Set<string>();
    for (const v of filtered) {
      for (const o of (v.options ?? []) as any[]) {
        if ((o.group?.name || '') === groupName) {
          availableOpts.add(o.name);
        }
      }
    }
    return availableOpts;
  };

  const findMatchingVariant = (selections: Record<string, string>) => {
    if (Object.keys(selections).length < optionGroups.length) return null;
    return getFilteredVariants(selections)[0] || null;
  };

  const selectedVariant = hasMultipleOptions
    ? findMatchingVariant(selectedOptions)
    : product.variants[0] || null;

  const selectedVariantId = selectedVariant?.id || null;

  const handleOptionSelect = (groupName: string, optionName: string) => {
    const newSelections = { ...selectedOptions, [groupName]: optionName };
    setSelectedOptions(newSelections);
    const match = findMatchingVariant(newSelections);
    if (match?.featuredAsset) {
      setFeaturedAsset(match.featuredAsset);
    }
  };

  const extractPriceValue = (price?: any): number | null => {
    if (price == null) return null;
    if (typeof price === 'number') return price;
    if (typeof price === 'object') {
      if ('value' in price && typeof price.value === 'number')
        return price.value;
      if ('min' in price && typeof price.min === 'number') return price.min;
    }
    return null;
  };

  const currentPriceValue = extractPriceValue(selectedVariant?.priceWithTax);
  const shadowPriceRaw = selectedVariant?.customFields?.shadowPrice;
  const shadowPriceValue =
    typeof shadowPriceRaw === 'number'
      ? shadowPriceRaw * 100
      : extractPriceValue(shadowPriceRaw);
  const shouldShowShadowPrice =
    shadowPriceValue != null &&
    currentPriceValue != null &&
    shadowPriceValue > currentPriceValue;

  const discountPercent =
    shouldShowShadowPrice && shadowPriceValue && currentPriceValue
      ? Math.round(
          ((shadowPriceValue - currentPriceValue) / shadowPriceValue) * 100,
        )
      : null;

  const qtyInCart =
    activeOrder?.lines.find(
      (l: any) => l.productVariant.id === selectedVariantId,
    )?.quantity ?? 0;

  const orderLine = activeOrder?.lines.find(
    (l: any) => l.productVariant.id === selectedVariantId,
  );

  const [featuredAsset, setFeaturedAsset] = useState(
    selectedVariant?.featuredAsset,
  );

  useEffect(() => {
    if (!selectedVariant && product.variants[0]?.options) {
      const initial: Record<string, string> = {};
      for (const opt of product.variants[0].options) {
        const groupName = opt.group?.name || '';
        if (groupName) initial[groupName] = opt.name;
      }
      setSelectedOptions(initial);
    }
  }, [selectedVariant, product.variants]);

  const handleToggleFavorite = async () => {
    if (!isSignedIn) {
      setModalMessage('SignIn To Add Favorite');
      setShowSignInModal(true);
      return;
    }
    try {
      const response = await fetch('/api/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!response.ok) throw new Error('Failed to toggle favorite');
      const data = await response.json();
      const updatedFavorites = data.items;
      const isNowFavorite = updatedFavorites.some(
        (item: { product: { id: string } }) => item.product.id === product.id,
      );
      setIsFavorited(isNowFavorite);
    } catch (error) {
      console.error('Favorite error:', error);
      alert(t('product.favoriteError'));
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;
    await addItemToOrder(selectedVariantId, 1);
  };

  const handleAdjustQty = async (orderLineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(orderLineId);
    } else {
      await adjustOrderLine(orderLineId, quantity);
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-4 py-2 min-h-screen sm:py-6">
        <Breadcrumbs
          items={
            product.collections[product.collections.length - 1]?.breadcrumbs ??
            []
          }
        />
        <div className="mt-9">
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 bg-surface p-6 rounded-lg shadow-md flex flex-col">
              <div className="relative w-full">
                <img
                  src={
                    (featuredAsset?.preview || product.featuredAsset?.preview) +
                    '?w=800'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              {product.assets.length > 1 && (
                <div className="mt-4">
                  <ScrollableContainer>
                    {product.assets.map((asset: any) => (
                      <div
                        key={asset.id}
                        className={`basis-1/3 flex-shrink-0 select-none touch-pan-x rounded-lg cursor-pointer ${
                          featuredAsset?.id === asset.id
                            ? 'border-2 border-primary-500'
                            : 'border border-border-theme'
                        }`}
                        onClick={() => setFeaturedAsset(asset)}
                      >
                        <img
                          draggable="false"
                          className="rounded-lg h-20 w-full object-cover"
                          src={
                            asset.preview + '?preset=full' ||
                            '/placeholder.svg'
                          }
                        />
                      </div>
                    ))}
                  </ScrollableContainer>
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="w-full lg:w-1/2 bg-surface p-6 rounded-lg shadow-md flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-semibold tracking-tight text-text-primary mb-4">
                    {product.name}
                  </h2>
                  <button
                    type="button"
                    className="p-3 rounded-md border border-border-strong hover:bg-gray-100 transition"
                    onClick={handleToggleFavorite}
                    title={
                      isFavorited
                        ? t('product.removeFavorite')
                        : t('product.addFavorite')
                    }
                  >
                    {isFavorited ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartOutlineIcon className="w-6 h-6 text-text-tertiary" />
                    )}
                  </button>
                </div>
                <div
                  className="text-base text-text-secondary mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-border-theme">
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-semibold text-text-primary">
                      <Price
                        priceWithTax={selectedVariant?.priceWithTax}
                        currencyCode={selectedVariant?.currencyCode}
                      />
                    </span>
                    {discountPercent && discountPercent > 0 ? (
                      <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                        {discountPercent}% Off
                      </span>
                    ) : null}
                  </div>
                  {shouldShowShadowPrice ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary mt-2">
                      <span className="font-medium">M.R.P:</span>
                      <span className="line-through text-text-tertiary">
                        <Price
                          priceWithTax={shadowPriceValue ?? 0}
                          currencyCode={selectedVariant?.currencyCode}
                        />
                      </span>
                      <span className="text-text-tertiary">
                        (Incl. of all taxes)
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex mt-1 flex-wrap items-center justify-between gap-4 text-sm text-text-secondary">
                  <span className="font-medium">
                    SKU:{' '}
                    <span className="font-normal">{selectedVariant?.sku}</span>
                  </span>
                  <StockLevelLabel stockLevel={selectedVariant?.stockLevel} />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    {hasMultipleOptions ? (
                      <div className="mb-6 space-y-4">
                        {optionGroups.map((group) => {
                          const availableOpts = getAvailableOptionsForGroup(group.name);
                          return (
                            <div key={group.id}>
                              <label className="block text-sm font-semibold text-text-secondary mb-2 capitalize">
                                {group.name}
                                {selectedOptions[group.name] && (
                                  <span className="ml-2 text-xs font-normal text-text-tertiary capitalize">
                                    — {selectedOptions[group.name]}
                                  </span>
                                )}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {group.options.map((option) => {
                                  const isSelected = selectedOptions[group.name] === option.name;
                                  const available = availableOpts.has(option.name);
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => handleOptionSelect(group.name, option.name)}
                                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 capitalize ${
                                        isSelected
                                          ? 'bg-btn-primary text-btn-primary-text border-btn-primary shadow-sm'
                                          : available
                                            ? 'bg-surface text-text-primary border-border-theme hover:border-btn-primary'
                                            : 'bg-surface-hover text-text-muted border-border-theme line-through opacity-50 cursor-not-allowed'
                                      }`}
                                      disabled={!available}
                                    >
                                      {option.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Add-to-Cart or Stepper UI */}
                    {qtyInCart === 0 ? (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full text-btn-primary-text py-2 mt-1 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md bg-btn-primary"
                      >
                        {t('product.addToCart')}
                      </button>
                    ) : (
                      <div className="flex mt-1 items-center justify-center w-full mx-auto rounded-lg">
                        <button
                          type="button"
                          onClick={() =>
                            orderLine &&
                            handleAdjustQty(
                              orderLine.id,
                              Math.max(0, qtyInCart - 1),
                            )
                          }
                          className="flex-1 rounded-2xl border text-[#FF6B6B] shadow-sm text-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center py-1 text-sm font-semibold text-text-primary">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            orderLine &&
                            handleAdjustQty(orderLine.id, qtyInCart + 1)
                          }
                          className="flex-1 rounded-2xl border text-[#FF6B6B] shadow-sm text-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Ordered */}
      <RecentOrders
        products={frequentlyOrdered}
        activeCustomer={activeCustomer}
        activeOrder={activeOrder}
      />

      <SignInPromptModal
        isOpen={showSignInModal}
        close={() => setShowSignInModal(false)}
        message={modalMessage}
        title="Sign In Required"
      />
    </div>
  );
}
