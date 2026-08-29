import { createReview } from "@/src/domain/commands/create-review";
import { DomainError } from "@/src/domain/errors";
import { sceneStore } from "@/src/domain/scene-store";
import { TOOL_INPUT_SCHEMAS, getReviewToolInputSchema } from "@/src/webmcp/contracts";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";
import { safeToolError } from "@/src/webmcp/tools/common";

export function createGetReviewTool(): WebMCP.ModelContextTool {
  return {
    name: TOOL_NAMES.getReview,
    title: "Review the exact desk kit",
    description: "Return exact current variants, quantities, prices, warnings, and review digest.",
    inputSchema: TOOL_INPUT_SCHEMAS.getReview,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      try {
        const parsed = getReviewToolInputSchema.parse(input);
        const current = sceneStore.getState().sceneVersion;
        if (parsed.expectedSceneVersion !== current) {
          throw new DomainError(
            "STALE_SCENE",
            `Scene version ${parsed.expectedSceneVersion} is stale; current version is ${current}.`,
            true,
            current,
          );
        }
        return { ok: true, ...(await createReview()) };
      } catch (error) {
        return safeToolError(error, sceneStore.getState().sceneVersion);
      }
    },
  };
}
