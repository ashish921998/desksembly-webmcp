import { PROJECT_TOOL_PREFIX } from "@/src/webmcp/tool-names";

export type ToolAuditReport = {
  names: string[];
  duplicates: string[];
  projectNames: string[];
  nativeNames: string[];
};

export async function auditToolNames(
  modelContext: WebMCP.ModelContext,
): Promise<ToolAuditReport> {
  const tools = await modelContext.getTools();
  const names = tools.map((tool) => tool.name).sort();
  const counts = new Map<string, number>();

  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);

  return {
    names,
    duplicates: [...counts]
      .filter(([, count]) => count > 1)
      .map(([name]) => name)
      .sort(),
    projectNames: names.filter((name) => name.startsWith(PROJECT_TOOL_PREFIX)),
    nativeNames: names.filter((name) => !name.startsWith(PROJECT_TOOL_PREFIX)),
  };
}

export function assertUniqueToolName(report: ToolAuditReport, name: string) {
  if (report.names.includes(name)) {
    throw new Error(`WebMCP tool name already registered: ${name}`);
  }
}
