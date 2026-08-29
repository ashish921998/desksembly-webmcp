# Project Scope

## Project Name

- **Desksembly** — chosen by Ashish after Visual Pause 2.
- Tagline: “An agent-ready desk, assembled in front of you.”

## One-Line Summary

A shopper asks their browser agent for a complete desk setup; WebMCP lets the agent select, validate, and visibly arrange real products in a miniature 3D world before the shopper approves the exact setup for a Shopify cart.

## Target User

The primary user is an everyday online shopper who wants to buy a complete desk or work-from-home setup but does not want to search, compare, resolve variants, track compatibility, and manage a budget across many product pages.

The MVP is consumer-facing. Merchant value is a secondary part of the story: better product discovery, understandable curated kits, exposure of more catalog items, and a distinctive agent-ready storefront experience.

## Problem

Buying a complete setup is a multi-product decision rather than a single-product search. A shopper must repeatedly:

- discover products across several categories;
- compare price, style, availability, and variants;
- remember a running budget;
- decide whether products form a coherent setup;
- preserve favorite choices while replacing incompatible ones;
- add each exact variant to the cart.

Ordinary storefront navigation exposes these operations as separate pages, filters, and buttons. A generic browser agent can see the interface, but without a typed capability surface it must scrape the page or imitate clicks. WebMCP lets the site expose reliable, structured actions that operate the same visible application state as the shopper.

## Core Workflow

1. The shopper opens a miniature desk world backed by one small Shopify product catalog.
2. They give their compatible browser agent a brief such as: “Build a cozy work-from-home setup under $350 for a small room in the US. No RGB. Keep the orange lamp.”
3. The agent discovers the page's WebMCP tools, reads current scene state, searches products, resolves variants, and previews a valid kit.
4. Validated products arrive as animated packages, unpack, and move smoothly into fixed semantic positions around the desk.
5. The shopper locks, drags, rejects, or swaps one item.
6. The agent re-reads the scene and repairs only the affected portion without overwriting the shopper's decision.
7. The page displays exact products, variants, quantities, constraints, and total for review.
8. After explicit approval, Shopify accepts the cart mutation. Only accepted items animate into the visible cart.
9. The shopper receives a normal, visible handoff to Shopify Checkout; no autonomous payment occurs.

## What We Are Building

### Shopper experience

- One responsive storefront experience centered on a miniature Three.js desk scene.
- One curated development-store catalog with 6–12 visually legible products.
- One completed kit containing 3–5 exact product variants.
- A text-first brief with budget, visual preference, room constraint, and one preserved item.
- A visible proposal state distinct from confirmed scene and cart states.
- One human lock/drag/swap override.
- Deterministic validation for budget, availability, item count, and simple placement compatibility.
- A review panel showing exact cart intent before mutation.
- One real Shopify cart update and visible checkout handoff.
- Ordinary manual controls and feature detection when WebMCP is unavailable.

### WebMCP surface

- `get_world_state` — return scene version, constraints, placed/locked products, budget, and cart summary.
- `search_store_products` — return compact product candidates from the Shopify-backed catalog.
- `preview_world_plan` — validate a proposed kit and return placements without mutation.
- `stage_world_plan` — run an allowlisted, scene-only placement choreography.
- `move_product` — make one reversible spatial change.
- `review_kit` — return exact variants, quantities, total, warnings, and a reviewed-plan hash.
- `commit_kit_to_cart` — reject stale state, update Shopify, and animate only accepted cart lines.

### Visual system

- One fixed isometric desk world with semantic anchors rather than free-form procedural geometry.
- Three reusable package sizes.
- Parcel arrival, opening, product placement, replacement/return, and post-approval cart animations.
- A compact tool-receipt ribbon showing sanitized calls and outcomes.
- Clear visual ownership: human-locked objects, agent proposals, confirmed products, failures, and carted items look different.
- Reduced-motion behavior for major transitions.

## What We Are Not Building

- Merchant dashboard, Shopify Admin workflow, or inventory forecasting.
- Multiple rooms, stores, catalogs, or product categories.
- Persistent user accounts, saved projects, or collaborative editing.
- General-purpose interior design or physically accurate room planning.
- Procedural building generation, avatars, multiplayer, crowds, or simulated conversion analytics.
- Formal Shopify Bundle SKU creation, bundle inventory reconciliation, or discount administration.
- Cross-merchant universal carts.
- Autonomous checkout or payment.
- Reliance on proposed WebMCP features such as rich file inputs, persistent service-worker tools, standardized live state subscriptions, or protocol-level bulk execution.

These are explicit cuts, not missing promises. The goal is one polished vertical slice that makes WebMCP immediately understandable.

## Inspiration And References

- **Unpacking:** tactile parcel reveal and deliberate object placement.
- **Townscaper:** small structured inputs resolving into a coherent miniature world.
- **Wilmot's Warehouse:** spatial grouping as a visible product taxonomy.
- **Stacklands:** combining products into a proposed kit before validation.
- **Overcooked:** complementary human and agent roles with visible handoffs.
- **Factorio:** a brief glass-box pipeline that reveals tool sequencing.
- **A Little to the Left:** satisfying snap behavior and several valid arrangements.
- **Donut County:** a short, funny cart transition used only after approval.

Detailed evidence and links are in `outputs/webmcp-shopify-research-and-plan.md`. The visual concept is in `outputs/show-me-webmcp-shopify-concept.html`.

## Demo Path

### Setup

The miniature desk opens with an orange lamp already placed and locked by the shopper. The budget meter and US shipping context are visible.

### Initial request

> “Build a cozy work-from-home desk setup under $350 for a small room in the US. No RGB lighting. Keep the orange lamp.”

The agent reads the current world, searches the catalog, resolves variants, and stages a 3–5 item setup. Products pass through named validation steps, arrive as packages, unpack, and snap into place.

### Human intervention

The shopper drags one item away or rejects it. The scene version changes. The agent detects stale state on its next mutation, re-reads the world, preserves the orange lamp and all unaffected products, and replaces only the invalidated item.

### Constraint shock

> “Make the setup fit a 90 cm desk, keep it under $300, and replace anything that is not available in the US.”

Only necessary products leave in return cartons. New packages arrive and the world settles into a valid layout. Exact product/variant, reason, availability, and total remain visible.

### Cart proof

The shopper reviews and approves the exact kit. Shopify is updated first; confirmed items then animate into the real storefront cart, whose drawer and total match the reviewed scene. The final action is a visible checkout handoff.

## The Defining WebMCP Moment

A compatible browser agent dynamically composes site-owned catalog, scene, validation, and cart tools around agent-held context and a concurrent human edit. It updates a non-DOM 3D world and the shopper's live Shopify session without scraping controls, coordinate clicking, or a store-specific embedded chatbot.

The defensible claim is: impossible through this storefront's ordinary click-and-form workflow alone—not impossible for any bespoke website to implement.

## Submission Story

This project demonstrates what an agent-ready Shopify storefront can feel like when structured commerce capabilities become a shared visual workspace.

The human remains responsible for fuzzy intent, taste, corrections, and approval. The agent handles repetitive search, variant resolution, constraint checking, and precise execution. Shopify remains the source of product and cart truth. WebMCP is the open bridge that lets a compatible browser agent operate the experience reliably while the shopper watches the real interface change.

The result is not another shopping chatbot and not a decorative 3D storefront. It is a new interaction primitive: a browser-agent-operable, directly manipulable product world.

## Time Budget And Scope Ruler

Available time: approximately 40–50 focused build hours before the submission deadline.

Planned allocation:

- Integration gate: 6–8 hours.
- Core scene and shared state: 8–10 hours.
- WebMCP tool surface and constraint workflow: 8–10 hours.
- Shopify catalog/cart integration: 6–8 hours.
- Animation, responsive UI, and accessibility polish: 8–10 hours.
- Testing, deployment, README, submission material, and demo recording: protected final 8–10 hours.

If an integration gate fails, use a clearly labeled deterministic catalog/cart adapter while preserving real WebMCP scene operation. Do not sacrifice the final test/deployment/video block to add features.

## Technical Risk Gates

Before visual polish:

1. Verify the target browser exposes the required `document.modelContext` API.
2. List and call Shopify's built-in WebMCP tools on a real Liquid or Hydrogen development storefront.
3. Verify custom scene tools can coexist with Shopify's native tool registrations.
4. Mutate and reconcile a real cart, including theme drawer/counter behavior.
5. Verify ambiguous variants return clarification without mutation.
6. Verify buyer-country context before claiming shippability.
7. Confirm checkout is a visible handoff after tool completion.

## Definition Of Done

The proof of concept is done when a judge can:

1. Open the deployed app in a supported browser.
2. Use a browser agent to discover and call the WebMCP tools.
3. Watch a valid 3–5 product desk setup assemble from one prompt.
4. Make one manual edit that the agent preserves.
5. Add a late constraint and watch only necessary products change.
6. Review exact products, variants, quantities, and total.
7. Approve one real Shopify cart update.
8. See the live cart match the miniature scene.
9. Reach a normal Shopify Checkout handoff.

No other category, mode, or feature is required for the MVP.
