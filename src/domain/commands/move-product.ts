import { DomainError } from "@/src/domain/errors";
import { assertValidMove } from "@/src/domain/placement";
import type { SceneAnimationPort } from "@/src/domain/ports";
import { immediateSceneAnimation } from "@/src/domain/ports";
import { sceneStore, updateDomainState } from "@/src/domain/scene-store";
import { moveProductInputSchema } from "@/src/domain/schemas";
import { selectItems } from "@/src/domain/selectors";
import { assertExpectedVersion, inputError, mapCancellation } from "@/src/domain/commands/shared";

export async function moveProduct(
  input: unknown,
  dependencies?: { animation?: SceneAnimationPort; signal?: AbortSignal },
) {
  const parsed = moveProductInputSchema.safeParse(input);
  const state = sceneStore.getState();
  if (!parsed.success) throw inputError(parsed.error.issues[0]?.message ?? "Invalid move.");
  assertExpectedVersion(state, parsed.data.expectedSceneVersion);
  const item = state.itemsById[parsed.data.itemId];
  if (!item) throw new DomainError("UNKNOWN_PRODUCT", "The scene item does not exist.");
  if (item.locked) {
    throw new DomainError(
      "LOCKED_ITEM_CONFLICT",
      `${item.variant.title} is locked by the shopper.`,
      false,
      state.sceneVersion,
    );
  }

  assertValidMove({
    variant: item.variant,
    targetAnchorId: parsed.data.targetAnchorId,
    constraints: state.constraints,
    occupied: new Set(
      selectItems(state)
        .filter((candidate) => candidate.id !== item.id)
        .map((candidate) => candidate.anchorId),
    ),
  });

  try {
    await (dependencies?.animation ?? immediateSceneAnimation).move(
      structuredClone(item),
      parsed.data.targetAnchorId,
      dependencies?.signal,
    );
  } catch (error) {
    mapCancellation(error, state.sceneVersion);
  }

  assertExpectedVersion(sceneStore.getState(), parsed.data.expectedSceneVersion);
  updateDomainState((current) => ({
    ...current,
    sceneVersion: current.sceneVersion + 1,
    itemsById: {
      ...current.itemsById,
      [item.id]: {
        ...current.itemsById[item.id],
        anchorId: parsed.data.targetAnchorId,
        owner: "human",
      },
    },
    review: null,
    approval: null,
  }));
  return { sceneVersion: sceneStore.getState().sceneVersion, itemId: item.id };
}
