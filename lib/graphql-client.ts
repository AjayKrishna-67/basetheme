import { DocumentNode, print } from 'graphql';
import { API_URL, CHANNEL_TOKEN } from './constants';
import { getSdk } from '@/generated/graphql';
import { getAuthToken } from './session';

export interface QueryOptions {
  authToken?: string;
  customHeaders?: Record<string, string>;
}

export interface GraphqlResponse<Response> {
  errors: any[];
  data: Response;
}

export type WithHeaders<T> = T & { _headers: Headers };

async function sendQuery<Response, Variables = {}>(options: {
  query: string;
  variables?: Variables;
  authToken?: string;
  customHeaders?: Record<string, string>;
}): Promise<GraphqlResponse<Response> & { headers: Headers }> {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('vendure-token', CHANNEL_TOKEN);

  // Get auth token from session if not provided
  const authToken = options.authToken ?? (await getAuthToken());
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (options.customHeaders) {
    for (const key in options.customHeaders) {
      headers.set(key, options.customHeaders[key]);
    }
  }

  return fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: options.query,
      variables: options.variables,
    }),
    headers,
    cache: 'no-store',
  }).then(async (res) => ({
    ...(await res.json()),
    headers: res.headers,
  }));
}

function requester<R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: QueryOptions,
): Promise<R & { _headers: Headers }> {
  return sendQuery<R, V>({
    query: print(doc),
    variables: vars,
    ...options,
  }).then(async (response) => {
    const headers: Record<string, string> = {};
    headers['x-vendure-api-url'] = API_URL;

    const vendureAuthToken = response.headers.get('vendure-auth-token');
    if (vendureAuthToken) {
      headers['vendure-auth-token'] = vendureAuthToken;
    }

    if (response.errors) {
      console.error(
        response.errors[0].extensions?.exception?.stacktrace.join('\n') ??
          response.errors,
      );
      throw new Error(JSON.stringify(response.errors[0]));
    }

    return { ...response.data, _headers: new Headers(headers) };
  });
}

const baseSdk = getSdk<QueryOptions, unknown>(requester);

type Sdk = typeof baseSdk;
type SdkWithHeaders = {
  [k in keyof Sdk]: (
    ...args: Parameters<Sdk[k]>
  ) => Promise<Awaited<ReturnType<Sdk[k]>> & { _headers: Headers }>;
};

export const sdk: SdkWithHeaders = baseSdk as any;

/**
 * For use in API route handlers where we need to pass auth token explicitly
 */
export async function createAuthenticatedSdk(authToken: string) {
  function authRequester<R, V>(
    doc: DocumentNode,
    vars?: V,
    options?: QueryOptions,
  ): Promise<R & { _headers: Headers }> {
    return sendQuery<R, V>({
      query: print(doc),
      variables: vars,
      authToken,
      ...options,
    }).then(async (response) => {
      const headers: Record<string, string> = {};
      headers['x-vendure-api-url'] = API_URL;

      const vendureAuthToken = response.headers.get('vendure-auth-token');
      if (vendureAuthToken) {
        headers['vendure-auth-token'] = vendureAuthToken;
      }

      if (response.errors) {
        console.error(response.errors);
        throw new Error(JSON.stringify(response.errors[0]));
      }

      return { ...response.data, _headers: new Headers(headers) };
    });
  }

  return getSdk<QueryOptions, unknown>(authRequester) as SdkWithHeaders;
}
