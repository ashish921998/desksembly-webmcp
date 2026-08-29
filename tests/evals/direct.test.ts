import { describe, expect, it } from "vitest";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import { createDeskBuilderTools } from "@/src/webmcp/register-tools";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";

describe("direct scene prompt eval", () => {
  const tools = createDeskBuilderTools({ catalog: new MockCommerceGateway() });

  it("routes a direct read prompt to get_scene without commerce mutation", () => {
    const prompt = "Show me the current desk world.";
    const selected = /current desk world/i.test(prompt) ? TOOL_NAMES.getScene : null;
    expect(selected).toBe(TOOL_NAMES.getScene);
    expect(tools.find((tool) => tool.name === selected)?.annotations).toMatchObject({
      readOnlyHint: true,
      untrustedContentHint: false,
    });
  });

  it("keeps the registry limited to five scene-owned capabilities", () => {
    expect(tools.map((tool) => tool.name)).toEqual([
      TOOL_NAMES.getScene,
      TOOL_NAMES.previewPlan,
      TOOL_NAMES.stagePlan,
      TOOL_NAMES.moveProduct,
      TOOL_NAMES.getReview,
    ]);
    expect(tools.every((tool) => tool.description.length < 120)).toBe(true);
  });
});
