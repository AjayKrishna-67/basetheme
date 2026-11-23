'use client';

import { useState } from 'react';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { SingleBanner } from '@/components/SingleBanner';
import { PhoneNumberModal } from '@/components/modal/PhoneNumberModal';
import { NextOfferPoster } from '@/components/NextOfferPoster';

interface HomePageClientProps {
  collections: any[];
  banners: any[];
}

export function HomePageClient({
  collections,
  banners,
}: HomePageClientProps) {
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Banners */}
      {banners && banners.length > 0 && <SingleBanner banners={banners} />}

      {/* Collections */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.map((collection: any) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>


      {/* Next Custom Offer Poster */}
      <NextOfferPoster />

      {/* Phone Number Modal */}
      <PhoneNumberModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        isSubmitting={false}
        fetcher={null}
      />
    </div>
  );
}
