import { previewPlan } from "@/src/domain/commands/preview-plan";
import { stagePlan } from "@/src/domain/commands/stage-plan";
import { sceneStore } from "@/src/domain/scene-store";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import { CONSTRAINT_SHOCK_SELECTIONS } from "@/src/demo/scenario";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";

const shockGateway = new MockCommerceGateway();

export async function runConstraintShock(signal?: AbortSignal) {
  const state = sceneStore.getState();
  const lockedMerchandise = new Set(
    Object.values(state.itemsById)
      .filter((item) => item.locked)
      .map((item) => item.variant.merchandiseId),
  );
  const proposal = await previewPlan(
    {
      expectedSceneVersion: state.sceneVersion,
      constraints: {
        ...state.constraints,
        budget: { amount: "300.00", currencyCode: "USD" },
        deskWidthCm: 90,
        market: "US",
      },
      selections: CONSTRAINT_SHOCK_SELECTIONS.filter(
        (selection) => !lockedMerchandise.has(selection.merchandiseId),
      ),
    },
    { catalog: shockGateway, signal },
  );
  const result = await stagePlan(
    {
      expectedSceneVersion: state.sceneVersion + 1,
      proposalId: proposal.proposalId,
      proposalDigest: proposal.digest,
    },
    { animation: worldAnimationController, signal },
  );
  return { proposal, result };
}
