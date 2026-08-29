import { createInitialSceneState, replaceDomainState, sceneStore } from "@/src/domain/scene-store";

export function resetWorld() {
  const current = sceneStore.getState();
  replaceDomainState(
    createInitialSceneState({
      sceneVersion: current.sceneVersion + 1,
      cartSnapshot: structuredClone(current.cartSnapshot),
    }),
  );
  return { sceneVersion: sceneStore.getState().sceneVersion };
}
