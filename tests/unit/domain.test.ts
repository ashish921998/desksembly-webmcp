import { beforeEach, describe, expect, it } from "vitest";
import { approveReview, consumeReviewApproval } from "@/src/domain/commands/approve-review";
import { createReview } from "@/src/domain/commands/create-review";
import { getScene } from "@/src/domain/commands/get-scene";
import { moveProduct } from "@/src/domain/commands/move-product";
import { previewPlan } from "@/src/domain/commands/preview-plan";
import { resetWorld } from "@/src/domain/commands/reset-world";
import { stagePlan } from "@/src/domain/commands/stage-plan";
import { findConstraintShockItems } from "@/src/domain/constraints";
import { DomainError } from "@/src/domain/errors";
import type { CatalogPort, SceneAnimationPort } from "@/src/domain/ports";
import {
  DEFAULT_CONSTRAINTS,
  resetSceneStoreForTests,
  sceneStore,
  updateDomainState,
} from "@/src/domain/scene-store";
import type { ProductVariantRef, WorldConstraints } from "@/src/domain/types";

const display: ProductVariantRef = {
  merchandiseId: "gid://shopify/ProductVariant/display-1",
  productId: "gid://shopify/Product/display",
  handle: "compact-display",
  title: "Compact display",
  variantTitle: "24 inch",
  role: "display",
  imageUrl: null,
  price: { amount: "139.00", currencyCode: "USD" },
  available: true,
  market: "US",
  dimensions: { widthCm: 50, depthCm: 20, heightCm: 36 },
  tags: ["calm"],
};

const keyboard: ProductVariantRef = {
  merchandiseId: "gid://shopify/ProductVariant/input-1",
  productId: "gid://shopify/Product/input",
  handle: "quiet-keyboard",
  title: "Quiet keyboard",
  variantTitle: "Sand",
  role: "input",
  imageUrl: null,
  price: { amount: "49.00", currencyCode: "USD" },
  available: true,
  market: "US",
  dimensions: { widthCm: 38, depthCm: 14, heightCm: 4 },
  tags: ["quiet"],
};

const decor: ProductVariantRef = {
  merchandiseId: "gid://shopify/ProductVariant/decor-1",
  productId: "gid://shopify/Product/decor",
  handle: "desk-plant",
  title: "Desk plant",
  variantTitle: "Terracotta",
  role: "decor",
  imageUrl: null,
  price: { amount: "12.00", currencyCode: "USD" },
  available: true,
  market: "US",
  dimensions: { widthCm: 14, depthCm: 14, heightCm: 22 },
  tags: ["cozy"],
};

function catalogFor(...variants: ProductVariantRef[]): CatalogPort {
  return {
    async getProductsByMerchandiseIds(ids) {
      return variants.filter((variant) => ids.includes(variant.merchandiseId));
    },
  };
}

function selections(options?: { includeDecor?: boolean; displayAnchor?: string }) {
  return [
    {
      merchandiseId: display.merchandiseId,
      role: "display" as const,
      preferredAnchorId: options?.displayAnchor ?? "display-center",
      reason: "Keeps the primary screen compact.",
    },
    options?.includeDecor
      ? {
          merchandiseId: decor.merchandiseId,
          role: "decor" as const,
          preferredAnchorId: "decor-back",
          reason: "Adds a small warm accent.",
        }
      : {
          merchandiseId: keyboard.merchandiseId,
          role: "input" as const,
          preferredAnchorId: "input-front",
          reason: "Keeps typing quiet and compact.",
        },
  ];
}

async function previewAndStage(options?: { includeDecor?: boolean }) {
  const variants = options?.includeDecor ? [display, decor] : [display, keyboard];
  const proposal = await previewPlan(
    {
      expectedSceneVersion: 0,
      constraints: DEFAULT_CONSTRAINTS,
      selections: selections(options),
    },
    { catalog: catalogFor(...variants) },
  );
  await stagePlan({
    expectedSceneVersion: 1,
    proposalId: proposal.proposalId,
    proposalDigest: proposal.digest,
  });
  return proposal;
}

beforeEach(() => resetSceneStoreForTests());

describe("versioned scene domain", () => {
  it("increments once per successful preview and stage and rejects stale calls", async () => {
    const proposal = await previewPlan(
      {
        expectedSceneVersion: 0,
        constraints: DEFAULT_CONSTRAINTS,
        selections: selections(),
      },
      { catalog: catalogFor(display, keyboard) },
    );
    expect(sceneStore.getState().sceneVersion).toBe(1);

    await expect(
      previewPlan(
        {
          expectedSceneVersion: 0,
          constraints: DEFAULT_CONSTRAINTS,
          selections: selections(),
        },
        { catalog: catalogFor(display, keyboard) },
      ),
    ).rejects.toMatchObject({ code: "STALE_SCENE" });

    await stagePlan({
      expectedSceneVersion: 1,
      proposalId: proposal.proposalId,
      proposalDigest: proposal.digest,
    });
    expect(sceneStore.getState().sceneVersion).toBe(2);
  });

  it("blocks locked moves and invalid anchors", async () => {
    await expect(
      moveProduct({
        expectedSceneVersion: 0,
        itemId: "lamp-orange",
        targetAnchorId: "audio-right",
      }),
    ).rejects.toMatchObject({ code: "LOCKED_ITEM_CONFLICT" });

    await previewAndStage();
    const inputItem = Object.values(sceneStore.getState().itemsById).find(
      (item) => item.variant.role === "input",
    )!;
    await expect(
      moveProduct({
        expectedSceneVersion: 2,
        itemId: inputItem.id,
        targetAnchorId: "lamp-left",
      }),
    ).rejects.toMatchObject({ code: "ANCHOR_CONFLICT" });
  });

  it("rejects budget and market conflicts with safe codes", async () => {
    const lowBudget: WorldConstraints = {
      ...DEFAULT_CONSTRAINTS,
      budget: { amount: "45.00", currencyCode: "USD" },
    };
    await expect(
      previewPlan(
        {
          expectedSceneVersion: 0,
          constraints: lowBudget,
          selections: selections(),
        },
        { catalog: catalogFor(display, keyboard) },
      ),
    ).rejects.toMatchObject({ code: "BUDGET_CONFLICT" });

    const wrongMarket = { ...display, market: "CA" };
    await expect(
      previewPlan(
        {
          expectedSceneVersion: 0,
          constraints: DEFAULT_CONSTRAINTS,
          selections: selections(),
        },
        { catalog: catalogFor(wrongMarket, keyboard) },
      ),
    ).rejects.toMatchObject({ code: "MARKET_UNAVAILABLE" });
  });

  it("restores the stable proposal state when staging is cancelled", async () => {
    const proposal = await previewPlan(
      {
        expectedSceneVersion: 0,
        constraints: DEFAULT_CONSTRAINTS,
        selections: selections(),
      },
      { catalog: catalogFor(display, keyboard) },
    );
    const before = structuredClone(sceneStore.getState());
    const animation: SceneAnimationPort = {
      async stage() {
        throw new DOMException("cancel", "AbortError");
      },
      async move() {},
    };

    await expect(
      stagePlan(
        {
          expectedSceneVersion: 1,
          proposalId: proposal.proposalId,
          proposalDigest: proposal.digest,
        },
        { animation },
      ),
    ).rejects.toMatchObject({ code: "OPERATION_CANCELLED" });
    expect(sceneStore.getState()).toEqual(before);
  });

  it("keeps review digests stable and changes them after material scene changes", async () => {
    await previewAndStage();
    const first = await createReview();
    const second = await createReview();
    expect(second.digest).toBe(first.digest);

    const displayItem = Object.values(sceneStore.getState().itemsById).find(
      (item) => item.variant.role === "display",
    )!;
    await moveProduct({
      expectedSceneVersion: 2,
      itemId: displayItem.id,
      targetAnchorId: "display-wide",
    });
    expect((await createReview()).digest).not.toBe(first.digest);
  });

  it("expires and consumes review approvals exactly once", async () => {
    await previewAndStage();
    const review = await createReview();
    await approveReview(review, { now: 100, ttlMs: 10 });
    expect(() => consumeReviewApproval(review.digest, 110)).toThrowError(
      expect.objectContaining({ code: "REVIEW_EXPIRED" }),
    );

    await approveReview(review, { now: 200, ttlMs: 10 });
    expect(consumeReviewApproval(review.digest, 205)?.consumed).toBe(true);
    expect(() => consumeReviewApproval(review.digest, 206)).toThrowError(
      expect.objectContaining({ code: "REVIEW_REQUIRED" }),
    );
  });

  it("identifies only invalidated items during the 120 cm to 90 cm shock", async () => {
    await previewAndStage({ includeDecor: true });
    const compact = { ...DEFAULT_CONSTRAINTS, deskWidthCm: 90 };
    const invalidated = findConstraintShockItems(getScene().items, compact);
    expect(invalidated.map((item) => item.variant.role)).toEqual(["decor"]);
    expect(invalidated.some((item) => item.locked)).toBe(false);
  });

  it("resets the scene without clearing authoritative cart state", () => {
    updateDomainState((state) => ({
      ...state,
      reducedMotion: true,
      cartSnapshot: {
        id: "cart-1",
        lines: [{ merchandiseId: display.merchandiseId, quantity: 1 }],
        total: { amount: "139.00", currencyCode: "USD" },
        checkoutUrl: "https://checkout.example.test",
      },
    }));
    resetWorld();
    expect(sceneStore.getState().cartSnapshot?.id).toBe("cart-1");
    expect(sceneStore.getState().reducedMotion).toBe(true);
    expect(getScene().items).toHaveLength(1);
    expect(getScene().items[0].locked).toBe(true);
  });

  it("never exposes raw internal errors in public results", () => {
    const error = new DomainError("INVALID_INPUT", "Safe message", false, 7);
    expect(error.toPublicResult()).toEqual({
      ok: false,
      code: "INVALID_INPUT",
      message: "Safe message",
      retryable: false,
      sceneVersion: 7,
    });
  });
});
