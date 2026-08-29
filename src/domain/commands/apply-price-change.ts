import { DomainError } from "@/src/domain/errors";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import type { Money } from "@/src/domain/types";
import { assertExpectedVersion } from "@/src/domain/commands/shared";

export function applyPriceChange(input: {
  expectedSceneVersion: number;
  itemId: string;
  price: Money;
}) {
  const state = sceneStore.getState();
  assertExpectedVersion(state, input.expectedSceneVersion);
  const item = state.itemsById[input.itemId];
  if (!item) throw new DomainError("UNKNOWN_PRODUCT", "The repriced scene item is missing.");
  updateDomainState((current) => ({
    ...current,
    sceneVersion: current.sceneVersion + 1,
    itemsById: {
      ...current.itemsById,
      [input.itemId]: {
        ...current.itemsById[input.itemId],
        variant: { ...current.itemsById[input.itemId].variant, price: input.price },
      },
    },
    review: null,
    approval: null,
  }));
  return { sceneVersion: sceneStore.getState().sceneVersion };
}
