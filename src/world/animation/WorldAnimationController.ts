import { gsap } from "gsap";
import { createStore } from "zustand/vanilla";
import type { SceneAnimationPort } from "@/src/domain/ports";
import { sceneStore } from "@/src/domain/scene-store";
import type { SceneItem } from "@/src/domain/types";

export type ParcelStatus = "arriving" | "opening" | "revealed" | "placing";

export type ParcelVisual = {
  id: string;
  item: SceneItem;
  status: ParcelStatus;
  sequence: number;
};

export type AnimationReceipt = {
  id: string;
  label: string;
  status: "pending" | "success" | "error";
};

type AnimationState = {
  active: boolean;
  parcels: ParcelVisual[];
  receipts: AnimationReceipt[];
  lastResult: "idle" | "success" | "cancelled" | "error";
};

const animationStore = createStore<AnimationState>(() => ({
  active: false,
  parcels: [],
  receipts: [],
  lastResult: "idle",
}));

export const worldAnimationStore = {
  getState: animationStore.getState,
  subscribe: animationStore.subscribe,
};

function patchState(patch: Partial<AnimationState>) {
  animationStore.setState((state) => ({ ...state, ...patch }));
}

function updateParcel(id: string, status: ParcelStatus) {
  animationStore.setState((state) => ({
    ...state,
    parcels: state.parcels.map((parcel) =>
      parcel.id === id ? { ...parcel, status } : parcel,
    ),
  }));
}

function finishReceipt(id: string, status: AnimationReceipt["status"]) {
  animationStore.setState((state) => ({
    ...state,
    receipts: state.receipts.map((receipt) =>
      receipt.id === id ? { ...receipt, status } : receipt,
    ),
  }));
}

async function runTimeline(options: {
  signal: AbortSignal;
  duration: number;
  steps: Array<() => void>;
}) {
  await new Promise<void>((resolve, reject) => {
    const progress = { value: 0 };
    const timeline = gsap.timeline({ paused: true, onComplete: resolve });
    for (const step of options.steps) {
      timeline.call(step).to(progress, {
        value: progress.value + 1,
        duration: options.duration,
        ease: "power2.inOut",
      });
    }
    const abort = () => {
      timeline.kill();
      reject(new DOMException("Animation cancelled", "AbortError"));
    };
    options.signal.addEventListener("abort", abort, { once: true });
    if (options.signal.aborted) {
      abort();
      return;
    }
    timeline.eventCallback("onComplete", () => {
      options.signal.removeEventListener("abort", abort);
      resolve();
    });
    timeline.play();
  });
}

class WorldAnimationController implements SceneAnimationPort {
  private activeController: AbortController | null = null;

  async stage(items: SceneItem[], externalSignal?: AbortSignal) {
    if (this.activeController) {
      throw new Error("A world animation transaction is already active.");
    }
    const controller = new AbortController();
    this.activeController = controller;
    const forwardAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", forwardAbort, { once: true });
    const reduced = sceneStore.getState().reducedMotion;
    const duration = reduced ? 0.025 : 0.22;

    patchState({ active: true, parcels: [], receipts: [], lastResult: "idle" });
    try {
      for (const [index, item] of items.entries()) {
        const parcelId = `parcel-${item.id}`;
        const receiptId = `stage-${index}-${item.id}`;
        animationStore.setState((state) => ({
          ...state,
          parcels: [
            ...state.parcels,
            { id: parcelId, item, status: "arriving", sequence: index },
          ],
          receipts: [
            ...state.receipts,
            { id: receiptId, label: `Stage ${item.variant.title}`, status: "pending" },
          ],
        }));
        await runTimeline({
          signal: controller.signal,
          duration,
          steps: reduced
            ? [
                () => updateParcel(parcelId, "revealed"),
                () => updateParcel(parcelId, "placing"),
              ]
            : [
                () => updateParcel(parcelId, "arriving"),
                () => updateParcel(parcelId, "opening"),
                () => updateParcel(parcelId, "revealed"),
                () => updateParcel(parcelId, "placing"),
              ],
        });
        finishReceipt(receiptId, "success");
        animationStore.setState((state) => ({
          ...state,
          parcels: state.parcels.filter((parcel) => parcel.id !== parcelId),
        }));
      }
      patchState({ active: false, parcels: [], lastResult: "success" });
    } catch (error) {
      patchState({
        active: false,
        parcels: [],
        lastResult:
          error instanceof DOMException && error.name === "AbortError"
            ? "cancelled"
            : "error",
        receipts: animationStore
          .getState()
          .receipts.map((receipt) =>
            receipt.status === "pending" ? { ...receipt, status: "error" } : receipt,
          ),
      });
      throw error;
    } finally {
      externalSignal?.removeEventListener("abort", forwardAbort);
      this.activeController = null;
    }
  }

  async move(item: SceneItem, _targetAnchorId: string, signal?: AbortSignal) {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    signal?.addEventListener("abort", forwardAbort, { once: true });
    const receipt: AnimationReceipt = {
      id: `move-${item.id}-${Date.now()}`,
      label: `Move ${item.variant.title}`,
      status: "pending",
    };
    patchState({ receipts: [...animationStore.getState().receipts, receipt] });
    try {
      await runTimeline({
        signal: controller.signal,
        duration: sceneStore.getState().reducedMotion ? 0.02 : 0.18,
        steps: [() => undefined],
      });
      finishReceipt(receipt.id, "success");
    } finally {
      signal?.removeEventListener("abort", forwardAbort);
    }
  }

  cancel() {
    this.activeController?.abort();
  }

  reset() {
    this.cancel();
    patchState({
      active: false,
      parcels: [],
      receipts: [],
      lastResult: "idle",
    });
  }
}

export const worldAnimationController = new WorldAnimationController();
