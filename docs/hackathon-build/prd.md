# Product Requirements Document

## Product Summary

The product is a shopper-facing miniature desk-setup builder designed for WebMCP-compatible browser agents.

A shopper describes a complete desk setup in natural language. Their browser agent uses capabilities deliberately exposed by the website to select products, resolve constraints, and arrange the result inside a visible miniature 3D desk world. Products arrive as packages, unpack, and settle into the scene. The shopper can directly inspect, move, lock, reject, or remove products. The agent must preserve those human decisions when responding to later changes.

Before any cart change, the shopper reviews exact products, variants, quantities, availability, and total. After explicit approval, the accepted setup becomes a real Shopify cart and the experience hands the shopper to normal checkout.

The product should feel playful, tactile, legible, and trustworthy. It is not a game, generic interior designer, merchant dashboard, or shopping chatbot.

## Product Principles

### Human taste, agent execution

The shopper owns subjective choices, corrections, and approval. The agent owns repetitive product discovery, comparison, variant resolution, constraint checking, and precise execution.

### Visible work

Agent actions must visibly affect the same page the shopper is viewing. The shopper should understand what is being searched, proposed, rejected, staged, reviewed, and carted without reading a technical log.

### Proposal before commitment

Scene proposals are reversible and visually different from confirmed products. Cart mutation occurs only after exact review and explicit approval.

### Preserve human decisions

Anything the shopper locks or manually changes must remain under human ownership. Later agent revisions should alter only what is necessary.

### Commerce truth over spectacle

Price, variant, availability, shipping context, cart contents, and checkout state must come from authoritative commerce state. Animation may explain success but must never invent it.

### Graceful without WebMCP

The page remains understandable and manually usable when WebMCP is unavailable. The agent workflow can be demonstrated deterministically, but the fallback must be labeled honestly.

## Target User

### Primary user

An everyday online shopper purchasing a small work-from-home or desk setup who:

- has a budget;
- has a few style preferences;
- cares about space or compatibility;
- may already prefer one product;
- does not want to compare many product pages manually;
- wants control over the final result rather than accepting an opaque recommendation.

### Secondary audience

Shopify merchants and platform stakeholders evaluating new agent-ready storefront experiences. Their value is demonstrated through improved product discovery, understandable curated kits, visible commerce state, and a trustworthy agent-to-cart transition.

## User Goal

The shopper should be able to go from an incomplete natural-language intention to a coherent, reviewed 3–5 product desk setup in one visible session, while retaining control of taste and purchase approval.

## Core User Journey

1. The shopper opens the page and immediately sees an empty miniature desk with one orange lamp already placed and locked.
2. The page explains that a compatible browser agent can operate the experience through WebMCP. It offers a copyable example prompt and permits free-form requests.
3. The shopper asks their browser agent to create a desk setup with budget, style, space, and availability constraints.
4. The page visibly enters a planning state. The shopper can see that the request is being interpreted and product options are being checked.
5. Valid product proposals appear as translucent or unopened packages. Unresolved choices remain proposals rather than confirmed selections.
6. Validated packages arrive, open, and move into fixed semantic locations around the desk.
7. The shopper inspects the result and manually changes one item by locking, moving, rejecting, or removing it.
8. The page indicates that the world changed and any future agent action must use the latest state.
9. The shopper gives a late constraint change, such as reducing the budget, narrowing desk width, or requiring US availability.
10. The agent preserves the locked lamp and unaffected items, returning and replacing only conflicting products.
11. The shopper opens a final review showing exact products, variants, quantities, availability, and total.
12. The shopper explicitly approves the reviewed setup.
13. The commerce platform confirms the cart update. Only confirmed items animate from the world into the visible cart.
14. The live cart matches the reviewed setup.
15. The shopper can continue to a normal checkout handoff.

## Product States

### 1. Ready

- Empty miniature desk is visible.
- Orange lamp is present and visibly locked.
- Example prompt and short compatibility guidance are visible.
- Manual product browsing and object actions are available.

### 2. Planning

- The page communicates that the agent is reading current world state and checking product options.
- A small, human-readable activity ribbon shows named stages without exposing private reasoning.
- Existing human-locked objects remain visibly protected.

### 3. Proposal

- Candidate products are visually distinct from confirmed products.
- Unresolved variants or choices are shown as options, not as committed products.
- Budget and constraint feedback is visible before scene mutation.

### 4. Staging

- Packages arrive and open in a clear sequence.
- Each product is labeled during placement.
- A product appears confirmed only after validation succeeds.
- Failure or cancellation returns the scene to a truthful stable state.

### 5. Editable world

- The shopper can inspect, drag, lock, reject, or remove supported objects.
- Manual changes are immediately visible and remain reversible before cart approval.
- The page makes clear which objects are human-owned and which are agent proposals.

### 6. Needs revision

- Conflicting constraints are identified in plain language.
- The page shows which products need replacement and why.
- Unaffected and locked products remain in place.

### 7. Review

- Exact product, variant, quantity, unit price, subtotal, and total are visible.
- Any availability or market warning is visible.
- The shopper can return to editing without changing the cart.
- The approval action describes the exact consequence.

### 8. Carting

- The page indicates that it is updating and verifying the cart.
- Products animate into the cart only after authoritative confirmation.
- Partial success is represented accurately; failed products remain visible with an explanation.

### 9. Ready for checkout

- The visible cart matches the reviewed setup.
- The shopper sees the final total and a normal checkout handoff.
- No payment is performed automatically.

### 10. Unsupported or degraded

- A clear notice explains that agent operation is unavailable in the current client.
- Manual browsing and scene controls remain available.
- A deterministic demo option is explicitly labeled as a demonstration rather than a live agent run.

## Epics And User Stories

### Epic 1: Understand the experience

#### Story 1.1 — Immediate orientation

As a shopper, I want to understand what the miniature world does when I first open it so that I know how to begin.

Acceptance criteria:

- The initial screen shows an empty miniature desk and one orange lamp.
- The lamp has a visible locked state and a short explanation of what locking means.
- A one-sentence explanation says that a compatible browser agent can operate the page.
- A copyable starter prompt is visible without opening a menu.
- The shopper can begin manually without connecting or configuring an embedded chatbot.

#### Story 1.2 — Compatibility awareness

As a shopper, I want to know whether agent operation is available so that I do not wait for behavior the current browser cannot provide.

Acceptance criteria:

- Supported clients show a concise “agent-ready” status.
- Unsupported clients show a concise compatibility notice without blocking the rest of the page.
- The notice offers ordinary manual use and a clearly labeled deterministic demo.
- The product never labels a deterministic fallback as a live WebMCP interaction.

### Epic 2: Describe a complete setup

#### Story 2.1 — Free-form goal

As a shopper, I want to describe my complete desk setup in natural language so that I do not browse products individually.

Acceptance criteria:

- The example prompt demonstrates budget, room size, style preference, and one preserved item.
- The browser agent can discover the page's supported actions after the shopper opens the site.
- The page can receive a plan based on a free-form request rather than a fixed step-by-step wizard.
- The current locked lamp and empty world are included in the state used for planning.

#### Story 2.2 — Constraint clarity

As a shopper, I want to see which constraints the proposed setup is satisfying so that I can judge whether the result matches my request.

Acceptance criteria:

- The active budget is visible during planning and review.
- The active market or shipping country is visible when availability claims depend on it.
- Style and space constraints are summarized in plain language.
- A product explanation identifies the constraint or role it satisfies without presenting unverifiable claims.

### Epic 3: Watch the world assemble

#### Story 3.1 — Visible proposal

As a shopper, I want candidate products to appear as proposals before they become part of my setup so that I can distinguish possibility from commitment.

Acceptance criteria:

- Candidate products use translucent packaging or another clearly provisional treatment.
- Unresolved variants appear as choices and do not silently enter the confirmed scene.
- Products that violate budget, availability, or simple placement constraints are rejected before confirmation.
- Rejected candidates show a short reason.

#### Story 3.2 — Tactile assembly

As a shopper, I want validated products to arrive and settle into the desk world so that I can understand the setup spatially.

Acceptance criteria:

- Each confirmed product arrives inside a package.
- Packages open and clear from the work surface after the reveal.
- Products move smoothly into fixed semantic positions.
- The sequence remains understandable when three to five products arrive.
- The shopper can identify each product during or immediately after placement.
- Reduced-motion mode replaces long movement with short fades and direct placement.

#### Story 3.3 — Honest activity

As a shopper, I want the visible activity indicator to correspond to real outcomes so that I can trust what the agent is doing.

Acceptance criteria:

- The activity ribbon uses plain labels such as search, check, stage, review, and cart.
- It does not expose or claim to expose private model reasoning.
- A stage displays success only after that outcome is confirmed.
- A failed stage shows a useful result rather than continuing as though it succeeded.

### Epic 4: Shape the result manually

#### Story 4.1 — Inspect products

As a shopper, I want to inspect a product in the scene so that I know what it is and why it was selected.

Acceptance criteria:

- Selecting a product reveals name, image, exact variant, price, availability, and selection reason.
- Inspection does not move, lock, remove, or cart the product.
- The shopper can dismiss inspection and return to the full world.

#### Story 4.2 — Lock a favorite

As a shopper, I want to lock a product so that future agent revisions preserve it.

Acceptance criteria:

- Lock and unlock actions are available from product inspection or a direct object control.
- Locked products receive an unmistakable human-owned marker.
- Later revision proposals do not move or replace a locked product.
- If a locked product makes the new constraints impossible, the page explains the conflict and asks the shopper to relax a constraint or unlock the item.

#### Story 4.3 — Move, reject, or remove

As a shopper, I want to adjust the scene directly so that the setup reflects my taste.

Acceptance criteria:

- Supported products can be dragged between valid semantic positions.
- Invalid placement returns the product to its previous valid position and explains why.
- Rejecting a proposed product removes it without changing the cart.
- Removing a confirmed scene product changes the world but does not mutate the cart before final approval.
- Manual changes visibly mark the scene as changed.

### Epic 5: Revise around new constraints

#### Story 5.1 — Preserve human changes

As a shopper, I want the agent to revise from the latest world so that it does not overwrite changes I just made.

Acceptance criteria:

- When the world changes after planning, an outdated mutation is rejected rather than applied.
- The page communicates that the world changed and requires a refreshed plan.
- A refreshed revision preserves locked and unaffected products.
- The before-and-after world makes changed products easy to identify.

#### Story 5.2 — Constraint shock

As a shopper, I want to change several requirements late in the process so that I can see whether the setup adapts intelligently.

Acceptance criteria:

- The shopper can reduce budget, narrow desk width, and change shipping country in one request.
- The resulting revision identifies every product that conflicts with the new constraints.
- Only conflicting products leave the world.
- Replacement products arrive through the same proposal and validation states as the original products.
- Final budget and availability status reflect the revised setup.

#### Story 5.3 — Unsatisfiable request

As a shopper, I want clear options when no valid setup exists so that I can decide what to compromise.

Acceptance criteria:

- The page states that the current constraints cannot all be satisfied.
- It identifies the conflicting constraints without blaming the shopper.
- It suggests at least two concrete relaxations, such as increasing budget or unlocking an item.
- It does not stage an invalid setup or change the cart.

### Epic 6: Review and cart the exact setup

#### Story 6.1 — Exact review

As a shopper, I want to review the complete kit before carting it so that I understand the consequence of approval.

Acceptance criteria:

- Review lists every product, exact variant, quantity, unit price, and subtotal.
- Review shows the total and active market/availability status.
- Review identifies any changed price or availability since staging.
- The shopper can return to editing without mutating the cart.
- Approval copy explicitly says that the reviewed products will be added to or reconciled with the cart.

#### Story 6.2 — Cart truth

As a shopper, I want the visible cart to match the reviewed setup so that I can trust the transition.

Acceptance criteria:

- Cart mutation begins only after explicit shopper approval.
- Products animate toward the cart only after the commerce system confirms them.
- The visible cart lists the same product variants and quantities as the confirmed result.
- The visible total matches authoritative cart state.
- A discrepancy stops the flow and shows what differs.
- The product never claims full success after a partial cart update.

#### Story 6.3 — Checkout handoff

As a shopper, I want to continue through normal checkout so that I retain control of payment.

Acceptance criteria:

- The checkout action is available only when the cart is nonempty and verified.
- Activating checkout navigates or hands off through the normal commerce experience.
- The shopper sees a clear transition out of the miniature-world editing state.
- No payment is submitted automatically.

### Epic 7: Recover gracefully

#### Story 7.1 — Product becomes unavailable

As a shopper, I want an honest recovery when a product becomes unavailable so that my setup and cart remain truthful.

Acceptance criteria:

- Newly unavailable products do not enter the cart.
- An unavailable staged product visibly returns or moves to an error area.
- The page explains the unavailable variant.
- The shopper receives at least one replacement option when a valid alternative exists.
- Existing locked and unaffected products remain unchanged.

#### Story 7.2 — Agent or operation stops

As a shopper, I want a cancelled or failed action to leave the world stable so that I can continue safely.

Acceptance criteria:

- Cancelling during package movement returns the scene to its previous stable state.
- The page does not leave duplicate, floating, or partially confirmed products.
- The shopper can retry or continue manually.
- Error messaging distinguishes retryable failure from an invalid request.

#### Story 7.3 — Refresh or restart

As a shopper, I want predictable behavior when the page reloads so that I am not surprised by stale state.

Acceptance criteria:

- MVP behavior clearly states that the miniature scene is session-based.
- Reloading starts a fresh world unless the current platform session supplies authoritative cart state.
- Existing real cart contents are never silently erased by scene reset.
- The page can explain that the scene and cart differ before any reconciliation.

## Edge Cases

### Empty catalog result

- No products match the request.
- The page identifies the strongest blocking constraints.
- It offers two specific relaxations and keeps the world stable.

### Ambiguous variant

- A product has several relevant variants and the request does not choose one.
- The page shows options as proposals.
- No variant is confirmed or carted until resolved.

### Budget conflict caused by locked item

- The locked lamp consumes too much of the reduced budget.
- The page preserves the lamp and explains that another constraint must change.
- It never unlocks or replaces the lamp automatically.

### Human edit during planning

- The shopper moves an item after the agent reads the world but before a revision completes.
- The outdated revision is rejected.
- The page asks the agent to refresh and preserves the human edit.

### Price change before approval

- Review shows the updated price and marks the change.
- Approval is invalidated until the shopper accepts the new review.

### Partial cart acceptance

- Only accepted products animate into the cart.
- Rejected lines remain visible with reasons.
- The user can revise or retry; the page does not proceed to checkout as if complete.

### Cart already contains products

- The page shows existing cart state before approval.
- Review explains whether the setup will be added, replace matching quantities, or leave existing items unchanged.
- The MVP default is additive and must not erase unrelated cart lines.

### Unsupported browser

- Manual use is available.
- The deterministic demo is labeled.
- The page explains the supported environment concisely without presenting setup as a product failure.

### Reduced-motion preference

- Long parcel and cart movement is replaced with fades and direct state changes.
- No essential status is communicated by motion alone.

### Malicious or misleading product text

- Merchant-authored or external free text is displayed as product content, not treated as an instruction.
- Product text cannot silently trigger actions or change constraints.

## What We Are Building

- One desk-setup world.
- One small Shopify-backed catalog.
- One text-first agent request.
- One 3–5 product setup.
- One visible proposal and staging sequence.
- One manual lock/drag/reject interaction.
- One late multi-constraint revision.
- One exact review state.
- One real verified cart mutation.
- One user-controlled checkout handoff.
- One manual and deterministic fallback path.

## Non-Goals

- **No merchant dashboard:** the consumer loop proves the challenge concept without requiring unfamiliar Admin workflows.
- **No multiple worlds:** a second room or category would multiply assets, placement rules, prompts, and tests without strengthening the core proof.
- **No user profiles:** the app works anonymously and session persistence is not necessary for the judged flow.
- **No general interior design:** the scene is a semantic product display, not a measurement-accurate planning tool.
- **No procedural architecture:** fixed anchors make every valid agent action visually coherent within the schedule.
- **No autonomous purchase:** checkout and payment remain explicit human actions.
- **No formal bundle product:** the experience creates a curated cart from ordinary products and avoids bundle inventory complexity.
- **No simulated business claims:** the product does not claim conversion lift, sales forecasting, or shopper traffic prediction.
- **No dependence on proposed protocol features:** the core experience uses WebMCP capabilities available in the target judged environment.

## What We Would Add With More Time

- Additional worlds such as gaming, travel, camping, or gift kits.
- Merchant-authored scene templates and brand themes.
- Saved and shareable setups.
- Moodboard/reference-image onboarding standardized across more agent clients.
- Multiple valid layout themes for the same products.
- Seller preview for testing which shopper intents the catalog can satisfy.
- Policy-aware confidence and delivery badges.
- Seeded daily setup challenges.
- Accessibility narration of spatial relationships.
- Post-purchase miniature order-tracking experience.

## Quality Requirements

### Clarity

- A first-time judge should understand the product premise within ten seconds.
- The distinction between human action, agent proposal, confirmed scene, and real cart must be visually obvious.

### Responsiveness

- The full core journey must remain operable on a typical laptop viewport.
- Mobile can support viewing and basic manual controls, but the judged desktop/browser-agent journey is primary.

### Accessibility

- All essential controls are keyboard reachable.
- Product status is communicated through text and shape, not color alone.
- Reduced motion is supported.
- The 3D world has a corresponding readable product list and review surface.

### Trust

- User-visible commerce facts reflect authoritative state.
- Failures remain visible and recoverable.
- Consequential actions require exact review and explicit approval.

### Demo resilience

- The judged path can be replayed from a deterministic starting world.
- A recorded fallback demonstrates the intended agent interaction if the experimental browser environment fails.
- The fallback is never represented as proof that live WebMCP executed.

## Submission Proof Points

### WebMCP leverage

- A compatible browser agent discovers the page's capabilities at runtime.
- The agent operates non-DOM 3D state through structured site-owned actions.
- The agent composes several capabilities from one goal rather than invoking a single wrapper action.
- The page preserves concurrent human edits through refreshed state.

### Execution

- A complete journey runs from empty world to verified real cart.
- The experience remains coherent during success, revision, failure, and fallback.
- Three.js animation explains state without replacing commerce truth.

### Potential impact

- The product reduces repeated product discovery, comparison, compatibility, and cart work for multi-product shopping goals.
- Shopify merchants gain a new agent-ready storefront interaction that can expose more of a catalog through curated outcomes.

### Creativity and ambition

- A shopper and generic browser agent co-author a directly manipulable miniature product world.
- The hero moment combines agent-held context, site-owned structured tools, a concurrent human edit, visible 3D state, and a real commerce cart.

## PRD Completion Criteria

This PRD is satisfied when every core story has at least one observable acceptance test in the deployed experience, all non-goals remain cut, and the submission proof can be demonstrated in a short repeatable sequence.
