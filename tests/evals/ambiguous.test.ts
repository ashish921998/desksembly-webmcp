import { describe, expect, it } from "vitest";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";

describe("ambiguous revision prompt", () => {
  it("reads current state before proposing and avoids consequential tools", () => {
    const prompt = "Make the desk calmer and less expensive.";
    expect(prompt).toMatch(/calmer/);
    const expected = [TOOL_NAMES.getScene, "search_catalog", TOOL_NAMES.previewPlan];
    expect(expected[0]).toBe(TOOL_NAMES.getScene);
    expect(expected).not.toContain("add_to_cart");
    expect(expected).not.toContain(TOOL_NAMES.stagePlan);
  });
});
