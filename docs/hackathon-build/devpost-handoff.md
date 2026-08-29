# Desksembly — Devpost Handoff

Prepared for `$prepare-submission`. This document is not a submitted Devpost
entry and does not create or modify a Devpost project.

## Project identity

- **Name:** Desksembly
- **Tagline:** An agent-ready desk, assembled in front of you.
- **Live URL:** <https://devp-one.vercel.app>
- **Public repository:** <https://github.com/ashish921998/desksembly-webmcp>
- **Narrated demo draft:** `docs/evidence/demo-draft.mp4` (29.96 seconds)
- **YouTube URL:** Required before submission; upload the approved draft publicly
  during `$prepare-submission`.

## Short description

Desksembly is a WebMCP-powered miniature desk builder where a shopper and their
browser agent share one visible, directly manipulable workspace. The agent reads
versioned scene state, proposes exact products, and stages them through animated
parcels. The shopper can move or lock any choice. A late 90 cm, $300, US-market
constraint preserves those human decisions and replaces only the product that no
longer fits.

## Full project story

### The problem

Buying a complete desk setup is not one search. A shopper has to compare several
categories, resolve exact variants, track price and availability, remember what
they already liked, and then reproduce the final decision in a cart. A generic
browser agent can imitate clicks, but it lacks a reliable contract for the
non-DOM state inside a visual product workspace.

### What Desksembly does

Desksembly exposes five deliberately scoped WebMCP tools:

```text
deskbuilder.get_scene
deskbuilder.preview_plan
deskbuilder.stage_plan
deskbuilder.move_product
deskbuilder.get_review
```

Shopify retains ownership of its native catalog, cart, policy, and checkout
tools. The project tools own only the miniature scene. Both the shopper UI and
WebMCP adapters call the same versioned domain commands.

A typical run begins with a locked orange lamp and the brief: “Build a cozy
work-from-home desk setup under $350 for a small room in the US. No RGB. Keep the
orange lamp.” Parcels arrive one at a time, open, and settle onto semantic desk
anchors. The shopper can inspect, drag, move, lock, unlock, or remove products
through the canvas or its equivalent accessible list.

Then the shopper adds a late constraint: fit the setup on a 90 cm desk, keep it
under $300, and use US-available products. A stale agent call is rejected. After
refreshing, the agent preserves the locked lamp and keyboard plus unaffected
products, returns only the wide-desk plant, and stages one compact replacement.

### Why WebMCP is essential

The defining moment crosses several ownership boundaries: a browser agent reads
site-owned scene state, composes Shopify discovery with project-specific scene
tools, survives a concurrent human edit through optimistic versioning, and
changes a non-DOM 3D world without scraping controls or embedding a store-specific
chatbot.

This produces a better experience because the agent's work is visible and
reversible. Product proposals, package movement, validation, stale-state errors,
human locks, review lines, and cart outcomes all appear in the same interface.

### Implementation

- Next.js App Router and the pinned Shopify Hydrogen developer preview provide
  server rendering, Storefront API primitives, ShopifyScripts, native WebMCP,
  Standard Actions, and request routing.
- A strict Zod-validated command layer owns every scene mutation.
- Zustand provides synchronous fresh reads for long-lived WebMCP callbacks.
- Every mutation checks `expectedSceneVersion`; failed and cancelled operations
  leave the prior stable state intact.
- React Three Fiber and Three.js render the fixed semantic desk world.
- GSAP drives cancellable parcel transactions; Motion renders activity receipts.
- Exact SHA-256 digests protect proposals and one-time review approvals.
- Playwright, Vitest, and prompt-family evals cover manual, agent, failure,
  cancellation, stale, reduced-motion, and responsive paths.

### Deterministic fallback disclosure

No participant Shopify development store was available. Desksembly therefore
uses a clearly labeled deterministic desk catalog and deterministic final cart.
Shopify-hosted `mock.shop` separately proves native Shopify WebMCP coexistence and
the application-enforced cart gate, including a rejected unapproved native cart
call and an approved Shopify-hosted test line.

The project does **not** claim that the desk fixture variants exist in a
participant store, that its final scene reached a real participant-store cart,
or that Shopify Checkout is enabled. Even after exact deterministic
reconciliation, the checkout control remains disabled with the missing-store
explanation.

### What people and agents can now do together

The human contributes taste, manual spatial decisions, locks, constraint changes,
and purchase approval. The agent contributes structured scene reads, repetitive
discovery, exact argument composition, deterministic validation, and precise
replanning. Neither role silently overwrites the other.

### Accomplishments

- Shopify native tools and exactly five project tools coexist without collision.
- Human edits cause stale agent mutations to fail safely.
- The US constraint shock preserves exact IDs and replaces only one conflict.
- Animation cancellation removes transient parcels and preserves stable state.
- Reduced-motion replay produces the same five-item result in under one second.
- Exact review invalidates on price changes and consumes approval once.
- Partial deterministic cart acceptance animates accepted lines only and blocks
  checkout.
- The entire product remains manually usable without WebMCP.

### What we learned

The current WebMCP draft intentionally keeps tool metadata and execution small;
it does not provide application state push or dependable confirmation. Correctness
therefore belongs in the website's own versioning, transaction, and approval
boundaries. Shopify and custom tools can coexist cleanly when the project avoids
duplicating commerce capabilities and gives every scene tool a precise prefix.

### What's next

Connect a participant development store containing the curated desk variants,
replace the deterministic final cart with authoritative scene-to-cart
reconciliation, upload the narrated demo to YouTube, and capture the complete
90-second live judge flow.

## Built with

- WebMCP
- TypeScript
- Next.js
- React
- Shopify Hydrogen
- Shopify Storefront API and Standard Actions
- React Three Fiber
- Three.js and Drei
- Zustand
- Zod
- GSAP
- Motion
- Vitest
- Playwright
- Vercel
- OpenAI Codex

## AI and Codex usage

Codex was used for standards and sponsor research, product interviews, scope,
PRD/spec/checklist creation, architecture review, implementation, debugging,
test generation, live browser verification, deployment, evidence capture, and
handoff drafting. The running app hosts no model and sends no shopper request to
a proprietary model API; it relies on the shopper's compatible browser agent.

## Judge instructions

1. Open <https://devp-one.vercel.app> in ChatGPT's in-app browser or Chrome with
   WebMCP enabled.
2. Confirm Shopify's native tools and the five `deskbuilder.*` tools are visible.
3. Copy the $350 starter prompt or run the labeled deterministic replay.
4. Cancel once and retry; optionally enable reduced motion.
5. Select and lock the QuietType keyboard.
6. Apply the US constraint shock and observe one return and one replacement.
7. Prepare the exact review and try the price-change and partial-failure controls.
8. Approve the deterministic kit once. Confirm the unrelated line remains and
   Shopify Checkout is explicitly unavailable.

No credentials are required. The fallback banner is expected.

## Official requirement mapping

- **Working live URL:** ready and production-smoke verified.
- **Text description:** covers WebMCP fit, UX, human-agent collaboration, and
  implementation.
- **Demo video:** local narrated MP4 is ready and under three minutes; public
  YouTube upload remains for `$prepare-submission`.
- **Public repository:** ready after Item 12 push; MIT license at repository root.
- **Source/assets/instructions:** complete in the repository and README.
- **Required visible WebMCP registration:** implemented imperatively in
  `src/webmcp/register-tools.ts`.

## Submission-form answer draft

| Field | Draft |
| --- | --- |
| Submitter Type | Individual — confirm during `$prepare-submission` |
| Country of residence | Participant confirmation required; do not infer from app market |
| App Status | New |
| Existing-project update | Not applicable; all repository implementation is new hackathon work |
| Live URL | https://devp-one.vercel.app |
| Testing instructions | Use judge instructions above; no credentials; deterministic fallback expected |
| Public code repository | https://github.com/ashish921998/desksembly-webmcp |
| Agent/client tested | ChatGPT/Codex in-app browser with WebMCP; ordinary Playwright Chromium for unsupported fallback |
| AI tools leveraged | OpenAI Codex for research, planning, implementation, tests, debugging, verification, deployment, and handoff |
| Learning level | Suggested: Significant — participant must confirm |
| Career AI value | Suggested: Yes — participant must confirm |

## Official judging alignment

- **WebMCP Leverage:** non-trivial five-tool scene surface, Shopify coexistence,
  stale-state correctness, cancellation, and adversarial handling.
- **Execution:** deployed coherent manual/agent/failure/fallback product journey.
- **Potential Impact:** reduces multi-product comparison and precise execution work
  for setup shopping while preserving human control.
- **Creativity & Ambition:** directly manipulable miniature commerce world with
  visible parcel transactions and concurrent human-agent ownership.
