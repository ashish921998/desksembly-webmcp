import { updateDomainState } from "@/src/domain/scene-store";

export function setReducedMotionPreference(reducedMotion: boolean) {
  updateDomainState((state) => ({ ...state, reducedMotion }));
}
