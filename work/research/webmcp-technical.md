# WebMCP technical research for a Shopify-oriented 3D hackathon experience

Research date: 2026-08-29

## Executive conclusion

The strongest concept is a **Shopify “agentic build mode”**: a browser agent turns one natural-language merchandising brief into a live miniature 3D store, while the page exposes typed scene and cart operations through WebMCP. Products arrive as animated parcels, unpack, snap into valid positions, and—only after a visible review boundary—fly into the real Shopify cart.

This is well aligned with WebMCP’s actual strengths. WebMCP is meant to let a browser agent discover structured, page-owned JavaScript tools and execute them in the live tab, using the same application logic, DOM, cookies, session, and visible interface as the user. It is frontend- and tab-bound, while ordinary MCP is backend- and persistently available; Chrome explicitly recommends combining the two rather than treating them as substitutes. ([WebMCP draft](https://webmachinelearning.github.io/webmcp/), [Chrome: WebMCP vs MCP](https://developer.chrome.com/docs/ai/webmcp/compare-mcp), [Shopify Storefront MCP](https://shopify.dev/docs/apps/build/storefront-mcp))

The sponsor-facing story is unusually clean:

- **Shopify supplies commerce truth**: catalog, policies, cart, and checkout through Shopify’s Storefront MCP or Storefront/Ajax APIs. Shopify officially positions Storefront MCP for natural-language product discovery, cart management, checkout, store information, and order workflows. ([Shopify Storefront MCP](https://shopify.dev/docs/apps/build/storefront-mcp), [Storefront API](https://shopify.dev/docs/api/storefront/latest))
- **WebMCP supplies embodied frontend action**: the live page exposes scene operations such as placing, moving, styling, inspecting, and packaging products as typed tools, and those functions visibly update the user’s 3D world. ([Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp), [imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api))
- **The page remains the stage**: Chrome’s design goal is for tool execution to happen visibly in the existing website, preserving the site’s brand and giving the user observable evidence of what the agent did. ([Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp))

WebMCP is still experimental. The 26 August 2026 document is a W3C Community Group draft, explicitly not a W3C Standard or Standards Track document; Chrome’s experiment runs through an origin trial (desktop/Android milestones 149–156) with shipping estimated for 157 in the Blink intent. ([WebMCP draft status](https://webmachinelearning.github.io/webmcp/), [Blink Intent to Experiment](https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ), [Chrome setup](https://developer.chrome.com/docs/ai/webmcp))

## What can be built with the current API

### Imperative tools: the core of the 3D experience

The current surface is `document.modelContext`. A page registers an imperative tool with `name`, `description`, optional JSON `inputSchema`, an `execute` callback, and optional annotations. The callback can call any ordinary page JavaScript, so it can mutate a Three.js/React Three Fiber scene, update a state store, play an animation, call Shopify’s storefront endpoints, and return a concise structured result. The browser-facing agent discovers the registered tools through browser internals; an in-page JavaScript agent can use `getTools()` and `executeTool()` directly. ([WebMCP draft API](https://webmachinelearning.github.io/webmcp/#api), [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api))

The draft currently defines:

```js
await document.modelContext.registerTool({
  name: "place_product",
  title: "Place product in miniature store",
  description: "Places one catalog variant at a valid display location.",
  inputSchema: {
    type: "object",
    properties: {
      variantId: { type: "string" },
      zone: { type: "string", enum: ["window", "hero", "shelf", "counter"] },
      expectedSceneVersion: { type: "integer" }
    },
    required: ["variantId", "zone", "expectedSceneVersion"]
  },
  annotations: { readOnlyHint: false },
  async execute(input, { signal }) {
    // Validate; reserve placement; animate parcel; commit state; return summary.
  }
});
```

Tool names are unique within a document’s model context, must be 1–128 characters, and are restricted to ASCII letters/digits plus `_`, `-`, and `.`. Duplicate registration rejects. `executeTool()` resolves with the stringified tool result. ([WebMCP draft: tool definition and registration](https://webmachinelearning.github.io/webmcp/#modelcontexttool-dictionary), [WebMCP draft: ModelContext](https://webmachinelearning.github.io/webmcp/#modelcontext-interface))

The official Pizza Maker demo proves the relevant interaction pattern: several small typed tools change a visible creative canvas, including pizza size, style, layers, and toppings; the callback directly invokes the same UI functions used by the human interface. ([Pizza Maker source: registered scene-like tools](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/pizza-maker/script.js#L190-L347))

### Tool lifecycle, cancellation, and state-dependent affordances

Passing an `AbortSignal` when registering a tool unregisters it when the signal aborts. The `execute` callback receives its own cancellation signal, and a caller can cancel a pending `executeTool()` call. Chrome notes that as of Chrome 153, unregistering a tool no longer breaks an already in-flight execution. `toolchange` notifies interested frames that the available tool list changed. ([Chrome imperative API: unregister and cancellation](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [WebMCP draft: registration options](https://webmachinelearning.github.io/webmcp/#modelcontextregistertooloptions-dictionary), [WebMCP draft: events](https://webmachinelearning.github.io/webmcp/#events))

That enables a game-like tool vocabulary. The official WebMCP Maze registers only `start_game` during intro/game-over, then swaps to `move`, `look`, `pickup`, `drop`, and `use` during play by aborting one registration controller and registering the next state’s tools. ([WebMCP Maze ToolRegistry](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/webmcp-maze/src/webmcp/ToolRegistry.ts#L15-L113))

For this project, use that pattern sparingly: expose `commit_bundle_to_cart` only after the scene has a valid reviewed bundle, and expose `begin_checkout` only after a cart exists. Chrome’s best-practices guide recommends registering tools only in page states where they are useful, but also warns that too many or overlapping tools consume context and make selection harder. ([Chrome WebMCP best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices))

### Declarative tools: useful for the final human boundary

Chrome’s declarative API converts a normal HTML `<form>` into a tool using `toolname` and `tooldescription`; form fields become schema parameters, and `toolparamdescription` can improve their semantic descriptions. Invoking the tool brings the visible form into focus and populates it. Without `toolautosubmit`, the user must still click submit; with it, the agent can submit automatically. `SubmitEvent.agentInvoked` and `respondWith()` let the page distinguish and respond to agent-assisted submissions, while `toolactivated` / `toolcancel` events and `:tool-form-active` / `:tool-submit-active` CSS states provide visible feedback. ([Chrome declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api))

This is a good fit for a **review order / confirm checkout form**, not for the 3D canvas itself. It naturally produces a moment where the agent has done the compositional work but the user remains visibly in control of the consequential step. Note that the normative draft’s declarative section still contains TODOs, even though Chrome documents and demos the behavior; treat it as Chrome-specific experimental functionality and keep an ordinary form fallback. ([WebMCP draft: Declarative WebMCP](https://webmachinelearning.github.io/webmcp/#declarative-webmcp), [Chrome declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api))

### Cross-frame composition

WebMCP is gated by the `tools` Permissions Policy, whose default allowlist is `self`. A cross-origin iframe must receive `allow="tools"`; cross-origin tool discovery additionally requires the tool owner to list the caller in `exposedTo`, while the caller lists the tool owner in `fromOrigins`. Returned `RegisteredTool` objects include the source `window` and `origin`, which disambiguates tools from different frames. ([Chrome imperative API: cross-origin iframes](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [Chrome security and permissions](https://developer.chrome.com/docs/ai/webmcp), [WebMCP draft: `RegisteredTool`](https://webmachinelearning.github.io/webmcp/#registeredtool-dictionary))

This suggests a credible Shopify embedding pattern: a 3D configurator may live in an app iframe while a small theme bridge in the storefront owns cart mutation. A public standards discussion documents a Shopify-embedded map-poster editor whose `add_to_cart` WebMCP tool sends `postMessage` to storefront JavaScript, which calls `/cart/add.js` and returns success to the editor; the implementer confirmed that the `fetch()` path needs no transient user activation. ([Shopify/WebMCP implementation comment](https://github.com/webmachinelearning/webmcp/issues/62#issuecomment-4591761745), [Shopify Ajax Cart API](https://shopify.dev/docs/api/ajax/reference/cart))

Do not embed or automate checkout in a cross-origin frame for the prototype. Keep cart assembly in the storefront session and navigate to Shopify checkout only after the WebMCP call has completed and the user has reviewed the result.

## Recommended project architecture

### A small, stable tool surface

Expose 6–8 tools, not dozens:

| Tool | Annotation / risk | Purpose |
|---|---|---|
| `get_world_state` | `readOnlyHint: true` | Return scene version, dimensions, placed product IDs, occupied zones, budget, and cart summary. |
| `search_store_products` | `readOnlyHint: true`; `untrustedContentHint: true` if descriptions/reviews are returned | Query Shopify catalog or proxy Shopify Storefront MCP results into a compact, whitelisted shape. |
| `preview_store_plan` | `readOnlyHint: true` | Validate a proposed bundle and return placements/costs without mutating state. |
| `stage_store_plan` | mutating | Animate parcels into the world, unpack them, and snap products to reserved placements. |
| `move_product` | mutating | Make a reversible adjustment to one placed item. |
| `set_store_mood` | mutating | Change lighting, palette, signage, and packaging style. |
| `review_bundle` | `readOnlyHint: true` | Return exact variants, quantities, price, and any Shopify warnings before cart mutation. |
| `commit_bundle_to_cart` | mutating / consequential | Add the reviewed bundle to the Shopify cart, then animate the successful items into the cart drawer. |

Keep checkout as a normal visible form or button. The current WebMCP annotations only guarantee `readOnlyHint` and `untrustedContentHint`; a `consequentialHint` has working-group support and an open PR, but it is not in the current draft API. ([WebMCP draft: `ToolAnnotations`](https://webmachinelearning.github.io/webmcp/#dom-toolannotations), [discussion and resolution on consequential actions](https://github.com/webmachinelearning/webmcp/issues/176#issuecomment-4566158429), [open consequentialHint PR](https://github.com/webmachinelearning/webmcp/pull/217))

### One state store, used by humans and tools

All direct-manipulation UI and every WebMCP callback should call the same domain commands against one scene store. The tool callback must read the latest store state at execution time, not values captured when the tool was registered. Framework maintainers have identified stale closures and register/unregister churn as current WebMCP integration hazards; their practical rule is “register as rarely as possible, but read the state as freshly as possible at execution time.” ([framework integration discussion](https://github.com/webmachinelearning/webmcp/issues/199))

Because current WebMCP has no standardized resource subscription or arbitrary page-state push channel, implement **optimistic scene versioning**:

1. `get_world_state` returns `sceneVersion`.
2. Every mutating tool accepts `expectedSceneVersion`.
3. The callback validates that version immediately before committing.
4. If a human moved an object meanwhile, reject with a compact `STALE_SCENE` result and the new version so the agent can re-read and retry.

This is a project-level mitigation inferred from the open reactive-state proposal, which says today’s agent must poll `get_*` tools and can otherwise act on state that the concurrently active user has already changed. Resource subscriptions are proposed but not part of the present API. ([reactive state proposal](https://github.com/webmachinelearning/webmcp/issues/151))

### Animation transactions

Treat every mutating tool as an animation transaction:

1. Validate schema and business rules in application code.
2. Reserve target slots and calculate collisions.
3. Start the package-arrival timeline.
4. Honor the callback’s `signal`: on cancellation, stop the timeline and restore the pre-call snapshot.
5. Commit scene state only at a defined animation boundary.
6. Await the visible UI update before resolving the tool result.

Chrome explicitly recommends updating the interface state before considering the function complete because the agent may use the interface to plan its next step, and it documents forwarding the tool cancellation signal into long-running async work. ([Chrome best practices: reliability](https://developer.chrome.com/docs/ai/webmcp/best-practices), [Chrome imperative API: cancellation](https://developer.chrome.com/docs/ai/webmcp/imperative-api))

For cart mutation, call Shopify first and animate into the cart only for variants that Shopify accepted. Shopify’s locale-aware Ajax Cart API supports adding multiple variants in one `POST /{locale}/cart/add.js` request and can return up to five freshly rendered cart sections in the same request, so the cart icon/drawer can update atomically with the 3D exit animation. ([Shopify Ajax Cart API](https://shopify.dev/docs/api/ajax/reference/cart))

### A safe userland batch tool

For the hero choreography, add a project-owned `execute_scene_plan` or `stage_store_plan` tool that accepts an array of **scene-only** actions. It should allowlist calls such as `place`, `move`, `rotate`, `set_mood`, and `focus_camera`; it must never batch cart mutation, checkout, account changes, or arbitrary tool names.

This pattern is already being explored by Chrome’s WebMCP team: an open “code mode / bulk tool execution” issue reports that one `execute_tools` call can replace sequential size/style/topping round-trips in Pizza Maker, reducing round trips, tokens, and latency for deterministic flows. The associated official utility supports sequential steps and references to earlier outputs, but this remains a userland experiment, not standardized WebMCP. ([bulk execution discussion](https://github.com/webmachinelearning/webmcp/issues/222), [official batch utility source](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/shared/webmcp-batch.js#L40-L133))

## The “single impossible moment”

### Recommended demo beat: “Brief → world → cart”

The user speaks to the browser agent, not to a chatbot embedded in the store:

> “Build a tiny two-metre camping pop-up from this shop for under $250. Make it feel cozy, fit three products, and put the finished bundle in my cart.”

The agent then:

1. Discovers the live page’s WebMCP tools without scraping controls.
2. Queries Shopify’s structured catalog and current cart/session.
3. Calls `preview_store_plan` and receives exact variants, constraints, and a scene version.
4. Calls one allowlisted `stage_store_plan`; three branded parcels fall into the miniature world, open, and their products glide and snap into collision-free displays while the camera reframes.
5. Calls `review_bundle`; price cards and a visible order strip appear.
6. After review, calls `commit_bundle_to_cart`; the exact staged products arc into the real Shopify cart drawer, whose server-confirmed contents and total update.
7. The user remains on a visible checkout-review control rather than the agent silently purchasing.

The judge-facing proof is not merely “an AI changed a page.” It is that a **generic browser-side agent discovers a page-owned, typed capability surface at runtime and composes live Shopify commerce state with a 3D application’s private domain operations—without DOM scraping, coordinate clicking, or an app-specific chat integration**. A conventional, uninstrumented website workflow exposes only visual controls; it cannot give an external agent this reliable semantic path into non-DOM 3D state and then keep the effects visible in the same branded interface. Chrome describes exactly this gap: ordinary actuation simulates clicks and text entry with each step open to interpretation, while WebMCP declares purpose, parameters, state, and callable functions. ([Chrome: why WebMCP](https://developer.chrome.com/docs/ai/webmcp), [Chrome: WebMCP vs MCP](https://developer.chrome.com/docs/ai/webmcp/compare-mcp))

Add a small on-screen “tool pulse” ribbon showing the names and sanitized arguments of calls as parcels move. This is a demo affordance implemented by the app, not a standardized tool-lifecycle event: richer pre-execute/progress/complete/error lifecycle events are still only a proposal. ([tool lifecycle event proposal](https://github.com/webmachinelearning/webmcp/issues/85))

## Interaction styles worth borrowing

The best interaction grammar can be assembled from proven WebMCP demos rather than adding a separate game loop:

- **Roguelike verb unlocking**: borrow WebMCP Maze’s state-gated `look`, `move`, `pickup`, `drop`, and `use` vocabulary. In the store, valid verbs become `inspect`, `place`, `move`, `style`, `review`, and finally `cart`. Only contextually valid capabilities exist at each phase. ([WebMCP Maze ToolRegistry](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/webmcp-maze/src/webmcp/ToolRegistry.ts#L58-L107))
- **Creative build-mode composition**: borrow Pizza Maker’s pattern of several orthogonal controls that all affect one visible artifact. This maps well to shelf position, display theme, sign text, package style, and product selection. ([Pizza Maker tool source](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/pizza-maker/script.js#L190-L347))
- **Retrieve → decide → visibly act**: the official Coffee Shop demo exposes `get_order_history` and then `reorder_product`, whose action updates both stored cart count and visible UI. This is the same chain needed for catalog/policy lookup followed by scene staging and cart mutation. ([Coffee Shop source](https://github.com/GoogleChromeLabs/webmcp-tools/blob/97e6fbe83fc3f2e3c6df2198b962dd2ad59cb924/demos/coffee-shop/index.html#L283-L344))
- **One-shot choreography**: use a constrained batch plan for the satisfying parcel sequence, while retaining granular tools for corrections. This gives the agent speed for the spectacle and precision for follow-up edits. ([bulk execution discussion](https://github.com/webmachinelearning/webmcp/issues/222))
- **Human/agent co-op**: allow the user to drag a product while the agent is working, then use scene versioning to make the agent visibly reconsider rather than overwrite the user. WebMCP’s core framing is a collaborative workflow in a shared interface; the current absence of push state makes the version check important. ([WebMCP draft introduction](https://webmachinelearning.github.io/webmcp/#introduction), [reactive state proposal](https://github.com/webmachinelearning/webmcp/issues/151))

## Security and confirmation mechanics

### What is real now

- WebMCP is restricted to secure, origin-isolated documents. It is disabled when the document is not origin-keyed, including documents that opt out with `Origin-Agent-Cluster: ?0`. The `tools` Permissions Policy defaults to `self`; cross-origin frames require explicit delegation. ([Chrome security and permissions](https://developer.chrome.com/docs/ai/webmcp), [WebMCP draft: permissions policy](https://webmachinelearning.github.io/webmcp/#permissions-policy-integration))
- `readOnlyHint` tells an agent that a tool only reads state; `untrustedContentHint` tells it that returned material is untrusted. Chrome recommends confirmations for mutations unless the tool is clearly read-only, plus token limits, origin restrictions, output spotlighting, classifiers, and intent critics for higher-risk agents. ([Chrome secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools), [Chrome agent security](https://developer.chrome.com/docs/agents/security))
- Tool descriptions, parameter descriptions, and results are prompt-injection surfaces. The draft also warns about intent misrepresentation, authenticated tools performing high-privilege actions, cross-site context leakage, and over-parameterized schemas extracting personal data. ([WebMCP security considerations](https://webmachinelearning.github.io/webmcp/#security-and-privacy-considerations))
- Chrome recommends short payloads: roughly 500 characters per tool description, 150 per parameter description, 30 per tool/parameter name, and 1.5K per individual tool output. These are guidance, not current normative limits. ([Chrome secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools))

### What is not guaranteed yet

There is no stable, standardized “confirmation dialog” contract in the current draft. Chrome’s July tool-security page still mentions a draft `requestUserInteraction()` mechanism, but the 26 August specification no longer contains it; the working group is actively redesigning this area as `requestUserInput()` with interactive, form, and URL elicitation modes. Consent provenance, declarative human-in-the-loop policy, consequential-action hints, and agent identity are all open design discussions. ([Chrome secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools), [elicitation discussion](https://github.com/webmachinelearning/webmcp/issues/165), [consent provenance proposal](https://github.com/webmachinelearning/webmcp/issues/155), [HITL hint proposal](https://github.com/webmachinelearning/webmcp/issues/198), [agent identity/scopes proposal](https://github.com/webmachinelearning/webmcp/issues/96))

Therefore:

- Split read/preview operations from commit operations.
- Put exact variant, quantity, total, and destination in the visible review UI.
- Never let a site-provided hint lower the agent/client’s safety policy.
- Bind the commit to a hash/version of the reviewed plan; reject if anything changed.
- Do not auto-submit checkout in the hackathon demo.
- Treat product reviews, merchant-authored free text, and external descriptions as untrusted; return only the minimum fields needed for the next step.

The distinction between advisory risk hints and authorization is also explicit in the HITL discussion: the browser/agent should compute policy from tool, origin, target, user context, and exact arguments, and a site must not be able to downgrade a payment or deletion by declaring it safe. ([HITL policy discussion](https://github.com/webmachinelearning/webmcp/issues/198#issuecomment-4659426535))

### Validate in application code

Treat `inputSchema` as guidance and validate again inside every callback. “Who owns validation?” remains open; the issue states that current schemas are semantic hints and that tool authors must validate and return useful correction feedback. The draft also acknowledges races when a tool is unregistered and quickly re-registered under the same name with a different schema. ([validation discussion](https://github.com/webmachinelearning/webmcp/issues/92), [WebMCP draft: execution race](https://webmachinelearning.github.io/webmcp/#ref-for-imperative-execute-steps))

## Important limitations for the plan

1. **Browser availability is experimental.** Use the Chrome origin trial or enable `chrome://flags/#enable-webmcp-testing` for the judged build; feature-detect `document.modelContext` and provide ordinary UI controls as fallback. ([Chrome setup](https://developer.chrome.com/docs/ai/webmcp), [Blink intent](https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ))
2. **The API is tab/document-bound.** WebMCP tools exist only while the page is open; it is not a background commerce agent or backend MCP replacement. ([Chrome: WebMCP vs MCP](https://developer.chrome.com/docs/ai/webmcp/compare-mcp))
3. **Avoid navigation inside a tool call.** Cross-document responses and persistent execution across navigation are unresolved. A redirect to checkout can destroy the document that owes the agent a result. Return success first, then let the user follow a normal checkout link. ([cross-document response issue](https://github.com/webmachinelearning/webmcp/issues/135), [persistent tools/workers issue](https://github.com/webmachinelearning/webmcp/issues/212))
4. **No standardized live state subscriptions.** `toolchange` reports registry changes, not arbitrary scene changes; use `get_world_state`, scene versions, and compact outputs. ([WebMCP draft events](https://webmachinelearning.github.io/webmcp/#events), [reactive state proposal](https://github.com/webmachinelearning/webmcp/issues/151))
5. **Observation timing is implementation-defined.** A browser agent may receive tools together with screenshots or accessibility-tree context, but when it re-observes is up to the implementation. Do not depend on immediate tool-registry churn to communicate every animation frame. ([WebMCP draft: page observations](https://webmachinelearning.github.io/webmcp/#page-observations))
6. **Tool outputs are stringified, not a standardized rich media channel.** Image/blob/file inputs, multimodal outputs, and output schemas are active proposals. Keep all 3D feedback in the page and return compact JSON-like summaries to the agent. ([WebMCP draft: `executeTool`](https://webmachinelearning.github.io/webmcp/#modelcontext-interface), [image I/O issue](https://github.com/webmachinelearning/webmcp/issues/41), [rich result issue](https://github.com/webmachinelearning/webmcp/issues/86), [attachment issue](https://github.com/webmachinelearning/webmcp/issues/81))
7. **State-driven frameworks need discipline.** Register stable tools once, read current state through refs/stores at call time, and use AbortController only for genuine availability changes. Dynamic schemas, disabled tools, keyed updates, and collection/grouping primitives are still proposals. ([dynamic tool proposal](https://github.com/webmachinelearning/webmcp/issues/167), [framework meta issue](https://github.com/webmachinelearning/webmcp/issues/199), [tool collections proposal](https://github.com/webmachinelearning/webmcp/issues/255))
8. **Headless use is not the primary target.** Chrome’s docs describe WebMCP as designed for local browser workflows with a human in the loop; persistent service-worker tools and headless-but-still-web execution remain exploratory. ([Chrome limitations](https://developer.chrome.com/docs/ai/webmcp), [worker/headless proposal](https://github.com/webmachinelearning/webmcp/issues/212))

## “Crazy ideas” found in current discussions

These are useful as stretch directions, but none should be represented as standardized current capability:

- **Reactive co-building**: subscribe the agent to selection, cursor, cart, and scene changes rather than polling. Proposed WebMCP resources/subscriptions would let the page notify agents only when state changes. ([proposal #151](https://github.com/webmachinelearning/webmcp/issues/151))
- **Store-authored merchandising skill**: a shop could publish a higher-level “visual merchandiser” skill containing tool groups, current promotion context, sizing knowledge, and workflow guidance. A working experiment implements skills today as a read-only tool that returns instructions, but a protocol-level skill remains debated. ([proposal #161](https://github.com/webmachinelearning/webmcp/issues/161), [working tools-as-skills experiment](https://github.com/webmachinelearning/webmcp/issues/161#issuecomment-4198205315))
- **Reverse inference / sampling**: the page asks the visiting agent’s frontier model to rank products or critique a layout, so a small merchant gains AI reasoning without running its own model backend. This is an open proposal with significant token-cost, permission, prompt-injection, and data-leakage questions. ([proposal #148](https://github.com/webmachinelearning/webmcp/issues/148))
- **Persistent “shop ghost” in a service worker**: tools could survive navigation, potentially letting a browser agent operate a storefront without rendering each page. The standards discussion explicitly calls this a boundary case between WebMCP and backend MCP, and it is not available today. ([proposal #212](https://github.com/webmachinelearning/webmcp/issues/212))
- **Web-native typed RPC**: one discussion suggests generalizing WebMCP into a secure, origin-scoped function-call bridge across windows and workers, with agent tooling emerging as one consumer. This could eventually make the 3D iframe, storefront shell, and browser agent peers on one typed action bus. ([proposal #236](https://github.com/webmachinelearning/webmcp/issues/236))
- **Attach a mood board directly**: proposed file/blob elicitation would let a tool request a user’s PDF or image inspiration without the manual download/upload loop. File attachments and image I/O are not in the present surface. ([attachment proposal #81](https://github.com/webmachinelearning/webmcp/issues/81), [image I/O proposal #41](https://github.com/webmachinelearning/webmcp/issues/41))
- **A persistent tool collection called `cart-checkout`**: progressive disclosure could let large apps reveal only the relevant tool group and preserve workflow identity across server round trips. Tool collections are an open proposal, not current WebMCP. ([proposal #255](https://github.com/webmachinelearning/webmcp/issues/255))

## Validation plan

Chrome recommends combining deterministic tests with probabilistic evals. Tests should cover correct tool selection, parameters, ordering, state updates, UI side effects, compact outputs, and mid-chain failures—especially the case where a coupon or cart mutation fails but the agent proceeds anyway. ([Chrome WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals))

Minimum evaluation set:

- Direct: “Place the red lantern on the hero plinth.”
- Ambiguous: “Make the entrance feel warmer without exceeding the budget.”
- Constraint conflict: three products cannot physically fit; agent must preview, revise, then stage.
- Human race: user moves a product between `get_world_state` and `stage_store_plan`; tool must reject stale version rather than overwrite.
- Cancellation: cancel halfway through parcel delivery; animation and scene must roll back.
- Cart partial failure: one variant becomes unavailable; only Shopify-confirmed lines animate into the cart, and the agent must not claim full success.
- Injection: malicious text in a product description must be marked/treated as untrusted and never trigger another tool.
- Confirmation: `commit_bundle_to_cart` must show exact reviewed lines; checkout remains user-controlled.
- Navigation: tool returns before any checkout navigation.
- Fallback: without `document.modelContext`, the mini-world remains fully usable by ordinary controls.

The strongest demo is therefore technically modest but conceptually sharp: **seven stable tools, one transactional scene store, one constrained choreography tool, one real Shopify cart mutation, and one unmistakable human confirmation boundary**.
