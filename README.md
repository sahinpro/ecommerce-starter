# Sukoon

Premium cloth e-commerce: **guest storefront** + **admin dashboard** in one Next.js app.

## Architecture

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

Catalog collections
  → Palestine · Sukoon · Sabr · Tawakkul · Brotherhood
```

## Quick start

```bash
bun install          # or npm install
cp .env.example .env.local
# fill Supabase + Cloudinary keys
bun run dev          # http://localhost:3000
```

Admin: create a user in Supabase Auth, then open `/admin/sign-in `.

SQL: apply additive files in [`supabase/migrations/`](./supabase/migrations/) in the Supabase SQL editor (orders/settings, menus, then later catalog media/size-fit files). Do not replace a live `place_cod_order` function if checkout already works.

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
3. Deploy. Storefront and dashboard ship together.

## Docs

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](./AGENTS.md) | Agent conventions (dashboard patterns) |
| [CLAUDE.md](./CLAUDE.md) | Project conventions |

## Notes

- Clerk is **not** used. Auth is Supabase only.
- Storefront checkout is Cash on Delivery only. No payment gateway and no customer accounts.
