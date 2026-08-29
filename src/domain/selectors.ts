import type { Money, SceneSnapshot, SceneStoreState } from "@/src/domain/types";
import { moneyToMinorUnits } from "@/src/domain/constraints";
import { DESK_ANCHORS } from "@/src/world/anchors";

export function selectItems(state: SceneStoreState) {
  return Object.values(state.itemsById).sort((a, b) => a.id.localeCompare(b.id));
}

export function selectTotal(state: SceneStoreState): Money {
  const items = selectItems(state);
  const amount = items.reduce(
    (sum, item) => sum + moneyToMinorUnits(item.variant.price.amount),
    0,
  );
  return {
    amount: (amount / 100).toFixed(2),
    currencyCode: state.constraints.budget.currencyCode,
  };
}

export function selectAvailableAnchors(state: SceneStoreState) {
  const occupied = new Set(selectItems(state).map((item) => item.anchorId));
  return DESK_ANCHORS.filter(
    (anchor) =>
      anchor.minDeskWidthCm <= state.constraints.deskWidthCm && !occupied.has(anchor.id),
  ).map((anchor) => anchor.id);
}

export function toSceneSnapshot(state: SceneStoreState): SceneSnapshot {
  const items = selectItems(state);
  return structuredClone({
    sceneVersion: state.sceneVersion,
    phase: state.phase,
    constraints: state.constraints,
    items,
    occupiedAnchors: items.map((item) => item.anchorId).sort(),
    lockedItemIds: items.filter((item) => item.locked).map((item) => item.id).sort(),
    total: selectTotal(state),
  });
}
