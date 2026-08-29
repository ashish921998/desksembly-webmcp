import type { CartSnapshot, KitReview } from "@/src/domain/types";
import { updateDomainState } from "@/src/domain/scene-store";

export function reconcileCart(review: KitReview, cart: CartSnapshot) {
  const quantities = new Map(
    cart.lines.map((line) => [line.merchandiseId, line.quantity]),
  );
  const missing = review.lines.filter(
    (line) => (quantities.get(line.merchandiseId) ?? 0) < line.quantity,
  );
  const matched = missing.length === 0;
  updateDomainState((state) => ({
    ...state,
    phase: matched ? "ready-for-checkout" : "needs-revision",
    cartSnapshot: structuredClone(cart),
  }));
  return {
    matched,
    missing: missing.map((line) => line.merchandiseId),
  };
}
