/// <reference types="webmcp-types" />

declare namespace WebMCP {
  interface ModelContext {
    executeTool(
      tool: RegisteredTool,
      inputObject?: Record<string, unknown>,
      options?: { signal?: AbortSignal },
    ): Promise<string>;
  }
}

interface Window {
  __deskbuilderToolAudit?: {
    names: string[];
    duplicates: string[];
    projectNames: string[];
    nativeNames: string[];
  };
}
