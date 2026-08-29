import type { CatalogPort, SceneAnimationPort } from "@/src/domain/ports";
import { DESKBUILDER_TOOL_NAMES } from "@/src/webmcp/tool-names";
import { auditToolNames, assertUniqueToolName } from "@/src/webmcp/tool-audit";
import { createGetSceneTool } from "@/src/webmcp/tools/get-scene";
import { createPreviewPlanTool } from "@/src/webmcp/tools/preview-plan";
import { createStagePlanTool } from "@/src/webmcp/tools/stage-plan";
import { createMoveProductTool } from "@/src/webmcp/tools/move-product";
import { createGetReviewTool } from "@/src/webmcp/tools/get-review";

export function createDeskBuilderTools(dependencies: {
  catalog: CatalogPort;
  animation?: SceneAnimationPort;
}) {
  return [
    createGetSceneTool(),
    createPreviewPlanTool(dependencies.catalog),
    createStagePlanTool(dependencies.animation),
    createMoveProductTool(dependencies.animation),
    createGetReviewTool(),
  ];
}

export async function registerDeskBuilderTools(
  modelContext: WebMCP.ModelContext,
  controller: AbortController,
  dependencies: { catalog: CatalogPort; animation?: SceneAnimationPort },
) {
  const before = await auditToolNames(modelContext);
  for (const name of DESKBUILDER_TOOL_NAMES) assertUniqueToolName(before, name);

  const tools = createDeskBuilderTools(dependencies);
  for (const tool of tools) {
    if (controller.signal.aborted) {
      throw new DOMException("Tool registration cancelled", "AbortError");
    }
    await modelContext.registerTool(tool, { signal: controller.signal });
  }

  const after = await auditToolNames(modelContext);
  if (after.duplicates.length) {
    controller.abort();
    throw new Error(`Duplicate WebMCP tool names: ${after.duplicates.join(", ")}`);
  }
  return after;
}
