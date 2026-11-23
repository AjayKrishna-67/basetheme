import gql from 'graphql-tag';
import { sdk } from '@/lib/graphql-client';
import { SearchQueryVariables } from '@/generated/graphql';

export function search(variables: SearchQueryVariables) {
  return sdk.search(variables);
}

export function searchFacetValues(variables: SearchQueryVariables) {
  return sdk.searchFacetValues(variables);
}

export function getProductBySlug(slug: string) {
  return sdk.product({ slug });
}

export async function getProductById(id: string) {
  return sdk.product({ id });
}

export const detailedProductFragment = gql`
  fragment DetailedProduct on Product {
    id
    name
    description
    slug
    collections {
      id
      slug
      name
      breadcrumbs {
        id
        name
        slug
      }
    }
    facetValues {
      facet {
        id
        code
        name
      }
      id
      code
      name
    }
    featuredAsset {
      id
      preview
    }
    assets {
      id
      preview
    }
    optionGroups {
      id
      code
      name
      options {
        id
        code
        name
      }
    }
    variants {
      id
      name
      priceWithTax
      currencyCode
      sku
      stockLevel
      customFields {
        shadowPrice
      }
      options {
        id
        name
        code
        group {
          id
          name
          code
        }
      }
      featuredAsset {
        id
        preview
      }
    }
  }
`;

gql`
  query product($slug: String, $id: ID) {
    product(slug: $slug, id: $id) {
      ...DetailedProduct
    }
  }
`;

export const listedProductFragment = gql`
  fragment ListedProduct on SearchResult {
    productId
    productName
    slug
    productAsset {
      id
      preview
    }
    currencyCode
    priceWithTax {
      ... on PriceRange {
        min
        max
      }
      ... on SinglePrice {
        value
      }
    }
  }
`;

gql`
  query search($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        ...ListedProduct
      }
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
    }
  }
  ${listedProductFragment}
`;

gql`
  query searchFacetValues($input: SearchInput!) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
    }
  }
  ${listedProductFragment}
`;
