# Sukoon

Premium cloth e-commerce: **guest storefront** + **admin dashboard** in one Next.js app.

## Architecture (approved)

```
Next.js (App Router)
  → Single Vercel project
  → Storefront + Dashboard together

Data
  → Supabase DB + Auth (admin/staff only)
  → Cloudinary (product media)

Storefront
  → Guest only (no customer accounts)
  → Cart: localStorage `sukoon-cart`
  → Wishlist: localStorage `sukoon-wishlist`

Catalog collections (FINAL)
  → Palestine · Sukoon · Sabr · Tawakkul · Brotherhood
```

## Quick start

```bash
bun install          # or npm install
cp .env.example .env.local
# fill Supabase + Cloudinary keys
bun run dev          # http://localhost:3000
```

Admin: create a user in Supabase Auth, then open `/admin/sign-in`.

SQL: run migrations under `supabase/migrations/` in order via Supabase SQL Editor (see `.env.example`).

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run lint` | Oxlint |
| `bun run format` | Format |

## Deploy (Vercel)

1. Import this repo as **one** Vercel project.
2. Set env vars from `.env.example` (no Clerk keys).
3. Deploy. Storefront and dashboard ship together.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/phase5-collections-audit.md](./docs/phase5-collections-audit.md) | Current collection IA |
| [docs/phase5-p0-collection-loop-report.md](./docs/phase5-p0-collection-loop-report.md) | Catalog loop verification |
| [docs/production-cleanup-report.md](./docs/production-cleanup-report.md) | Cleanup / deploy readiness |
| [AGENTS.md](./AGENTS.md) | Agent conventions (dashboard patterns) |

## Notes

- Clerk is **not** used. Auth is Supabase only.
- Homepage still has temporary cashmere marketing copy — see production cleanup report (P1 content).
- Dashboard Customers page still uses mock user data until orders/customers are connected.
