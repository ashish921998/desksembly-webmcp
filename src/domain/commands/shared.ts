import { DomainError } from "@/src/domain/errors";
import type { SceneStoreState } from "@/src/domain/types";
import { sceneStore } from "@/src/domain/scene-store";

export function currentState() {
  return sceneStore.getState();
}

export function assertExpectedVersion(
  state: SceneStoreState,
  expectedSceneVersion: number,
) {
  if (state.sceneVersion !== expectedSceneVersion) {
    throw new DomainError(
      "STALE_SCENE",
      `Scene version ${expectedSceneVersion} is stale; current version is ${state.sceneVersion}.`,
      true,
      state.sceneVersion,
    );
  }
}

export function inputError(message: string, sceneVersion?: number) {
  return new DomainError("INVALID_INPUT", message, false, sceneVersion);
}

export function mapCancellation(error: unknown, sceneVersion: number): never {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw new DomainError(
      "OPERATION_CANCELLED",
      "The operation was cancelled; the stable scene is unchanged.",
      true,
      sceneVersion,
    );
  }
  throw error;
}
