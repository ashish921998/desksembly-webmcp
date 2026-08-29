export const DOMAIN_ERROR_CODES = [
  "UNSUPPORTED_WEBMCP",
  "INVALID_INPUT",
  "INVALID_PHASE",
  "STALE_SCENE",
  "UNKNOWN_PRODUCT",
  "UNAVAILABLE_VARIANT",
  "MARKET_UNAVAILABLE",
  "BUDGET_CONFLICT",
  "ANCHOR_CONFLICT",
  "LOCKED_ITEM_CONFLICT",
  "NO_VALID_PLAN",
  "PROPOSAL_MISMATCH",
  "REVIEW_REQUIRED",
  "REVIEW_EXPIRED",
  "REVIEW_MISMATCH",
  "CART_PARTIAL_FAILURE",
  "CART_MISMATCH",
  "OPERATION_CANCELLED",
  "COMMERCE_UNAVAILABLE",
] as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[number];

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly sceneVersion?: number,
  ) {
    super(message);
    this.name = "DomainError";
  }

  toPublicResult() {
    return {
      ok: false as const,
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      ...(this.sceneVersion === undefined ? {} : { sceneVersion: this.sceneVersion }),
    };
  }
}

export function cancelledError(sceneVersion: number) {
  return new DomainError(
    "OPERATION_CANCELLED",
    "The scene operation was cancelled and the prior stable scene was restored.",
    true,
    sceneVersion,
  );
}
