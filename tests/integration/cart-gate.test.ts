import { describe, expect, it, vi } from "vitest";
import {
  createCartGateController,
  digestCartLines,
  type ReviewedCartLine,
} from "@/src/commerce/cart-gate";

const exact: ReviewedCartLine[] = [
  { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
];

function createActions() {
  let configuredHandler: ((
    defaultHandler: () => Promise<unknown>,
    payload: { lines?: ReviewedCartLine[] },
  ) => Promise<unknown>) | null = null;
  let cart = {
    id: "gid://shopify/Cart/test",
    totalQuantity: 0,
    cost: { totalAmount: { amount: "0", currencyCode: "CAD" } },
    lines: { nodes: [] as Array<{ id: string; quantity: number; cost: { totalAmount: { amount: string; currencyCode: string } } }> },
    discountCodes: [],
  };
  const defaultHandler = vi.fn(async () => {
    cart = {
      ...cart,
      totalQuantity: 1,
      cost: { totalAmount: { amount: "25.0", currencyCode: "CAD" } },
      lines: {
        nodes: [
          {
            id: "gid://shopify/CartLine/1",
            quantity: 1,
            cost: { totalAmount: { amount: "25.0", currencyCode: "CAD" } },
          },
        ],
      },
    };
    return { cart };
  });
  const updateCart = Object.assign(vi.fn(), {
    configure: vi.fn((options) => {
      configuredHandler = options.handler;
      return true;
    }),
    isDefault: vi.fn(() => configuredHandler === null),
  });
  const actions = {
    getCart: vi.fn(async () => ({ cart })),
    updateCart,
    openCart: Object.assign(vi.fn(async () => undefined), {
      configure: vi.fn(),
      isDefault: vi.fn(),
    }),
  };

  return {
    actions: actions as never,
    defaultHandler,
    call: (lines: ReviewedCartLine[]) =>
      configuredHandler?.(defaultHandler, { lines }) as Promise<{
        cart: typeof cart;
        userErrors?: Array<{ code?: string }>;
      }>,
  };
}

describe("human-approved Shopify cart gate", () => {
  it("blocks unapproved, mismatched, expired, and repeated calls", async () => {
    let now = 1_000;
    const gate = createCartGateController({ now: () => now });
    const harness = createActions();
    expect(gate.configure(harness.actions, () => new EventTarget())).toBe(true);

    expect((await harness.call(exact)).userErrors?.[0].code).toBe("REVIEW_REQUIRED");
    expect(harness.defaultHandler).not.toHaveBeenCalled();

    await gate.approve(exact);
    expect(
      (await harness.call([{ ...exact[0], quantity: 2 }])).userErrors?.[0].code,
    ).toBe("REVIEW_MISMATCH");
    expect(harness.defaultHandler).not.toHaveBeenCalled();

    await gate.approve(exact, 10);
    now += 10;
    expect((await harness.call(exact)).userErrors?.[0].code).toBe("REVIEW_EXPIRED");
    expect(harness.defaultHandler).not.toHaveBeenCalled();

    await gate.approve(exact);
    const approved = await harness.call(exact);
    expect(approved.userErrors).toBeUndefined();
    expect(approved.cart.totalQuantity).toBe(1);
    expect(harness.defaultHandler).toHaveBeenCalledTimes(1);
    expect(gate.getApproval()?.consumed).toBe(true);

    expect((await harness.call(exact)).userErrors?.[0].code).toBe("REVIEW_REQUIRED");
    expect(harness.defaultHandler).toHaveBeenCalledTimes(1);
  });

  it("produces stable order-independent digests", async () => {
    const a = [
      { merchandiseId: "b", quantity: 1 },
      { merchandiseId: "a", quantity: 2 },
    ];
    const b = [...a].reverse();
    expect(await digestCartLines(a)).toBe(await digestCartLines(b));
  });
});
