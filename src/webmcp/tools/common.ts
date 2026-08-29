import { ZodError } from "zod";
import { DomainError } from "@/src/domain/errors";

export function safeToolError(error: unknown, fallbackSceneVersion?: number) {
  if (error instanceof DomainError) return error.toPublicResult();
  if (error instanceof ZodError) {
    return {
      ok: false as const,
      code: "INVALID_INPUT",
      message: error.issues[0]?.message ?? "The tool input is invalid.",
      retryable: false,
      ...(fallbackSceneVersion === undefined
        ? {}
        : { sceneVersion: fallbackSceneVersion }),
    };
  }
  return {
    ok: false as const,
    code: "INVALID_INPUT",
    message: "The tool could not complete the requested scene operation.",
    retryable: false,
    ...(fallbackSceneVersion === undefined ? {} : { sceneVersion: fallbackSceneVersion }),
  };
}

export function sanitizeReason(reason: string) {
  return reason
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function waitForVisibleState() {
  if (typeof requestAnimationFrame !== "function") return;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
