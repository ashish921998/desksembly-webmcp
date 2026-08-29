import { previewPlan } from "@/src/domain/commands/preview-plan";
import { resetWorld } from "@/src/domain/commands/reset-world";
import { stagePlan } from "@/src/domain/commands/stage-plan";
import { sceneStore } from "@/src/domain/scene-store";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import { STARTER_SELECTIONS } from "@/src/demo/scenario";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";

const demoGateway = new MockCommerceGateway();

export async function runDeterministicDemo(signal?: AbortSignal) {
  const current = sceneStore.getState();
  if (Object.keys(current.itemsById).length > 1 || current.proposal) {
    resetWorld();
    worldAnimationController.reset();
  }
  const fresh = sceneStore.getState();
  const proposal = await previewPlan(
    {
      expectedSceneVersion: fresh.sceneVersion,
      constraints: fresh.constraints,
      selections: STARTER_SELECTIONS,
    },
    { catalog: demoGateway, signal },
  );
  return stagePlan(
    {
      expectedSceneVersion: fresh.sceneVersion + 1,
      proposalId: proposal.proposalId,
      proposalDigest: proposal.digest,
    },
    { animation: worldAnimationController, signal },
  );
}
