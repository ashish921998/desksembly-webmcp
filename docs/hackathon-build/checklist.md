# Build Checklist

## Build Preferences

- **Plan ownership:** Handed off to Codex; do not re-run planning interviews in the implementation task.
- **Build mode:** Autonomous. Execute sequentially and continue while acceptance and verification pass.
- **Comprehension checks:** N/A.
- **Git:** Initialize the repository if needed. Commit after every verified checklist item using a focused message. Never commit secrets, generated credentials, or failing work.
- **Verification:** Required for every item. Do not mark an item complete from code inspection alone.
- **Verification pauses:** Two human visual pauses only:
  1. after Item 3, when WebMCP/Shopify coexistence and the real cart gate are proven;
  2. after Item 8, when the first complete animated desk workflow is visible.
- **Check-in cadence:** Speed-run. Report only a failed gate, a required user credential/action, a material scope decision, or one of the two planned visual pauses.
- **Scope discipline:** Build only the single desk world and the exact user journey in `scope.md`, `prd.md`, and `spec.md`. Anything listed as a non-goal stays cut.
- **Source discipline:** Follow current primary documentation linked from `spec.md`. Pin the Hydrogen preview and lockfile once the integration gates pass.
- **Checklist tracking:** Mark each checkbox only after its acceptance and verification steps pass. Record notable decisions and failures in `docs/hackathon-build/build-notes.md`.
- **Fresh-task instruction:** The implementation task must read `learner-profile.md`, `scope.md`, `prd.md`, `spec.md`, and this checklist before editing code. It should implement, not redesign.

## Wow Moment

The shopper manually moves or locks a product, then gives a late desk-width, budget, and US-availability constraint. The browser agent preserves the human choice, replaces only conflicting products, and—after one visible approval—moves the exact Shopify-confirmed setup into the real cart.

## Checklist

- [x] **1. Scaffold the official storefront and deploy the empty shell**
  Spec ref: `spec.md > Stack`, `Deployment Architecture`, `File Structure`
  What to build: Initialize Git if needed; scaffold a Next.js TypeScript app using Shopify's official Hydrogen developer-preview setup; preserve generated request handlers and `ShopifyScripts`; add the planned `src/` responsibility folders; add `.env.example`, a visible working-descriptor title, an MIT `LICENSE`, `THIRD_PARTY_NOTICES.md`, base scripts for typecheck/test/E2E, and an initial Vercel deployment. Do not add 3D assets or custom WebMCP tools yet.
  Acceptance: The app renders a responsive empty shell over HTTPS; generated Shopify routes build; secrets are absent from tracked files; repository and license are ready for a later public push; Vercel deployment returns a successful page.
  Verify: Run `npm run typecheck`, `npm test -- --run`, and `npm run build`; inspect `git status --short`; open the deployed URL on desktop and mobile widths; commit as `chore: scaffold hydrogen storefront`.

- [x] **2. Prove native Shopify WebMCP and project-tool coexistence**
  Spec ref: `spec.md > WebMCP Integration > Initialization`, `Risks And Verification > Risk 1`, `Risk 2`
  What to build: Feature-detect `document.modelContext`; add the target typings; implement development-only tool audit; register one prefixed `deskbuilder.echo` spike through an AbortController-owned lifecycle; enumerate tools in the exact target Chromium/ChatGPT environment; prove Shopify's native catalog/product/cart tools and the custom tool coexist with unique names; capture the actual injected tool list and browser/Hydrogen versions in `docs/integration-evidence.md`.
  Acceptance: A compatible live page exposes both Shopify native tools and `deskbuilder.echo`; the echo tool can be invoked; cleanup unregisters it without leaks; unsupported browsers display a non-blocking compatibility state; no duplicate names exist.
  Verify: Run `npm run test:integration -- webmcp-coexistence`; use the target WebMCP inspector/browser agent to call one Shopify read tool and `deskbuilder.echo`; save sanitized screenshots/logs; run `npm run build`; commit as `test: prove webmcp tool coexistence`.

- [x] **3. Prove the human-approved Shopify cart gate**
  Spec ref: `spec.md > Cart Review Gate`, `External APIs And Dependencies > Shopify`, `Risks And Verification > Risk 3`
  What to build: Configure Shopify Standard Action `updateCart` once with a handler; create the minimum canonical line digest and one-time approval record; reject an unapproved or mismatched update without calling Shopify's default handler; allow an exact approved payload; await Shopify result/cart event and reconcile it; open the real cart UI on success. Keep this spike deliberately plain—no Three.js or cart animation.
  Acceptance: An agent/native `update_cart` attempt without approval fails and leaves the cart unchanged; an exact human-approved test line reaches Shopify; returned/visible cart variants, quantities, and total match; approval expires or consumes once; failure propagation is useful enough for the agent and UI. If the native handler cannot enforce this reliably, activate the documented non-overlapping fallback and record why.
  Verify: Run `npm run test:integration -- cart-gate`; manually execute unapproved, approved, mismatched, expired, and repeated calls; call Shopify `get_cart` and compare the visible drawer; capture evidence in `docs/integration-evidence.md`; run `npm run build`; commit as `feat: enforce reviewed cart updates`.

  **Visual pause 1:** Stop the fresh implementation task here. Show the user the deployed shell, the combined Shopify/custom tool list, one rejected unapproved cart call, and one approved real cart update. Continue only after the user confirms the integration foundation is acceptable.

- [x] **4. Freeze dependencies and implement the versioned domain core**
  Spec ref: `spec.md > Domain Model`, `Domain Commands`, `Architecture invariants`
  What to build: Remove the echo spike; pin the working Hydrogen preview/browser assumptions and commit the lockfile; implement domain types, Zod schemas, error codes, canonical serialization/digests, fixed anchor catalog, deterministic constraint/placement rules, Zustand scene store, selectors, and commands for get scene, preview, stage-state commit, move, lock, remove, review, approve, reconcile, and reset. Keep animation and commerce behind interfaces/fakes.
  Acceptance: Domain commands are the only business-state writers; successful mutations increment `sceneVersion` once; stale calls fail; locked items cannot move; invalid anchors/budgets/markets fail with safe codes; review digests are stable and change for every material cart/scene change; reset never clears real cart state.
  Verify: Run `npm run test:unit -- domain`; require coverage for stale concurrency, cancellation rollback, locked conflicts, digest stability, approval expiry/consumption, and constraint shock; run `npm run typecheck`; commit as `feat: add versioned scene domain`.

- [x] **5. Implement live and deterministic commerce gateways**
  Spec ref: `spec.md > CommerceGateway`, `Constraint And Placement Rules`, `Risks And Verification > Risk 4`
  What to build: Implement the shared `CommerceGateway`; add Hydrogen normalization for exact variants, market-aware price/availability, cart reads, cart results, and checkout URL; add deterministic mock products/carts matching the same types; seed 6–12 desk products with roles and simple dimensions; include fixtures for unavailable variant, price change, and partial cart failure. Do not expose duplicate custom catalog/cart WebMCP tools.
  Acceptance: Both gateways satisfy the same contract; normalized data contains only required safe fields; server tokens stay server-side; US market and budget validation work; mock mode is visibly labeled and cannot masquerade as Shopify; product roles cover one 3–5 item desk setup around the locked orange lamp.
  Verify: Run `npm run test:integration -- commerce-gateway`; compare live and mock normalized snapshots; scan the client build for private-token values; run `npm run build`; commit as `feat: add commerce gateways and desk catalog`.

- [x] **6. Build the bare miniature desk and complete manual workflow**
  Spec ref: `spec.md > File Structure > world`, `Components And Responsibilities > DeskCanvas`, `prd.md > Epic 1`, `Epic 4`
  What to build: Add the fixed isometric React Three Fiber desk, camera, lighting, semantic anchors, orange lamp, primitive/low-poly product visuals, corresponding accessible list view, inspect panel, selection, keyboard/pointer drag, lock/unlock, remove, invalid-placement snap-back, budget/market badges, compatibility notice, and responsive shell. All UI actions call domain commands.
  Acceptance: The initial world is empty except for a visibly locked orange lamp; a user can inspect, drag, lock, unlock, and remove supported items; invalid placements explain and return; list view exposes the same products/status; laptop flow is complete and mobile is viewable; no WebMCP or cart behavior is required for this item.
  Verify: Run `npm run test:e2e -- manual-world`; complete keyboard-only and pointer flows; check reduced viewport and accessible names; run `npm run build`; commit as `feat: build manual miniature desk`.

- [x] **7. Register the five audited deskbuilder WebMCP tools**
  Spec ref: `spec.md > WebMCP Integration`, all `Tool contract` subsections
  What to build: Implement the production registry and adapters for `deskbuilder.get_scene`, `deskbuilder.preview_plan`, `deskbuilder.stage_plan`, `deskbuilder.move_product`, and `deskbuilder.get_review`; use exact schemas, annotations, project prefixes, AbortSignals, compact results, fresh `sceneStore.getState()` reads, Zod validation, safe errors, and tool audit. Preserve Shopify native tool ownership of catalog/cart/checkout.
  Acceptance: Tool names and descriptions are unambiguous; read-only/untrusted hints match behavior; malformed inputs fail; preview/stage/move require current versions; product reason text cannot execute instructions; callbacks resolve only after visible state is stable; registration cleans up; target agent selects correct tool families for direct prompts.
  Verify: Run `npm run test:integration -- webmcp-tools` and `npm run test:evals -- direct`; manually invoke every project tool in target browser, including malformed and stale inputs; run `npm run build`; commit as `feat: expose miniature world through webmcp`.

- [x] **8. Complete the first animated agent-built desk workflow**
  Spec ref: `spec.md > Animation Architecture`, `Most Important Data Flow > Initial agent-built world`, `prd.md > Epic 2`, `Epic 3`
  What to build: Implement the activity ribbon and animation controller; add cancellable parcel arrival, open, reveal, anchor placement, proposal/confirmed visual states, one-at-a-time sequencing, rollback, package cleanup, labels, and reduced-motion alternative; connect the starter prompt flow to Shopify native product discovery plus project preview/stage tools; deliver one complete 3–5 product desk setup.
  Acceptance: From the documented prompt, the browser agent selects exact Shopify variants, creates a visible proposal, and stages a coherent setup; packages do not obstruct the final world; activity stages reflect real results; cancellation restores the prior stable scene; no cart change occurs; reduced-motion mode communicates the same state without long movement.
  Verify: Run `npm run test:e2e -- stage-plan` and `npm run test:evals -- build`; execute the live prompt in target browser; cancel once mid-animation and retry; inspect the accessible list against the canvas; run `npm run build`; commit as `feat: animate agent-built desk setup`.

  **Visual pause 2:** Stop the fresh implementation task here. Show the user the deployed prompt-to-animated-desk journey, manual inspection/drag/lock behavior, activity ribbon, and reduced-motion result. Continue only after the user confirms the product direction and visual grammar.

- [x] **9. Implement human-edit preservation and constraint shock**
  Spec ref: `spec.md > Most Important Data Flow > Human edit and agent repair`, `Constraint And Placement Rules > Constraint shock`, `prd.md > Epic 5`
  What to build: Add revision proposal/return/replacement behavior; preserve locked and unaffected items; reject stale agent mutations after a manual edit; surface conflict explanations and two relaxation suggestions when no plan exists; implement the canonical late request for 90 cm width, $300 budget, and US availability.
  Acceptance: A human drag/lock increments the version; an old stage call fails `STALE_SCENE`; re-read/replan preserves the human choice; only conflicting products return and get replacements; new setup satisfies visible constraints; locked-item impossibility never silently unlocks; unsatisfiable requests leave the stable world unchanged.
  Verify: Run `npm run test:e2e -- constraint-shock` and `npm run test:evals -- revision`; execute live stale-state and locked-conflict cases; compare before/after item IDs; run `npm run build`; commit as `feat: preserve human edits during replanning`.

- [x] **10. Finish exact review, deterministic cart transition, and checkout disclosure**
  Spec ref: `spec.md > Cart Review Gate`, `Most Important Data Flow > Review to real cart`, `prd.md > Epic 6`, `Epic 7`
  What to build: Complete ReviewPanel, exact line/variant/price/market warnings, approval invalidation on any scene/price change, one-time cart gate, authoritative deterministic-cart reconciliation, partial-failure UI, cart drawer bridge, and accepted-only post-confirmation animation. Approval remains the single required human click. Because the participant has no development store, keep Shopify Checkout explicitly disabled and label this as deterministic fallback rather than real participant-store proof.
  Acceptance: The review matches current stable scene; stale/changed review cannot approve; unapproved native Shopify cart calls remain blocked by the proven gate; approved lines update the clearly labeled deterministic cart; only accepted variants animate; unrelated existing lines remain; mismatches and partial failures block checkout; even exact reconciliation states that Shopify Checkout requires development-store credentials; no payment is autonomous and no real-cart claim is made.
  Verify: Run `npm run test:e2e -- review-cart`; manually test price change, partial failure, repeated approval, pre-existing unrelated cart line, exact deterministic reconciliation, and disabled checkout disclosure; compare review and cart snapshots; run `npm run build`; commit as `feat: reconcile reviewed desk with deterministic cart`.

- [x] **11. Harden, evaluate, deploy, and record the submission build**
  Spec ref: `spec.md > Testing Strategy`, `Risks And Verification`, `Demo And Submission Flow`
  What to build: Complete unit/integration/E2E/eval coverage; test adversarial product text, cancellation, unsupported browser, reduced motion, keyboard access, responsive layouts, build and runtime errors; finish deterministic labeled fallback; add concise error recovery; optimize assets; deploy production; run smoke tests; capture the successful live WebMCP run, screenshots, and a sub-three-minute demo recording draft. Freeze feature work.
  Acceptance: All required test suites and build pass; deployed HTTPS app completes the 90-second core flow; real and fallback modes are unmistakable; no secrets or unlicensed assets exist; README setup works from a clean clone; public-facing claims match running behavior; demo media shows WebMCP tools, human edit preservation, real cart truth, and checkout handoff.
  Verify: Run `npm run typecheck`, `npm test -- --run`, `npm run test:integration`, `npm run test:e2e`, `npm run test:evals`, and `npm run build`; run production smoke checklist; inspect console/network for errors; test clean-clone setup; commit as `chore: harden and deploy submission build`.

- [x] **12. Prepare Devpost handoff**
  Spec ref: `prd.md > Submission Proof Points`, `spec.md > Demo And Submission Flow`, `scope.md > Submission Story`
  What to build: Finalize participant-chosen project name; make repository public with visible license; finish README with architecture, WebMCP/Shopify setup, supported browser, testing instructions, screenshots, live URL, and exact new work; prepare concise project description, built-with list, AI/Codex usage, Shopify/WebMCP explanation, demo script/video URL, judge instructions, fallback disclosure, source/asset notices, and sanitized integration evidence. Update build notes and checklist completion state.
  Acceptance: Live URL works in supported browser; public repository builds from instructions and shows its license; demo video is under three minutes with audio; submission story accurately explains WebMCP leverage, execution, impact, creativity, human approval, and real cart proof; required handoff materials are ready for `$prepare-submission` without inventing facts.
  Verify: Review every Devpost requirement against the official submission checklist; test live URL and public repo in a signed-out/incognito session; play the complete video; confirm all links and credentials/instructions; confirm next command is `$prepare-submission`; commit as `docs: prepare devpost handoff`.

## Gut Check

This checklist contains 12 verified build units, two planned visual pauses, and one final submission handoff. The risky standards/integration work occurs before domain and visual investment. The product becomes manually usable before WebMCP animation work, and the full agent/cart path is completed before final polish.
