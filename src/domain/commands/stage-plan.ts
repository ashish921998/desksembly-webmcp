import { DomainError } from "@/src/domain/errors";
import type { SceneAnimationPort } from "@/src/domain/ports";
import { immediateSceneAnimation } from "@/src/domain/ports";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import { stagePlanInputSchema } from "@/src/domain/schemas";
import { selectItems, toSceneSnapshot } from "@/src/domain/selectors";
import type { SceneItem } from "@/src/domain/types";
import { assertExpectedVersion, inputError, mapCancellation } from "@/src/domain/commands/shared";

export async function stagePlan(
  input: unknown,
  dependencies?: { animation?: SceneAnimationPort; signal?: AbortSignal },
) {
  const parsed = stagePlanInputSchema.safeParse(input);
  const state = sceneStore.getState();
  if (!parsed.success) throw inputError(parsed.error.issues[0]?.message ?? "Invalid stage input.");
  assertExpectedVersion(state, parsed.data.expectedSceneVersion);
  const proposal = state.proposal;
  if (
    !proposal ||
    proposal.proposalId !== parsed.data.proposalId ||
    proposal.digest !== parsed.data.proposalDigest
  ) {
    throw new DomainError(
      "PROPOSAL_MISMATCH",
      "The proposal no longer matches the visible scene.",
      true,
      state.sceneVersion,
    );
  }

  const variantById = new Map(
    proposal.variants.map((variant) => [variant.merchandiseId, variant]),
  );
  const preservedIds = new Set(proposal.preservedItemIds);
  const stagedItems: SceneItem[] = proposal.placements.map((placement) => {
    const variant = variantById.get(placement.merchandiseId);
    if (!variant) {
      throw new DomainError("UNKNOWN_PRODUCT", "A proposal product is missing.");
    }
    const existing = Object.values(state.itemsById).find(
      (item) =>
        preservedIds.has(item.id) &&
        item.variant.merchandiseId === placement.merchandiseId,
    );
    if (existing) {
      return {
        ...structuredClone(existing),
        status: "confirmed" as const,
        reason: placement.reason,
      };
    }
    return {
      id: `item-${variant.merchandiseId.replace(/[^a-zA-Z0-9]/g, "-")}`,
      variant,
      anchorId: placement.anchorId,
      status: "confirmed",
      owner: "agent",
      locked: false,
      reason: placement.reason,
    };
  });
  const lockedItems = selectItems(state).filter((item) => item.locked);
  const returningItems = proposal.returningItemIds.flatMap((id) => {
    const item = state.itemsById[id];
    return item ? [{ ...structuredClone(item), status: "returning" as const }] : [];
  });
  const animatedItems = stagedItems.filter((item) => !preservedIds.has(item.id));
  const stableSnapshot = toSceneSnapshot(state);

  try {
    await (dependencies?.animation ?? immediateSceneAnimation).stage(
      structuredClone([...returningItems, ...animatedItems]),
      dependencies?.signal,
    );
  } catch (error) {
    mapCancellation(error, state.sceneVersion);
  }

  assertExpectedVersion(sceneStore.getState(), parsed.data.expectedSceneVersion);
  updateDomainState((current) => ({
    ...current,
    sceneVersion: current.sceneVersion + 1,
    phase: "editable",
    itemsById: Object.fromEntries(
      [...lockedItems, ...stagedItems].map((item) => [item.id, item]),
    ),
    proposal: null,
    review: null,
    approval: null,
    lastStableSnapshot: stableSnapshot,
  }));

  return {
    sceneVersion: sceneStore.getState().sceneVersion,
    staged: stagedItems.map((item) => ({
      merchandiseId: item.variant.merchandiseId,
      anchorId: item.anchorId,
    })),
    preservedItemIds: [...proposal.preservedItemIds],
    returnedItemIds: [...proposal.returningItemIds],
  };
}
