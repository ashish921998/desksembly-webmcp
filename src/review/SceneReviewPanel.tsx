"use client";

import { useMemo, useState } from "react";
import { approveReview, consumeReviewApproval } from "@/src/domain/commands/approve-review";
import { applyCartResult } from "@/src/domain/commands/apply-cart-result";
import { applyPriceChange } from "@/src/domain/commands/apply-price-change";
import { createReview } from "@/src/domain/commands/create-review";
import { reconcileCart } from "@/src/domain/commands/reconcile-cart";
import { DomainError } from "@/src/domain/errors";
import { useSceneState } from "@/src/domain/scene-react";
import type { KitReview } from "@/src/domain/types";
import { MOCK_DESK_PRODUCTS } from "@/src/commerce/mock-catalog";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import type { CartMutationResult } from "@/src/commerce/types";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";

const unrelatedLine = {
  merchandiseId: MOCK_DESK_PRODUCTS[7].merchandiseId,
  quantity: 1,
};

function productName(merchandiseId: string) {
  return (
    MOCK_DESK_PRODUCTS.find((product) => product.merchandiseId === merchandiseId)
      ?.title ?? merchandiseId
  );
}

export function SceneReviewPanel() {
  const state = useSceneState();
  const [review, setReview] = useState<KitReview | null>(null);
  const [result, setResult] = useState<CartMutationResult | null>(null);
  const [partialFailure, setPartialFailure] = useState(false);
  const [status, setStatus] = useState(
    "Prepare an exact review after the desk reaches a stable editable state.",
  );
  const [busy, setBusy] = useState(false);
  const reviewCurrent = Boolean(review && review.sceneVersion === state.sceneVersion);
  const totalQuantity = useMemo(
    () => result?.cart.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0,
    [result],
  );

  async function prepare() {
    const next = await createReview();
    setReview(next);
    setResult(null);
    setStatus(`Exact review prepared for scene v${next.sceneVersion}.`);
  }

  function simulatePriceChange() {
    const speaker = Object.values(state.itemsById).find(
      (item) => item.variant.role === "audio",
    );
    if (!speaker) return;
    applyPriceChange({
      expectedSceneVersion: state.sceneVersion,
      itemId: speaker.id,
      price: { amount: "45.00", currencyCode: "USD" },
    });
    setStatus("Price changed to USD 45.00. Prepare a fresh review before approval.");
  }

  async function approve() {
    if (!review || !reviewCurrent || busy) return;
    setBusy(true);
    try {
      await approveReview(review);
      consumeReviewApproval(review.digest);
      const rejectedId = MOCK_DESK_PRODUCTS[3].merchandiseId;
      const gateway = new MockCommerceGateway(MOCK_DESK_PRODUCTS, {
        initialLines: [unrelatedLine],
        rejectMerchandiseIds: partialFailure ? [rejectedId] : [],
      });
      const mutation = await gateway.updateCart(
        review.lines.map((line) => ({
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
        })),
      );
      const reconciliation = reconcileCart(review, mutation.cart);
      const acceptedIds = mutation.accepted.map((line) => line.merchandiseId);
      const acceptedItems = Object.values(state.itemsById).filter((item) =>
        acceptedIds.includes(item.variant.merchandiseId),
      );
      await worldAnimationController.cart(acceptedItems);
      applyCartResult({
        acceptedMerchandiseIds: acceptedIds,
        rejectedMerchandiseIds: mutation.rejected.map((line) => line.merchandiseId),
      });
      setResult(mutation);
      setStatus(
        reconciliation.matched
          ? "Exact deterministic cart reconciled. Shopify Checkout remains unavailable without a development store."
          : "Partial deterministic cart result. Checkout is blocked until every reviewed line is accepted.",
      );
    } catch (error) {
      setStatus(
        error instanceof DomainError
          ? `${error.code}: ${error.message}`
          : "The deterministic cart approval failed safely.",
      );
    } finally {
      setBusy(false);
    }
  }

  function repeatApproval() {
    if (!review) return;
    try {
      consumeReviewApproval(review.digest);
    } catch (error) {
      setStatus(
        error instanceof DomainError
          ? `${error.code}: consumed approvals cannot be reused.`
          : "Repeated approval rejected.",
      );
    }
  }

  return (
    <section className="scene-review" aria-labelledby="scene-review-title">
      <header>
        <div>
          <p className="shell__eyebrow">Exact scene review</p>
          <h2 id="scene-review-title">Approve the deterministic kit once.</h2>
        </div>
        <span>Fallback cart · Shopify Checkout disabled</span>
      </header>

      <div className="scene-review__controls">
        <button onClick={prepare}>Prepare exact review</button>
        <button disabled={!reviewCurrent} onClick={simulatePriceChange}>
          Simulate price change
        </button>
        <label>
          <input
            type="checkbox"
            checked={partialFailure}
            onChange={(event) => setPartialFailure(event.target.checked)}
          />
          Simulate one rejected line
        </label>
      </div>

      {review ? (
        <div className="scene-review__body">
          <div>
            <h3>Reviewed scene · v{review.sceneVersion}</h3>
            <ul className="scene-review__lines">
              {review.lines.map((line) => (
                <li key={line.merchandiseId}>
                  <span><strong>{line.title}</strong><small>{line.variantTitle} · qty {line.quantity}</small></span>
                  <code>{line.price.currencyCode} {line.price.amount}</code>
                </li>
              ))}
            </ul>
            <p className="scene-review__total">
              Total <strong>{review.total.currencyCode} {review.total.amount}</strong>
            </p>
            {!reviewCurrent ? (
              <p className="scene-review__warning" role="alert">
                Scene or price changed. This review cannot be approved.
              </p>
            ) : null}
            <div className="scene-review__controls">
              <button
                data-primary="true"
                disabled={!reviewCurrent || busy || Boolean(result)}
                onClick={approve}
              >
                {busy ? "Reconciling…" : "Approve exact deterministic kit"}
              </button>
              <button disabled={!result} onClick={repeatApproval}>
                Repeat consumed approval
              </button>
            </div>
          </div>

          <aside className="scene-review__cart" aria-label="Deterministic cart drawer">
            <h3>Deterministic cart</h3>
            {result ? (
              <>
                <p>{result.cart.lines.length} lines · {totalQuantity} items</p>
                <ul>
                  {result.cart.lines.map((line) => (
                    <li key={line.merchandiseId}>
                      <span>{productName(line.merchandiseId)}</span>
                      <code>qty {line.quantity}</code>
                    </li>
                  ))}
                </ul>
                {result.rejected.length ? (
                  <ul className="scene-review__rejected" aria-label="Rejected cart lines">
                    {result.rejected.map((line) => (
                      <li key={line.merchandiseId}>{productName(line.merchandiseId)} · {line.code}</li>
                    ))}
                  </ul>
                ) : null}
                <p>Total {result.cart.total.currencyCode} {result.cart.total.amount}</p>
              </>
            ) : (
              <p>No deterministic cart result yet.</p>
            )}
            <button disabled>Shopify Checkout unavailable · connect a development store</button>
          </aside>
        </div>
      ) : null}

      <p className="scene-review__status" role="status">{status}</p>
    </section>
  );
}
