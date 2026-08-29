import { createStore } from "zustand/vanilla";
import type {
  ProductVariantRef,
  SceneItem,
  SceneStoreState,
  WorldConstraints,
} from "@/src/domain/types";

export const DEFAULT_CONSTRAINTS: WorldConstraints = {
  budget: { amount: "350.00", currencyCode: "USD" },
  deskWidthCm: 120,
  market: "US",
  styleTags: ["cozy"],
  disallowedTags: ["RGB"],
  minItems: 3,
  maxItems: 5,
};

export const ORANGE_LAMP_VARIANT: ProductVariantRef = {
  merchandiseId: "gid://shopify/ProductVariant/90000000000001",
  productId: "gid://shopify/Product/90000000000001",
  handle: "orange-desk-lamp",
  title: "Orange desk lamp",
  variantTitle: "Warm orange",
  role: "lamp",
  imageUrl: null,
  price: { amount: "39.00", currencyCode: "USD" },
  available: true,
  market: "US",
  dimensions: { widthCm: 20, depthCm: 18, heightCm: 38 },
  tags: ["cozy", "warm"],
};

export function createInitialLamp(): SceneItem {
  return {
    id: "lamp-orange",
    variant: structuredClone(ORANGE_LAMP_VARIANT),
    anchorId: "lamp-left",
    status: "confirmed",
    owner: "human",
    locked: true,
    reason: "Kept by the shopper as the warm focal point.",
  };
}

export function createInitialSceneState(options?: {
  sceneVersion?: number;
  cartSnapshot?: SceneStoreState["cartSnapshot"];
  reducedMotion?: boolean;
}): SceneStoreState {
  const lamp = createInitialLamp();
  return {
    sceneVersion: options?.sceneVersion ?? 0,
    phase: "ready",
    constraints: structuredClone(DEFAULT_CONSTRAINTS),
    itemsById: { [lamp.id]: lamp },
    proposal: null,
    review: null,
    approval: null,
    activityReceipts: [],
    cartSnapshot: options?.cartSnapshot ?? null,
    selectedItemId: null,
    reducedMotion: options?.reducedMotion ?? false,
    webMcpCapability: "checking",
    lastStableSnapshot: null,
  };
}

const internalSceneStore = createStore<SceneStoreState>(() => createInitialSceneState());

export const sceneStore = {
  getState: internalSceneStore.getState,
  subscribe: internalSceneStore.subscribe,
};

export function replaceDomainState(next: SceneStoreState) {
  internalSceneStore.setState(structuredClone(next), true);
}

export function updateDomainState(
  updater: (current: SceneStoreState) => SceneStoreState,
) {
  replaceDomainState(updater(internalSceneStore.getState()));
}

export function resetSceneStoreForTests(state = createInitialSceneState()) {
  replaceDomainState(state);
}
