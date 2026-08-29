import type { SceneAnimationPort } from "@/src/domain/ports";
import { moveProduct } from "@/src/domain/commands/move-product";
import { sceneStore } from "@/src/domain/scene-store";
import { TOOL_INPUT_SCHEMAS, moveProductToolInputSchema } from "@/src/webmcp/contracts";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";
import { safeToolError, waitForVisibleState } from "@/src/webmcp/tools/common";

export function createMoveProductTool(
  animation?: SceneAnimationPort,
): WebMCP.ModelContextTool {
  return {
    name: TOOL_NAMES.moveProduct,
    title: "Move one desk product",
    description: "Move one unlocked product to a compatible unoccupied desk anchor.",
    inputSchema: TOOL_INPUT_SCHEMAS.moveProduct,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input, options) {
      try {
        const parsed = moveProductToolInputSchema.parse(input);
        const result = await moveProduct(parsed, {
          animation,
          signal: options?.signal,
        });
        await waitForVisibleState();
        return { ok: true, ...result };
      } catch (error) {
        return safeToolError(error, sceneStore.getState().sceneVersion);
      }
    },
  };
}
