import { NextResponse } from 'next/server';
import { API_URL, CHANNEL_TOKEN } from '@/lib/constants';
import { getSession } from '@/lib/session';

const NEXT_BANNER_QUERY = `
  query NextOffer {
    nextBannerPopup {
      id
      asset { id source preview }
      product { id name }
      collection { id name }
      productVariant { id name sku }
    }
  }
`;

export async function GET() {
  try {
    const session = await getSession();
    const authToken = session.authToken;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'vendure-token': CHANNEL_TOKEN,
    };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: NEXT_BANNER_QUERY }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[next-offer] upstream HTTP error', res.status, text);
      return NextResponse.json({ error: `HTTP ${res.status}`, detail: text }, { status: 502 });
    }

    const newVendureToken = res.headers.get('vendure-auth-token');
    if (newVendureToken && newVendureToken !== authToken) {
      session.authToken = newVendureToken;
      await session.save();
    }

    const json = (await res.json()) as {
      data?: { nextBannerPopup: any };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      console.error('[next-offer] graphql errors', JSON.stringify(json.errors));
      return NextResponse.json({ error: json.errors[0].message, errors: json.errors }, { status: 400 });
    }

    return NextResponse.json(
      { banner: json.data?.nextBannerPopup ?? null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[next-offer] exception', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
