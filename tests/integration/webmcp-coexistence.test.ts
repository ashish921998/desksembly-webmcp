import { describe, expect, it, vi } from "vitest";
import { auditToolNames, assertUniqueToolName } from "@/src/webmcp/tool-audit";

function createModelContext(names: string[]) {
  return {
    getTools: vi.fn(async () =>
      names.map((name) => ({
        name,
        title: name,
        description: name,
        origin: "https://example.test",
        window: {} as Window,
      })),
    ),
    registerTool: vi.fn(),
    executeTool: vi.fn(),
    ontoolchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies WebMCP.ModelContext;
}

describe("WebMCP inventory audit", () => {
  it("separates Shopify and project-prefixed names", async () => {
    const report = await auditToolNames(
      createModelContext(["get_cart", "search_catalog", "deskbuilder.get_scene"]),
    );
    expect(report.nativeNames).toEqual(["get_cart", "search_catalog"]);
    expect(report.projectNames).toEqual(["deskbuilder.get_scene"]);
    expect(report.duplicates).toEqual([]);
  });

  it("detects collisions before production registration", async () => {
    const report = await auditToolNames(
      createModelContext(["get_cart", "deskbuilder.get_scene", "deskbuilder.get_scene"]),
    );
    expect(report.duplicates).toEqual(["deskbuilder.get_scene"]);
    expect(() => assertUniqueToolName(report, "deskbuilder.get_scene")).toThrow(
      /already registered/,
    );
  });
});
