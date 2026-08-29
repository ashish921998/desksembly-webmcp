# Build Notes

## Onboarding

- Guided build path selected.
- Devpost identity resolved as Ashish Huddar.
- Round 1 started: project idea and technical experience.
- Ashish is starting without a preset project idea and wants guided brainstorming.
- Ashish identifies as an advanced developer; the remaining flow should emphasize tradeoffs, speed, and a non-trivial WebMCP implementation.
- Round 2 produced and confirmed a candidate direction: a Three.js-based, WebMCP-operable 3D planning and commerce workspace.
- Active shaping: Ashish redirected the initial commerce-game concept toward a credible normal product, while preserving a fun and highly visual demo.
- Product thesis: the human contributes taste and judgment; the agent performs structured catalog search, scene manipulation, constraint validation, budgeting, and iterative revisions.
- Active shaping: Ashish narrowed the goal toward a Shopify-sponsor-aligned experience for merchants or people who enjoy the concept, with a miniature 3D world and polished package/cart animations.
- Validation gate: do not finalize the project plan until current WebMCP capabilities and discussions, Shopify opportunities, and relevant interaction/game patterns have been researched.
- Non-negotiable: define a single demo moment that is impossible to express as a normal website workflow.
- Research completed across WebMCP specifications and discussions, Shopify official platform material and merchant discussions, and nine relevant interaction/game patterns.
- Recommended direction: a Shopify-backed living planogram, not a decorative 3D shop or embedded chatbot.
- Core boundary: Shopify owns commerce truth; custom page-local WebMCP tools own scene and animation truth.
- Research output: `outputs/webmcp-shopify-research-and-plan.md`.
- Round 3 completed: miniature 3D world, animated parcel arrival, polished placement/cart motion, and game-inspired interaction grammar were selected.
- Ashish approved the researched living-planogram direction after reviewing the visual storyboard.
- Ideation outcome: use WebMCP to let compatible browser agents operate a deliberate site-owned tool surface without scraping or clicking through the UI; preserve explicit approval for consequential cart/checkout actions.

## Scope

- Time budget confirmed: full-time, approximately 8–10 hours per day for the remaining window (roughly 40–50 hours).
- Scope principle: spend the first build block proving WebMCP, Shopify, and custom scene tools can coexist; visual polish follows only after the integration gate passes.
- First world selected: a compact desk setup. Other product worlds are outside the MVP unless the complete vertical slice ships early.
- Scope deepening rounds: 0. Ashish chose to write the scope after the mandatory beats.
- Scope document written with one shopper, one desk world, one catalog, one human override, one constraint-shock revision, and one verified Shopify cart transition.
- Explicit cuts: merchant/Admin workflows, multiple categories, procedural worlds, accounts, multiplayer, autonomous payment, formal Bundle SKUs, and speculative WebMCP features.

## PRD

- First-run defaults confirmed: empty miniature desk, one locked orange lamp, a copyable example prompt, and free-form agent requests.
- Manual behavior confirmed: inspect, drag, lock, remove, and open-cart actions remain available without an agent.
- Compatibility behavior confirmed: unsupported WebMCP clients retain a manually usable experience plus a clearly labeled deterministic demo.
- Failure behavior confirmed: expose conflicting constraints, replace newly unavailable items, preserve concurrent human edits, and stop on cart/review discrepancies rather than claiming success.
- PRD deepening rounds: 0. Ashish confirmed the user stories and chose to write the document.
- PRD written with ten visible product states, seven epics, testable acceptance criteria, genuine failure cases, explicit non-goals, accessibility/trust requirements, and submission proof points.

## Spec

- Stack confirmed: Next.js and TypeScript; Shopify Hydrogen developer preview; React Three Fiber and Drei; Zustand; Motion plus GSAP; Zod; Vitest and Playwright; Vercel deployment.
- Persistence boundary: scene state is session-only; Shopify remains authoritative for cart state.
- Shopify onboarding assumption: begin behind a commerce adapter using Shopify-compatible mock/storefront data, then connect a development store without changing scene-domain code.
- Architecture audit completed against the current WebMCP draft, Chrome implementation docs, Shopify WebMCP docs, Hydrogen preview docs/source, and Standard Actions docs.
- Corrections adopted: no state push, `toolchange` inventory-only, application-enforced confirmation, only current annotations, project-prefixed scene tools, no duplicate custom Shopify commerce tools, and early coexistence/collision testing.
- Cart gate decision: configure Shopify Standard Action `updateCart` to reject any payload without a matching one-time human-approved review digest; delegate matching calls to Shopify and reconcile before animation.
- Spec deepening rounds: 0. The standards challenge served as the architecture self-review, and Ashish said to proceed with the corrected design.
- Technical spec written with explicit file tree, domain model, WebMCP contracts, data flows, cart gate, dependencies, risk gates, tests, and checklist sequence.

## Checklist

- Plan ownership: handed off to Codex.
- Build mode: autonomous in a fresh Codex task.
- Git cadence: commit after each verified checklist item.
- Verification: required for every item.
- Visual pauses: after WebMCP/Shopify/cart risk gates (Item 3) and after the first complete animated desk workflow (Item 8).
- Check-in cadence: speed-run; surface only failed gates, credentials/actions, material scope decisions, and planned pauses.
- Wow moment confirmed: human edit preserved through late desk-width/budget/India constraints, followed by one approval and exact real-cart transition.
- Checklist drafted as 12 dependency-ordered units with Devpost handoff last.

## Build — Item 1

- Initialized Git in the implementation root and scaffolded Next.js 16.3.3 with the official `@shopify/hydrogen@2026.10.0-preview.1` setup flow.
- Added the server-rendered Shopify runtime, WebMCP-enabled `ShopifyScripts`, Shopify-owned request interception, standard route redirects, request-scoped storefront client, session boundary, and origin-keying header without adding custom WebMCP tools or 3D assets.
- Added the responsive empty-shell checkpoint, planned responsibility folders, canonical environment example, MIT license, third-party notices, baseline Vitest/Playwright scripts, and a clean npm lockfile.
- Verified `npm run typecheck`, `npm test -- --run`, `npm run lint`, and `npm run build` locally. The production build reports the app route and Hydrogen proxy successfully.
- Verified the shell in the in-app browser at 1440×900 and 390×844: correct title/heading, aligned desktop columns, stacked mobile cards, no horizontal overflow, and no browser console errors.
- Deployed the shell to `https://devp-one.vercel.app`; HTTPS returned 200 with `Origin-Agent-Cluster: ?1`, Vercel HSTS, and `powered-by: Shopify, Hydrogen`. Desktop and mobile deployment smoke checks passed.
- The production page already exposes Shopify's native tool family through `ShopifyScripts`; coexistence and invocation remain deliberately unverified until Item 2 adds the isolated `deskbuilder.echo` spike.

## Build — Item 2

- Added `webmcp-types@0.1.5`, a local `executeTool` typing gap, feature detection, exact project naming, duplicate audit, and one AbortController-owned `deskbuilder.echo` spike.
- Added a non-blocking agent-readiness badge. Supported clients report the Shopify/custom coexistence state; unsupported clients retain the usable shell and report `Agent tools unavailable · manual shell remains`.
- Verified `npm run test:integration -- webmcp-coexistence`: native and prefixed tools coexist, the echo result is stable, duplicates are rejected, and abort cleanup unregisters the project tool.
- Verified the unsupported-browser state with Playwright in ordinary headless Chromium and ran final typecheck, lint, and production build successfully.
- Deployed the final spike to `https://devp-one.vercel.app`. The Codex in-app browser exposed eleven current Shopify native tools plus exactly one `deskbuilder.echo`, with no duplicate names.
- Called `deskbuilder.echo` successfully and called Shopify `search_catalog` plus `get_cart`; the latter returned the expected empty mock cart. Navigating away removed the custom tool, and returning registered exactly one instance.
- Integration finding: the judged in-app runtime omitted the tool callback-options object even though the 2026-08-26 draft marks it required. The adapter now tolerates omission while honoring `AbortSignal` when present; this compatibility behavior is covered by the integration test.
- Sanitized tool inventory, call results, versions, cleanup/fallback checks, and screenshot are recorded in `docs/integration-evidence.md` and `docs/evidence/webmcp-coexistence.png`.

## Build — Item 3

- Implemented canonical line serialization, SHA-256 review digests, short-lived one-time approvals, and a single configured `Shopify.actions.updateCart` handler. Only an exact unexpired digest delegates to Shopify's default handler; successful delegation consumes the approval.
- Added a deliberately plain review/cart proof panel with controls for unapproved, mismatched, expired, exact-approved, and repeated-consumed cases. The panel awaits cart event promises and keeps the authoritative action result visible without relying on Shopify's default `/cart` navigation.
- Added integration coverage for all five gate cases plus digest ordering. `npm run test:integration -- cart-gate`, typecheck, lint, and production build pass.
- Live verification used Shopify-hosted `mock.shop` through Standard Actions and the native WebMCP tools. An unapproved native `add_to_cart` call returned a useful approval error and left the authoritative cart unchanged.
- The exact reviewed Slides / Medium variant was added once for CAD 25.00 while preserving a pre-existing Slides / Small line. Shopify `get_cart` reported both exact variant IDs, quantity one each, and CAD 50.00 total; consumed approval reuse remained blocked.
- Integration finding: Shopify's default `openCart` navigates this minimal headless shell to `/cart`. The spike therefore opens its own result drawer after the action resolves so review/cart reconciliation remains visible. The actual cart remains Shopify-owned.
- No participant development-store credentials are present. The page and evidence label `mock.shop` accurately; do not present this as a participant-store cart until credentials are connected.
- Sanitized live results and the visual ledger are recorded in `docs/integration-evidence.md` and `docs/evidence/cart-gate-approved.png`.

## Verification follow-up — Visual Pause 1

- At Ashish's request, reran the complete Item 1–3 matrix instead of relying on the earlier per-item checks.
- The first aggregate run found that Vitest was collecting the Playwright specification. The Playwright test itself passed in its proper runner, but `npm test -- --run` failed because the two runner APIs were mixed.
- Updated `vitest.config.ts` to exclude `tests/e2e/**` while preserving Vitest's default exclusions.
- Reran typecheck, the aggregate Vitest suite, integration tests, Playwright E2E, lint, and production build with fail-fast execution. All passed: 5 Vitest tests, 4 integration assertions, and 1 Playwright journey.
- Rechecked `https://devp-one.vercel.app`: HTTPS 200, origin-keying and HSTS headers present, `deskbuilder.echo` successful, authoritative Shopify cart unchanged across an unapproved call, `REVIEW_REQUIRED` visible, and no browser console errors.

## Build — Item 4

- Removed the temporary `deskbuilder.echo` registration while preserving the capability detector and collision audit for the production tool registry in Item 7.
- Pinned the proven Hydrogen preview to `2026.10.0-preview.1`, WebMCP types to `0.1.5`, and added exact Zod `4.5.2` and Zustand `5.0.15` dependencies with the lockfile updated.
- Implemented canonical domain types and strict schemas, safe error codes, stable JSON/SHA-256 digests, seven semantic desk anchors, deterministic role/footprint placement, market/tag/budget/item-count validation, a vanilla Zustand store, selectors, and the locked orange-lamp initial state.
- Implemented the shared command layer for scene reads, plan preview, transactional stage, move, lock, remove, exact review, approval/consumption, authoritative cart reconciliation, and scene reset that preserves cart truth. Commerce and animation remain behind injected ports.
- Domain tests cover version increments, stale calls, locked moves, invalid anchors, budget and market conflicts, cancellation rollback, digest stability/material changes, approval expiry/one-time consumption, the 120 cm → 90 cm constraint shock, safe public errors, and cart-preserving reset.
- Verified `npm run test:unit -- domain` (10 passing tests including the shell unit), `npm run typecheck`, lint with no warnings, and the production build.
