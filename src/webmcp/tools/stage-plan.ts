import type { SceneAnimationPort } from "@/src/domain/ports";
import { stagePlan } from "@/src/domain/commands/stage-plan";
import { sceneStore } from "@/src/domain/scene-store";
import { selectTotal } from "@/src/domain/selectors";
import { TOOL_INPUT_SCHEMAS, stagePlanToolInputSchema } from "@/src/webmcp/contracts";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";
import { safeToolError, waitForVisibleState } from "@/src/webmcp/tools/common";

export function createStagePlanTool(
  animation?: SceneAnimationPort,
): WebMCP.ModelContextTool {
  return {
    name: TOOL_NAMES.stagePlan,
    title: "Stage the current desk plan",
    description: "Confirm the current proposal through cancellable visible placement.",
    inputSchema: TOOL_INPUT_SCHEMAS.stagePlan,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input, options) {
      try {
        const parsed = stagePlanToolInputSchema.parse(input);
        const result = await stagePlan(parsed, {
          animation,
          signal: options?.signal,
        });
        await waitForVisibleState();
        return { ok: true, ...result, total: selectTotal(sceneStore.getState()) };
      } catch (error) {
        return safeToolError(error, sceneStore.getState().sceneVersion);
      }
    },
  };
}
