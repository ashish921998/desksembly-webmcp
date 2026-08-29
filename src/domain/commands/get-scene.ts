import { sceneStore } from "@/src/domain/scene-store";
import { toSceneSnapshot } from "@/src/domain/selectors";

export function getScene() {
  return toSceneSnapshot(sceneStore.getState());
}
