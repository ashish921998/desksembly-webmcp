import type { CartSnapshot, ProductVariantRef } from "@/src/domain/types";
import type { CartMutationLine, CartMutationResult, CommerceMode } from "@/src/commerce/types";

export interface CommerceGateway {
  readonly mode: CommerceMode;
  readonly label: string;

  getProductsByMerchandiseIds(
    ids: string[],
    context: { market: string; signal?: AbortSignal },
  ): Promise<ProductVariantRef[]>;

  getCart(signal?: AbortSignal): Promise<CartSnapshot>;

  updateCart(
    lines: CartMutationLine[],
    signal?: AbortSignal,
  ): Promise<CartMutationResult>;

  getCheckoutUrl(signal?: AbortSignal): Promise<string | null>;
}
