# WebMCP + Shopify architecture standards audit

Date checked: 2026-08-29
Scope: proposed architecture for the miniature desk builder
Sources: current WebMCP Community Group draft and repository, Chrome's official WebMCP documentation, and Shopify's official documentation and Hydrogen preview source. No third-party implementation claims are used as authority.

## Executive finding

The architecture is directionally compatible with current WebMCP and Shopify Hydrogen developer-preview capabilities, but it should **not** be described as “the standard WebMCP architecture.” WebMCP is currently a W3C Community Group draft (`CG-DRAFT`) and a Chrome origin-trial/experimental API, not a stable Recommendation. It standardizes how a live document exposes tools; it does not prescribe the application's state store, command model, review protocol, transaction hashing, commerce abstraction, UI fallback, or animation sequencing.

The most important correction is that current WebMCP has **no standardized, implemented confirmation/elicitation contract on which this application can rely**. `ModelContextClient.requestUserInteraction()` was removed from the draft on 2026-06-11 “for now,” and the explainer lists prompting/elicitation as an open question. Any review/confirm-before-cart behavior must therefore be enforced by the application and Shopify checkout/cart flows, not assumed from the browser agent.

There is also no current `provideContext({state, tools})` API. It was removed in March 2026. State must be read through tool execution (for example, a `get_scene` tool), reflected in the visible page, or encoded in current tool schemas/descriptions by unregistering and re-registering tools. A `toolchange` event announces changes to the tool inventory; it is not a general state-push channel.

## Standards-backed / application-choice / unproven matrix

| Proposed claim or pattern | Classification | Audit result |
|---|---|---|
| Use `document.modelContext` | Standards-backed (draft) | Correct current entry point. Chrome says `navigator.modelContext` is deprecated in Chrome 150. The draft exposes a secure-context, same-object `Document.modelContext`. |
| Register page-local tools with `registerTool()` | Standards-backed (draft) | Correct. Current registration is one tool at a time and returns `Promise<undefined>`. Do not use `provideContext()`, `clearContext()`, or `unregisterTool()`; they are absent from the current interface. |
| Tool shape: `name`, `description`, optional `title`, optional `inputSchema`, required `execute`, optional `annotations` | Standards-backed (draft) | Correct current producer shape. `execute(input, {signal})` can be async. Names are unique within a document's model context and constrained to 1–128 ASCII alphanumeric/`_`/`-`/`.` characters. |
| Registration lifecycle via `AbortSignal` | Standards-backed (draft) | Correct. Pass `{signal}` as the second argument to `registerTool`; aborting it unregisters that registration. Component mount/unmount should own an `AbortController`. |
| Invocation cancellation | Standards-backed (draft/Chrome) | Correct. The execution callback receives `{signal}` and should pass it to cancellable work such as `fetch`. `executeTool()` also accepts a signal for in-page consumers. |
| `toolchange` | Standards-backed (draft) | Correct for tool registration/unregistration changes. It does not carry application state and should not be described as a scene-update event. |
| `annotations.readOnlyHint` and `annotations.untrustedContentHint` | Standards-backed (draft) | These are the only two annotations in the current merged draft. They are hints, not authorization or confirmation enforcement. Do not claim current support for `destructiveHint`, `idempotentHint`, or a proposed `consequentialHint` without feature detection and a newer authoritative draft. |
| Browser-agent discovery | Standards-backed only at a high level | A browser agent receives tools through an implementation-defined observation. The draft explicitly does not require MCP as the transport or prescribe when observations occur. In-page agents use `getTools()`; built-in browser agents use an internal mechanism. Tools require a live/visited page and are ephemeral/tab-bound. |
| “External browser agent, not an embedded chatbot” | Application scope choice | Compatible with WebMCP and with Shopify's stated shopper-brought-agent model, but not required. WebMCP also supports author-provided in-page/iframe agents. |
| Origin isolation and `tools` Permissions Policy | Standards-backed (draft/Chrome) | Required platform constraints. WebMCP is secure-context and origin-isolation gated. `tools` defaults to `self`; cross-origin iframe registration requires `allow="tools"`. Cross-origin discovery/execution additionally requires matching `exposedTo` and `fromOrigins` secure-origin allowlists. |
| Native user confirmation/elicitation before a consequential call | **Not currently standards-backed** | Do not rely on it. The earlier `requestUserInteraction()` interface was removed from the merged draft; prompting/elicitation remains open design work. `readOnlyHint: false` may influence an agent's decision to ask, but does not force a prompt. |
| Push the current scene to the agent as WebMCP state | **Not supported by the current API** | `provideContext()` and its state model are gone. Expose a read-only state/snapshot tool and include current version identifiers in results; re-register only when tool availability/schema itself changes. Browser observation may include UI/DOM/screenshot context, but that is implementation-defined and cannot be the correctness channel. |
| Shopify WebMCP on every Liquid storefront | Shopify-supported | Confirmed by Shopify's current WebMCP documentation. No application installation is required for Liquid storefronts. |
| Shopify WebMCP on Hydrogen developer preview | Shopify-supported preview | Confirmed, but only for the **developer preview**, not a guarantee for stable/current Hydrogen or arbitrary headless storefronts. The preview's `ShopifyScripts` enables WebMCP by default and loads Shopify's CDN script only where a model-context API exists. |
| Next.js + Hydrogen developer preview + Vercel | Shopify-supported preview | Confirmed. Shopify documents a Next.js/Vercel starter and `npx create-next-app` followed by `npx @shopify/hydrogen@preview setup`. The preview requires an SSR JavaScript storefront and may change. |
| Shopify cart is live-session/visible-tab truth | Shopify-supported | Confirmed. Shopify says cart tools call Standard Actions in the shopper's live session; changes update the cart the shopper sees and can trigger the storefront's configured cart behavior. |
| Custom page-local tools coexist with Shopify-injected tools | Standards-compatible, but conditional | Multiple `registerTool()` calls coexist if names are unique. The current draft rejects duplicate names. Shopify's preview source loads its CDN tools through `registerTool()`, so custom tools should coexist in practice. However, Shopify does not publish a blanket compatibility guarantee for arbitrary custom tools, and collisions are not namespaced. Use a project-specific prefix and add a runtime collision test. |
| Manual UI and WebMCP tools call the same domain commands | Application architecture choice | Sensible and recommended for consistency/testability, but not a WebMCP or Shopify requirement. |
| Zustand versioned scene commands / optimistic concurrency | Application architecture choice | Not required by WebMCP. It is a good defense against stale agent calls because observation timing is implementation-defined. Enforce `expectedSceneVersion` inside every mutating command/tool, not only in client state. |
| Reviewed-kit hash and reject cart commit after scene change | Application architecture choice | Not a standard requirement. It is an appropriate application-level integrity invariant, especially because WebMCP has no dependable confirmation API. Use a canonical serialization and recompute the hash at commit. |
| Commerce adapter with mock and Shopify implementations | Application architecture choice | Not required by WebMCP or Hydrogen. It remains a sound boundary for preview churn, testing, and ensuring the scene domain does not depend directly on Shopify APIs. |
| Deterministic non-agent fallback/manual UI | Application/product choice | Not required by WebMCP, but necessary for non-supporting browsers and prudent because Chrome's API is experimental and agent availability is limited. WebMCP should be a progressive enhancement. |
| “Shopify confirms cart results before cart animations run” | **Unproven as a platform guarantee** | Shopify documents live-session actions, not this animation ordering guarantee. Implement it: await the adapter mutation, reconcile with the authoritative returned/subscribed cart state, then enqueue success animation; animate rollback/error otherwise. |
| “Stable WebMCP tool registry” | Incorrect wording | The draft and Chrome docs explicitly say the API is under active discussion and subject to change. Tool **names can be stable within this app**, but the browser API is not yet stable. |

## Current imperative API and lifecycle

The merged draft currently defines:

```webidl
[Exposed=Window, SecureContext]
interface ModelContext : EventTarget {
  Promise<undefined> registerTool(ModelContextTool tool,
      optional ModelContextRegisterToolOptions options = {});
  Promise<sequence<RegisteredTool>> getTools(
      optional ModelContextGetToolOptions options = {});
  Promise<DOMString> executeTool(RegisteredTool tool,
      optional object inputObject = {},
      optional ModelContextExecuteToolOptions options = {});
  attribute EventHandler ontoolchange;
};
```

Producer code for this app should follow this pattern:

```ts
const registration = new AbortController();

await document.modelContext.registerTool(
  {
    name: 'deskbuilder.apply_scene_command',
    title: 'Apply desk-builder change',
    description: 'Apply one validated change to the current miniature desk scene.',
    inputSchema: {
      type: 'object',
      properties: {
        expectedSceneVersion: {type: 'integer', minimum: 0},
        command: {type: 'object'},
      },
      required: ['expectedSceneVersion', 'command'],
      additionalProperties: false,
    },
    annotations: {readOnlyHint: false, untrustedContentHint: false},
    async execute(input, {signal}) {
      return applySceneCommand(input, {signal});
    },
  },
  {signal: registration.signal},
);

// Component/page teardown:
registration.abort();
```

`provideContext()` was removed specifically because one script could clear or overwrite tools installed by another script. The current per-tool registration model protects an existing exact name by rejecting a duplicate, but it does not authenticate the semantic owner of similar names. This matters on a storefront with first- and third-party scripts.

Chrome's 2026-08-20 guide and the latest draft agree on producer registration, lifecycle signals, cancellation, and `toolchange`. They currently differ on one in-page-consumer detail: Chrome's guide shows `executeTool(tool, JSON-string)`, while the latest draft IDL and explainer use an object. This application does not need to call `executeTool()` in production—the browser agent is the consumer—so avoid coupling application architecture to that unsettled consumer signature. Tests that manually invoke it should feature-detect against the target Chrome version.

Sources:

- [Current WebMCP draft IDL and registration algorithm](https://github.com/webmachinelearning/webmcp/blob/41d12f057167ccf5954dbcf49d99502cb6c84491/index.bs#L598-L769)
- [Current tool, annotation, registration, and cancellation dictionaries](https://github.com/webmachinelearning/webmcp/blob/41d12f057167ccf5954dbcf49d99502cb6c84491/index.bs#L1052-L1192)
- [Chrome imperative API: registration, unregistration, cancellation, discovery, and events](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [`provideContext()` and `clearContext()` removal](https://github.com/webmachinelearning/webmcp/pull/132)

## Discovery, isolation, and permissions

The built-in browser agent does not call `getTools()` from page JavaScript. The draft describes an implementation-defined browser observation containing tool definitions and whatever other page context the user agent chooses. Observation timing and the format delivered to the agent are implementation-defined; the browser may use MCP, proprietary function calling, or another representation. Therefore:

- do not build correctness around an assumption that the agent continuously receives Zustand state;
- return the current `sceneVersion` and relevant state from every read/mutation tool result;
- validate freshness again inside each mutation;
- keep critical state visible and accessible in the page, but treat DOM/screenshot ingestion only as supplemental context;
- do not claim background or pre-visit discovery. Chrome currently requires the client/browser to visit the site, and WebMCP tools are tab-bound.

The API is available only in a secure, origin-isolated document. Chrome says opting out of origin isolation, including through `Origin-Agent-Cluster: ?0`/`document.domain`, disables WebMCP. Permissions Policy defaults `tools` to `self`. Cross-origin frames need all of: delegated `allow="tools"`, the provider's secure `exposedTo` origin, and the consumer's matching secure `fromOrigins` request. None of this grants an external website general access to a top-level storefront's tools.

Sources:

- [Browser-agent observations and implementation-defined transport/timing](https://github.com/webmachinelearning/webmcp/blob/41d12f057167ccf5954dbcf49d99502cb6c84491/index.bs#L1320-L1411)
- [Chrome WebMCP limitations, origin isolation, and Permissions Policy](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome cross-origin discovery and exposure](https://developer.chrome.com/docs/ai/webmcp/imperative-api#cross-origin_iframes)
- [Chrome: WebMCP versus backend MCP, live-tab and ephemeral lifecycle](https://developer.chrome.com/docs/ai/webmcp/compare-mcp)

## Confirmation and elicitation

This is the sharpest gap in the earlier architecture explanation. The current merged draft has no `ModelContextClient` and no `requestUserInteraction()`/`requestUserInput()` method. The interface was removed on 2026-06-11, and the current explainer explicitly categorizes user prompting and elicitation as unresolved. Chrome's security page, last updated 2026-07-01, still says the draft includes `requestUserInteraction()`; that statement is stale relative to the official repository.

`readOnlyHint` can help an agent decide when it may be safe to call a tool, but a hint does not enforce a user prompt. Consequently, the application must own the review gate:

1. a read-only preview/review operation produces the canonical plan hash and current scene version;
2. a human-visible review UI records approval for that exact hash;
3. `commit_reviewed_kit` rechecks scene version, hash, availability, price, and current cart/server state;
4. only then does it invoke the Shopify cart adapter;
5. checkout remains a separate consequential action.

Sources:

- [Commit removing `ModelContextClient` “for now”](https://github.com/webmachinelearning/webmcp/commit/067a1c90b5364b02742ef6ce40e5cf5a6497b445)
- [Current explainer: prompting/elicitation is an open question](https://github.com/webmachinelearning/webmcp/blob/41d12f057167ccf5954dbcf49d99502cb6c84491/README.md#L476-L484)
- [Chrome security guidance on annotation hints](https://developer.chrome.com/docs/ai/webmcp/secure-tools)

## Shopify and Hydrogen findings

Shopify's official documentation confirms that it supplies native WebMCP tools on every Liquid storefront and on storefronts built with the Hydrogen developer preview. These are for agents the shopper brings to the browser, not for a custom server-side agent. The tools act in the live tab/session. Catalog tools read the Storefront API; cart tools call Shopify Standard Actions, and cart updates change the cart the shopper sees.

The Hydrogen developer preview is explicitly framework-agnostic and supports Next.js. Shopify publishes a Next.js + Vercel starter and documents adding the preview to a new Next.js app. This validates the proposed Next.js/Vercel direction, with two qualifications: it is a developer preview whose APIs can change, and the app must use the preview's root-script setup rather than assume any arbitrary headless site receives Shopify tools.

The current preview source makes the mechanism precise:

- React `ShopifyScripts` defaults `webMcp` to `true` and initializes once after mount.
- `initializeShopifyScripts()` loads WebMCP unless explicitly disabled.
- the loader feature-detects `document.modelContext` (with a deprecated navigator fallback) and injects `https://cdn.shopify.com/storefront/webmcp.js`.
- Shopify's Next.js template renders `ShopifyScripts` from the root layout through a client navigation wrapper.

Custom project tools can therefore be registered on the same document, but names must not collide with Shopify's names. The current draft's duplicate-name check provides exclusion, not namespacing. Use names such as `deskbuilder.get_scene`, `deskbuilder.apply_scene_command`, and `deskbuilder.review_kit`; do not reuse Shopify's catalog/cart/checkout names. Add an integration test that enumerates tools in a WebMCP-enabled Chromium build and asserts both Shopify and project-prefixed tools are present. Treat this as tested compatibility, not an unconditional Shopify guarantee.

Sources:

- [Shopify WebMCP availability, live session behavior, and tool catalog](https://shopify.dev/docs/api/web-mcp)
- [Hydrogen developer preview: framework support, SSR requirement, Next.js/Vercel starter and setup](https://shopify.dev/docs/storefronts/headless/developer-preview)
- [Hydrogen preview release: ShopifyScripts loads WebMCP by default](https://hydrogen.shopify.dev/update/developer-preview-release-notes-july-8-2026#webmcp-storefront-tools-for-ai-agents)
- [Hydrogen preview React `ShopifyScripts` defaults WebMCP on](https://github.com/Shopify/hydrogen/blob/1d2f7d987f8c566a712273727fdd668cbf4a4f98/packages/hydrogen/src/react/shopify-scripts.tsx#L13-L46)
- [Hydrogen preview WebMCP initialization](https://github.com/Shopify/hydrogen/blob/1d2f7d987f8c566a712273727fdd668cbf4a4f98/packages/hydrogen/src/core/shopify-scripts/initialize.ts#L7-L25)
- [Hydrogen preview feature detection and CDN loader](https://github.com/Shopify/hydrogen/blob/1d2f7d987f8c566a712273727fdd668cbf4a4f98/packages/hydrogen/src/core/shopify-scripts/webmcp.ts#L1-L20)
- [Official Next.js preview template root integration](https://github.com/Shopify/hydrogen/blob/1d2f7d987f8c566a712273727fdd668cbf4a4f98/templates/nextjs/app/layout.tsx#L51-L56)

## Required corrections to the proposed architecture

1. Rename “stable tool registry” to **versioned application tool contract over an experimental WebMCP registry**.
2. Replace any `provideContext` or scene-state push design with individually registered tools, registration-owned `AbortController`s, and a read-only `deskbuilder.get_scene` snapshot tool.
3. Make every mutating tool accept `expectedSceneVersion`; reject stale calls in the domain-command layer. Return the new version after success.
4. Treat `toolchange` only as a tool-inventory notification. Do not use or document it as the scene synchronization channel.
5. Add correct annotations: `readOnlyHint: true` for snapshot/catalog/read tools; `false` for scene/cart mutations; `untrustedContentHint: true` when results contain merchant/user/external content. State clearly that these are hints.
6. Keep the reviewed-plan hash and visible approval gate as application-enforced invariants. Do not attribute them to WebMCP confirmation or elicitation.
7. Keep Shopify as authoritative for cart contents, availability, price, and checkout. Await and reconcile the resulting live cart state before success animation; this ordering is application logic.
8. In Next.js, render Hydrogen preview `ShopifyScripts` once at the root and leave `webMcp` enabled. Do not separately import Shopify's WebMCP CDN script when `ShopifyScripts` owns it.
9. Prefix custom tool names and test for collision/coexistence with Shopify tools in the exact preview version being deployed.
10. Preserve the manual UI and deterministic fallback for unsupported browsers/agents. Feature-detect `document.modelContext`; WebMCP must remain a progressive enhancement.
11. Pin the Hydrogen preview version/lockfile and add an upgrade audit, because preview API and Shopify-injected tool names/behavior may change.
12. Document the browser support claim narrowly: Shopify says its tools are live, but agent support is currently limited to Chromium-based browsers; Chrome itself presents WebMCP as an origin-trial/experimental feature.

## Corrected architecture statement

> Manual UI and WebMCP tools call the same validated domain commands. WebMCP is a progressive, live-tab adapter registered through `document.modelContext.registerTool()`; it does not own or receive a pushed copy of application state. Scene mutations use application-enforced optimistic concurrency, and reviewed cart commits use an application-enforced hash/approval gate because standardized elicitation is not currently available. Hydrogen developer-preview `ShopifyScripts` supplies Shopify's live-session catalog/cart tools, while project-prefixed page-local tools expose miniature-builder operations. Shopify remains authoritative for cart, price, availability, and checkout; the UI reconciles confirmed cart state before success animation. A commerce adapter, deterministic manual fallback, Zustand store, versioning, and review hash are application architecture choices, not WebMCP requirements.

This corrected statement is supportable by the current primary sources.
