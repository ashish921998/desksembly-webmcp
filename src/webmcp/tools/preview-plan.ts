import type { CatalogPort } from "@/src/domain/ports";
import { previewPlan } from "@/src/domain/commands/preview-plan";
import { sceneStore } from "@/src/domain/scene-store";
import { selectItems } from "@/src/domain/selectors";
import { moneyToMinorUnits } from "@/src/domain/constraints";
import { TOOL_INPUT_SCHEMAS, previewPlanToolInputSchema } from "@/src/webmcp/contracts";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";
import {
  safeToolError,
  sanitizeReason,
  waitForVisibleState,
} from "@/src/webmcp/tools/common";

export function createPreviewPlanTool(catalog: CatalogPort): WebMCP.ModelContextTool {
  return {
    name: TOOL_NAMES.previewPlan,
    title: "Preview a desk plan",
    description: "Validate exact product variants and show a reversible desk proposal.",
    inputSchema: TOOL_INPUT_SCHEMAS.previewPlan,
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) {
      try {
        const parsed = previewPlanToolInputSchema.parse(input);
        const proposal = await previewPlan(
          {
            ...parsed,
            selections: parsed.selections.map((selection) => ({
              ...selection,
              reason: sanitizeReason(selection.reason),
            })),
          },
          { catalog, signal: options?.signal },
        );
        await waitForVisibleState();
        const lockedTotal = selectItems(sceneStore.getState())
          .filter((item) => item.locked)
          .reduce(
            (sum, item) => sum + moneyToMinorUnits(item.variant.price.amount),
            0,
          );
        const proposalTotal = proposal.variants.reduce(
          (sum, variant) => sum + moneyToMinorUnits(variant.price.amount),
          lockedTotal,
        );
        return {
          ok: true,
          sceneVersion: sceneStore.getState().sceneVersion,
          proposalId: proposal.proposalId,
          accepted: proposal.placements.map((placement) => ({
            merchandiseId: placement.merchandiseId,
            anchorId: placement.anchorId,
          })),
          rejected: proposal.rejected,
          total: {
            amount: (proposalTotal / 100).toFixed(2),
            currencyCode: proposal.constraints.budget.currencyCode,
          },
          digest: proposal.digest,
        };
      } catch (error) {
        return safeToolError(error, sceneStore.getState().sceneVersion);
      }
    },
  };
}
