import { DomainError } from "@/src/domain/errors";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import { assertExpectedVersion } from "@/src/domain/commands/shared";

export function lockProduct(input: {
  expectedSceneVersion: number;
  itemId: string;
  locked: boolean;
}) {
  const state = sceneStore.getState();
  assertExpectedVersion(state, input.expectedSceneVersion);
  const item = state.itemsById[input.itemId];
  if (!item) throw new DomainError("UNKNOWN_PRODUCT", "The scene item does not exist.");
  updateDomainState((current) => ({
    ...current,
    sceneVersion: current.sceneVersion + 1,
    itemsById: {
      ...current.itemsById,
      [input.itemId]: {
        ...current.itemsById[input.itemId],
        locked: input.locked,
        owner: "human",
      },
    },
    review: null,
    approval: null,
  }));
  return { sceneVersion: sceneStore.getState().sceneVersion, locked: input.locked };
}
