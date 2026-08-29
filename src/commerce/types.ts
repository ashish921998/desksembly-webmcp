import type { CartSnapshot, Money, ProductRole, ProductVariantRef } from "@/src/domain/types";

export type CommerceMode = "shopify" | "deterministic-demo";

export type ProductMetadata = {
  role: ProductRole;
  dimensions?: ProductVariantRef["dimensions"];
  tags?: string[];
};

export type CartMutationLine = {
  merchandiseId: string;
  quantity: number;
};

export type CartMutationResult = {
  cart: CartSnapshot;
  accepted: CartMutationLine[];
  rejected: Array<CartMutationLine & { code: string; message: string }>;
};

export type PriceChangeFixture = {
  merchandiseId: string;
  previousPrice: Money;
  currentPrice: Money;
};
