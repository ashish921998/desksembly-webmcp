import { describe, expect, it, vi } from "vitest";
import { registerEchoTool } from "@/src/webmcp/register-echo";
import { auditToolNames } from "@/src/webmcp/tool-audit";
import { ECHO_TOOL_NAME } from "@/src/webmcp/tool-names";

function createModelContext(nativeNames = ["search_catalog", "get_product", "get_cart"]) {
  const tools = new Map<string, WebMCP.ModelContextTool>();
  for (const name of nativeNames) {
    tools.set(name, {
      name,
      description: `Native ${name}`,
      execute: vi.fn(),
    });
  }

  const modelContext = {
    getTools: vi.fn(async () =>
      [...tools.values()].map((tool) => ({
        name: tool.name,
        title: tool.title ?? tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        origin: "https://example.test",
        window: {} as Window,
      })),
    ),
    registerTool: vi.fn(async (tool: WebMCP.ModelContextTool, options) => {
      if (tools.has(tool.name)) throw new Error("duplicate tool");
      tools.set(tool.name, tool);
      options?.signal?.addEventListener("abort", () => tools.delete(tool.name), {
        once: true,
      });
    }),
    executeTool: vi.fn(),
    ontoolchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies WebMCP.ModelContext;

  return { modelContext, tools };
}

describe("WebMCP coexistence spike", () => {
  it("registers a unique prefixed echo tool beside native Shopify tools", async () => {
    const { modelContext, tools } = createModelContext();
    const controller = new AbortController();

    const report = await registerEchoTool(modelContext, controller);
    const echo = tools.get(ECHO_TOOL_NAME);

    expect(report.nativeNames).toEqual(["get_cart", "get_product", "search_catalog"]);
    expect(report.projectNames).toEqual([ECHO_TOOL_NAME]);
    expect(report.duplicates).toEqual([]);
    const result = await echo?.execute(
      { message: "coexists" },
      { signal: new AbortController().signal },
    );
    expect(result).toEqual({ ok: true, echoed: "coexists", tool: ECHO_TOOL_NAME });
    expect(
      await echo?.execute(
        { message: "runtime without callback options" },
        undefined as never,
      ),
    ).toEqual({
      ok: true,
      echoed: "runtime without callback options",
      tool: ECHO_TOOL_NAME,
    });

    controller.abort();
    expect((await auditToolNames(modelContext)).projectNames).toEqual([]);
  });

  it("rejects a duplicate project tool before registration", async () => {
    const { modelContext } = createModelContext([ECHO_TOOL_NAME]);
    await expect(
      registerEchoTool(modelContext, new AbortController()),
    ).rejects.toThrow(/already registered/);
  });
});
