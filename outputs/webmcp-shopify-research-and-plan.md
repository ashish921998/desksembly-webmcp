# WebMCP + Shopify 3D Commerce Research and Recommended Plan

Research date: 29 August 2026

## Outcome

Build a **Shopify-backed living planogram**: a miniature 3D world in which a shopper and their browser agent co-create a contextual product kit. Real products arrive as animated packages, unpack, and snap into a spatial scene. The human can lock, drag, or reject products; the agent repairs the remaining plan around those choices. After explicit approval, the exact staged variants animate into the shopper's real Shopify cart and the experience hands off to Shopify Checkout.

This is a credible product rather than a game. The game-inspired mechanics make product discovery, constraint solving, and agent actions legible and enjoyable.

The actual project name should be chosen by the participant later. Labels used in this report are only concept descriptors.

## Why this direction wins

The concept aligns unusually well with all four judging dimensions:

- **WebMCP leverage:** a generic browser agent discovers and composes page-owned catalog, scene, validation, and cart capabilities. It does not scrape controls or operate by coordinates.
- **Execution:** the output is a complete storefront experience with a visible product loop, exact variants, a real cart, reversible interaction, and a checkout boundary.
- **Impact:** Shopify merchants gain a differentiated way to sell curated kits and help shoppers discover more of a catalog through goals rather than SKU-by-SKU browsing.
- **Creativity:** agent-controlled Three.js state, tactile parcel animation, and human-agent co-editing are substantially more distinctive than another shopping chat bubble.

Shopify states that its browser WebMCP tools act on the shopper's live storefront session: catalog calls read real store data, cart actions change the cart the shopper sees, and theme behavior such as opening the cart drawer is triggered too. Shopify currently provides tools for search, browsing, product and variant resolution, cart operations, policies, checkout navigation, and order history. [Shopify WebMCP documentation](https://shopify.dev/docs/api/web-mcp)

Chrome describes WebMCP as a more reliable alternative to agents interpreting elements and simulating clicks. A page declares structured tools with JSON schemas; those tools execute visibly in the existing interface and share current page state. [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)

## What current WebMCP can actually do

Verified capabilities relevant to this project:

- `document.modelContext.registerTool()` can expose ordinary page JavaScript as typed tools. A callback can mutate a Three.js or React Three Fiber scene, update a shared state store, play animations, and call storefront logic. [WebMCP draft](https://webmachinelearning.github.io/webmcp/) and [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- Tools have names, descriptions, JSON input schemas, execution callbacks, read-only/untrusted-content hints, cancellation signals, and registration lifecycles.
- Tools can be registered only in relevant application states. The official WebMCP Maze changes its tool vocabulary as game state changes, while the Pizza Maker demo exposes several orthogonal tools that visibly modify one creative artifact. [WebMCP demo repository](https://github.com/GoogleChromeLabs/webmcp-tools)
- `toolchange` reports when available tools change. It does not provide arbitrary application-state subscriptions.
- Cross-origin iframe access is possible only through explicit permissions and origin exposure. This could support a 3D app embedded in a storefront, but it should be treated as a technical spike rather than assumed. [WebMCP permissions model](https://developer.chrome.com/docs/ai/webmcp#security-and-permissions)
- Declarative WebMCP can expose visible HTML forms to an agent. This is suitable for a final review/confirmation surface, with an ordinary form as fallback. [Chrome declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api)

Important current limitations:

- WebMCP remains experimental, browser support is Chromium-based, and the API is still evolving.
- It is designed primarily for a visible local tab with a human in the loop, not persistent background commerce automation.
- There is no stable standardized confirmation primitive on which a purchase flow should depend. The project must provide its own visible review and approval boundary.
- There is no standardized push channel for arbitrary scene changes. Use a read tool and optimistic scene-version checks so an agent never overwrites a human edit.
- Rich image/file tool results and cross-document execution are unresolved. Keep visuals inside the page and return compact structured text to the agent.
- JSON schemas aid agent understanding, but callbacks must still validate every input and business rule.

The standards discussions themselves suggest unusual future possibilities—state subscriptions, store-authored skills, reverse inference, service-worker tools, bulk execution, richer results, and Web-native typed RPC—but these are not safe MVP dependencies. Relevant discussions include [reactive state](https://github.com/webmachinelearning/webmcp/issues/151), [workflow-level skills](https://github.com/webmachinelearning/webmcp/issues/161), [bulk tool execution](https://github.com/webmachinelearning/webmcp/issues/222), and [WebMCP as a broader communication surface](https://github.com/webmachinelearning/webmcp/issues/236).

## Shopify fit

Use Shopify as the source of commerce truth and custom WebMCP tools as the source of spatial truth.

Native Shopify responsibilities:

- catalog and collection discovery;
- exact products, variants, prices, and availability;
- cart contents and mutations;
- store policies;
- checkout navigation.

Custom page-local responsibilities:

- world dimensions and spatial zones;
- product proposals and locked items;
- placement, movement, and replacement;
- animation state and scene mood;
- deterministic budget/fit checks;
- visual tool receipts.

Do not claim to extend Shopify's managed UCP or Storefront MCP server with custom scene tools. Those are distinct from browser WebMCP. Shopify documents browser WebMCP for the shopper's visible tab, Storefront MCP for app-owned shopping assistants, and UCP for broader agentic-commerce flows. [Shopify WebMCP](https://shopify.dev/docs/api/web-mcp), [Storefront MCP](https://shopify.dev/docs/apps/build/storefront-mcp), and [agentic commerce/UCP](https://shopify.dev/docs/agents)

For the MVP, create an **agent-curated cart/kit**, not a persistent Shopify Bundle SKU. Shopify describes bundles as useful for curation, discounts, product visibility, inventory movement, and average order value, but runtime bundle authoring introduces inventory, variant, and Admin API complexity that is unnecessary for the demo. [Shopify bundle overview](https://help.shopify.com/en/manual/products/bundles)

Public merchant discussions repeatedly mention bundle activation friction, variant combinations, inventory synchronization, separate bundle pages, and poor visibility of offers. These are anecdotal rather than platform guarantees, but they support a shopper-facing kit builder in which normal products and variants remain visible and are added directly to the cart. Examples: [bundle setup friction](https://www.reddit.com/r/shopify/comments/1mkvva7/turns_out_just_add_bundles_isnt_as_easy_as_it/) and [variant-bundle limitations](https://www.reddit.com/r/shopify/comments/1q8atfj/bundle_app_recommendations/).

## Recommended user flow

### 1. Enter the miniature world

The page opens on a small isometric scene—initially a desk, shelf, camping pitch, coffee ritual, or other tightly scoped setting. A visible brief explains that the shopper can build manually or ask any compatible browser agent to operate the world through WebMCP.

### 2. Give the agent a messy human goal

Example:

> Build a cozy night-owl desk setup under $250. No beige. Use only items available now and shippable to India. Keep the black tote I already chose.

The request should deliberately combine taste, budget, availability, location, and an existing human choice.

### 3. Discover and preview

The agent reads world state, searches the catalog, resolves exact variants, and requests a scene preview. Candidate packages remain translucent until product and constraint validation succeeds. A compact on-screen tool ribbon shows sanitized calls such as `search`, `check`, `stage`, and `cart`.

### 4. Assemble the world

Validated packages arrive through a short visible pipeline:

`catalog search -> variant/constraint check -> staging -> world placement`

Boxes open one by one. Products move along smooth splines and snap into semantic zones. Prices, stock, and reasons remain visible. An unavailable item diverts back to the loading bay instead of silently disappearing.

### 5. Human correction

The shopper locks a favorite item or drags one product elsewhere. The scene version changes. When the agent next acts, it must re-read state and repair only the affected portion rather than replacing the human's decisions.

### 6. Constraint shock

Late in the process, the shopper changes several requirements:

> Make it fit a 90 cm desk, keep it under $220, and replace anything that cannot ship to India.

The agent revalidates live products and changes only the necessary objects. Return cartons remove rejected products; replacement packages arrive and snap into the remaining spaces.

### 7. Explicit approval and real cart

The page displays exact variants, quantities, and total. Only after approval does the agent update the real Shopify cart. Each confirmed product travels into the cart only after Shopify accepts the mutation. The theme's normal cart drawer opens and shows the same lines and total.

Checkout remains a visible handoff to Shopify rather than an autonomous payment action.

## The single impossible moment

The strongest version uses context the website never received directly:

1. The shopper shares a moodboard or reference image with their browser agent, outside the storefront.
2. They ask the agent to recreate its feel with products from the current Shopify store, under explicit constraints.
3. The agent uses its own visual/context understanding, then invokes the site's typed WebMCP tools.
4. The 3D world assembles visibly and becomes an exact real cart after review.

A conventional storefront could build a bespoke upload-and-AI configurator, but its ordinary authored workflow cannot accept arbitrary context already held by any compatible browser agent and dynamically compose catalog, variant, spatial, validation, and cart operations. The defensible claim is therefore:

> Impossible through this storefront's normal click-and-form workflow alone—not impossible for any bespoke website to implement.

The protocol win is dynamic composition of page-owned capabilities around agent-held context; the 3D animation makes that composition visible.

## Interaction inspirations

- **Unpacking:** packages create anticipation and make every product receive attention. Keep empty cartons out of the work surface. [Official site](https://www.unpackinggame.com/)
- **Townscaper:** tiny inputs resolve into aesthetically coherent structures. Use fixed semantic anchors and composable fixtures rather than expensive procedural architecture. [Official description](https://apps.apple.com/us/story/id1593903202)
- **Wilmot's Warehouse:** spatial grouping becomes a visible taxonomy. Nearby products communicate collection, occasion, and complementarity. [Official Finji page](https://finji.itch.io/wilmots)
- **Stacklands:** direct manipulation creates recipes. Stacking selected products can create a proposed kit before validation. [Official page](https://sokpop.itch.io/stacklands)
- **Overcooked:** human and agent should have complementary roles rather than duplicating each other. The human owns taste and approval; the agent owns search and constraint work. [Official Team17 page](https://www.team17.com/games/overcooked)
- **Factorio:** a short glass-box pipeline makes invisible tool sequencing understandable. Use it only for the hero sequence. [Official page](https://www.factorio.com/game/content)
- **A Little to the Left:** snap previews, several valid arrangements, and decisive settle animations support human correction without presenting one layout as objectively correct. [Developer site](https://www.maxinferno.com/)
- **Donut County:** a two-second cart-gravity payoff is funny and GIF-friendly, but should happen only after approval. [Official site](https://www.donutcounty.com/)

## MVP tool surface

Keep the surface small and stable:

1. `get_world_state` — current scene version, constraints, placed and locked product IDs, budget, and cart summary.
2. `search_store_products` — compact product candidates from Shopify; returned merchant text treated as untrusted.
3. `preview_world_plan` — validate proposed products and return placements without mutation.
4. `stage_world_plan` — allowlisted scene-only choreography: place, move, rotate, mood, and camera focus.
5. `move_product` — reversible adjustment of one object.
6. `review_kit` — exact variants, quantities, cost, shipping/availability warnings, and reviewed-plan hash.
7. `commit_kit_to_cart` — reject if the scene or reviewed hash changed; update Shopify first, animate only accepted lines.

Checkout remains outside the batch tool and requires a normal user-visible action.

## Technical shape

- React/TypeScript with React Three Fiber for the miniature world.
- Shopify Hydrogen developer preview or a real Liquid development storefront for live WebMCP and cart behavior.
- One authoritative domain store shared by manual UI actions and WebMCP callbacks.
- Optimistic `sceneVersion` on every mutating tool to protect human edits.
- A small curated catalog of 6–12 visually legible products and 3–5 items per completed kit.
- Fixed isometric anchors, simple low-poly/representative models, product-image decals, and three reusable package sizes.
- Animation transactions validate, reserve placement, animate, then commit; cancellation restores the previous snapshot.
- Feature detection and ordinary manual controls when `document.modelContext` is unavailable.

## First technical gates

Before investing in visual polish:

1. Verify the judged Chromium/ChatGPT environment exposes the expected WebMCP API.
2. Verify Shopify's built-in WebMCP tools on a real Liquid or Hydrogen storefront.
3. Verify custom scene tools coexist with Shopify's injected tools and have unambiguous descriptions.
4. Update a live Shopify cart, reconcile with `get_cart`, and confirm theme cart state changes.
5. Test ambiguous variants and confirm no mutation occurs until resolved.
6. Verify buyer-country context before claiming shippability.
7. Confirm checkout is a handoff, not an autonomous payment.

## Must ship and cuts

Must ship:

- one miniature scene and one curated product category;
- parcel reveal, placement, replacement, and cart animations;
- 6–7 WebMCP tools with visible receipts;
- one lock/drag human override;
- real catalog/variant data and one real cart mutation;
- deterministic constraint checking;
- explicit review and approval;
- one recorded fallback run for presentation resilience.

Cut first:

- avatars and free-roaming characters;
- procedural building generation;
- crowd or conversion simulation;
- multiplayer;
- cross-merchant universal carts;
- runtime Shopify Bundle SKU creation;
- autonomous checkout;
- dozens of tools or deeply dynamic schemas.

## Validation and evals

Test both deterministic behavior and agent selection:

- direct placement request;
- ambiguous style request;
- impossible budget/fit combination;
- human edit between read and write, producing a stale-scene rejection;
- cancellation halfway through parcel delivery;
- one variant becoming unavailable before cart commit;
- prompt injection embedded in merchant/product text;
- cart review hash changing before commit;
- feature-disabled browser fallback.

Chrome's WebMCP evaluation guidance recommends testing tool descriptions, schemas, call ordering, state changes, UI side effects, and mid-chain failures. [Chrome WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals)

## Final recommendation

Proceed with the living-planogram concept. Begin with a short technical spike proving native Shopify tools, custom scene-tool coexistence, and live-cart reconciliation. Once those gates pass, lock the narrow product category and visual theme, then move to scope and PRD.
