"use client";

import { useMemo, useRef, useState } from "react";
import { previewPlan } from "@/src/domain/commands/preview-plan";
import { stagePlan } from "@/src/domain/commands/stage-plan";
import { moveProduct } from "@/src/domain/commands/move-product";
import { lockProduct } from "@/src/domain/commands/lock-product";
import { removeProduct } from "@/src/domain/commands/remove-product";
import { resetWorld } from "@/src/domain/commands/reset-world";
import { setReducedMotionPreference } from "@/src/domain/commands/set-reduced-motion";
import { DomainError } from "@/src/domain/errors";
import { useSceneState } from "@/src/domain/scene-react";
import { selectItems, selectTotal } from "@/src/domain/selectors";
import { MOCK_DESK_PRODUCTS } from "@/src/commerce/mock-catalog";
import { MockCommerceGateway } from "@/src/commerce/mock-gateway";
import { DESK_ANCHORS } from "@/src/world/anchors";
import { DeskCanvas } from "@/src/world/DeskCanvas";
import { worldAnimationController } from "@/src/world/animation/WorldAnimationController";
import { useWorldAnimation } from "@/src/world/animation/use-world-animation";
import { StarterPrompt } from "@/src/experience/StarterPrompt";
import { ActivityRibbon } from "@/src/experience/ActivityRibbon";
import { ConstraintShockPanel } from "@/src/experience/ConstraintShockPanel";

const manualGateway = new MockCommerceGateway();

export function ManualDeskExperience() {
  const state = useSceneState();
  const animation = useWorldAnimation();
  const items = useMemo(() => selectItems(state), [state]);
  const total = useMemo(() => selectTotal(state), [state]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>("lamp-orange");
  const [message, setMessage] = useState("The orange lamp is locked and owned by you.");
  const [busy, setBusy] = useState(false);
  const pointerStarts = useRef<Record<string, number>>({});
  const selected = selectedItemId ? state.itemsById[selectedItemId] : undefined;

  function report(error: unknown) {
    setMessage(
      error instanceof DomainError
        ? error.message
        : "The manual scene action could not be completed.",
    );
  }

  async function loadManualSample() {
    if (busy || items.length > 1) return;
    setBusy(true);
    try {
      const proposal = await previewPlan(
        {
          expectedSceneVersion: state.sceneVersion,
          constraints: state.constraints,
          selections: [
            {
              merchandiseId: MOCK_DESK_PRODUCTS[1].merchandiseId,
              role: "display",
              reason: "A compact screen for the small desk.",
            },
            {
              merchandiseId: MOCK_DESK_PRODUCTS[2].merchandiseId,
              role: "input",
              reason: "A quiet no-RGB keyboard.",
            },
            {
              merchandiseId: MOCK_DESK_PRODUCTS[3].merchandiseId,
              role: "audio",
              reason: "A small speaker that fits the right edge.",
            },
          ],
        },
        { catalog: manualGateway },
      );
      await stagePlan({
        expectedSceneVersion: state.sceneVersion + 1,
        proposalId: proposal.proposalId,
        proposalDigest: proposal.digest,
      }, { animation: worldAnimationController });
      setMessage("Manual sample placed through the versioned domain commands.");
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  }

  function nextAnchor(itemId: string) {
    const current = state.itemsById[itemId];
    if (!current) return null;
    const occupied = new Set(items.filter((item) => item.id !== itemId).map((item) => item.anchorId));
    const compatible = DESK_ANCHORS.filter(
      (anchor) =>
        anchor.roles.includes(current.variant.role) &&
        anchor.minDeskWidthCm <= state.constraints.deskWidthCm &&
        !occupied.has(anchor.id),
    );
    const index = compatible.findIndex((anchor) => anchor.id === current.anchorId);
    return compatible[(index + 1 + compatible.length) % compatible.length]?.id ?? null;
  }

  async function moveNext(itemId: string) {
    const targetAnchorId = nextAnchor(itemId);
    if (!targetAnchorId || targetAnchorId === state.itemsById[itemId]?.anchorId) {
      setMessage("No alternate compatible anchor is available for this product.");
      return;
    }
    try {
      await moveProduct({
        expectedSceneVersion: state.sceneVersion,
        itemId,
        targetAnchorId,
      });
      setMessage(`Moved to ${targetAnchorId}. Scene version advanced once.`);
    } catch (error) {
      report(error);
    }
  }

  async function invalidMove() {
    if (!selected) return;
    try {
      await moveProduct({
        expectedSceneVersion: state.sceneVersion,
        itemId: selected.id,
        targetAnchorId: "lamp-left",
      });
    } catch (error) {
      report(error);
      setMessage("Invalid placement — product returned to its prior valid anchor.");
    }
  }

  function toggleLock() {
    if (!selected) return;
    try {
      lockProduct({
        expectedSceneVersion: state.sceneVersion,
        itemId: selected.id,
        locked: !selected.locked,
      });
      setMessage(selected.locked ? "Product unlocked." : "Product locked to your decision.");
    } catch (error) {
      report(error);
    }
  }

  function removeSelected() {
    if (!selected) return;
    try {
      removeProduct({ expectedSceneVersion: state.sceneVersion, itemId: selected.id });
      setSelectedItemId(null);
      setMessage("Product removed from the scene. The Shopify cart was not changed.");
    } catch (error) {
      report(error);
    }
  }

  return (
    <section className="manual-world" aria-labelledby="manual-world-title">
      <header className="manual-world__header">
        <div>
          <p className="shell__eyebrow">Manual world · scene v{state.sceneVersion}</p>
          <h2 id="manual-world-title">Shape the desk directly.</h2>
        </div>
        <div className="manual-world__badges" aria-label="Active constraints">
          <span>{state.constraints.market} market</span>
          <span>{state.constraints.deskWidthCm} cm desk</span>
          <span>{total.currencyCode} {total.amount} / {state.constraints.budget.amount}</span>
          <button
            aria-pressed={state.reducedMotion}
            onClick={() => setReducedMotionPreference(!state.reducedMotion)}
          >
            {state.reducedMotion ? "Reduced motion on" : "Use reduced motion"}
          </button>
        </div>
      </header>

      <StarterPrompt />
      <ConstraintShockPanel />
      <ActivityRibbon />

      <div className="manual-world__layout">
        <DeskCanvas
          items={items}
          selectedItemId={selectedItemId}
          onSelect={setSelectedItemId}
          onPointerDrag={moveNext}
          parcels={animation.parcels}
        />

        <aside className="world-inspector" aria-label="Product inspector">
          <div className="world-inspector__actions">
            <button disabled={busy || items.length > 1} onClick={loadManualSample}>
              {busy ? "Placing sample…" : "Place manual sample"}
            </button>
            <button
              onClick={() => {
                resetWorld();
                setSelectedItemId("lamp-orange");
                setMessage("Fresh scene restored; real cart state was preserved.");
              }}
            >
              Reset scene
            </button>
          </div>

          {selected ? (
            <div className="world-inspector__detail" data-testid="product-inspector">
              <p className="shell__eyebrow">{selected.variant.role}</p>
              <h3>{selected.variant.title}</h3>
              <p>{selected.variant.variantTitle} · {selected.variant.price.currencyCode} {selected.variant.price.amount}</p>
              <p>{selected.reason}</p>
              <dl>
                <div><dt>Anchor</dt><dd>{selected.anchorId}</dd></div>
                <div><dt>Owner</dt><dd>{selected.owner}</dd></div>
                <div><dt>Status</dt><dd>{selected.locked ? "Locked" : "Editable"}</dd></div>
              </dl>
              <div className="world-inspector__actions">
                <button onClick={toggleLock}>{selected.locked ? "Unlock product" : "Lock product"}</button>
                <button disabled={selected.locked} onClick={() => moveNext(selected.id)}>
                  Move to next anchor
                </button>
                <button disabled={selected.locked} onClick={invalidMove}>Try invalid placement</button>
                <button disabled={selected.locked} onClick={removeSelected}>Remove product</button>
              </div>
            </div>
          ) : (
            <p>Select a product from the canvas or accessible list.</p>
          )}

          <p className="world-message" role="status">{message}</p>
        </aside>
      </div>

      <div className="world-list" aria-labelledby="world-list-title">
        <h3 id="world-list-title">Accessible scene list</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                aria-pressed={item.id === selectedItemId}
                data-merchandise-id={item.variant.merchandiseId}
                onClick={() => setSelectedItemId(item.id)}
                onPointerDown={(event) => {
                  pointerStarts.current[item.id] = event.clientX;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={(event) => {
                  const start = pointerStarts.current[item.id];
                  event.currentTarget.releasePointerCapture(event.pointerId);
                  if (Math.abs(event.clientX - start) > 24) moveNext(item.id);
                  delete pointerStarts.current[item.id];
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveNext(item.id);
                  }
                }}
              >
                <strong>{item.variant.title}</strong>
                <span>{item.anchorId} · {item.locked ? "Locked" : "Editable"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
