import { DomainError } from "@/src/domain/errors";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import { assertExpectedVersion } from "@/src/domain/commands/shared";

export function removeProduct(input: { expectedSceneVersion: number; itemId: string }) {
  const state = sceneStore.getState();
  assertExpectedVersion(state, input.expectedSceneVersion);
  const item = state.itemsById[input.itemId];
  if (!item) throw new DomainError("UNKNOWN_PRODUCT", "The scene item does not exist.");
  if (item.locked) {
    throw new DomainError(
      "LOCKED_ITEM_CONFLICT",
      `${item.variant.title} is locked by the shopper.`,
      false,
      state.sceneVersion,
    );
  }
  updateDomainState((current) => {
    const itemsById = { ...current.itemsById };
    delete itemsById[input.itemId];
    return {
      ...current,
      sceneVersion: current.sceneVersion + 1,
      itemsById,
      review: null,
      approval: null,
    };
  });
  return { sceneVersion: sceneStore.getState().sceneVersion, removed: input.itemId };
}
