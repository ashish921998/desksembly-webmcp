# WebMCP miniature desk-setup builder

An in-progress Shopify-backed miniature desk world designed for a shopper and
their compatible browser agent. The current checkpoint is the empty Hydrogen
storefront shell; the scene, custom WebMCP tools, and cart gate are added only
through the verified build checklist.

## Local setup

1. Copy `.env.example` to `.env.local` and provide Shopify Headless channel
   credentials when testing against a real development store. Without local
   credentials the shell uses `mock.shop` for non-secret development defaults.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.

## Checks

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`

Hydrogen's browser runtime is rendered once at the root, and Shopify-owned
request routes are intercepted by the Next.js proxy before application routing.

## Deployment

The current verified production shell is available at
[devp-one.vercel.app](https://devp-one.vercel.app).

## License

MIT. See `LICENSE` and `THIRD_PARTY_NOTICES.md`.
