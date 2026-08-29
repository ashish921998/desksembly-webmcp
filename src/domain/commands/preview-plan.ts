import { digestValue } from "@/src/domain/canonicalize";
import {
  validateBudget,
  validateItemCount,
  validateVariant,
} from "@/src/domain/constraints";
import { DomainError } from "@/src/domain/errors";
import { chooseAnchor } from "@/src/domain/placement";
import type { CatalogPort } from "@/src/domain/ports";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import { previewPlanInputSchema } from "@/src/domain/schemas";
import { selectItems } from "@/src/domain/selectors";
import type { PlanProposal, SceneItem } from "@/src/domain/types";
import { assertExpectedVersion, inputError, mapCancellation } from "@/src/domain/commands/shared";
import { ANCHOR_BY_ID } from "@/src/world/anchors";

export async function previewPlan(
  input: unknown,
  dependencies: { catalog: CatalogPort; signal?: AbortSignal },
) {
  const parsed = previewPlanInputSchema.safeParse(input);
  const state = sceneStore.getState();
  if (!parsed.success) throw inputError(parsed.error.issues[0]?.message ?? "Invalid plan.");
  assertExpectedVersion(state, parsed.data.expectedSceneVersion);

  const duplicateIds = new Set<string>();
  const seenIds = new Set<string>();
  for (const selection of parsed.data.selections) {
    if (seenIds.has(selection.merchandiseId)) duplicateIds.add(selection.merchandiseId);
    seenIds.add(selection.merchandiseId);
  }
  if (duplicateIds.size) throw inputError("Duplicate merchandise IDs are not allowed.");

  let variants;
  try {
    variants = await dependencies.catalog.getProductsByMerchandiseIds(
      parsed.data.selections.map((selection) => selection.merchandiseId),
      { market: parsed.data.constraints.market, signal: dependencies.signal },
    );
  } catch (error) {
    mapCancellation(error, state.sceneVersion);
  }

  const variantById = new Map(variants.map((variant) => [variant.merchandiseId, variant]));
  const currentItems = selectItems(state);
  const lockedItems = currentItems.filter((item) => item.locked);
  const existingByMerchandiseId = new Map(
    currentItems
      .filter((item) => !item.locked)
      .map((item) => [item.variant.merchandiseId, item]),
  );
  const occupied = new Set(lockedItems.map((item) => item.anchorId));
  const usedRoles = new Set(lockedItems.map((item) => item.variant.role));

  for (const item of lockedItems) {
    const anchor = ANCHOR_BY_ID.get(item.anchorId);
    if (!anchor || anchor.minDeskWidthCm > parsed.data.constraints.deskWidthCm) {
      throw new DomainError(
        "LOCKED_ITEM_CONFLICT",
        `${item.variant.title} is locked on an anchor that does not fit the new desk width.`,
        false,
        state.sceneVersion,
      );
    }
  }

  const placements: PlanProposal["placements"] = [];
  const proposedItems: SceneItem[] = [];
  const orderedVariants = [];
  const preservedItemIds: string[] = [];

  for (const selection of parsed.data.selections) {
    const variant = variantById.get(selection.merchandiseId);
    if (!variant) {
      throw new DomainError(
        "UNKNOWN_PRODUCT",
        `Unknown merchandise ID ${selection.merchandiseId}.`,
        false,
        state.sceneVersion,
      );
    }
    if (usedRoles.has(selection.role)) {
      throw inputError(`Role ${selection.role} is already occupied.`, state.sceneVersion);
    }
    validateVariant(variant, parsed.data.constraints, selection.role);
    const existing = existingByMerchandiseId.get(selection.merchandiseId);
    let anchorId: string;
    try {
      anchorId = chooseAnchor({
        variant,
        constraints: parsed.data.constraints,
        occupied,
        preferredAnchorId: selection.preferredAnchorId ?? existing?.anchorId,
      });
    } catch (error) {
      if (!existing || selection.preferredAnchorId) throw error;
      anchorId = chooseAnchor({
        variant,
        constraints: parsed.data.constraints,
        occupied,
      });
    }
    occupied.add(anchorId);
    usedRoles.add(selection.role);
    const reason = selection.reason.slice(0, 180);
    placements.push({
      merchandiseId: variant.merchandiseId,
      role: selection.role,
      anchorId,
      reason,
    });
    proposedItems.push({
      id:
        existing?.id ??
        `item-${variant.merchandiseId.replace(/[^a-zA-Z0-9]/g, "-")}`,
      variant,
      anchorId,
      status: "proposal",
      owner: "agent",
      locked: false,
      reason,
    });
    if (existing && existing.anchorId === anchorId) preservedItemIds.push(existing.id);
    orderedVariants.push(variant);
  }

  const returningItemIds = currentItems
    .filter((item) => !item.locked && !preservedItemIds.includes(item.id))
    .map((item) => item.id)
    .sort();

  const completeItems = [...lockedItems, ...proposedItems];
  validateItemCount(completeItems, parsed.data.constraints);
  validateBudget(completeItems, parsed.data.constraints);
  const digest = await digestValue({
    basedOnSceneVersion: state.sceneVersion,
    constraints: parsed.data.constraints,
    placements,
    preservedItemIds,
    returningItemIds,
    prices: orderedVariants.map((variant) => ({
      merchandiseId: variant.merchandiseId,
      price: variant.price,
    })),
  });
  const proposal: PlanProposal = {
    proposalId: `proposal-${digest.slice(0, 16)}`,
    basedOnSceneVersion: state.sceneVersion,
    constraints: structuredClone(parsed.data.constraints),
    placements,
    variants: structuredClone(orderedVariants),
    preservedItemIds,
    returningItemIds,
    rejected: [],
    digest,
  };

  assertExpectedVersion(sceneStore.getState(), parsed.data.expectedSceneVersion);
  updateDomainState((current) => ({
    ...current,
    sceneVersion: current.sceneVersion + 1,
    phase: "proposal",
    constraints: structuredClone(parsed.data.constraints),
    proposal,
    review: null,
    approval: null,
  }));

  return structuredClone(proposal);
}
