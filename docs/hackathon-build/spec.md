# Technical Spec

## Overview

The application is a server-rendered Next.js storefront using Shopify's Hydrogen developer preview, deployed to Vercel. It progressively enhances a normal, manually usable miniature desk builder with WebMCP tools.

Shopify's `ShopifyScripts` runtime supplies native WebMCP tools for catalog, variants, cart, policies, and checkout. The project registers only scene-specific tools, all prefixed with `deskbuilder.` to avoid collisions. Both manual UI actions and project WebMCP tools call the same validated domain commands against one versioned scene store.

The application does not push scene state into WebMCP. Agents read a compact snapshot through `deskbuilder.get_scene`. Every mutating tool supplies `expectedSceneVersion`; stale calls fail without modifying state. `toolchange` is treated only as tool-inventory notification.

Because the current WebMCP draft has no dependable confirmation/elicitation API, consequential cart approval is enforced by the application. A visible review produces a canonical reviewed-kit digest. The shopper approves that exact digest. Shopify's configurable Standard Action handler rejects cart changes that do not match an unconsumed approval and delegates approved writes to Shopify's default handler.

The core demo remains fully usable without WebMCP. Manual controls and a clearly labeled deterministic scenario share the same domain logic.

## Standards Status And Boundaries

WebMCP is a W3C Community Group draft and an experimental Chromium feature, not a stable W3C Recommendation. The implementation must pin and test the exact browser and Hydrogen preview versions used for submission.

### Standards-backed WebMCP behavior

- Entry point: `document.modelContext`.
- Tool registration: `document.modelContext.registerTool(tool, options)`.
- Tool fields: `name`, optional `title`, `description`, optional JSON `inputSchema`, async `execute`, and optional `annotations`.
- Registration lifecycle: an `AbortSignal` passed in registration options unregisters the tool when aborted.
- Execution cancellation: each `execute` callback receives `{ signal }`.
- Current annotations: `readOnlyHint` and `untrustedContentHint` only.
- `toolchange`: reports tool registration/unregistration changes only.
- Security boundary: secure, origin-keyed documents and the `tools` Permissions Policy.
- Tool output: JSON-serializable data returned from the callback.
- Lifetime: tools exist only while the page is open.

### Application-level behavior

- Zustand state store.
- Domain-command layer shared by UI and WebMCP.
- Optimistic scene versioning.
- Proposal IDs and reviewed-kit digests.
- Human approval record and one-time consumption.
- Commerce adapter and deterministic mock implementation.
- Cart-result reconciliation before animation.
- Animation transactions and rollback.
- Manual and recorded fallback behavior.

### Explicitly unsupported assumptions

- No `provideContext()` or arbitrary scene-state push.
- No use of `toolchange` as state synchronization.
- No reliance on `requestUserInteraction()`, `requestUserInput()`, `consequentialHint`, or other proposed interfaces.
- No background/service-worker WebMCP execution.
- No cross-document tool transaction for checkout.
- No protocol-level batch executor or rich media tool results.

## Stack

| Area | Choice | Reason | Documentation |
| --- | --- | --- | --- |
| Framework | Next.js + TypeScript | Familiar SSR platform with official Hydrogen preview setup and Vercel deployment path. | [Next.js](https://nextjs.org/docs) |
| Commerce | `@shopify/hydrogen@preview` | Typed Storefront API, cart primitives, Standard Actions, ShopifyScripts, and native Shopify WebMCP. | [Hydrogen developer preview](https://shopify.dev/docs/storefronts/headless/developer-preview) |
| WebMCP types | `webmcp-types` | Chrome-recommended TypeScript declarations for the experimental browser API. | [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) |
| 3D | React Three Fiber + Drei | Declarative Three.js scene, pointer events, camera helpers, and asset loading. | [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction), [Drei](https://github.com/pmndrs/drei) |
| Domain state | Zustand | Small external store with synchronous `getState()` for fresh reads inside stable WebMCP callbacks. | [Zustand](https://zustand.docs.pmnd.rs/) |
| Validation | Zod | Runtime validation for tool inputs, product data, domain commands, and adapter responses. | [Zod](https://zod.dev/) |
| UI motion | Motion | Accessible interface transitions and reduced-motion integration. | [Motion](https://motion.dev/docs/react) |
| 3D timelines | GSAP | Interruptible package, replacement, and cart animation timelines. | [GSAP](https://gsap.com/docs/v3/) |
| Unit tests | Vitest | Fast domain, schema, store, hash, and adapter tests. | [Vitest](https://vitest.dev/) |
| Browser tests | Playwright | Manual path, deterministic demo, WebMCP registration smoke, cart gate, and visual-flow checks. | [Playwright](https://playwright.dev/docs/intro) |
| Deployment | Vercel | Official Next.js/Hydrogen preview path and HTTPS production origin. | [Hydrogen preview setup](https://shopify.dev/docs/storefronts/headless/developer-preview) |

The implementation task must commit the generated lockfile and record exact resolved versions in the README. Do not float Hydrogen preview upgrades after the integration gate passes.

## Architecture

```text
Shopper's browser agent
  ├─ Shopify native WebMCP tools
  │    search_catalog / get_product / show_variant
  │    get_cart / update_cart / proceed_to_checkout
  │
  └─ Project-prefixed WebMCP tools
       deskbuilder.get_scene
       deskbuilder.preview_plan
       deskbuilder.stage_plan
       deskbuilder.move_product
       deskbuilder.get_review
                    │
                    v
Human UI ─────> Domain command layer <──── WebMCP adapter
                    │
                    v
             Versioned Zustand store
             ├─ scene and proposals
             ├─ constraints and phases
             ├─ activity receipts
             └─ review/approval metadata
                    │
           ┌────────┴─────────┐
           v                  v
    React Three Fiber     Review / cart UI
           │                  │
           └──── animation ───┘
                              │
                              v
                    CommerceGateway
                    ├─ HydrogenGateway
                    └─ MockCommerceGateway
                              │
                              v
                 Shopify Standard Actions/cart
```

### Architecture invariants

1. The UI and project WebMCP tools never mutate the store directly; they call domain commands.
2. Every mutating scene command validates `expectedSceneVersion` immediately before commit.
3. A scene mutation increments `sceneVersion` exactly once after a successful transaction.
4. A failed or cancelled mutation restores the last stable snapshot and does not increment the version.
5. Shopify is authoritative for product identity, variants, price, availability, cart contents, and checkout URL.
6. Project tools do not duplicate Shopify catalog or cart tools in live mode.
7. Product text returned to an agent is treated as untrusted.
8. Approval applies to one canonical review digest, expires, and is consumed at most once.
9. Cart animation begins only after Shopify resolves the update and the resulting cart matches accepted lines.
10. Unsupported clients retain the same manual domain workflow.

## Deployment Architecture

### Production

- Vercel HTTPS deployment.
- Server-rendered Next.js storefront.
- Hydrogen preview request handlers proxy Storefront API, cart, redirects, and Shopify script traffic through the application origin.
- `ShopifyScripts` renders once in the root layout with WebMCP enabled.
- Custom WebMCP tools register only in client code after feature detection.
- Product assets are served from Shopify CDN or local optimized assets.

### Required headers and browser conditions

- HTTPS secure context in production.
- Keep the document origin-keyed; never opt out with `Origin-Agent-Cluster: ?0` or `document.domain`.
- Set `Origin-Agent-Cluster: ?1` explicitly if the target deployment does not already guarantee it.
- Do not add COOP/COEP solely for WebMCP; origin-keying is the requirement, not `crossOriginIsolated`.
- Do not use a cross-origin iframe for the MVP.

### Environment variables

Use names created by the Hydrogen preview setup as the source of truth. Expected values include:

```text
PUBLIC_STORE_DOMAIN
PUBLIC_STOREFRONT_API_TOKEN
PRIVATE_STOREFRONT_API_TOKEN
```

Server-only tokens must never be exposed to client bundles. The implementation task must generate `.env.example` with placeholders and document how to obtain credentials through Shopify's Headless channel.

## File Structure

Run the official Next.js + Hydrogen preview setup first. Preserve generated request-handler and root-script files, then organize project code as follows:

```text
app/
├── layout.tsx                         # SSR root; Hydrogen ShopifyScripts, metadata, headers
├── page.tsx                           # Loads initial catalog/cart data and renders experience
├── globals.css                        # Global tokens, accessibility, non-canvas layout
└── api/                               # Only routes required/generated by Hydrogen preview

src/
├── experience/
│   ├── ExperienceShell.tsx            # PRD Epic 1; top-level state-aware layout
│   ├── AgentReadinessBadge.tsx        # Supported/unsupported live capability status
│   ├── StarterPrompt.tsx              # Copyable desk-setup prompt
│   ├── ActivityRibbon.tsx             # Human-readable search/check/stage/review/cart receipts
│   └── DemoModeBanner.tsx              # Honest deterministic-fallback label
│
├── world/
│   ├── DeskCanvas.tsx                 # R3F Canvas, camera, lighting, reduced-motion mode
│   ├── DeskEnvironment.tsx            # Fixed desk, floor, backdrop, and semantic zones
│   ├── SceneProduct.tsx               # Render confirmed/proposed/locked product object
│   ├── Parcel.tsx                     # Reusable package shell and reveal states
│   ├── InteractionControls.tsx        # Pointer/keyboard selection, drag, lock, remove
│   ├── anchors.ts                     # Fixed semantic anchor catalog and fit metadata
│   ├── product-visuals.ts              # Variant/category → low-poly asset/image mapping
│   └── animation/
│       ├── WorldAnimationController.ts # Queues transactions; owns GSAP timelines
│       ├── parcel-arrival.ts           # Arrival/open/place timeline factory
│       ├── replacement.ts              # Return-carton and replacement timeline
│       ├── cart-transition.ts          # Post-confirmation movement to cart UI
│       └── rollback.ts                 # Cancels timeline and restores stable visual state
│
├── domain/
│   ├── types.ts                        # Canonical Product, Scene, Proposal, Review, Cart types
│   ├── schemas.ts                      # Zod schemas for commands and external responses
│   ├── errors.ts                       # Typed domain error codes and safe messages
│   ├── canonicalize.ts                 # Stable serialization and SHA-256 digest helpers
│   ├── constraints.ts                  # Budget, market, item count, role, anchor validation
│   ├── placement.ts                    # Deterministic role/category → valid anchor mapping
│   ├── scene-store.ts                  # Zustand state only; no business logic in components
│   ├── selectors.ts                    # Derived totals, display states, review/cart diffs
│   └── commands/
│       ├── get-scene.ts                # Compact immutable snapshot
│       ├── preview-plan.ts              # Validate products/constraints; create proposal
│       ├── stage-plan.ts                # Transactional proposal → confirmed scene
│       ├── move-product.ts              # Versioned manual/agent move
│       ├── lock-product.ts              # Human ownership toggle
│       ├── remove-product.ts            # Reversible pre-cart removal
│       ├── create-review.ts             # Exact lines + digest from current stable scene
│       ├── approve-review.ts            # One-time, expiring approval record
│       ├── reconcile-cart.ts            # Compare authoritative cart to reviewed lines
│       └── reset-world.ts               # Deterministic initial state; never clears real cart
│
├── webmcp/
│   ├── model-context.d.ts               # Local augmentation only if package types need gaps
│   ├── capability.ts                    # Feature detection; no navigator fallback in app code
│   ├── register-tools.ts                # One AbortController-owned registration lifecycle
│   ├── contracts.ts                     # Tool input/output Zod schemas and type exports
│   ├── tool-names.ts                    # Single source for deskbuilder.* names
│   ├── tool-audit.ts                    # Runtime collision/coexistence diagnostics
│   └── tools/
│       ├── get-scene.ts                 # deskbuilder.get_scene adapter
│       ├── preview-plan.ts              # deskbuilder.preview_plan adapter
│       ├── stage-plan.ts                # deskbuilder.stage_plan adapter
│       ├── move-product.ts              # deskbuilder.move_product adapter
│       └── get-review.ts                # deskbuilder.get_review adapter
│
├── commerce/
│   ├── types.ts                         # ProductSummary, Variant, CartSnapshot, CartResult
│   ├── gateway.ts                       # CommerceGateway interface
│   ├── hydrogen-gateway.ts              # Storefront/cart primitives from generated setup
│   ├── mock-gateway.ts                  # Deterministic local catalog/cart for fallback/tests
│   ├── product-normalizer.ts             # Shopify result → compact safe domain shape
│   ├── cart-gate.ts                     # Standard Action approval/review enforcement
│   ├── cart-events.ts                   # Listen for Shopify cart update/error promises
│   └── cart-reconcile.ts                # Map authoritative cart variants into scene states
│
├── review/
│   ├── ReviewPanel.tsx                  # Exact lines, warnings, total, approval action
│   ├── ProductReviewRow.tsx             # Variant, price, availability, change status
│   ├── ConstraintSummary.tsx            # Budget/market/space summary
│   └── CartDrawerBridge.tsx              # Opens/reflects configured cart UI
│
├── demo/
│   ├── scenario.ts                      # Fixed initial lamp, prompt, products, late constraints
│   ├── run-deterministic-demo.ts        # Calls the same domain commands; labeled fallback
│   └── reset-demo.ts                    # Restores scene only, preserves real cart
│
└── test/
    ├── fixtures/                        # Products, variants, carts, expected scene snapshots
    ├── webmcp-harness.ts                # Target-version registration/execution helper
    └── shopify-harness.ts               # Standard Action/cart event test helpers

tests/
├── unit/                                # Domain schemas, commands, digests, constraints
├── integration/                         # Tool registry, gateway, cart gate, animation rollback
├── e2e/                                 # Manual and deterministic user journeys
└── evals/                               # Prompt → expected tool and argument sequences
```

Generated Hydrogen files take precedence when their exact names differ. The implementation task must map this responsibility tree onto the generated project rather than fighting the generator.

## Domain Model

### Core types

```ts
type ScenePhase =
  | 'ready'
  | 'planning'
  | 'proposal'
  | 'staging'
  | 'editable'
  | 'needs-revision'
  | 'review'
  | 'carting'
  | 'ready-for-checkout'
  | 'unsupported';

type ProductRole =
  | 'lamp'
  | 'display'
  | 'input'
  | 'audio'
  | 'seating'
  | 'organization'
  | 'decor';

interface Money {
  amount: string;
  currencyCode: string;
}

interface ProductVariantRef {
  merchandiseId: string;
  productId: string;
  handle: string;
  title: string;
  variantTitle: string;
  role: ProductRole;
  imageUrl: string | null;
  price: Money;
  available: boolean;
  market: string;
  dimensions?: {widthCm: number; depthCm: number; heightCm: number};
}

interface SceneItem {
  id: string;
  variant: ProductVariantRef;
  anchorId: string;
  status: 'proposal' | 'confirmed' | 'returning' | 'carted' | 'error';
  owner: 'agent' | 'human';
  locked: boolean;
  reason: string;
}

interface WorldConstraints {
  budget: Money;
  deskWidthCm: number;
  market: string;
  styleTags: string[];
  disallowedTags: string[];
  minItems: number;
  maxItems: number;
}

interface SceneSnapshot {
  sceneVersion: number;
  phase: ScenePhase;
  constraints: WorldConstraints;
  items: SceneItem[];
  occupiedAnchors: string[];
  lockedItemIds: string[];
  total: Money;
}

interface PlanProposal {
  proposalId: string;
  basedOnSceneVersion: number;
  constraints: WorldConstraints;
  placements: Array<{
    merchandiseId: string;
    role: ProductRole;
    anchorId: string;
    reason: string;
  }>;
  rejected: Array<{merchandiseId: string; code: string; message: string}>;
  digest: string;
}

interface KitReview {
  reviewId: string;
  sceneVersion: number;
  lines: Array<{merchandiseId: string; quantity: number}>;
  total: Money;
  warnings: string[];
  digest: string;
}

interface ReviewApproval {
  digest: string;
  approvedAt: number;
  expiresAt: number;
  consumed: boolean;
}
```

### Scene store

The Zustand store holds serializable application state:

```text
sceneVersion
phase
constraints
itemsById
proposal
review
approval
activityReceipts
cartSnapshot
selectedItemId
reducedMotion
webMcpCapability
lastStableSnapshot
```

Components may select and render state. Only domain commands may change business state. Animation progress is kept inside the animation controller unless it affects observable product status.

## Domain Commands

Each command:

1. validates input with Zod;
2. reads current state using `sceneStore.getState()`;
3. checks phase and expected version;
4. validates business invariants;
5. records a stable snapshot for rollback if mutating;
6. runs cancellable external/animation work;
7. commits once;
8. returns a compact typed result;
9. maps internal errors to safe public error codes.

### Error codes

```text
UNSUPPORTED_WEBMCP
INVALID_INPUT
INVALID_PHASE
STALE_SCENE
UNKNOWN_PRODUCT
UNAVAILABLE_VARIANT
MARKET_UNAVAILABLE
BUDGET_CONFLICT
ANCHOR_CONFLICT
LOCKED_ITEM_CONFLICT
NO_VALID_PLAN
PROPOSAL_MISMATCH
REVIEW_REQUIRED
REVIEW_EXPIRED
REVIEW_MISMATCH
CART_PARTIAL_FAILURE
CART_MISMATCH
OPERATION_CANCELLED
COMMERCE_UNAVAILABLE
```

Error results include `code`, `message`, `retryable`, and the latest `sceneVersion` where relevant. They never expose raw stack traces, tokens, GraphQL documents, or product text as instructions.

## WebMCP Integration

### Initialization

1. Hydrogen `ShopifyScripts` renders once in the root layout with its default WebMCP support enabled.
2. A client-side project registry checks `document.modelContext?.registerTool`.
3. If unavailable, store capability becomes `unsupported`; no project tools register.
4. If available, create one registration `AbortController` for the page lifecycle.
5. Before each registration, audit intended names against `document.modelContext.getTools()` when the target browser supports the current consumer signature.
6. Register project-prefixed tools with the controller signal.
7. On unmount/page teardown, abort the controller.
8. In development, enumerate tools and assert both Shopify native tools and `deskbuilder.*` tools appear without duplicates.

The production app does not call `executeTool()` itself. That consumer API has changed between Chrome documentation and the latest draft. Browser agents invoke tools through their implementation-defined integration.

### Tool naming

Use exact names:

```text
deskbuilder.get_scene
deskbuilder.preview_plan
deskbuilder.stage_plan
deskbuilder.move_product
deskbuilder.get_review
```

Names are centralized in `tool-names.ts`. Do not add aliases. Do not reuse Shopify names. Descriptions stay under Chrome's recommended character budget and state positive behavior, not long workflow instructions.

### Tool contract: `deskbuilder.get_scene`

Purpose: return the latest compact scene snapshot so an agent can plan from authoritative page state.

Annotations:

```ts
{readOnlyHint: true, untrustedContentHint: false}
```

Input:

```ts
{}
```

Output:

```ts
{
  ok: true,
  sceneVersion: number,
  phase: ScenePhase,
  constraints: WorldConstraints,
  items: Array<{
    id: string,
    merchandiseId: string,
    role: ProductRole,
    anchorId: string,
    locked: boolean,
    owner: 'agent' | 'human',
    status: string,
    price: Money
  }>,
  availableAnchors: string[],
  total: Money
}
```

Do not return product descriptions, reviews, HTML, full images, or internal animation state.

### Tool contract: `deskbuilder.preview_plan`

Purpose: validate exact product variants already discovered through Shopify tools and create a visible proposal without confirming the scene or changing the cart.

Annotations:

```ts
{readOnlyHint: false, untrustedContentHint: true}
```

Input:

```ts
{
  expectedSceneVersion: number,
  constraints: WorldConstraints,
  selections: Array<{
    merchandiseId: string,
    role: ProductRole,
    preferredAnchorId?: string,
    reason: string
  }>
}
```

Rules:

- 3–5 selections.
- Exact Shopify merchandise/variant IDs only.
- Validate each ID through the commerce gateway.
- Treat `reason` as untrusted display text; normalize length and never execute it.
- Preserve locked items.
- Reject duplicate roles unless explicitly permitted.
- Assign deterministic anchors.
- Create translucent proposal parcels and increment `sceneVersion` once.

Output:

```ts
{
  ok: true,
  sceneVersion: number,
  proposalId: string,
  accepted: Array<{merchandiseId: string, anchorId: string}>,
  rejected: Array<{merchandiseId: string, code: string, message: string}>,
  total: Money,
  digest: string
}
```

### Tool contract: `deskbuilder.stage_plan`

Purpose: convert the current validated proposal into a confirmed world through cancellable parcel animations.

Annotations:

```ts
{readOnlyHint: false, untrustedContentHint: false}
```

Input:

```ts
{
  expectedSceneVersion: number,
  proposalId: string,
  proposalDigest: string
}
```

Rules:

- Proposal must match current state and digest.
- Revalidate availability, price, market, budget, anchors, and locked items before animation.
- Save last stable snapshot.
- Execute one package at a time.
- Pass WebMCP execution signal into animation controller and commerce fetches.
- On cancellation/failure, rollback all products from this transaction.
- On success, confirm products, clear proposal, set phase `editable`, increment version once.

Output:

```ts
{
  ok: true,
  sceneVersion: number,
  staged: Array<{merchandiseId: string, anchorId: string}>,
  total: Money
}
```

### Tool contract: `deskbuilder.move_product`

Purpose: move one unlocked scene product to a valid semantic anchor.

Annotations:

```ts
{readOnlyHint: false, untrustedContentHint: false}
```

Input:

```ts
{
  expectedSceneVersion: number,
  itemId: string,
  targetAnchorId: string
}
```

Rules:

- Reject locked items.
- Reject occupied or role-incompatible anchors.
- Animate after validation.
- Roll back on cancellation.
- Increment version once.

### Tool contract: `deskbuilder.get_review`

Purpose: return an exact review for the current stable scene. It does not approve or mutate the cart.

Annotations:

```ts
{readOnlyHint: true, untrustedContentHint: false}
```

Input:

```ts
{ expectedSceneVersion: number }
```

Output:

```ts
{
  ok: true,
  reviewId: string,
  sceneVersion: number,
  lines: Array<{
    merchandiseId: string,
    title: string,
    variantTitle: string,
    quantity: number,
    price: Money
  }>,
  total: Money,
  warnings: string[],
  digest: string
}
```

The UI recomputes this review before displaying approval. A tool result cannot create approval.

### Shopify native WebMCP tools

Expected live tools include Shopify's documented names:

```text
search_catalog
browse_store
get_product
show_variant
get_cart
update_cart
cancel_cart
proceed_to_checkout
search_shop_policies_and_faqs
manage_orders
```

The implementation must discover and snapshot the actual injected tool list in the target Hydrogen preview/browser combination. It must not hard-fail because an irrelevant Shopify tool is absent, but the demo gate requires catalog search, product detail, cart read/update, and checkout handoff.

## Cart Review Gate

### Goal

Prevent Shopify's native `update_cart` path from mutating the cart unless the exact current kit has received visible human approval.

### Configuration

Shopify Standard Actions permit `Shopify.actions.updateCart.configure({ handler })`. Only the first configuration wins. The implementation must configure the action once, as early as the Hydrogen client runtime permits, before any demo cart call.

### Review lifecycle

1. Current stable scene produces `KitReview` with canonical lines and digest.
2. Review panel displays exact lines, variants, prices, warnings, and total.
3. Human presses `Approve exact kit`.
4. `approveReview()` revalidates current scene/cart/product data and stores a one-time `ReviewApproval` for the digest, with a short expiry.
5. The approval button invokes `Shopify.actions.updateCart()` with the reviewed lines.
6. Configured cart handler canonicalizes the payload and compares it with the unconsumed approval.
7. On mismatch/missing/expired approval, throw or return a schema-compatible `REVIEW_REQUIRED` failure without calling `defaultHandler()`.
8. On match, call `defaultHandler()`, await the result, consume approval, and return Shopify's result.
9. Listen to the emitted cart event promise and/or Hydrogen cart subscription.
10. Reconcile authoritative cart lines against the review.
11. Animate only accepted variants into the cart.
12. If cart differs, show discrepancy and keep checkout disabled.

### Native agent calls

If a browser agent calls Shopify's native `update_cart` before the human approval button creates a matching approval, the configured handler rejects it. The agent can continue searching and staging without a click; cart mutation is intentionally the single human approval action.

### Exact handler result

Do not invent Shopify's error result shape in advance. Derive the handler signature and result type from the pinned Hydrogen preview package. The integration spike must prove how a rejected handler propagates to Shopify's native WebMCP tool and UI. If a thrown typed error does not produce a useful agent result, return the package-defined result shape with a `REVIEW_REQUIRED` user error.

## CommerceGateway

The gateway exists for domain validation, manual UI, deterministic demo, and tests. It is not exposed as a duplicate custom WebMCP catalog/cart tool in live mode.

```ts
interface CommerceGateway {
  getProductsByMerchandiseIds(
    ids: string[],
    context: {market: string; signal?: AbortSignal}
  ): Promise<ProductVariantRef[]>;

  getCart(signal?: AbortSignal): Promise<CartSnapshot>;

  updateCart(
    lines: Array<{merchandiseId: string; quantity: number}>,
    signal?: AbortSignal
  ): Promise<CartMutationResult>;

  getCheckoutUrl(signal?: AbortSignal): Promise<string | null>;
}
```

### HydrogenGateway

- Uses generated Hydrogen Storefront/cart primitives.
- Normalizes product/variant data to small domain types.
- Uses buyer market context for price and availability.
- Reuses Standard Actions/cart store for mutations where appropriate.
- Never exposes private tokens client-side.

### MockCommerceGateway

- Uses deterministic local fixtures matching the same interface.
- Simulates one unavailable variant, one price change, and one partial cart failure.
- Powers unit/integration tests and labeled fallback mode.
- Never presents its cart as a real Shopify cart.

## Constraint And Placement Rules

Keep rules deterministic and explainable.

### Product constraints

- 3–5 confirmed products.
- Each selected variant must be available in the active market.
- Sum must be within budget.
- Product must map to one known `ProductRole`.
- Orange lamp begins locked and consumes the lamp role.
- No RGB-tagged product when `RGB` is disallowed.
- Duplicate merchandise IDs are rejected.

### Placement constraints

- Fixed anchor catalog for one desk width profile.
- Each anchor accepts a set of roles and maximum footprint.
- One product per anchor.
- Human-locked item anchor cannot change.
- Manual drag snaps to nearest compatible unoccupied anchor.
- Invalid drag animates back and reports why.

### Constraint shock

Changing from 120 cm to 90 cm desk marks anchors outside the smaller profile invalid. Replanning preserves locked and compatible items, returns only invalidated items, and proposes replacements that fit the remaining anchors and budget.

## Animation Architecture

### Transaction model

`WorldAnimationController` owns one active scene mutation timeline at a time.

```text
validate command
  capture stable snapshot
    reserve anchors
      enqueue animation receipts
        run GSAP timeline
          commit scene state
            increment version
              resolve tool/command
```

On AbortSignal, error, or component teardown:

```text
kill timeline
clear transient parcels
restore stable snapshot
emit OPERATION_CANCELLED or typed failure
leave version unchanged
```

### Required timelines

- Parcel arrival → open → product reveal → anchor placement.
- Rejected/unavailable product → divert or return carton.
- Replacement → old product exits before new package arrives.
- Cart success → confirmed objects travel toward cart UI after reconciliation.
- Reduced motion → fade proposal, direct placement, short cart confirmation.

Animation never predicts success. It begins from authoritative domain/cart transitions and updates visible state before a WebMCP callback resolves.

## Most Important Data Flow

### Initial agent-built world

```text
1. Shopper opens page.
2. Hydrogen ShopifyScripts injects native Shopify WebMCP tools.
3. Project registry adds deskbuilder.* tools.
4. Browser agent calls deskbuilder.get_scene.
5. Agent calls Shopify search_catalog/get_product to select exact variants.
6. Agent calls deskbuilder.preview_plan with exact merchandise IDs and constraints.
7. Domain validates through HydrogenGateway and creates visible proposal parcels.
8. Agent calls deskbuilder.stage_plan with current version/proposal digest.
9. Domain revalidates, runs cancellable parcel timeline, commits scene once.
10. Agent receives compact success result after UI is stable.
```

### Human edit and agent repair

```text
1. Human locks or drags an item through manual UI.
2. UI calls the same domain command used by project tools.
3. Scene commits and increments sceneVersion.
4. Any older agent mutation fails STALE_SCENE.
5. Agent re-calls deskbuilder.get_scene.
6. Agent searches replacements through Shopify native tools.
7. Preview/stage repeats while preserving locked and unaffected items.
```

### Review to real cart

```text
1. Agent or UI calls deskbuilder.get_review.
2. UI independently recomputes review from current authoritative data.
3. Human sees exact lines and presses Approve exact kit.
4. App records one-time digest approval.
5. UI calls Shopify.actions.updateCart(reviewedLines).
6. Configured handler verifies digest, then calls Shopify default handler.
7. Shopify resolves cart result and emits/subscribes authoritative state.
8. App reconciles cart with review.
9. Accepted scene items animate into cart; mismatches remain with errors.
10. Checkout enables only when reconciliation succeeds.
```

## Components And Responsibilities

### ExperienceShell

Implements: `prd.md > Epic 1: Understand the experience`, `Epic 7: Recover gracefully`.

- Owns responsive page layout, capability status, example prompt, fallback banner, and global phase presentation.
- Never contains scene or cart business logic.

### DeskCanvas And World Components

Implements: `prd.md > Epic 3: Watch the world assemble`, `Epic 4: Shape the result manually`.

- Render fixed world, anchors, products, parcels, proposal/confirmed/locked states.
- Forward pointer/keyboard intent to domain commands.
- Never write cart state or call Shopify directly.

### Domain Command Layer

Implements: all epics' behavioral invariants.

- Owns validation, scene versioning, proposals, placement, rollback, review digest, and safe error mapping.
- Only layer allowed to commit scene business state.

### WebMCP Registry And Tool Adapters

Implements: `prd.md > Epic 2`, `Epic 3`, `Epic 5`, and WebMCP submission proof points.

- Registers project-prefixed tools once per page lifecycle.
- Validates tool inputs again in code.
- Reads store state at execution time, not registration time.
- Passes cancellation signal into commands.
- Returns compact JSON-serializable results.

### CommerceGateway

Implements: product/variant validation and cart truth needed by `Epic 2`, `Epic 5`, `Epic 6`, `Epic 7`.

- Separates scene domain from Hydrogen preview churn.
- Provides live and deterministic implementations.
- Not exposed as duplicate live WebMCP search/cart tools.

### CartGate And ReviewPanel

Implements: `prd.md > Epic 6: Review and cart the exact setup`.

- Produces exact human-visible review.
- Records one-time approval.
- Configures Shopify Standard Action update handler.
- Reconciles authoritative cart before animation/checkout.

### Deterministic Demo Runner

Implements: unsupported/degraded behavior and demo resilience.

- Uses the same domain commands with fixed input.
- Is always visibly labeled.
- Cannot claim Shopify/WebMCP execution when using mocks.

## External APIs And Dependencies

### WebMCP

- [Current Community Group draft](https://webmachinelearning.github.io/webmcp/)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Chrome best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- [Chrome security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- [Chrome eval guidance](https://developer.chrome.com/docs/ai/webmcp/evals)

The current draft is the final authority when Chrome documentation lags. Notably, do not use the removed `requestUserInteraction()` despite an older Chrome security page mentioning it.

### Shopify

- [Shopify WebMCP tool reference](https://shopify.dev/docs/api/web-mcp)
- [Hydrogen developer preview](https://shopify.dev/docs/storefronts/headless/developer-preview)
- [Hydrogen preview updates](https://hydrogen.shopify.dev/updates)
- [Standard Action configuration](https://shopify.dev/docs/api/storefront-events-and-actions/actions/configure)
- [Standard cart events](https://shopify.dev/docs/api/storefront-events-and-actions/events)
- [Storefront Cart](https://shopify.dev/docs/api/storefront/latest/objects/cart)

### Asset constraints

- Prefer local low-poly GLB assets or primitive geometry for fixtures.
- Product images may be used as decals/cards when no suitable model exists.
- Every third-party asset needs a compatible license recorded in `THIRD_PARTY_NOTICES.md`.
- Do not scrape unlicensed 3D models.

## AI Usage

The deployed product does not host or call its own language model. It relies on the shopper's compatible browser agent to interpret the request and compose WebMCP tools.

The app supplies:

- structured site-owned tools;
- deterministic product/constraint validation;
- visible shared state;
- exact commerce integration;
- human approval boundaries.

AI output is never the source of price, availability, cart, or checkout truth. Free text from product data and agent-supplied reasons is treated as untrusted content, length-limited, and never executed.

Codex is used during development for research, planning, scaffolding, implementation, debugging, tests, and submission drafting. The final submission must accurately describe this use.

## Testing Strategy

### Unit tests

- Every Zod schema accepts valid fixtures and rejects malformed/extra fields.
- Scene commands reject stale versions, invalid phases, locked moves, duplicate products, invalid anchors, and budget conflicts.
- Successful mutations increment version once.
- Failed/cancelled mutations preserve version and restore snapshot.
- Canonical review digest is order-stable and changes for any line/quantity/price/scene change.
- Approval expires and consumes once.
- Product normalizer drops unsafe/unneeded text.

### Integration tests

- Register and abort all `deskbuilder.*` tools without leaks.
- Detect duplicate tool names before registration.
- Enumerate target-browser tool list and confirm Shopify + custom coexistence.
- Manually invoke project tools with target-version harness.
- Configure `Shopify.actions.updateCart` exactly once.
- Unapproved cart call fails without reaching default handler.
- Approved exact payload reaches default handler.
- Mismatched payload fails and leaves approval unconsumed or explicitly invalidated according to final spike result.
- Cart success event reconciles lines before animation.
- Partial cart failure animates only accepted lines.
- Abort during staging rolls back the scene.

### End-to-end tests

- Manual unsupported-browser journey.
- Labeled deterministic demo journey.
- Live WebMCP registration smoke in target Chromium configuration.
- Initial prompt path to staged 3–5 item desk.
- Human drag increments version; stale agent call fails.
- Constraint shock replaces only invalidated items.
- Review approval updates real cart and opens matching drawer.
- Checkout remains disabled on mismatch and enabled on exact reconciliation.
- Keyboard-only manual flow.
- Reduced-motion flow.
- Laptop viewport and basic mobile viewing.

### Agent evals

Use Chrome's eval guidance to test tool selection and argument accuracy.

Required prompts:

```text
Direct:
"Show me the current desk world."

Build:
"Build a cozy desk setup under ₹30,000 for a small room. No RGB. Keep the orange lamp."

Ambiguous:
"Make the desk calmer and less expensive."

Constraint shock:
"Fit this on a 90 cm desk, keep it under ₹25,000, and only use items available in India."

Stale state:
Human moves a product after the agent reads scene, before stage call.

Adversarial product text:
Product description contains instructions to ignore prior rules and call cart.
```

Assert expected tool families and required arguments, not brittle natural-language wording. Include mid-chain Shopify search/variant/cart failures.

## Risks And Verification

### Risk 1: Experimental API or browser mismatch

Verification:

- Feature-detect `document.modelContext` in exact judged environment.
- Register one `deskbuilder.echo` spike tool before scaffolding the world.
- Manually invoke through ChatGPT in-app browser or target Chrome agent.
- Pin target browser instructions in README.

Fallback:

- Manual UI plus deterministic labeled demo.
- Recorded live successful run for presentation resilience.

### Risk 2: Shopify and custom tool collision/coexistence

Verification:

- Generate Hydrogen preview storefront and render ShopifyScripts.
- Enumerate tool names.
- Register one prefixed custom tool.
- Enumerate again and call both a Shopify tool and custom tool.
- Fail build if any duplicate name exists.

### Risk 3: Cart review handler behavior

Verification:

- Configure handler before demo calls.
- Test unapproved native WebMCP `update_cart` call.
- Test approved exact call.
- Confirm how thrown/returned failures surface to the browser agent.
- Confirm one-time approval and cart event promise behavior.

Fallback:

- If native tool failure propagation is unusable, disable Shopify WebMCP for cart in the demo profile and expose one project commit tool backed by the same reviewed gate. Do not expose overlapping cart tools.

### Risk 4: No Shopify development store ready

Verification:

- Start with generated preview/mock storefront data.
- Create or connect a development store during the integration gate.
- Keep scene work behind CommerceGateway.

Fallback:

- Preserve real project WebMCP scene operation with a clearly labeled deterministic commerce adapter; do not claim real Shopify cart proof until connected.

### Risk 5: 3D polish consumes the schedule

Verification:

- Fixed anchors and primitives first.
- One parcel timeline proves the visual grammar.
- Use product cards/decals instead of custom modeling where needed.
- Cut secondary product animations before tests/video time.

### Risk 6: Agent tool confusion

Verification:

- No custom catalog/cart duplicates.
- Five project tools maximum.
- Short positive descriptions and strict schemas.
- Eval direct, ambiguous, and failure prompts.

### Risk 7: Scene/cart divergence

Verification:

- Review digest covers exact merchandise IDs and quantities.
- Approval gate checks payload.
- Reconcile returned/subscribed cart snapshot.
- Checkout disabled on mismatch.

## Architecture Self-Review

### Finding 1: The original custom commerce tools overlapped Shopify

Correction: live agent commerce uses Shopify native tools. Custom tools own only miniature scene operations. CommerceGateway exists for application code, validation, fallback, and tests.

### Finding 2: The earlier design implied WebMCP could enforce confirmation

Correction: current WebMCP cannot. Human approval and the cart handler are application-enforced. Standard annotations are hints only.

### Finding 3: The earlier design implied scene state could be pushed

Correction: agents call `deskbuilder.get_scene`; mutation version checks provide correctness. `toolchange` is not used for state.

### Finding 4: Next.js/Hydrogen preview is valid but volatile

Correction: use the official setup, pin the preview lockfile, perform integration gates first, and avoid post-gate upgrades.

### Finding 5: The spec still risks too much animation

Control: one world, fixed anchors, three package sizes, one arrival grammar, one replacement grammar, and one cart payoff. No asset work begins before Shopify/WebMCP/cart gates pass.

## Implementation Sequence For Checklist

`$build-checklist` must produce tasks in this dependency order:

1. Scaffold official Next.js + Hydrogen preview project; deploy empty shell.
2. Prove target WebMCP feature and one custom prefixed tool.
3. Prove Shopify native tools and custom tools coexist.
4. Prove Standard Action cart review handler and real cart reconciliation.
5. Freeze package/browser/Hydrogen versions.
6. Implement domain types, schemas, store, commands, versioning, digests, and tests.
7. Implement CommerceGateway live/mock adapters and fixtures.
8. Implement bare fixed-anchor R3F desk world and manual controls.
9. Register the five project WebMCP tools over domain commands.
10. Implement proposal/stage/revision workflows without polish.
11. Implement review gate, cart events, reconciliation, and checkout state.
12. Add package/replacement/cart animation transactions and reduced motion.
13. Add activity ribbon, compatibility/fallback UX, and accessibility list views.
14. Add unit, integration, E2E, and agent eval coverage.
15. Deploy, run smoke tests, record successful WebMCP demo, and protect final submission time.

Each checklist task must name files, verification command, expected observable result, and rollback/fallback when relevant.

## Demo And Submission Flow

### 90-second demo outline

```text
0–10s   Show empty mini desk, locked orange lamp, agent-ready status.
10–20s  Give browser agent the desk brief.
20–40s  Agent uses Shopify search + project scene tools; packages assemble setup.
40–50s  Human drags/locks one product.
50–65s  Give constraint-shock request; stale state is preserved and only conflicts change.
65–78s  Show exact review; human approves once.
78–88s  Shopify-confirmed products animate into matching real cart drawer.
88–90s  Show checkout handoff and one-line WebMCP explanation.
```

### Proof visible in recording

- Browser agent tool calls include Shopify native and `deskbuilder.*` tools.
- No embedded chatbot.
- Human edit survives agent revision.
- Scene/cart exact variant IDs and totals reconcile.
- Approval occurs before cart mutation.
- Checkout remains user-controlled.
- Tool/debug view or development overlay can verify calls, but the consumer UI must remain understandable without it.

## Spec Completion Criteria

The spec is complete when a fresh Codex implementation task can:

- scaffold the official generated storefront;
- locate every project responsibility in the file tree;
- implement tools from exact contracts;
- trace scene data from agent/human input through commands to 3D and cart;
- enforce stale-state and review/cart invariants;
- test the documented risks before polishing;
- ship the defined demo without inventing additional product decisions.
