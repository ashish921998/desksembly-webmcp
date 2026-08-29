import { getScene } from "@/src/domain/commands/get-scene";
import { sceneStore } from "@/src/domain/scene-store";
import { selectAvailableAnchors } from "@/src/domain/selectors";
import { TOOL_INPUT_SCHEMAS, getSceneToolInputSchema } from "@/src/webmcp/contracts";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";
import { safeToolError } from "@/src/webmcp/tools/common";

export function createGetSceneTool(): WebMCP.ModelContextTool {
  return {
    name: TOOL_NAMES.getScene,
    title: "Read miniature desk scene",
    description: "Return the latest compact desk scene, constraints, locks, and anchors.",
    inputSchema: TOOL_INPUT_SCHEMAS.getScene,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute(input) {
      try {
        getSceneToolInputSchema.parse(input);
        const snapshot = getScene();
        return {
          ok: true,
          sceneVersion: snapshot.sceneVersion,
          phase: snapshot.phase,
          constraints: snapshot.constraints,
          items: snapshot.items.map((item) => ({
            id: item.id,
            merchandiseId: item.variant.merchandiseId,
            role: item.variant.role,
            anchorId: item.anchorId,
            locked: item.locked,
            owner: item.owner,
            status: item.status,
            price: item.variant.price,
          })),
          availableAnchors: selectAvailableAnchors(sceneStore.getState()),
          total: snapshot.total,
        };
      } catch (error) {
        return safeToolError(error, sceneStore.getState().sceneVersion);
      }
    },
  };
}
