"use client";

import { useSyncExternalStore } from "react";
import { sceneStore } from "@/src/domain/scene-store";

export function useSceneState() {
  return useSyncExternalStore(
    sceneStore.subscribe,
    sceneStore.getState,
    sceneStore.getState,
  );
}
