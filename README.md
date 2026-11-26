# Cheat The Sky — cheat-the-sky.pages.dev

| Mobile | Desktop |
| --- | --- |
| ![Cheat The Sky on mobile](docs/cheat-the-sky-mobile.png) | ![Cheat The Sky on desktop](docs/cheat-the-sky-desktop.png) |

Travel site by Kareem Hesham. Static Next.js export hosted on Cloudflare Pages,
with Pages Functions powering the live API routes under `/api/*`.

## Layout

- `site/` — static build output served by Cloudflare Pages (deploy target).
- `functions/` — Cloudflare Pages Functions (TypeScript). Most wrap the Next
  route handlers from `src/app/api/*/route.ts` through the `shim/next-server.ts`
  adapter; `api/cheapest.ts` and `api/country.ts` are self-contained edge handlers.
  The `google*.html.ts` files serve the Google Search Console verification files
  (root-level static `.html` files get 308-redirected on Pages, so they must be
  functions).
- `src/` — Next.js app source (routes, components, lib).
- `shim/next-server.ts` — minimal `next/server` shim so the Next route handlers
  run on the Pages Functions runtime.
- `wrangler.toml` — Pages project config (`pages_build_output_dir = "site"`).

## Deploy

```
npx wrangler pages deploy site --project-name cheat-the-sky
```

## Environment / secrets (set in the Cloudflare dashboard, not in this repo)

- `TRAVELPAYOUTS_TOKEN` — Aviasales/Travelpayouts API token (flights, cheapest).
- `TRAVELPAYOUTS_MARKER` — affiliate marker.
- `SITE_URL` — canonical site URL used in metadata/sitemap.
- `VISA_API_KEY` / `VISA_API_HOST` / `VISA_DATA_MODE` — visa data source config
  (optional; snapshot fallback data is bundled).
- `LLM_API_KEY` / `LLM_PROVIDER` — optional AI guide generation.
- `HOTEL_AFFILIATE_ID` — optional hotel affiliate parameter.
