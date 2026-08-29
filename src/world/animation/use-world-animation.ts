"use client";

import { useSyncExternalStore } from "react";
import { worldAnimationStore } from "@/src/world/animation/WorldAnimationController";

export function useWorldAnimation() {
  return useSyncExternalStore(
    worldAnimationStore.subscribe,
    worldAnimationStore.getState,
    worldAnimationStore.getState,
  );
}
