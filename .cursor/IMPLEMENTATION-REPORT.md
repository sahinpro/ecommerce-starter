# Sukoon — Current Implementation Report

**Date:** 12 August 2026 (updated after Phase 5B catalog + storefront wiring)  
**Purpose:** As-built snapshot after Phases 1–5B: auth, Cloudinary, canonical catalog, storefront DB reads, dashboard Products rewrite, off-canvas nav.  
**Audience:** Product, engineering, and next-phase implementation agents.

**Related specs**

- Storefront: [`.cursor/SUKOON-STOREFRONT.md`](./SUKOON-STOREFRONT.md)
- Dashboard / store management: [`.cursor/SUKOON-DASHBOARD-FINAL.md`](./SUKOON-DASHBOARD-FINAL.md)
- Prior snapshot (pre–Phase 1): superseded by this document

---

## 1. Executive summary

The repo is a **single Next.js 16 app** (Kiranism shadcn starter + Figma-aligned Sukoon storefront), intended to deploy as **one Vercel project**.

| Area | Status | Notes |
|------|--------|--------|
| **Storefront UI** | Largely complete | Home, shop, PDP, cart, checkout shell, static pages |
| **Storefront data** | **Supabase catalog** | Active products/categories via shared catalog service; CMS blocks still mock |
| **Cart / wishlist** | Client MVP done | Zustand + `localStorage`; cart uses real `product_variants.id` |
| **Checkout / orders** | Mock UI only | No payment; no order persistence — **Phase 5C+** |
| **Admin auth** | **Done (Supabase)** | Clerk fully removed |
| **Admin profiles** | **Done** | `profiles` + RLS + role gate |
| **Dashboard shell** | Cleaned starter | WhatsApp theme + header polish (Phase 3.1) |
| **Dashboard Products** | **Done (5B)** | CRUD over catalog + Cloudinary images/colors/variants; UUID ids |
| **Dashboard orders/customers** | Not built | Customers table still starter mock |
| **Cloudinary** | **Wired to Products** | Signed upload infra + product image nested section |
| **Supabase catalog** | **5A schema + 5B seed/app** | Apply both migrations in SQL Editor if not already |

**Bottom line:** Phases 1–5B are complete in code (`tsc` + `next build` green). Apply `phase5a` + `phase5b` SQL on the live project if not run yet. **Stop before checkout/orders/payments (5C).**

---

## 2. Phase completion status

| Phase | Focus | Status |
|-------|--------|--------|
| **Phase 1** | Starter cleanup, WhatsApp theme, remove demo nav/data | **Complete** |
| **Phase 2** | Clerk → Supabase Auth (admin only) | **Complete** |
| **Phase 3** | Admin profiles, RLS, client cart/wishlist, single-app deploy model | **Complete** |
| **Phase 3.1** | Dashboard WhatsApp fidelity + header/theme toggle polish | **Complete** |
| **Phase 4** | Cloudinary signed media infrastructure | **Complete** |
| **Phase 5A** | Catalog schema alignment + RLS + domain service foundation | **Complete** |
| **Phase 5B** | Canonical catalog, storefront DB wiring, dashboard Products, off-canvas nav | **Complete** |
| **Phase 5C+** | Checkout, orders, payments | **Not started** |

---

## 3. Target architecture (approved)

```text
                    VERCEL
                       │
                  NEXT.JS APP (one project)
                       │
          ┌────────────┴────────────┐
          │                         │
     STOREFRONT                  DASHBOARD
     Public / Guest           Supabase Auth (admin/staff)
          │                         │
          └────────────┬────────────┘
                       │
                    SUPABASE
               ┌───────┴───────┐
           Database          Auth
               │               │
        Store data        Admin users
        + customers

                   CLOUDINARY
                       │
                  Store media
            (infra ready; catalog later)
```

**MVP client commerce**

```text
Browser localStorage
        ├── Cart      (sukoon-cart)
        └── Wishlist  (sukoon-wishlist)
```

No customer Supabase Auth. Guests shop; checkout may later create `customers` DB rows.

---

## 4. Tech stack (as installed)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5.7 |
| Styling | Tailwind CSS v4, shadcn/ui, Base UI |
| Icons | Tabler via `@/components/icons` |
| Auth | **Supabase Auth** (`@supabase/ssr`, `@supabase/supabase-js`) |
| Media | **Cloudinary** (`cloudinary` + `server-only`; signed uploads) |
| Data fetching | TanStack React Query |
| Forms | TanStack Form + Zod |
| Tables | TanStack Table |
| Client state | Zustand (cart, wishlist) |
| Charts | Recharts (overview shell; empty states) |
| Package manager | npm / Bun-compatible |

**Removed:** `@clerk/nextjs` and all Clerk runtime usage.

---

## 5. Storefront — what exists

### 5.1 Routes

| Route | Purpose | Data |
|-------|---------|------|
| `/` | Home | Featured from Supabase; hero/stories/tiles mock |
| `/shop`, `/shop/[category]` | PLP | Supabase active products + live filters |
| `/product/[slug]` | PDP | Supabase product + related |
| `/cart` | Cart | Zustand localStorage (variant UUIDs) |
| `/checkout` | Checkout form | Mock submit |
| `/about`, `/contact`, `/faq`, `/shipping`, `/careers` | Static | Static |
| `/terms-of-service`, `/privacy-policy` | Legal | Static |

### 5.2 Behavior

| Feature | Behavior |
|---------|----------|
| Cart | Persist `sukoon-cart`; hydration-safe |
| Wishlist | Persist `sukoon-wishlist`; hydration-safe |
| Checkout | UI only → delay → clear cart → toast |
| Search / currency | UI only / not wired |
| Welcome newsletter popup | **Disabled** (removed from `StorefrontShell`; component retained unused) |
| Account | **No customer login** (guest storefront) |

### 5.3 Data layer

- Canonical domain: `src/features/catalog/` (`types`, `adapters`, `service`, `queries`, `mutations`)
- Storefront: `src/features/storefront/api/service.ts` wraps catalog reads (`status = 'active'` only)
- Hero / stories / tiles / benefits remain in `constants/mock-data.ts` until a content phase
- Mega menu: `PRIMARY_NAV` + `getCategoryNavChildren` (derived from `product_type`)
- Supabase client in catalog service: browser session on client; cookie-free anon on server (no `next/headers` in the shared module) 

---

## 6. Dashboard — what exists

### 6.1 Routes

| Route | Nature |
|-------|--------|
| `/admin/sign-in` | Supabase email/password admin login |
| `/dashboard` | Redirect → overview |
| `/dashboard/overview` | Empty metrics (`$0` / `0`) — no fake starter sales |
| `/dashboard/product` | **Catalog admin** — list/archive over Supabase |
| `/dashboard/product/[productId]` | Create/edit + nested images/colors/variants |
| `/dashboard/users` | Starter mock “Customers” table UI |
| `/dashboard/notifications` | Mock notification center UI |

**Removed:** Workspaces, Teams, Billing, Profile (Clerk), Kanban, Chat, GitHub promo, theme gallery.

### 6.2 Navigation

- Dashboard  
- Products  
- Customers  

### 6.3 Theme / header (Phase 3.1)

- Default theme: **WhatsApp** (light/dark via starter toggle)  
- Storefront forced to **Sukoon** via `StorefrontTheme`  
- Header: sidebar trigger, breadcrumb, search, notification bell, theme toggle, admin profile  
- Branding: **Sukoon / Store admin**  

---

## 7. Authentication & authorization

| Item | State |
|------|--------|
| Provider | Supabase Auth |
| Sign-in | `/admin/sign-in` |
| Protection | `src/proxy.ts` session refresh + `/dashboard/*` redirect; layout `requireAdminUser()` |
| Sign-out | Server action `signOutAdmin()` |
| Roles | `admin` \| `manager` \| `staff` on `profiles.role` |
| Gate | Auth user **must** have a `profiles` row with valid role |
| Customer Auth | **Not implemented** (by design) |

**Local verification (12 Aug 2026):** after switching to a new Supabase account, SQL was re-applied and admin login / dashboard access were confirmed locally.

---

## 8. Supabase & database

### 8.1 Project switch (current)

- Previous project ref in older docs/example: retired  
- **Current local `.env.local`** points at the new Supabase project (keys set)  
- `.env.example` uses a placeholder URL (no hardcoded old project)  

### 8.2 App clients

| File | Role |
|------|------|
| `src/lib/supabase/client.ts` | Browser (anon) |
| `src/lib/supabase/server.ts` | Server cookie session (anon) |
| `src/lib/supabase/middleware.ts` | Proxy session refresh |
| `src/lib/supabase/admin.ts` | Service role (server-only) |

### 8.3 Applied foundation (Phase 3)

Primary migration: `supabase/migrations/20260812100000_phase3_admin_profiles.sql`  
(**re-applied on the new Supabase project**)

| Table | Purpose | Status on new project |
|-------|---------|------------------------|
| `profiles` | Admin/staff (`id` → `auth.users`) | Present; admin login verified locally |
| `customers` | Guest buyer records (not Auth) | Present |

Also: profile auto-create trigger, backfill, RLS, role-change guard.

Living summary: `supabase/schema.sql` (foundation tables).

### 8.4 Catalog SQL (optional / early)

- Reference: `supabase/planned/schema-catalog.sql` (Phase 5+)  
- If applied on the new project: tables may exist, but **app feature services are still mock**  
- Do not treat early catalog SQL as “catalog feature complete”

### 8.5 Explicit non-goals (current)

- No Supabase Storage for media (Cloudinary is the media store)  
- No customer Auth users  
- No Product/Category admin CRUD against DB yet  

---

## 9. Environment variables

**Required (local `.env.local` + one Vercel project)**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only — never NEXT_PUBLIC_

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=       # server only — never NEXT_PUBLIC_
```

**Removed:** all Clerk / webhook Clerk vars.

**Notes**

- Restart `npm run dev` after changing Supabase/Cloudinary env values  
- Deploy: set the same vars on **one** Vercel project  

---

## 10. Gap matrix vs final plan

### Storefront

| Requirement | Status |
|-------------|--------|
| Figma-aligned UI | Done |
| Guest browsing | Done |
| Live catalog from DB | **Done (5B)** — active products only |
| Real checkout / orders | Not done |
| Customer accounts | Out of MVP scope |
| Welcome newsletter popup | Disabled for now |

### Dashboard / platform

| Requirement | Status |
|-------------|--------|
| Remove Clerk | Done |
| Supabase admin Auth | Done (new project verified locally) |
| Admin profiles + roles | Done |
| WhatsApp admin theme | Done (Phase 3.1) |
| Starter demo nav cleanup | Done |
| Cloudinary media infra | Done (Phase 4) |
| Real products / categories / inventory | **Done (5B)** — Products CRUD + variants |
| Orders admin | Not done |
| Real overview metrics | Not done (empty states only) |
| Wire catalog services to Supabase | **Done (5A/5B)** |

---

## 11. Suggested next phases

1. **Apply SQL on Supabase (if not done):** `20260812190000_phase5a_catalog_alignment.sql` then `20260812193000_phase5b_catalog_seed.sql`
2. **Phase 5C — Checkout / orders** — guest checkout → `customers` + orders; admin order UI; payments later
3. **Overview** — real metrics from DB
4. Optional: CMS tables for hero/stories/tiles; re-enable welcome newsletter when email is ready

---

## 12. Key paths

```text
src/app/(storefront)/          Storefront pages
src/features/storefront/       Storefront UI + cart/wishlist (+ mock CMS)
src/features/catalog/          Canonical catalog types/service/queries
src/features/products/         Dashboard Products UI over catalog
src/app/admin/sign-in/         Admin login
src/app/dashboard/             Admin shell
src/app/api/cloudinary/        Signed upload + delete (admin-only)
src/features/media/            Reusable CloudinaryImageUpload
src/lib/cloudinary/            Server config, sign, delete, URL helpers
src/lib/auth/                  Session, actions, role types
src/lib/supabase/              Browser / server / anon / middleware / admin clients
src/proxy.ts                   Supabase session + dashboard protection
supabase/migrations/           Phase 3 + 5A alignment + 5B seed
.cursor/SUKOON-DASHBOARD-FINAL.md
```

---

## 13. Document control

| Field | Value |
|-------|--------|
| Report type | Implementation status (as-built) |
| Codebase | `sukon` |
| Covers through | Phase 4 + local re-verification on new Supabase account |
| Local QA | Admin sign-in / dashboard confirmed after SQL re-apply (12 Aug 2026) |
| Not covered | Pixel QA vs every Figma frame; payment providers; production secrets inventory; live Cloudinary upload (needs credentials) |

---

## 14. Phase 3.1 — Dashboard theme & header polish

### Why WhatsApp looked wrong

1. **`DashboardTheme` forced `setTheme('dark')` on every mount**, so the light/dark toggle could not stick and felt broken.
2. **Theme toggle tooltip showed raw `Toggle theme` + `D D`** (hardcoded `Kbd`), which matched the reported “Toggle theme D D” UI.
3. **Notification bell had been removed** from the header during earlier cleanup.
4. **WhatsApp CSS lost the starter’s nested `@theme inline` block** under `[data-theme='whatsapp']`.
5. **SSR cookie validation only allowed gallery themes** (`THEMES`), so `sukoon` was rejected and storefront could SSR with WhatsApp until the client forced Sukoon.

### Fixes

| Area | Change |
|------|--------|
| Theme toggle | Clean tooltip (“Toggle theme”); sun/moon icons; no `D D`; no forced dark lock |
| Theme scope | `DashboardTheme` → WhatsApp + `dashboard-theme` class; `StorefrontTheme` → Sukoon + restore prior color mode |
| Cookie/SSR | `VALID_THEMES` includes `whatsapp` + `sukoon`; gallery still WhatsApp-only |
| WhatsApp CSS | Restored full starter `whatsapp.css` including nested `@theme inline` |
| Header | Search + NotificationCenter (mock) + ThemeModeToggle + UserNav (Supabase admin) |
| Nav | Unchanged: Dashboard / Products / Customers; Sukoon / Store admin branding kept |

### Isolation

- Dashboard `/dashboard/*` and `/admin/sign-in` → `data-theme="whatsapp"`
- Storefront routes → `data-theme="sukoon"` via `StorefrontTheme` + cookie
- No Clerk reintroduced; storefront visuals not redesigned

### Verification

- `npx tsc --noEmit` — pass  
- `npm run build` — pass  

### Changed files (Phase 3.1)

```text
src/app/layout.tsx
src/app/dashboard/layout.tsx
src/app/dashboard/notifications/page.tsx
src/components/layout/header.tsx
src/components/themes/theme.config.ts
src/components/themes/dashboard-theme.tsx
src/components/themes/storefront-theme.tsx
src/components/themes/theme-mode-toggle.tsx
src/components/ui/notification-card.tsx
src/features/notifications/**
src/styles/themes/whatsapp.css
```

---

## 15. Phase 4 — Cloudinary media infrastructure

### Architecture

Signed browser → Cloudinary uploads (Vercel-compatible; no local filesystem):

```text
Admin (Supabase session)
  → POST /api/cloudinary/sign  (folder allowlist)
  → FormData upload to Cloudinary
  → CloudinaryAsset { publicId, secureUrl, … }
```

Delete: `POST /api/cloudinary/delete` (admin only; `sukoon/` public_id prefix required).

### Packages

- `cloudinary` — official Node SDK (server signing / delete)  
- `server-only` — blocks client imports of server config  

### Folders

- `sukoon/products`  
- `sukoon/categories`  
- `sukoon/general`  

### Security

- `CLOUDINARY_API_SECRET` server-only; never `NEXT_PUBLIC_*`  
- Sign/delete require `getAdminUser()`  
- Folder paths application-controlled  
- JPG/PNG/WebP only; max 5 MB; no SVG  
- Unauthorized sign/delete → 401 (verified)  
- Secret absent from `.next/static` client bundles (verified)  

### UI

- Reusable `CloudinaryImageUpload` (wraps existing `FileUploader`)  
- No new nav; no Product CRUD; storefront unchanged  

### Env (`.env.example` + Vercel)

```text
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Verification

- `npx tsc --noEmit` — pass  
- `npm run build` — pass (`/api/cloudinary/sign`, `/api/cloudinary/delete`)  
- Unauthorized API → 401  
- Live signed upload requires Cloudinary credentials in `.env.local` / Vercel  

### Deferred to Phase 5+

Product catalog schema wiring in the app, Product/Category CRUD, storefront Cloudinary image consumption, media library.

---

## 16. Supabase account switch — local verification log

**When:** 12 August 2026  

**What changed**

- Supabase project switched to a new account/project  
- SQL foundation re-applied on the new project  
- `.env.local` updated with new project URL + anon + service role keys  
- Local admin sign-in / dashboard access confirmed by the developer  

**SQL expected on the new project**

1. **Required now:** `supabase/migrations/20260812100000_phase3_admin_profiles.sql`  
2. **Optional early:** `supabase/planned/schema-catalog.sql` (Phase 5+; app still mock until Phase 5)  

**Still required for Cloudinary live upload**

- Set Cloudinary env vars locally / on Vercel when ready to test signed uploads end-to-end  

*Next milestone at the time: Phase 5 (Catalog).*

---

## 17. Phase 5A / 5B — Catalog foundation + storefront/dashboard wiring

**When:** 12 August 2026  

### Delivered

- **5A migration:** `supabase/migrations/20260812190000_phase5a_catalog_alignment.sql` — catalog tables, indexes, RLS, `is_dashboard_staff()`, `categories.image_public_id`
- **5B seed:** `supabase/migrations/20260812193000_phase5b_catalog_seed.sql` — categories/products/images/colors/variants (fixed UUIDs, `/sukoon/...` image paths)
- **Canonical catalog:** `src/features/catalog/{types,adapters,constants,service,queries,mutations}.ts`
- **Storefront:** shop/PDP/featured/filters/nav children from Supabase; cart `variant_id` = `product_variants.id`
- **Off-canvas nav:** Menu trigger + dual-column desktop / back-stack mobile mega menu
- **Dashboard Products:** rewritten over catalog (UUID, archive, Cloudinary nested images, colors, variants)
- **Client-safe Supabase access:** catalog service uses browser client in the browser and cookie-free anon client on the server (avoids bundling `next/headers` into Client Components)

### Verification

- `npx tsc --noEmit` — pass  
- `npm run build` — pass  

### Manual step (Supabase SQL Editor)

1. Run `20260812190000_phase5a_catalog_alignment.sql`  
2. Run `20260812193000_phase5b_catalog_seed.sql`  

Without these, storefront PLP/PDP will show empty (“Nothing here yet.”).

### Explicitly out of scope (stop here)

Checkout persistence, orders admin, payments, customer auth, overview metrics from orders.

---

## 18. Phase 5A taxonomy realign — Figma is authoritative

**When:** 12 August 2026  

**Correction:** Mock catalog / Elle & Riley subcategory trees are **not** the source of truth.

### Authority

| Source | Role |
|--------|------|
| Figma file `9vLIUjShBT6xikhTmUqEuL` | Authoritative category **labels** (header `1:215`, homepage `1:84`, footer Shop `1:173`) |
| Supabase `categories` | Live which categories exist + product assignment |
| Elle & Riley | Off-canvas **interaction** inspiration only — never import its subcategory names |

### Figma primary categories (header)

1. New Arrivals → `/shop?sort=newest`  
2. Women → `/shop/women`  
3. Men → `/shop/men`  
4. Accessories → `/shop/accessories`  
5. About → `/about` (page link, not a `categories` row)

Footer Shop (`1:173`): Best Sellers, Shop All.

### Code

- `src/features/catalog/figma-taxonomy.ts` — Figma map + `buildPrimaryNav(categories)`
- Header / mega menu consume **DB categories** ordered by Figma list (no mock fallback inventing labels)
- Secondary column = `Shop All` + live `product_type` values only (no Sweaters / Cardigans & Jackets / etc.)
- Migration `20260812195000_phase5a_figma_taxonomy_realign.sql` — upsert Figma categories; null out Elle & Riley–inferred `product_type` strings
- Seed updated so `product_type` stays `null` until staff set real Sukoon types

### Apply on Supabase

1. `20260812190000_phase5a_catalog_alignment.sql` (if not applied)  
2. `20260812195000_phase5a_figma_taxonomy_realign.sql`  
3. `20260812193000_phase5b_catalog_seed.sql` (optional sample products)
