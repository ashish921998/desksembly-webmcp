import { DomainError } from "@/src/domain/errors";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import type { KitReview } from "@/src/domain/types";
import { createReview } from "@/src/domain/commands/create-review";

export async function approveReview(
  review: KitReview,
  options?: { now?: number; ttlMs?: number },
) {
  const current = await createReview();
  const state = sceneStore.getState();
  if (current.digest !== review.digest || current.sceneVersion !== review.sceneVersion) {
    throw new DomainError(
      "REVIEW_MISMATCH",
      "The scene changed after this review was created.",
      true,
      state.sceneVersion,
    );
  }
  const approvedAt = options?.now ?? Date.now();
  const approval = {
    digest: review.digest,
    approvedAt,
    expiresAt: approvedAt + (options?.ttlMs ?? 30_000),
    consumed: false,
  };
  updateDomainState((value) => ({
    ...value,
    phase: "review",
    review: structuredClone(review),
    approval,
  }));
  return structuredClone(approval);
}

export function consumeReviewApproval(digest: string, now = Date.now()) {
  const state = sceneStore.getState();
  const approval = state.approval;
  if (!approval || approval.consumed) {
    throw new DomainError("REVIEW_REQUIRED", "An unconsumed review approval is required.");
  }
  if (approval.expiresAt <= now) {
    throw new DomainError("REVIEW_EXPIRED", "The review approval expired.", true);
  }
  if (approval.digest !== digest) {
    throw new DomainError("REVIEW_MISMATCH", "The approved review digest does not match.");
  }
  updateDomainState((value) => ({
    ...value,
    approval: value.approval ? { ...value.approval, consumed: true } : null,
  }));
  return structuredClone(sceneStore.getState().approval);
}
