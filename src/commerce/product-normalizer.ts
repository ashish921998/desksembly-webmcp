import { productVariantSchema } from "@/src/domain/schemas";
import type { ProductVariantRef } from "@/src/domain/types";
import type { ProductMetadata } from "@/src/commerce/types";

export type HydrogenVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  image?: { url: string } | null;
  price: { amount: string; currencyCode: string };
  product: { id: string; handle: string; title: string };
};

function safeText(value: string, maxLength: number) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export function normalizeHydrogenVariant(
  node: HydrogenVariantNode,
  metadata: ProductMetadata,
  market: string,
): ProductVariantRef {
  return productVariantSchema.parse({
    merchandiseId: node.id,
    productId: node.product.id,
    handle: safeText(node.product.handle, 120),
    title: safeText(node.product.title, 120),
    variantTitle: safeText(node.title, 120),
    role: metadata.role,
    imageUrl: node.image?.url ?? null,
    price: node.price,
    available: node.availableForSale,
    market,
    dimensions: metadata.dimensions,
    tags: metadata.tags?.map((tag) => safeText(tag, 40)),
  });
}
