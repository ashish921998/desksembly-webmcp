import { describe, expect, it } from "vitest";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import {
  MOCK_DESK_PRODUCTS,
  MOCK_PARTIAL_FAILURE_MERCHANDISE_ID,
} from "@/src/commerce/mock-catalog";

describe("mid-chain commerce failure", () => {
  it("returns accepted and rejected lines without claiming full success", async () => {
    const gateway = new MockCommerceGateway();
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
