import { describe, expect, it } from "vitest";
import {
  CONSTRAINT_SHOCK_PROMPT,
  CONSTRAINT_SHOCK_SELECTIONS,
} from "@/src/demo/scenario";
import { TOOL_NAMES } from "@/src/webmcp/tool-names";

describe("US constraint revision eval", () => {
  it("requires a fresh scene read after a human edit", () => {
    expect(CONSTRAINT_SHOCK_PROMPT).toMatch(/90 cm/);
    expect(CONSTRAINT_SHOCK_PROMPT).toMatch(/\$300/);
    expect(CONSTRAINT_SHOCK_PROMPT).toMatch(/US/);
    expect([
      TOOL_NAMES.getScene,
      "search_catalog",
      "get_product",
      TOOL_NAMES.previewPlan,
      TOOL_NAMES.stagePlan,
    ]).toEqual(expect.arrayContaining([TOOL_NAMES.getScene, TOOL_NAMES.previewPlan]));
  });

  it("replaces only the wide-desk decor role", () => {
    expect(CONSTRAINT_SHOCK_SELECTIONS.map((selection) => selection.role)).toEqual([
      "display",
      "input",
      "audio",
      "decor",
    ]);
    expect(CONSTRAINT_SHOCK_SELECTIONS[3].preferredAnchorId).toBe(
      "organization-left",
    );
  });
});
