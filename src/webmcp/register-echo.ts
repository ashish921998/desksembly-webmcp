import { auditToolNames, assertUniqueToolName } from "@/src/webmcp/tool-audit";
import { ECHO_TOOL_NAME } from "@/src/webmcp/tool-names";

const ECHO_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["message"],
  properties: {
    message: {
      type: "string",
      minLength: 1,
      maxLength: 160,
      description: "Short text to return unchanged for coexistence testing.",
    },
  },
} as const;

function readEchoMessage(input: Record<string, unknown>) {
  const message = input.message;
  if (typeof message !== "string" || message.length < 1 || message.length > 160) {
    throw new TypeError("message must be a string between 1 and 160 characters");
  }
  return message;
}

export async function registerEchoTool(
  modelContext: WebMCP.ModelContext,
  controller: AbortController,
) {
  const before = await auditToolNames(modelContext);
  assertUniqueToolName(before, ECHO_TOOL_NAME);

  if (controller.signal.aborted) {
    throw new DOMException("Registration cancelled", "AbortError");
  }

  await modelContext.registerTool(
    {
      name: ECHO_TOOL_NAME,
      title: "Desk builder echo",
      description:
        "Return short text unchanged to verify the desk builder tool channel.",
      inputSchema: ECHO_INPUT_SCHEMA,
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (input, options) => {
        // The current in-app browser omits the callback options object even
        // though the latest draft marks it required. Keep cancellation when
        // present and remain compatible with that judged runtime.
        if (options?.signal?.aborted) {
          throw new DOMException("Echo cancelled", "AbortError");
        }
        const message = readEchoMessage(input);
        return { ok: true, echoed: message, tool: ECHO_TOOL_NAME };
      },
    },
    { signal: controller.signal },
  );

  const after = await auditToolNames(modelContext);
  if (after.duplicates.length > 0) {
    controller.abort();
    throw new Error(`Duplicate WebMCP tool names: ${after.duplicates.join(", ")}`);
  }
  return after;
}
