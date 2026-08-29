export type WebMcpCapability = "checking" | "supported" | "unsupported" | "error";

export function getModelContext() {
  if (typeof document === "undefined") return undefined;
  if (typeof document.modelContext?.registerTool !== "function") return undefined;
  return document.modelContext;
}
