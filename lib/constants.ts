export const APP_META_TITLE = 'SwadKerala - Pure Spices, True Flavours';
export const APP_META_DESCRIPTION = '';

export const DEMO_API_URL = 'http://localhost:80/shop-api';

export const API_URL: string =
  process.env.VENDURE_API_URL ?? DEMO_API_URL;

export const CHANNEL_TOKEN: string = process.env.CHANNEL_TOKEN ?? 'Ind-Snacks';

export const CHANNEL_TYPE: string = process.env.CHANNEL_TYPE ?? 'BRAND';
