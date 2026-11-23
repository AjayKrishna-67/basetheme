import { getCollections } from '@/providers/collections';
import { getCustomBanners } from '@/providers/custom-plugins';
import { HomePageClient } from './home-page-client';

export default async function HomePage() {
  const [collections, bannersResult] = await Promise.all([
    getCollections({ take: 20 }),
    getCustomBanners(),
  ]);

  const topLevelCollections = (collections ?? []).filter(
    (collection: any) => collection.parent?.name === '__root_collection__',
  );

  const banners = bannersResult ? bannersResult.data : [];

  return (
    <HomePageClient
      collections={topLevelCollections}
      banners={banners}
    />
  );
}
