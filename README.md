# Desksembly

**An agent-ready desk, assembled in front of you.**

A proof-of-concept Shopify storefront where a shopper and a compatible browser
agent shape one directly manipulable miniature desk world. WebMCP exposes five
scene-owned tools; Shopify retains its native catalog, cart, and checkout tools.

Live proof of concept: <https://devp-one.vercel.app>

Public source: <https://github.com/ashish921998/desksembly-webmcp>

Public demo draft: [29.96-second narrated MP4](docs/evidence/demo-draft.mp4)

![A parcel opening inside the miniature desk world](docs/evidence/animated-stage.png)

![The US constraint shock preserving a locked keyboard](docs/evidence/constraint-shock.png)

## Current proof

- Fixed US desk world with one human-locked orange lamp.
- Exact $350 starter prompt and $300/90 cm US constraint shock.
- Cancellable parcel assembly, accessible scene list, manual edits, locks, and
  reduced motion.
- Stale-scene rejection and preservation of locked/unaffected product IDs.
- Exact one-time deterministic review/cart fallback with partial-failure truth.
- Shopify-native WebMCP coexistence and an application-enforced native cart gate.

## Honest limitation

No participant Shopify development store is connected. The desk catalog and
final scene cart are therefore clearly labeled deterministic fallback data.
Shopify-hosted `mock.shop` proves native tool coexistence and cart-gate behavior,
but the project does **not** claim an exact participant-store cart or checkout.

## Architecture

```text
Shopify native WebMCP tools ─┐
                             ├─ browser agent
deskbuilder.* scene tools ───┘       │
                                     v
manual UI ───────────────> versioned domain commands
                                     │
                   ┌─────────────────┴────────────────┐
                   v                                  v
          React Three Fiber world         commerce gateway / review gate
```

Scene mutations only occur through domain commands. Every agent mutation carries
an expected scene version. Review approval is exact, expiring, and one-time.

## Requirements

- Node.js 20 or newer
- npm
- A WebMCP-capable Chromium/browser-agent environment for live tool operation

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without credentials, the app intentionally runs the labeled deterministic path
and tokenless `mock.shop` integration checks.

To connect a development store, fill these untracked values from Shopify's
Headless channel:

```text
PUBLIC_STORE_DOMAIN
PUBLIC_STOREFRONT_API_TOKEN
PRIVATE_STOREFRONT_API_TOKEN
PUBLIC_STOREFRONT_ID
PUBLIC_CHECKOUT_DOMAIN
SHOP_ID
```

Never commit `.env.local` or private tokens.

## Verification

```bash
npm run typecheck
npm test -- --run
npm run test:integration
npm run test:e2e
npm run test:evals
npm run lint
npm run build
```

The test matrix covers domain invariants, live Hydrogen normalization, tool
registration, cart gating, manual accessibility, animation cancellation,
reduced motion, US constraint shock, exact review, partial failure, adversarial
text, and fallback disclosure.

## Supported demo flow

1. Run or copy the $350 starter request.
2. Watch four parcels assemble around the locked lamp.
3. Move or lock a product manually.
4. Apply the $300, 90 cm, US-availability revision.
5. Prepare and approve the exact deterministic review once.
6. Observe accepted-only reconciliation and the disabled Shopify Checkout
   disclosure.

## Source and licenses

All implementation in this repository is new hackathon work. Visuals use only
local primitive geometry; no third-party 3D assets are included. The project is
MIT licensed—see `LICENSE` and `THIRD_PARTY_NOTICES.md`.
