import { describe, expect, it } from "vitest";
import { SHELL_DESCRIPTION, SHELL_TITLE } from "@/src/experience/shell-copy";

describe("storefront shell copy", () => {
  it("keeps the working descriptor and shared-workspace promise visible", () => {
    expect(SHELL_TITLE).toMatch(/desk/i);
    expect(SHELL_DESCRIPTION).toMatch(/agent-ready desk/i);
    expect(SHELL_DESCRIPTION).toMatch(/human choice preserved/i);
  });
});
