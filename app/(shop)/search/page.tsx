import { search, searchFacetValues } from '@/providers/products';
import { getActiveCustomer } from '@/providers/customer';
import { getAuthToken } from '@/lib/session';
import { CollectionPageClient } from '../collections/[slug]/collection-page-client';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const term = (resolvedSearchParams.q as string) || '';
  const facetValueIds = resolvedSearchParams.fvid
    ? Array.isArray(resolvedSearchParams.fvid)
      ? resolvedSearchParams.fvid
      : [resolvedSearchParams.fvid]
    : [];
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  const searchResult = await search({
    input: {
      term,
      facetValueFilters: facetValueIds.length
        ? [{ or: facetValueIds }]
        : undefined,
      take: limit,
      skip,
      groupByProduct: true,
    },
  });

  const facetValuesResult = await searchFacetValues({
    input: { term, groupByProduct: true },
  });

  // Get auth state
  const authToken = await getAuthToken();
  const isSignedIn = !!authToken;
  let activeCustomer = null;
  if (isSignedIn) {
    try {
      const result = await getActiveCustomer();
      activeCustomer = result ?? null;
    } catch {
      // not logged in
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {term ? `Results for "${term}"` : 'All Products'}
        </h1>
      </div>

      <CollectionPageClient
        collection={{ name: term ? `"${term}"` : 'All Products', breadcrumbs: [] }}
        searchResult={searchResult.search}
        resultWithoutFacetValueFilters={facetValuesResult.search}
        currentPage={page}
        limit={limit}
        term={term}
        activeFacetValueIds={facetValueIds}
        activeCustomer={activeCustomer}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
