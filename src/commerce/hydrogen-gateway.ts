import { gql, type StorefrontClient } from "@shopify/hydrogen";
import { DomainError } from "@/src/domain/errors";
import type { CartSnapshot, ProductVariantRef } from "@/src/domain/types";
import type { CommerceGateway } from "@/src/commerce/gateway";
import { normalizeHydrogenVariant, type HydrogenVariantNode } from "@/src/commerce/product-normalizer";
import type {
  CartMutationLine,
  CartMutationResult,
  ProductMetadata,
} from "@/src/commerce/types";

const VARIANTS_QUERY = gql(`
  query DeskBuilderVariants($ids: [ID!]!, $country: CountryCode)
  @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        __typename
        id
        title
        availableForSale
        image { url }
        price { amount currencyCode }
        product { id handle title }
      }
    }
  }
`);

export interface LiveCartPort {
  getCart(signal?: AbortSignal): Promise<CartSnapshot>;
  updateCart(lines: CartMutationLine[], signal?: AbortSignal): Promise<CartMutationResult>;
  getCheckoutUrl(signal?: AbortSignal): Promise<string | null>;
}

export class HydrogenCommerceGateway implements CommerceGateway {
  readonly mode = "shopify" as const;
  readonly label = "Live Shopify commerce";

  constructor(
    private readonly storefrontClient: StorefrontClient,
    private readonly cart: LiveCartPort,
    private readonly metadataByMerchandiseId: Readonly<Record<string, ProductMetadata>>,
  ) {}

  async getProductsByMerchandiseIds(
    ids: string[],
    context: { market: string; signal?: AbortSignal },
  ): Promise<ProductVariantRef[]> {
    if (this.storefrontClient.requestContext.i18n.country !== context.market) {
      throw new DomainError(
        "MARKET_UNAVAILABLE",
        `The Shopify client is configured for ${this.storefrontClient.requestContext.i18n.country}, not ${context.market}.`,
      );
    }
    try {
      const { data, errors } = await this.storefrontClient.graphql(VARIANTS_QUERY, {
        variables: { ids },
        signal: context.signal,
      });
      if (errors?.length) {
        throw new DomainError("COMMERCE_UNAVAILABLE", errors[0].message, true);
      }
      return (data?.nodes ?? []).flatMap((candidate) => {
        if (!candidate || candidate.__typename !== "ProductVariant") return [];
        const metadata = this.metadataByMerchandiseId[candidate.id];
        if (!metadata) return [];
        return [
          normalizeHydrogenVariant(
            candidate as unknown as HydrogenVariantNode,
            metadata,
            context.market,
          ),
        ];
      });
    } catch (error) {
      if (error instanceof DomainError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new DomainError(
        "COMMERCE_UNAVAILABLE",
        "Shopify product data is temporarily unavailable.",
        true,
      );
    }
  }

  getCart(signal?: AbortSignal) {
    return this.cart.getCart(signal);
  }

  updateCart(lines: CartMutationLine[], signal?: AbortSignal) {
    return this.cart.updateCart(lines, signal);
  }

  getCheckoutUrl(signal?: AbortSignal) {
    return this.cart.getCheckoutUrl(signal);
  }
}
