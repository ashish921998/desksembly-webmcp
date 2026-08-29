import { describe, expect, it } from "vitest";
import { STARTER_PROMPT, STARTER_SELECTIONS } from "@/src/demo/scenario";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";

describe("starter build prompt eval", () => {
  it("requires Shopify discovery before scene preview and stage", () => {
    expect(STARTER_PROMPT).toMatch(/\$350/);
    expect(STARTER_PROMPT).toMatch(/US/);
    expect(STARTER_PROMPT).toMatch(/No RGB/);
    expect(STARTER_PROMPT).toMatch(/orange lamp/);
    expect(STARTER_SELECTIONS).toHaveLength(3);

    const expectedToolFamilies = [
      "search_catalog",
      "get_product",
      TOOL_NAMES.getScene,
      TOOL_NAMES.previewPlan,
      TOOL_NAMES.stagePlan,
    ];
    expect(expectedToolFamilies).not.toContain("add_to_cart");
    expect(expectedToolFamilies).not.toContain("update_cart_lines");
  });

  it("passes exact merchandise IDs and the required desk roles", () => {
    expect(STARTER_SELECTIONS.map((selection) => selection.role)).toEqual([
      "display",
      "input",
      "audio",
    ]);
    expect(
      STARTER_SELECTIONS.every((selection) =>
        selection.merchandiseId.startsWith("gid://shopify/ProductVariant/"),
      ),
    ).toBe(true);
  });
});
