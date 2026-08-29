import { digestValue } from "@/src/domain/canonicalize";
import { sceneStore } from "@/src/domain/scene-store";
import { selectItems, selectTotal } from "@/src/domain/selectors";
import type { KitReview } from "@/src/domain/types";

export async function createReview(): Promise<KitReview> {
  const state = sceneStore.getState();
  const lines = selectItems(state)
    .filter((item) => item.status === "confirmed")
    .map((item) => ({
      merchandiseId: item.variant.merchandiseId,
      title: item.variant.title,
      variantTitle: item.variant.variantTitle,
      quantity: 1,
      price: item.variant.price,
    }))
    .sort((a, b) => a.merchandiseId.localeCompare(b.merchandiseId));
  const total = selectTotal(state);
  const digest = await digestValue({
    sceneVersion: state.sceneVersion,
    constraints: state.constraints,
    lines,
    total,
  });
  return {
    reviewId: `review-${digest.slice(0, 16)}`,
    sceneVersion: state.sceneVersion,
    lines,
    total,
    warnings: [],
    digest,
  };
}
