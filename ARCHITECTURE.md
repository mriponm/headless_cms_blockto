# Blockto — Technical Architecture

> Last updated: May 2026

---

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + custom CSS |
| State | Zustand 5 (prices), SWR 2 (API data) |
| Animation | Framer Motion 12 |
| Charts | Lightweight Charts 5 (TradingView) |
| CMS | WordPress + WPGraphQL (headless) |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Build output | `standalone` Node.js server |
| Deployment | VPS via Docker / standalone server |

---

## Repository Structure

```
app/                    # Next.js App Router pages + API routes
  (pages)/              # Homepage, category, article, prices, metrics, etc.
  api/                  # ~35 server-side API route handlers
  auth/                 # Client-side OAuth pages (Google)
  layout.tsx            # Root layout — providers, fonts, head metadata
  manifest.ts           # PWA web app manifest

components/
  features/             # Page-specific feature components
    homepage/           # HeroSection, NewsGrid, CategoryNewsSection, Sidebar…
    prices/             # MetricsView, RainbowChart, PricesView…
    alerts/             # Alert system (AlertChecker, AlertDropdown)
  layout/               # Header, Footer, MobileDrawer, BottomNav, BFCacheRefresh
  providers/            # React context providers (Theme, I18n, Auth, Price, Translation)
  ui/                   # Shared UI primitives (BrandLogo, AuthModal, UserButton…)

lib/
  wordpress/            # WPGraphQL client + typed queries (getPosts, getPostBySlug…)
  supabase/             # Server client (SSR), browser client, middleware client
  store/                # Zustand stores (priceStore, metricsStore)
  hooks/                # usePriceSocket (Binance WebSocket), useCryptoData, useFlash
  i18n/                 # Translation system (languages, translation keys)
  utils/                # Formatters (price, percent, compact dollar)

public/                 # Static assets — logos, favicons, PWA icons, sw.js
```

---

## Frontend Architecture

### Rendering strategy

- **Homepage** (`/`): Server Component, `force-dynamic`. Fetches posts server-side on every request. No CDN or data cache — `Cache-Control: no-store` applied.
- **Article pages** (`/news/[slug]`): Server Component, statically generated with ISR.
- **Category pages** (`/category/[slug]`): Server Component with 60s ISR revalidation.
- **Interactive pages** (Metrics, Prices, Trading): Client Components with SWR data fetching and Binance WebSocket live prices.
- **API routes** (`app/api/*`): Server-side proxy routes — shield third-party API keys, handle rate limiting, normalize responses.

### Client-side navigation

- `prefetch={false}` on all homepage links (logo, nav) to prevent Next.js router cache from storing stale RSC payloads.
- `staleTimes: { dynamic: 0 }` in `next.config.ts` — zero client router cache TTL for dynamic routes.
- `BFCacheRefresh` component — calls `router.refresh()` on `pageshow(persisted)` (BFCache restore) and `visibilitychange` (iPhone app-switch). Prevents stale posts after Safari back navigation.

### Providers tree

```
RootLayout
└── AuthModalProvider
    └── ThemeProvider
        └── I18nProvider
            └── TranslationBatcherProvider
                └── PriceProvider          ← initialises Binance WebSocket
                    └── ConditionalShell   ← Header + Footer + BottomNav
                        └── {page}
```

---

## CMS — WordPress (Headless)

- **Host**: `cms.blockto.io` (separate WordPress installation)
- **API**: WPGraphQL — all content fetched over GraphQL POST requests
- **Client**: `lib/wordpress/client.ts` → `fetchGraphQL()` wrapper
- **Queries**: `lib/wordpress/queries.ts` — `getPosts`, `getPostsPage`, `getPostBySlug`, `getCategories`
- **Content types**: Posts organised by category slugs mapped in `APP_SLUG_TO_WP`
- **Cache**: Homepage queries use `cache: 'no-store'` (always fresh). Category/paginated queries use `revalidate: 60`.

---

## APIs and Data Providers

| Route | Provider | Data | Refresh |
|-------|----------|------|---------|
| `/api/markets` | CoinGecko Pro | Top 100 coin prices + 30d % | 60s |
| `/api/global` | CoinMarketCap Pro | Market cap, volume, BTC/ETH dominance | 60s |
| `/api/fear-greed` | CoinMarketCap Pro | Fear & Greed index + history | 1h |
| `/api/gainers` | Binance REST + CoinGecko | Top 24h gainers/losers (enriched) | 60s |
| `/api/futures` | Binance Futures REST | Open interest, funding rate, L/S ratio | 30s |
| `/api/gas` | Etherscan | ETH gas prices (slow/standard/fast) | 30s |
| `/api/mempool` | Mempool.space | Bitcoin block height, hash rate, halving | 60s |
| `/api/defillama` | DefiLlama | Total TVL, stablecoin supply | 1h |
| `/api/rainbow` | CryptoCompare | BTC daily OHLC history (power-law chart) | 24h |
| `/api/pairs` | Binance REST | Trading pair data | on-demand |
| `/api/binance/[symbol]` | Binance REST | Single symbol ticker | on-demand |
| `/api/translate` | Google Translate (free tier) | Page-level UI translation | on-demand |
| `/api/posts` | WordPress WPGraphQL | Paginated posts (category pages) | on-demand |
| `/api/search` | WordPress WPGraphQL | Full-text article search | on-demand |

### Live prices — Binance WebSocket

- `lib/hooks/usePriceSocket.ts` connects to `wss://stream.binance.com:9443/stream`
- Subscribes to `miniTicker` stream for 30 symbols (BTC, ETH, SOL, BNB, XRP…)
- Prices stored in Zustand `priceStore` — components subscribe with precise selectors to avoid unnecessary re-renders
- Auto-reconnects on disconnect (3s back-off)

---

## Authentication

**Provider**: Supabase Auth with custom Next.js route handlers (not using `@auth0/nextjs-auth0` in production).

### Flow — Email/Password

1. `POST /api/auth/login` → `supabase.auth.signInWithPassword()`
2. Session cookies written directly onto `NextResponse` (not `next/headers` — required for App Router route handlers)
3. `GET /api/auth/me` reads session via `req.cookies`, returns user object

### Flow — Google OAuth (PKCE)

1. Popup opens `/auth/google` — **client-side page** using `createBrowserClient`
2. Browser Supabase client initiates OAuth → stores PKCE code verifier in `document.cookie`
3. Google redirects popup to `/api/auth/callback?popup=1`
4. Server reads PKCE verifier from `req.cookies`, calls `supabase.auth.exchangeCodeForSession(code)`
5. Session cookies set on response
6. Popup broadcasts `auth:complete` via `BroadcastChannel("blockto_auth")`
7. Main window receives broadcast → `router.refresh()` → UI updates

**Why client-side initiation**: Server-side `signInWithOAuth` with `skipBrowserRedirect: true` sets the PKCE verifier via `Set-Cookie` on a redirect response. That cookie is frequently dropped on the Google→site cross-domain redirect in production. Browser-side initiation stores the verifier directly via `document.cookie` — guaranteed present on the callback request.

### Session management

- Cookies: `sb-*` session tokens (set by `@supabase/ssr`)
- `GET /api/auth/me`: validates session server-side via `supabase.auth.getUser()`
- `POST /api/auth/logout`: calls `supabase.auth.signOut()`, clears cookies
- Rate limiting on login (5 req/IP/15 min) and translate (30 req/IP/min) via in-memory `lib/rateLimit.ts`

---

## Internationalisation (i18n) + Translation

- **UI strings**: Static translation keys in `lib/i18n/translations.ts` — 20+ languages including RTL (Arabic, Farsi, Urdu, Hebrew)
- **Page translation**: `PageTranslator` component — DOM-based translation using Google Translate API directly from browser (`sl=auto`). Cross-language support (e.g. NL→DE) via reverse-store lookup that preserves English originals across language switches.
- **Batch translation**: `TranslationBatcherProvider` — collects registered strings, deduplicates, sends to `/api/translate` in batches of 10. Session-cached.

---

## PWA / Service Worker

- `public/sw.js` — custom service worker
- Caches only true static assets (images, fonts, icons) using stale-while-revalidate
- Navigation requests (`mode === "navigate"`) always bypass cache — page HTML always fetched from network
- API routes bypass cache
- Cache version key: `blockto-v2` — bump to invalidate all cached assets

---

## Hosting / Deployment

```
VPS (standalone Docker or Node.js)
├── Next.js standalone server  (next start / node server.js)
├── output: "standalone"       (self-contained, no node_modules needed)
└── Reverse proxy              (Nginx or Caddy in front)

External services:
├── cms.blockto.io             WordPress + WPGraphQL (separate VPS or managed)
├── Supabase                   Auth + PostgreSQL database (managed cloud)
├── Binance                    WebSocket + REST (no API key for public endpoints)
├── CoinGecko Pro              REST API (API key via env)
├── CoinMarketCap Pro          REST API (API key via env)
├── Etherscan                  REST API (API key via env)
├── Mempool.space              Public REST API (no key)
└── DefiLlama                  Public REST API (no key)
```

### Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_WP_API                     # WPGraphQL endpoint
NEXT_PUBLIC_SITE_URL                   # https://blockto.io
CMC_API_KEY                            # CoinMarketCap Pro
COINGECKO_API_KEY                      # CoinGecko Pro
ETHERSCAN_API_KEY                      # Etherscan
```

---

## Rates / Price System Integration

### Architecture

```
Binance WebSocket (wss)
    │
    ▼
usePriceSocket()          ← mounts once in PriceProvider
    │ setPrice(symbol, price, prev)
    ▼
Zustand priceStore        ← single source of truth for live prices
    │  { prices, changes, flash, flashVersion }
    │
    ├── Header PriceTicker    → BTC, ETH, SOL, BNB, XRP
    ├── Prices page           → full coin table (100+ rows)
    ├── MetricsView           → btcPrice, btcChange (precise selectors)
    ├── CoinRow components    → each row subscribes to its own symbol
    └── Crypto converter      → CONV_SYMBOLS map (BTC/ETH/SOL/BNB/XRP)
```

### Performance design

Components subscribe with **precise Zustand selectors** (e.g. `s.prices["BTCUSDT"]`) not the full `s.prices` object. This means a SOL price tick does not re-render the BTC chart or any other component that doesn't need SOL.

The `RainbowChart` separates the expensive Catmull-Rom spline computation (500 points, recalculates only on raw data/timeframe change) from the live dot overlay (cheap x/y lookup, updates on every BTC tick).

---

## Scalability Notes

### Current bottlenecks

- **Third-party API rate limits**: CoinGecko Pro, CMC Pro, Etherscan all have request caps. All external calls go through Next.js API routes (server-side proxy) so rate limiting is centralised.
- **WordPress WPGraphQL**: Single CMS instance. High traffic could saturate the GraphQL endpoint. Mitigation: ISR caching on category/article pages (60–300s revalidation).
- **In-memory rate limiter** (`lib/rateLimit.ts`): Per-process, resets on server restart. Multi-instance deployments need Redis-backed rate limiting.
- **Binance WebSocket**: One persistent connection per client browser. Works well for current scale.

### Horizontal scaling

The app is stateless (no server-side session state — all auth in Supabase/cookies). Multiple Next.js instances behind a load balancer work without shared state, except:
- In-memory rate limiter must be replaced with Redis for consistent limits across instances
- Zustand price store is client-side — each browser instance maintains its own WebSocket

---

## Mobile App Integration (Future)

The architecture is intentionally API-first and app-ready:

### REST API surface

All data exposed via `/api/*` route handlers returns clean JSON. A React Native or Flutter app can consume:

- `GET /api/markets` — live coin prices + metadata
- `GET /api/global` — market overview stats
- `GET /api/fear-greed` — Fear & Greed index
- `GET /api/posts?slug=category&first=20&after=cursor` — paginated articles
- `GET /api/search?q=bitcoin` — article search
- `GET /api/futures` — derivatives data
- `GET /api/mempool` — Bitcoin network stats

### Authentication

Supabase Auth supports mobile SDKs (`@supabase/flutter`, `supabase-js` in React Native). Session tokens are JWT-based and portable — a mobile app can authenticate via the same Supabase project and call the same `/api/auth/*` endpoints, or directly via Supabase SDK.

### WebSocket prices

A mobile app connects directly to `wss://stream.binance.com:9443/stream` using the same symbol list defined in `lib/hooks/usePriceSocket.ts`. No backend relay needed.

### PWA (current mobile solution)

The site is already installable as a PWA:
- `app/manifest.ts` — name, icons, `display: standalone`, `orientation: portrait-primary`
- Service worker in `public/sw.js` — offline asset caching
- `mobile-web-app-capable` and Apple web-app meta tags set
- Bottom navigation (`BottomNav`) — mobile-specific tab bar, hidden on desktop
- Fully responsive layout — mobile-first design with `md:` breakpoints

---

*Generated from codebase — keep this document in sync with major architecture changes.*
