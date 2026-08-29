import { DomainError } from "@/src/domain/errors";
import type { CartSnapshot, ProductVariantRef } from "@/src/domain/types";
import type { CommerceGateway } from "@/src/commerce/gateway";
import {
  MOCK_DESK_PRODUCTS,
  MOCK_PARTIAL_FAILURE_MERCHANDISE_ID,
} from "@/src/commerce/mock-catalog";
import type { CartMutationLine, CartMutationResult } from "@/src/commerce/types";

export class MockCommerceGateway implements CommerceGateway {
  readonly mode = "deterministic-demo" as const;
  readonly label = "Deterministic demo commerce — not a Shopify cart";
  private readonly quantities = new Map<string, number>();
  private readonly rejectedIds: ReadonlySet<string>;

  constructor(
    private readonly products: readonly ProductVariantRef[] = MOCK_DESK_PRODUCTS,
    options?: {
      initialLines?: CartMutationLine[];
      rejectMerchandiseIds?: string[];
    },
  ) {
    for (const line of options?.initialLines ?? []) {
      this.quantities.set(line.merchandiseId, line.quantity);
    }
    this.rejectedIds = new Set(options?.rejectMerchandiseIds ?? []);
  }

  async getProductsByMerchandiseIds(
    ids: string[],
    context: { market: string; signal?: AbortSignal },
  ) {
    if (context.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    return this.products
      .filter((product) => ids.includes(product.merchandiseId))
      .map((product) => ({
        ...structuredClone(product),
        available: product.available && product.market === context.market,
      }));
  }

  async getCart(signal?: AbortSignal): Promise<CartSnapshot> {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const lines = [...this.quantities]
      .map(([merchandiseId, quantity]) => ({ merchandiseId, quantity }))
      .sort((a, b) => a.merchandiseId.localeCompare(b.merchandiseId));
    const totalMinor = lines.reduce((sum, line) => {
      const product = this.products.find(
        (candidate) => candidate.merchandiseId === line.merchandiseId,
      );
      return sum + Math.round(Number(product?.price.amount ?? 0) * 100) * line.quantity;
    }, 0);
    return {
      id: "mock-cart-session",
      lines,
      total: { amount: (totalMinor / 100).toFixed(2), currencyCode: "USD" },
      checkoutUrl: lines.length ? "/demo-checkout-disabled" : null,
    };
  }

  async updateCart(
    lines: CartMutationLine[],
    signal?: AbortSignal,
  ): Promise<CartMutationResult> {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const accepted: CartMutationLine[] = [];
    const rejected: CartMutationResult["rejected"] = [];

    for (const line of lines) {
      const product = this.products.find(
        (candidate) => candidate.merchandiseId === line.merchandiseId,
      );
      if (!product) {
        throw new DomainError("UNKNOWN_PRODUCT", "The mock product does not exist.");
      }
      if (!product.available) {
        rejected.push({ ...line, code: "UNAVAILABLE_VARIANT", message: "Variant unavailable." });
        continue;
      }
      if (
        line.merchandiseId === MOCK_PARTIAL_FAILURE_MERCHANDISE_ID ||
        this.rejectedIds.has(line.merchandiseId)
      ) {
        rejected.push({ ...line, code: "CART_PARTIAL_FAILURE", message: "Fixture rejection." });
        continue;
      }
      this.quantities.set(line.merchandiseId, line.quantity);
      accepted.push(structuredClone(line));
    }

    return { cart: await this.getCart(signal), accepted, rejected };
  }

  async getCheckoutUrl(signal?: AbortSignal) {
    return (await this.getCart(signal)).checkoutUrl;
  }
}
