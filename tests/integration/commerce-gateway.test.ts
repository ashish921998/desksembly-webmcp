import { beforeEach, describe, expect, it } from "vitest";
import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";
import { previewPlan } from "@/src/domain/commands/preview-plan";
import { resetSceneStoreForTests } from "@/src/domain/scene-store";
import { productVariantSchema } from "@/src/domain/schemas";
import { HydrogenCommerceGateway, type LiveCartPort } from "@/src/commerce/hydrogen-gateway";
import {
  MOCK_DESK_PRODUCTS,
  MOCK_PARTIAL_FAILURE_MERCHANDISE_ID,
  MOCK_PRICE_CHANGE,
  MOCK_UNAVAILABLE_MERCHANDISE_ID,
} from "@/src/commerce/mock-catalog";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";

const emptyCart = {
  id: "cart-live-test",
  lines: [],
  total: { amount: "0.00", currencyCode: "CAD" },
  checkoutUrl: null,
};

const liveCart: LiveCartPort = {
  async getCart() {
    return emptyCart;
  },
  async updateCart(lines) {
    return { cart: emptyCart, accepted: lines, rejected: [] };
  },
  async getCheckoutUrl() {
    return null;
  },
};

beforeEach(() => resetSceneStoreForTests());

describe("commerce gateways", () => {
  it("normalizes a tokenless Hydrogen mock.shop variant to the safe contract", async () => {
    const requestContext = createShopifyRequestContext({
      request: { headers: new Headers() },
      i18n: { country: "CA", language: "EN" },
    });
    const storefront = createStorefrontClient({
      type: "public",
      requestContext,
      config: { storeDomain: "mock.shop" },
    });
    const id = "gid://shopify/ProductVariant/43695710371862";
    const gateway = new HydrogenCommerceGateway(storefront, liveCart, {
      [id]: {
        role: "decor",
        dimensions: { widthCm: 20, depthCm: 20, heightCm: 8 },
        tags: ["fixture"],
      },
    });

    const [variant] = await gateway.getProductsByMerchandiseIds([id], {
      market: "CA",
    });
    expect(productVariantSchema.parse(variant)).toMatchObject({
      merchandiseId: id,
      title: "Slides",
      variantTitle: "Small",
      market: "CA",
      price: { currencyCode: "CAD" },
    });
    expect(Object.keys(variant).sort()).toMatchInlineSnapshot(`
      [
        "available",
        "dimensions",
        "handle",
        "imageUrl",
        "market",
        "merchandiseId",
        "price",
        "productId",
        "role",
        "tags",
        "title",
        "variantTitle",
      ]
    `);
  });

  it("provides a US-ready deterministic catalog without pretending it is live", async () => {
    const gateway = new MockCommerceGateway();
    expect(gateway.mode).toBe("deterministic-demo");
    expect(gateway.label).toMatch(/not a Shopify cart/i);

    const products = await gateway.getProductsByMerchandiseIds(
      MOCK_DESK_PRODUCTS.slice(0, 6).map((product) => product.merchandiseId),
      { market: "US" },
    );
    expect(products).toHaveLength(6);
    expect(products.every((product) => product.market === "US")).toBe(true);
    expect(products.map((product) => product.role)).toEqual([
      "lamp",
      "display",
      "input",
      "audio",
      "organization",
      "decor",
    ]);

    const proposal = await previewPlan(
      {
        expectedSceneVersion: 0,
        constraints: {
          budget: { amount: "350.00", currencyCode: "USD" },
          deskWidthCm: 120,
          market: "US",
          styleTags: ["cozy"],
          disallowedTags: ["RGB"],
          minItems: 3,
          maxItems: 5,
        },
        selections: [
          {
            merchandiseId: MOCK_DESK_PRODUCTS[1].merchandiseId,
            role: "display",
            reason: "Compact display",
          },
          {
            merchandiseId: MOCK_DESK_PRODUCTS[2].merchandiseId,
            role: "input",
            reason: "Quiet input",
          },
          {
            merchandiseId: MOCK_DESK_PRODUCTS[3].merchandiseId,
            role: "audio",
            reason: "Small audio",
          },
        ],
      },
      { catalog: gateway },
    );
    expect(proposal.placements).toHaveLength(3);
  });

  it("exposes unavailable, price-change, and partial-cart fixtures", async () => {
    const gateway = new MockCommerceGateway();
    const [unavailable] = await gateway.getProductsByMerchandiseIds(
      [MOCK_UNAVAILABLE_MERCHANDISE_ID],
      { market: "US" },
    );
    expect(unavailable.available).toBe(false);
    expect(MOCK_PRICE_CHANGE.previousPrice).not.toEqual(MOCK_PRICE_CHANGE.currentPrice);

    const result = await gateway.updateCart([
      { merchandiseId: MOCK_DESK_PRODUCTS[1].merchandiseId, quantity: 1 },
      { merchandiseId: MOCK_PARTIAL_FAILURE_MERCHANDISE_ID, quantity: 1 },
    ]);
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toEqual([
      expect.objectContaining({ code: "CART_PARTIAL_FAILURE" }),
    ]);
    expect(result.cart.lines).toHaveLength(1);
  });
});
