import type { ProductVariantRef, SceneItem } from "@/src/domain/types";

export interface CatalogPort {
  getProductsByMerchandiseIds(
    ids: string[],
    context: { market: string; signal?: AbortSignal },
  ): Promise<ProductVariantRef[]>;
}

export interface SceneAnimationPort {
  stage(items: SceneItem[], signal?: AbortSignal): Promise<void>;
  move(item: SceneItem, targetAnchorId: string, signal?: AbortSignal): Promise<void>;
}

export const immediateSceneAnimation: SceneAnimationPort = {
  async stage(_items, signal) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  },
  async move(_item, _targetAnchorId, signal) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  },
};
