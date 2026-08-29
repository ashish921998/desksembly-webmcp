"use client";

import { useEffect, useMemo, useState } from "react";
import { cartGate, type ReviewedCartLine } from "@/src/commerce/cart-gate";

const TEST_LINE = {
  merchandiseId: "gid://shopify/ProductVariant/43695710404630",
  quantity: 1,
  product: "Slides",
  variant: "Medium",
  price: "CAD 25.00",
} as const;

type ShopifyActions = NonNullable<Window["Shopify"]>["actions"];
type CartSummary = Awaited<ReturnType<ShopifyActions["getCart"]>>["cart"];
type Scenario = "unapproved" | "mismatched" | "expired" | "approved" | "repeated";
type Receipt = { scenario: Scenario; ok: boolean; code: string; quantity: number };

async function waitForShopifyActions(signal: AbortSignal) {
  while (!signal.aborted) {
    if (window.Shopify?.actions) return window.Shopify.actions;
    await new Promise((resolve) => window.setTimeout(resolve, 25));
  }
  throw new DOMException("Shopify runtime unavailable", "AbortError");
}

function reviewedLines(quantity: number = TEST_LINE.quantity): ReviewedCartLine[] {
  return [{ merchandiseId: TEST_LINE.merchandiseId, quantity }];
}

export function CartGatePanel() {
  const [actions, setActions] = useState<ShopifyActions | null>(null);
  const [cart, setCart] = useState<CartSummary>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [eventState, setEventState] = useState("waiting for a cart event");
  const [approvedOnce, setApprovedOnce] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    waitForShopifyActions(controller.signal)
      .then(async (availableActions) => {
        const configured = cartGate.configure(availableActions, () => document);
        if (!configured) throw new Error("Shopify updateCart handler was not accepted");
        const current = await availableActions.getCart();
        if (!active) return;
        setActions(availableActions);
        setCart(current.cart);
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("[deskbuilder] Cart gate bootstrap failed", error);
      });

    const onCartLinesUpdate = (event: Event) => {
      const promise = (event as CustomEvent<{ promise?: Promise<unknown> }>).detail
        ?.promise;
      if (!promise) return;
      setEventState("cart event pending");
      promise.then(
        () => active && setEventState("cart event reconciled"),
        () => active && setEventState("cart event failed"),
      );
    };
    document.addEventListener("shopify:cart:lines-update", onCartLinesUpdate);

    return () => {
      active = false;
      controller.abort();
      document.removeEventListener("shopify:cart:lines-update", onCartLinesUpdate);
    };
  }, []);

  const latest = receipts.at(0);
  const cartLineCount = cart?.lines.nodes.length ?? 0;
  const cartQuantity = cart?.totalQuantity ?? 0;
  const cartTotal = cart?.cost.totalAmount;
  const status = useMemo(
    () => (actions ? "Gate armed before cart calls" : "Arming Shopify cart gate"),
    [actions],
  );

  async function runScenario(scenario: Scenario) {
    if (!actions || busy) return;
    setBusy(true);
    try {
      if (scenario !== "repeated") cartGate.clearApproval();
      let payloadLines = reviewedLines();

      if (scenario === "mismatched") {
        await cartGate.approve(reviewedLines());
        payloadLines = reviewedLines(2);
      } else if (scenario === "expired") {
        await cartGate.approve(reviewedLines(), -1);
      } else if (scenario === "approved") {
        await cartGate.approve(reviewedLines());
      } else if (scenario === "repeated") {
        const approval = cartGate.getApproval();
        if (!approval?.consumed) {
          throw new Error("Run the approved scenario before the repeated-call check");
        }
      }

      const result = await actions.updateCart({ lines: payloadLines });
      const error = result.userErrors?.[0];
      const ok = !error;

      setCart(result.cart);
      setReceipts((current) => [
        {
          scenario,
          ok,
          code: error?.code ?? "APPROVED",
          quantity: result.cart.totalQuantity,
        },
        ...current,
      ].slice(0, 5));

      if (scenario === "approved" && ok) {
        setApprovedOnce(true);
        setDrawerOpen(true);
      }
      if (scenario === "mismatched" || scenario === "expired") {
        cartGate.clearApproval();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="cart-gate" aria-labelledby="cart-gate-title">
      <div className="cart-gate__heading">
        <p className="shell__eyebrow">Integration gate 03</p>
        <h2 id="cart-gate-title">Nothing reaches Shopify before exact review.</h2>
        <p>
          This deliberately plain spike proves the consequential boundary before
          the miniature world or cart animation exists. The test line uses
          Shopify-hosted mock.shop until a development-store credential is added.
        </p>
      </div>

      <div className="cart-gate__card">
        <div className="cart-gate__line">
          <div>
            <strong>{TEST_LINE.product}</strong>
            <small>{TEST_LINE.variant} · quantity {TEST_LINE.quantity}</small>
          </div>
          <span className="cart-gate__price">{TEST_LINE.price}</span>
        </div>

        <div className="cart-gate__actions" aria-label="Cart gate verification controls">
          <button disabled={!actions || busy} onClick={() => runScenario("unapproved")}>
            Try without approval
          </button>
          <button disabled={!actions || busy} onClick={() => runScenario("mismatched")}>
            Try mismatched quantity
          </button>
          <button disabled={!actions || busy} onClick={() => runScenario("expired")}>
            Try expired approval
          </button>
          <button
            data-primary="true"
            disabled={!actions || busy || approvedOnce}
            onClick={() => runScenario("approved")}
          >
            Approve exact line and add
          </button>
          <button
            disabled={!actions || busy || !approvedOnce}
            onClick={() => runScenario("repeated")}
          >
            Repeat consumed approval
          </button>
          <button disabled={!cart} onClick={() => setDrawerOpen((open) => !open)}>
            {drawerOpen ? "Close cart proof" : "Open cart proof"}
          </button>
        </div>

        <p
          className="cart-gate__result"
          data-error={latest ? !latest.ok : undefined}
          data-testid="cart-gate-result"
        >
          {latest
            ? `${latest.scenario}: ${latest.code} · cart quantity ${latest.quantity}`
            : `${status} · ${eventState}`}
        </p>

        <div className="cart-gate__drawer" hidden={!drawerOpen} data-testid="cart-proof">
          <div className="cart-gate__cart-row">
            <div>
              <strong>Authoritative Shopify cart</strong>
              <small>{cartLineCount} line · {cartQuantity} item</small>
            </div>
            <span className="cart-gate__price">
              {cartTotal ? `${cartTotal.currencyCode} ${cartTotal.amount}` : "Empty"}
            </span>
          </div>
          {cartQuantity > 0 ? (
            <p className="shell__lede">
              Reviewed line: {TEST_LINE.product} / {TEST_LINE.variant} / quantity 1
            </p>
          ) : null}
        </div>

        <ul className="cart-gate__log" aria-label="Recent cart gate receipts">
          {receipts.map((receipt, index) => (
            <li key={`${receipt.scenario}-${index}`}>
              <span>{receipt.scenario}</span>
              <code>{receipt.code} · qty {receipt.quantity}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
