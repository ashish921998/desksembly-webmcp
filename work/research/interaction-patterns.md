# Interaction patterns for a WebMCP mini-commerce world

Research date: 2026-08-29

## Executive recommendation

Build a **living planogram**, not a 3D shop skin.

The strongest short-demo concept combines four proven interaction ideas:

1. **Wilmot's Warehouse** for spatial merchandising: where a product sits communicates category, occasion, and relationship to nearby products.
2. **Townscaper** for forgiving authorship: a tiny human action or agent proposal should resolve into a polished, coherent shop layout automatically.
3. **Unpacking** plus **A Little to the Left** for the tactile layer: products arrive in parcels, reveal one at a time, glide to suggested positions, and settle with excellent snap, sound, and micro-motion.
4. **Overcooked** plus **Factorio** for human-agent collaboration: the human is the art director/approver; the agent is the fast merch-ops partner; WebMCP calls become visible as a small, comprehensible production line.

Use **Stacklands** as the compact bundle-building interaction and a very short **Donut County-style cart pull** as the payoff. Use **Mini Motorways** only as an optional replay/challenge structure, not as the central metaphor: a traffic simulation risks making the commerce value feel fabricated.

This is credible to a Shopify audience when every object maps to a real commerce object:

- product model = product or variant;
- package label = SKU, price, and live availability;
- shelf/zone = collection, occasion, or recommendation group;
- adjacency = complementary-product relationship;
- cart = an actual Shopify Storefront API cart;
- constraint badge = budget, availability, variant, or delivery rule;
- agent receipt = a visible WebMCP tool call and structured result.

Shopify already supports related/complementary recommendations and exposes cart lines, costs, discounts, and delivery information, so this visual language can sit on real primitives rather than invented game stats ([Shopify product recommendations](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations), [Storefront API Cart](https://shopify.dev/docs/api/storefront/latest/objects/cart)).

## What WebMCP should contribute

Chrome describes WebMCP as a proposed standard through which a page exposes named, schema-defined tools to an AI agent. This is intended to be more reliable than an agent guessing at buttons and fields, and it can be added as progressive enhancement ([Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp), [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/)).

The interaction design should therefore make three properties unmistakable:

- **Discovery:** the agent can understand abilities the page never presented as a fixed wizard.
- **Composition:** it can select and sequence several site-defined capabilities from one human goal.
- **Co-presence:** the person stays in the world, sees proposals and consequences, can interrupt or adjust them, and confirms consequential actions.

Do not pitch WebMCP as unrestricted cross-site automation. The current design is origin-aware, WebMCP is gated by a `tools` permissions policy, and cross-origin iframe exposure must be delegated explicitly. The defensible claim is “impossible through this site's normal click/form workflow alone,” not “impossible for any website ever to implement” ([Chrome permissions-policy notes](https://developer.chrome.com/docs/ai/webmcp#permissions_policy), [spec security model](https://webmachinelearning.github.io/webmcp/)).

## Pattern comparison

Scores are relative to a short hackathon demo: 5 is strongest/easiest to communicate. “Risk” combines implementation scope and the chance of reading as a gimmick.

| Inspiration and pattern | Merchant value | 60-second clarity | WebMCP legibility | Risk | Recommendation |
|---|---:|---:|---:|---|---|
| Unpacking: parcel reveal and intimate placement | 4 | 5 | 3 | Low | Core tactile layer |
| Townscaper: tiny input, coherent generative result | 4 | 5 | 4 | Medium | Core layout behavior |
| Wilmot's Warehouse: self-authored spatial taxonomy | 5 | 4 | 4 | Low | Core product model |
| Overcooked: role-bound co-op and handoffs | 4 | 5 | 5 | Medium | Core human-agent loop |
| Factorio: visible automation and bottlenecks | 4 | 5 | 5 | Medium | Use for the hero sequence only |
| Mini Motorways: live flows under changing constraints | 3 | 4 | 4 | High | Optional challenge/replay mode |
| A Little to the Left: snap, settle, multiple valid answers | 4 | 5 | 3 | Low | Core polish and override behavior |
| Stacklands: direct-manipulation recipes and packs | 5 | 5 | 5 | Low | Bundle-builder subinteraction |
| Donut County: escalating collection/cart pull | 2 | 5 | 2 | Low | One brief payoff, not the main loop |

### 1. Unpacking — parcels as anticipation, placement as meaning

**Source mechanic.** *Unpacking* turns opening boxes and placing possessions into the entire interaction. Its official description emphasizes fitting items into a home, exploring small spatial niches, and discovering a character through what arrives and what is left behind ([official site](https://www.unpackinggame.com/)). Developer interviews explain that forcing a player to place an object makes them attend to it, and that room constraints can themselves carry narrative meaning ([Game Developer on objects and story](https://www.gamedeveloper.com/marketing/unpacking-a-narrative-through-1-000-household-items), [Game Developer design interview](https://www.gamedeveloper.com/design/intimacy-from-the-inanimate-in-house-moving-puzzler-unpacking)).

**Commerce translation.** A WebMCP agent's proposed products should arrive as small Shopify-style parcels. Opening a parcel is a reveal, not a loading spinner. Product scale, label, packaging, and destination establish that this is a real SKU entering a real merchandising plan. Placement should be spatially meaningful: a complementary item arrives beside its anchor product; an unavailable variant never appears as a selectable physical object.

**Hackathon implementation.** Use three reusable package sizes, one flap/open animation, one product-emerge animation, and spline motion to named shelf anchors. Vary sound and final settle slightly by material class rather than creating bespoke physics for every SKU.

**Caution from discussion.** Players of an *Unpacking*-inspired demo specifically liked bringing boxes in one at a time because boxes otherwise block the room ([community discussion](https://www.reddit.com/r/Unpacking/comments/1kzao75/i_just_released_the_public_demo_for_unbox_the/)). Stage parcels at a loading edge and clear empties immediately; do not let “cute boxes” obstruct the work surface.

### 2. Townscaper — forgiving semantic construction

**Source mechanic.** *Townscaper* asks for minimal input: select a color, place a block, and its underlying algorithm turns the surrounding configuration into houses, arches, stairs, bridges, or gardens. The creator explicitly describes it as a building toy rather than a goal-driven game ([official site](https://www.townscapergame.com/)).

**Commerce translation.** The human or agent drops a product into a semantic zone, and the system resolves the presentation: pedestal, rack, shelf height, signage, and complementary adjacency. A “Rainy Day” zone might automatically create an umbrella stand when several rain products cluster. The input remains commerce semantics; the output becomes a polished miniature shop.

**Why it matters.** This prevents the demo from becoming a fiddly 3D editor. The merchant provides intent and a few corrections; the system handles visual grammar. It also makes agent actions aesthetically reliable—any valid structured tool result yields something presentable.

**Risk.** Procedural architecture can eat the hackathon. Limit generation to a fixed isometric grid and a handful of composable fixtures selected by product type, size, and adjacency. The visual surprise should come from recombination, not geometry generation.

### 3. Wilmot's Warehouse — space as an explainable recommendation system

**Source mechanic.** *Wilmot's Warehouse* lets the player push, sort, and stack products using any taxonomy they choose, then tests whether they can retrieve requested items quickly. It also supports two-player co-op ([official Finji page](https://finji.itch.io/wilmots)).

**Commerce translation.** Let the mini-world be a visual recommendation graph:

- nearby products are complementary;
- color/fixture groups are collections or occasions;
- paths are shopper journeys;
- a loading bay is unsorted inventory;
- the service hatch is the cart/checkout edge.

When the agent proposes a layout, it should be able to explain one or two placements in plain language: “I placed the travel mug beside the commuter bag because it is configured as complementary and both are in stock.” This makes the scene a spatial explanation, not 3D decoration.

**Merchant value.** This is the best core metaphor because merchants already think in collections, shelves, bundles, and stock. Shopify's Search & Discovery tooling allows merchants to customize complementary and related recommendations, while its analytics exposes recommendation click and purchase performance ([recommendation configuration](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations), [recommendation analytics](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-analytics)). The prototype can truthfully position the scene as a new authoring/preview surface for those familiar concepts.

### 4. Overcooked — true co-op through complementary roles

**Source mechanic.** Ghost Town Games designed *Overcooked* around how a team works together, not around duplicating a single-player avatar. Its levels force division of labor, communication, and handoffs ([designer deep dive](https://www.gamedeveloper.com/design/game-design-deep-dive-building-truly-cooperative-play-in-i-overcooked-i-), [official Team17 page](https://www.team17.com/games/overcooked)). Player discussions converge on role specialization, short callouts, and sometimes an “expediter” who coordinates the flow ([role discussion](https://www.reddit.com/r/OvercookedGame/comments/o72tx6/what_is_your_advice_on_overcooked_2_for_a_new/), [communication discussion](https://www.reddit.com/r/OvercookedGame/comments/boj94q/how_do_you_communicate_with_your_partners_during/)).

**Commerce translation.** Do not let the agent perform a solo cutscene while the human watches. Give each side a unique job:

- **Human:** states fuzzy taste, rotates the world, locks beloved products, moves one object, approves the final cart/publish action.
- **Agent:** searches structured catalog state, checks constraints, proposes compatible alternatives, sequences the packages, and repairs the plan after a human change.

Use visible handoff stations. For example, the agent delivers three translucent “proposal parcels”; the human opens or rejects them; accepted products become solid and move to a shelf or cart. A small queue of named tasks—`find`, `check`, `stage`, `cart`—makes the partnership readable in seconds.

**Risk.** Overcooked's stress is memorable but can undermine trust in a commerce agent. Borrow division of labor, shared state, and handoffs; avoid failure timers during the main demo. If a timed mode exists, make it an optional “shop shift.”

### 5. Factorio — glass-box automation

**Source mechanic.** *Factorio* centers on building infrastructure and automating production, with conveyors making flows and bottlenecks visible ([official game page](https://www.factorio.com/game/content)). In a large player discussion about satisfaction, recurring themes were watching a system run after building it and fixing one bottleneck only to reveal the next ([community discussion](https://www.reddit.com/r/factorio/comments/zyhe94/what_is_the_most_satisfying_aspect_of_factorio_to/)).

**Commerce translation.** During the hero WebMCP sequence, packages should visibly pass through a tiny four-station line:

`catalog search -> stock/constraint check -> stage display -> add to cart`

Each station lights only when its corresponding page tool completes. A rejected or out-of-stock product is visibly diverted; a successful product receives a check label and continues. This turns structured agent work into theatre without pretending that the model's private reasoning is being exposed.

**Why it showcases WebMCP.** The browser's tool contract is normally invisible. A production line makes tool discovery, structured arguments, results, and sequencing spatially obvious. It also yields useful failure behavior: a station can show “no in-stock blue variant” rather than silently breaking the animation.

**Risk.** Continuous belts, factories, and dozens of machines would shift the pitch from merchandising to logistics. Use the line only for the 8–12 second agent action, then fold it back into the shop.

### 6. Mini Motorways — live demand flow and replayable scenarios

**Source mechanic.** *Mini Motorways* has players draw and revise roads for a city that grows and changes ([official game page](https://dinopoloclub.com/games/mini-motorways/)). Its creators support daily/weekly challenges and both endless and expert modes, giving the same core system different levels of pressure ([official challenge notes](https://dinopoloclub.com/2023/05/04/buckle-up-for-new-daily-challenges-with-the-extra-for-experts-update/), [official FAQ](https://dinopoloclub.com/support/mini-motorways/)).

**Commerce translation.** Tiny shopper signals travel between entrances, product zones, and checkout. Changing the layout changes their path. Scenario cards can create replay: “Lunch-break rush,” “Dorm move-in,” or “Clear the rainwear overstock.” A deterministic seed lets judges compare a human-only attempt with human-plus-agent collaboration.

**Best use.** Adopt the **pause, rethink, rebuild** rhythm and scenario modifiers. Do not claim conversion lift from a toy crowd simulation. If the prototype lacks real behavioral data, label every movement as a scenario visualization, not analytics or prediction.

**Risk.** This is the easiest pattern to overbuild and the hardest to make commercially truthful. Keep at most 8–12 agents/dots, three destinations, and one visible bottleneck.

### 7. A Little to the Left — tactile certainty without a single “correct” layout

**Source mechanic.** *A Little to the Left* uses intuitive drag-and-drop sorting, stacking, and arranging; it supports multiple solutions, very short puzzles, and a unique Daily Tidy ([developer site](https://www.maxinferno.com/), [official press kit](https://www.maxinferno.com/press/)).

**Commerce translation.** Merchandising has multiple valid answers. Objects should magnetize to candidate anchors, preview alignment before release, and settle decisively without implying that the agent's layout is the only correct one. The human can move one product to express taste; the agent repairs only the affected constraints.

**Replay translation.** “Daily Tidy” becomes “Daily Window”: a seeded 60-second merchandising brief with a real catalog subset and explicit constraints. Scoring should use verifiable state—budget met, all variants available, requested category represented—not fictional sales forecasts.

**Polish requirement.** The snap should be interruptible and reversible. Provide a reduced-motion mode that replaces parcel flights and cart suction with short fades and position changes.

### 8. Stacklands — bundles as direct-manipulation recipes

**Source mechanic.** *Stacklands* lets a player drag cards together to execute a known recipe; packs reveal new cards, while idea cards teach valid combinations ([official Sokpop page](https://sokpop.itch.io/stacklands)).

**Commerce translation.** Give products a small card/tab when selected. Stacking “jacket + umbrella + tote” creates a **bundle proposal**, not an immediate irreversible mutation. The agent then checks stock, variants, and price; the stack unfolds into 3D products only after validation. A sealed pack can represent an agent-generated option; opening it is the reveal.

**Why it fits WebMCP.** Direct manipulation and natural-language agent operation reach the same structured command. A human stack can call `validateBundle`; a prompt can cause the agent to call the same tool. This makes agent parity demonstrable and testable.

**Merchant value.** Shopify describes bundles as useful for curation, discounts, visibility, inventory movement, and average-order-value growth ([Shopify bundle overview](https://help.shopify.com/en/manual/products/bundles)). Even if the demo only creates a shopper cart rather than a persistent Shopify Bundle product, the interaction maps to a familiar commercial goal.

### 9. Donut County — cart gravity as one punctuation mark

**Source mechanic.** *Donut County* is a physics puzzle in which a moving hole swallows objects and grows, enabling it to collect larger objects ([official site](https://www.donutcounty.com/), [Nintendo product page](https://www.nintendo.com/store/products/donut-county-switch/)). Players often describe the simple escalation as satisfying, while some wanted a more replayable or endless version ([satisfaction discussion](https://www.reddit.com/r/videogames/comments/1hgcwad/what_is_the_most_oddly_satisfying_game/), [replay discussion](https://www.reddit.com/r/GamePassGameClub/comments/obhwd8/donut_county_discussion/)).

**Commerce translation.** Once the user approves, the cart opens like a small gravity well and accepted products arc into it, ordered from smallest to largest. The cart counter and total land at the same time.

**Caution.** This is funny and GIF-able, but it communicates little about merchant value and can trivialize purchase consent. Use it only after explicit approval, for under two seconds, and keep the real cart summary visible.

## The recommended experience: “Tiny Shop Shift”

### Core loop

1. A brief appears: “Build a rainy-day commuter kit under ₹5,000 using only items available now.”
2. The human locks one product they like or drags one item into a semantic zone.
3. The agent discovers and calls the page's WebMCP tools. Four small stations show search, constraint validation, staging, and cart preparation.
4. Candidate products arrive in parcels. Invalid candidates divert back to the loading bay; valid ones open and move into a Townscaper-like coherent display.
5. The human moves or rejects one product. The agent repairs only the affected part of the proposal.
6. The human confirms. Products make one brief cart-gravity move into a real Storefront API cart, followed by a normal checkout link.

### Suggested page tools

Keep the tool surface small enough that a judge can understand it:

- `searchProducts(query, maxPrice, tags)` — read-only;
- `getProductRecommendations(productId, intent)` — read-only;
- `checkVariants(productIds, optionPreferences)` — read-only;
- `stageDisplay(productIds, zone, style)` — reversible client state;
- `prepareCart(lines, discountCode?)` — cart mutation, with confirmation in the UI;
- `getScenario()` — read-only brief and scoring constraints.

The product-recommendation tool can map to Shopify's Storefront API `productRecommendations` query, which distinguishes related and complementary intent ([Shopify API](https://shopify.dev/docs/api/storefront/latest/queries/productRecommendations)). The cart tool can map to `cartLinesAdd`/`cartLinesUpdate`; Shopify's cart object exposes estimated costs, discounts, delivery information, and merchandise lines ([Shopify Cart API](https://shopify.dev/docs/api/storefront/latest/objects/cart)).

### Animation grammar

- **Agent proposal:** translucent packaging and a cyan route ribbon.
- **Human-owned/locked item:** solid object with a warm pin; the agent never moves it without approval.
- **Tool pending:** package pauses at a named station; never animate success before the result exists.
- **Tool success:** label stamp, 500–800 ms spline into place, 80–120 ms settle.
- **Tool failure:** gentle divert to loading bay plus a human-readable reason.
- **Commit:** explicit confirmation, then the cart pull and the actual cart summary.

Animations should be queued from authoritative state transitions, not from predicted agent intentions. This avoids a common demo failure in which the animation says “done” before the API does.

## The single “impossible in a normal website workflow” moment

### Recommended hero prompt

> “Rescue the slow-selling yellow raincoat: turn it into a commuter kit under ₹5,000, use only variants available now, and keep my black tote.”

### What happens on screen

1. The black tote receives a human lock pin.
2. The agent discovers the site's structured product, recommendation, availability, staging, and cart tools.
3. In one continuous sequence, labeled parcels pass through four stations. An unavailable size visibly diverts; a compatible in-stock alternative continues.
4. Three accepted items unpack and reorganize the mini shop around the locked tote. Price and constraint badges update from returned data.
5. The user swaps one item by dragging it away. The agent replaces only that item while preserving budget and availability.
6. The user approves once. The products move into an actual Shopify cart with the correct variants and checkout URL.

### Why the claim is defensible

A conventional storefront can provide search, filters, recommendations, and add-to-cart, but its authored navigation does not let a generic browser agent discover and dynamically compose those site-specific operations from an open-ended goal. Without this tool contract, the user would repeatedly search, open product pages, compare options, check variants, calculate the running total, preserve a chosen item, and add each line manually. WebMCP supplies the structured, site-owned actions; the mini-world supplies legible co-presence, reversible preview, and human approval.

This moment is stronger than “the AI moved 3D objects.” A normal script could move objects. The differentiator is that a browser agent discovers several structured site capabilities, composes them around live session state and a human's in-world edit, and commits the result through the same real cart system while the page visualizes every consequence.

## Build priority for a hackathon

### Must ship

- one isometric scene with fixed anchor points;
- six to twelve real Shopify products/variants;
- parcel reveal plus smooth place/cart animation;
- four to six WebMCP tools with visible receipts;
- one human lock/drag override;
- one real cart mutation and checkout URL;
- one deterministic scenario and constraint verifier;
- explicit confirmation before cart mutation.

### Good if time permits

- three scenario cards;
- recorded before/after replay;
- two fixture themes generated from the same anchors;
- daily seeded challenge;
- reduced-motion mode.

### Cut first

- free-roaming avatars;
- general-purpose procedural building generation;
- real-time crowd or conversion simulation;
- physics-driven packaging;
- multiplayer networking;
- a persistent Shopify Bundle product authoring flow;
- dozens of WebMCP tools.

## Research takeaways from public discussions

Public discussions are anecdotal, but they identify useful failure modes:

- *Unpacking*-style boxes delight during reveal but become clutter if they remain in the workspace ([discussion](https://www.reddit.com/r/Unpacking/comments/1kzao75/i_just_released_the_public_demo_for_unbox_the/)).
- Automation fans value watching a system work and diagnosing visible bottlenecks, not simply receiving an instant result ([Factorio discussion](https://www.reddit.com/r/factorio/comments/zyhe94/what_is_the_most_satisfying_aspect_of_factorio_to/)).
- Co-op improves when players form complementary roles and a shared rhythm; unstructured overlap creates frustration ([Overcooked discussion](https://www.reddit.com/r/OvercookedGame/comments/boj94q/how_do_you_communicate_with_your_partners_during/)).
- Simple collection mechanics can feel excellent in a short session but need scenarios or variation for replayability ([Donut County discussion](https://www.reddit.com/r/GamePassGameClub/comments/obhwd8/donut_county_discussion/)).
- Timed systems need pause/assist affordances; even Stacklands players asked for automatic pausing when new cards spawn, and Overcooked later added assist-mode options ([Stacklands discussion](https://www.reddit.com/r/Stacklands/comments/u3i5rn/news_the_future_of_stacklands/), [Overcooked accessibility update](https://www.team17.com/news/overcooked-all-you-can-eat-world-food-day-and-accessibility-update-coming-soon)).

The design implication is consistent: give the agent visible work, the human meaningful control, and the system enough pause/undo behavior that polish never becomes pressure.
