# Integration Evidence

All evidence is sanitized. No Shopify tokens, Vercel credentials, cookies, or
private product data are recorded here.

## Target environment

- Checked: 2026-08-29
- Deployment: <https://devp-one.vercel.app>
- Browser: Codex in-app browser, Chromium/Codex Framework `151.0.7922.174`
- Next.js: `16.3.3`
- React: `19.2.8`
- Shopify Hydrogen: `2026.10.0-preview.1`
- WebMCP types: `0.1.5`
- WebMCP specification snapshot: Community Group Draft dated 2026-08-26

## Item 2 — Shopify and project-tool coexistence

The deployed page reported `Agent-ready · Shopify + deskbuilder.echo`. The
target browser exposed the following exact tool names on the same origin:

```text
deskbuilder.echo
search_catalog
browse_store
get_product
show_variant
get_cart
add_to_cart
update_cart_lines
cancel_cart
proceed_to_checkout
manage_orders
search_shop_policies_and_faqs
```

The inventory contained one project-prefixed tool, eleven Shopify-owned tools,
and no duplicate names.

### Live calls

`deskbuilder.echo` input:

```json
{"message":"Shopify and deskbuilder coexist"}
```

Result:

```json
{"ok":true,"echoed":"Shopify and deskbuilder coexist","tool":"deskbuilder.echo"}
```

Shopify `get_cart` result:

```json
{"item_count":0,"line_items":[],"total_price":null}
```

The browser also invoked `search_catalog` successfully. The default `mock.shop`
shell returned an empty result set, which is expected until a development-store
catalog is connected.

### Lifecycle and fallback checks

- Navigating away from the home experience removed `deskbuilder.echo` from the
  browser's inventory.
- Returning home registered exactly one `deskbuilder.echo`; no leak or duplicate
  registration remained.
- Headless Chromium without WebMCP rendered the non-blocking message
  `Agent tools unavailable · manual shell remains` while keeping the shell usable.
- The target browser omitted the tool callback-options object even though the
  latest draft marks it required. The spike now treats that object as optional
  while still honoring its `AbortSignal` whenever supplied.

### Visual evidence

![Deployed shell showing the agent-ready Shopify and deskbuilder.echo status](evidence/webmcp-coexistence.png)
