export type ReviewedCartLine = {
  merchandiseId: string;
  quantity: number;
};

type ShopifyActions = NonNullable<Window["Shopify"]>["actions"];
type UpdateCartPayload = Parameters<ShopifyActions["updateCart"]>[0];
type UpdateCartResult = Awaited<ReturnType<ShopifyActions["updateCart"]>>;

export type CartGateCode =
  | "APPROVED"
  | "REVIEW_REQUIRED"
  | "REVIEW_EXPIRED"
  | "REVIEW_MISMATCH";

export type CartApprovalSnapshot = {
  digest: string;
  approvedAt: number;
  expiresAt: number;
  consumed: boolean;
};

const DEFAULT_APPROVAL_TTL_MS = 30_000;

export function canonicalizeCartLines(lines: readonly ReviewedCartLine[]) {
  const quantities = new Map<string, number>();
  for (const line of lines) {
    if (!line.merchandiseId || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new TypeError("Reviewed lines require a merchandiseId and positive quantity");
    }
    quantities.set(
      line.merchandiseId,
      (quantities.get(line.merchandiseId) ?? 0) + line.quantity,
    );
  }

  return JSON.stringify(
    [...quantities]
      .map(([merchandiseId, quantity]) => ({ merchandiseId, quantity }))
      .sort((a, b) => a.merchandiseId.localeCompare(b.merchandiseId)),
  );
}

export async function digestCartLines(lines: readonly ReviewedCartLine[]) {
  const bytes = new TextEncoder().encode(canonicalizeCartLines(lines));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function payloadLines(payload: UpdateCartPayload): ReviewedCartLine[] | null {
  const lines = payload?.lines;
  if (!lines?.length) return null;
  const reviewed: ReviewedCartLine[] = [];

  for (const line of lines) {
    if (!line.merchandiseId || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      return null;
    }
    reviewed.push({ merchandiseId: line.merchandiseId, quantity: line.quantity });
  }
  return reviewed;
}

function emptyCart(currencyCode: string): UpdateCartResult["cart"] {
  return {
    id: "",
    totalQuantity: 0,
    cost: { totalAmount: { amount: "0", currencyCode } },
    lines: { nodes: [] },
    discountCodes: [],
  };
}

export function createCartGateController(options?: {
  now?: () => number;
  currencyCode?: string;
}) {
  const now = options?.now ?? Date.now;
  const currencyCode = options?.currencyCode ?? "CAD";
  let approval: CartApprovalSnapshot | null = null;
  let configured = false;

  async function approve(
    lines: readonly ReviewedCartLine[],
    ttlMs = DEFAULT_APPROVAL_TTL_MS,
  ) {
    const approvedAt = now();
    approval = {
      digest: await digestCartLines(lines),
      approvedAt,
      expiresAt: approvedAt + ttlMs,
      consumed: false,
    };
    return { ...approval };
  }

  function clearApproval() {
    approval = null;
  }

  async function verdict(payload: UpdateCartPayload): Promise<CartGateCode> {
    if (!approval || approval.consumed) return "REVIEW_REQUIRED";
    if (approval.expiresAt <= now()) return "REVIEW_EXPIRED";

    const lines = payloadLines(payload);
    if (!lines) return "REVIEW_MISMATCH";
    return (await digestCartLines(lines)) === approval.digest
      ? "APPROVED"
      : "REVIEW_MISMATCH";
  }

  function configure(actions: ShopifyActions, eventTarget: () => EventTarget | null) {
    if (configured) return true;

    const accepted = actions.updateCart.configure({
      eventTarget: () => eventTarget(),
      async handler(defaultHandler, payload) {
        const decision = await verdict(payload);
        if (decision !== "APPROVED") {
          const current = await actions.getCart();
          return {
            cart: current.cart ?? emptyCart(currencyCode),
            userErrors: [
              {
                code: decision,
                field: ["lines"],
                message:
                  decision === "REVIEW_EXPIRED"
                    ? "The reviewed cart approval expired. Review the exact lines again."
                    : decision === "REVIEW_MISMATCH"
                      ? "The requested cart lines do not match the reviewed lines."
                      : "Human approval is required for these exact cart lines.",
              },
            ],
            detail: { gate: { code: decision } },
          };
        }

        const result = await defaultHandler();
        if (!result.userErrors?.length && approval) approval.consumed = true;
        return {
          ...result,
          detail: { ...result.detail, gate: { code: "APPROVED" } },
        };
      },
    });

    configured = accepted || !actions.updateCart.isDefault();
    return configured;
  }

  return {
    approve,
    clearApproval,
    configure,
    getApproval: () => (approval ? { ...approval } : null),
  };
}

export const cartGate = createCartGateController();
