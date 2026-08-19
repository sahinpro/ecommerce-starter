# Sukoon Implementation Report (complete chat)

**Project:** Sukoon storefront + admin (Next.js 16, Supabase, Cloudinary, shadcn)  
**Date:** 2026-08-19  
**Audience:** Claude (continue or review this work)  
**Auth:** Supabase staff/admin only. Clerk is not used. Guest storefront.  
**Catalog collections:** Palestine · Sukoon · Sabr · Tawakkul · Brotherhood

This report covers **all work from the chat**: the original six-phase dashboard/storefront plan, then product-edit UX, live preview, barcode, size sort, media library, archive, and leftover follow-ups.

---

## Hard constraints (do not violate)

- Do **not** change COD checkout, `place_cod_order`, or stock-decrement RPCs.
- Do **not** set `deleted_at` when archiving a product (archive ≠ delete).
- Bundled `/public/sukoon/{home,products,swatches}` images are **display-only** in the media library. Deleting them must not call Cloudinary.
- Conventions: single quotes, no trailing commas, 2-space indent, icons only from `@/components/icons`, React Query via service/queries, `PageContainer` for dashboard headers, `useAppForm` for forms.

---

## SQL the operator must run

Apply in the **Supabase SQL editor** if not already applied. App code falls back if columns/tables are missing, but color photos and size-fit images will not persist until SQL exists.

| File | Purpose |
| --- | --- |
| `supabase/migrations/20260819100000_color_option_value_media.sql` | `product_option_value_media` + RPC `set_option_value_media` + backfill from `product_variant_media` |
| `supabase/migrations/20260819120000_product_size_fit_image.sql` | `products.size_fit_image_id` / `size_fit_image_url` |

Optional data cleanup (legacy archives):

```sql
UPDATE public.products
SET deleted_at = NULL
WHERE status = 'archived' AND deleted_at IS NOT NULL;
```

---

## Product edit flow (how the dashboard actually saves)

The edit page is **two independent save paths**. The main **Save** button does **not** persist options, colors, photos, or variants.

### Path A — Product fields (Save)

TanStack Form → `updateProduct` / `createProduct`.

Title, slug, SKU, description, price, compare-at, type, badge, composition, care, size & fit (text + optional image), status, category, featured.

Live preview (right sidebar) subscribes to name / price / compare-at / badge / status and merges them onto the React Query product.

### Path B — Nested catalog (instant API)

`ProductNestedSections`: images, options/values, color photos, variants. Each control is its own mutation. Cache is patched immediately (`src/features/products/api/cache.ts`). Mutations **invalidate on `onSettled`** so toasts cannot skip refetch (`src/features/products/api/mutations.ts`).

Typical color setup:

1. Add **Color** and **Size** options.
2. Add color values (name + hex via `ColorSwatchPicker`; names like Cream/Pink/Black auto-fill hex).
3. **Photos** on the color row → attach to `product_images` + `set_option_value_media`. Images are **per color**, shared by every size.
4. **Generate combinations** → Color × Size variants. Price/stock save on blur. Barcode field was **removed from the UI**; existing barcode is still sent through on save so the column is not wiped.
5. Remove a color → removes the option value and variants that used it (confirm if in use). Row disappears immediately (optimistic cache).

Storefront: shopper picks color first; gallery uses `imagesForColor()`.

---

# Part 1 — Original six-phase plan (implemented)

Source plan: `DASHBOARD-STOREFRONT-FIXES-PLAN.md` (user Downloads). All six phases shipped in this effort.

## Phase 1 — Color-first media (Shopify model)

Photos live on the **Color option value**, not on each size variant.

**Schema / RPC**

- Join table `product_option_value_media`
- RPC `set_option_value_media`
- Backfill from `product_variant_media`

**Domain**

- `ProductOptionValue.media_asset_ids`
- Variants inherit color-value media at read time (`src/features/catalog/adapters.ts`)
- Helpers: `colorOptionOf`, `variantColorValueId`, `groupVariantsByColor` in `src/features/catalog/variant-engine.ts`
- `imagesForColor()` / `imageForMediaAsset()`

**Dashboard**

- Photos button on Color rows (`product-nested-sections.tsx` → `ColorValueRow`)
- Per-variant Media button removed
- Variant table collapsed by color, compact rows, save on blur (`product-variants-section.tsx`)

**Compatibility:** catalog service probes `PRODUCT_DETAIL_SELECT`, falls back to `PRODUCT_DETAIL_SELECT_LEGACY`. Create/update retries without `size_fit_image_*` if columns missing.

## Phase 2 — Live preview

`src/features/products/components/product-live-preview.tsx` in the product-edit sidebar via `form.Subscribe`.

**Later in chat (see Part 2):** preview was reduced to the **storefront `ProductCard` only** (PDP buy-box was added then removed on request).

## Phase 3 — Orders date filter

- `OrderFilters.date_from` / `date_to`
- Asia/Dhaka helpers: `src/features/orders/date-range.ts`
- UI: `src/features/orders/components/orders-date-filter.tsx`
- Wired in orders listing + `/dashboard/orders` with nuqs (`shallow: false`)

## Phase 4 — Theme toggle cross-tab bug

**Cause:** `StorefrontTheme` called `setTheme('light')`, writing `localStorage.theme` and flipping the dashboard tab.

**Fix**

- `src/components/themes/theme-provider.tsx` uses `forcedTheme="light"` off `/dashboard` and `/auth`
- `storefront-theme.tsx` no longer calls `setTheme`

## Phase 5 — Shop UI

- Breadcrumb: `src/features/storefront/components/shop/shop-breadcrumb.tsx`
- Filter “All” chips per group
- Inline Product Type row (`Shop All · …`) sharing URL `types` param
- Product card wishlist heart (black fill when active), outside the `Link`

## Phase 6 — PDP + header

- Desktop gallery: stacked images (`lg:`); mobile unchanged (hero + thumbs)
- Color gallery uses `imagesForColor`
- Optional Size & Fit image: SQL + dashboard `product-detail-image-field.tsx`; PDP accordion if set
- Sticky header: hamburger instead of inline nav; hover + click open mega menu
- Hero stacked nav unchanged

PDP buy box extracted to `src/features/storefront/components/product/product-purchase-panel.tsx` (used on storefront only). Wishlist heart is **black filled** when wishlisted (not red).

---

# Part 2 — Follow-up work in this chat

## 2.1 Instant product-edit UI

**Bug:** Remove a color → toast “removed” but the row stayed. Same class of bug for add option/value.

**Cause:** Feature `onSuccess` (toasts) **replaced** mutation `onSuccess` that called `invalidateCatalog`. Query `staleTime` is 60s.

**Fix**

- Move invalidation to **`onSettled`** in `src/features/products/api/mutations.ts`
- Optimistic `setQueryData` on `catalogKeys.product(id)` and `catalogKeys.product(slug)` via `src/features/products/api/cache.ts`
- On remove: strip option value, `colors`, and variants that use that value id
- On add value: patch cache with returned row (`media_asset_ids: []`)
- Same pattern for images, color hex, color photos, option delete, variant delete

Edit page: `product-view-page.tsx` → `useSuspenseQuery(productByIdOptions)` → `ProductForm initialData={product}` → nested sections. Patching that query updates the form instantly.

## 2.2 Color picker

`src/features/products/components/color-swatch-picker.tsx`

- Large swatch (native `input type=color` overlaid)
- Hex text field (synced)
- Apparel preset popover (`Icons.palette`): Black, White, Cream, Pink, Red, …
- Typing a known name (e.g. Cream) auto-fills hex
- Existing color rows can update hex via `updateProductOptionValueMutation`

## 2.3 Barcode removed from variant rows (safely)

UI field gone from `product-variants-section.tsx`.

**Do not** omit `barcode` from `upsert_product_variant_full` — RPC treats missing as `null` and would wipe DB values.

Save and bulk price/stock still pass `barcode: variant.barcode`. Column and types remain.

## 2.4 Live preview reduced to the shop card

User asked to reuse the storefront product card, then **remove** the PDP block (title, description, swatches, Add to Cart, accordions).

**Now:** `ProductLivePreview` renders `ProductCard` with `preview`.

`ProductCard` `preview` mode:

- No links, no wishlist store writes
- Heart shown filled black
- Compact height (no `md:h-159`)
- Sizes always visible

Merged preview product: form name/price/compare/badge/status + live query images/options/colors/variants. Sizes/colors derived from options if variants not generated yet.

## 2.5 Size sort S → XL (not alphabetical)

Alphabetical `localeCompare` produced **L M S XL**.

`compareApparelSizes` / `sortSizeValues` / `isSizeOptionName` in `variant-engine.ts`.

Used in:

- Mapping Size option values
- `deriveSizes` / shop filter sizes
- Combination generation
- Variant groups (rows inside a color)
- Admin size chips
- Live preview

Order: OS, XS, S, M, L, XL, XLL, XXL/2XL, … then numeric sizes.

## 2.6 Media library: bundled storefront images

**Ask:** Combine images from `public/sukoon/home`, `products`, `swatches` into the dashboard media library. Non-removable. Must **not** affect Cloudinary.

**How**

- `src/features/media/api/bundled-assets.ts` walks those folders at request time
- IDs are `bundled:{relativePath}` (not UUID)
- `MediaAsset.locked: true`
- `listMediaAssets` prepends bundled files to Cloudinary/DB assets
- `deleteMediaAsset` rejects bundled IDs before any Cloudinary call
- Library UI: compact cards; info/exclaim icon + tooltip (“storefront file… Cloudinary is not changed”)
- Product **MediaPickerDialog** filters out `locked` so they cannot be attached (no `media_assets` row / FK)

Uploaded Cloudinary assets remain deletable (blocked only if `usage_count > 0`).

## 2.7 Archive list bug (partially fixed)

**Bug:** Archive toast succeeded; **Archived tab empty**.

**Cause:** `archiveProduct` set `deleted_at`. Admin list always used `deleted_at IS NULL`.

**Fix now in code**

- `archiveProduct` → `{ status: 'archived', deleted_at: null }`
- Archived tab sets `includeDeleted` so **legacy** rows that still have `deleted_at` appear there

**Still not perfect** — see Part 3.

Storefront remains safe: only `status = 'active'` and no `deleted_at`.

---

# Part 3 — Remaining work (do next)

Priority order for Claude.

### P0 — Archive UX is incomplete

See also `docs/archive-functionality-report.md` (same findings).

1. Confirm modal still says **“This action cannot be undone.”** Archive is reversible. Fix copy in `cell-action.tsx`. Add confirm to **bulk** archive (`product-tables/index.tsx`).
2. No **Restore**. Always shows Archive, even on archived rows. Add Restore → `status: 'draft'` (not `active`) + `deleted_at: null`. Hide Archive when already archived. Bulk Restore on Archived tab.
3. `updateProduct` Status dropdown does not clear `deleted_at`. Align with `archiveProduct`.
4. Legacy archived + `deleted_at`: **Edit by slug can 404** because `getProductBySlug` filters `deleted_at IS NULL`. Admin loader must allow those rows; storefront must not. Run the SQL cleanup above.

### P1 — Admin slug loader vs storefront

Keep storefront hide rules in `src/features/storefront/api/service.ts` only.

Dashboard `getProductByIdOrSlug` should load drafts/archived (and leftover `deleted_at` until SQL cleanup).

### P2 — Optional polish

- Overview product count (`dashboard/overview/layout.tsx`) includes archived (`deleted_at IS NULL` only). Decide active-only vs all non-deleted.
- Product-level archive does not archive variants. Fine if PDP never loads the parent. Optional: archive/restore variants together. Do not touch stock RPCs.
- **All** tab includes archived. Matches the label. Change only if the merchant wants All = active+draft.

---

# Part 4 — Key files map

| Area | Files |
| --- | --- |
| Color media SQL | `supabase/migrations/20260819100000_color_option_value_media.sql` |
| Size-fit SQL | `supabase/migrations/20260819120000_product_size_fit_image.sql` |
| Catalog read/write | `src/features/catalog/service.ts`, `adapters.ts`, `types.ts`, `variant-engine.ts` |
| Product mutations / cache | `src/features/products/api/mutations.ts`, `cache.ts` |
| Product edit UI | `product-form.tsx`, `product-nested-sections.tsx`, `product-variants-section.tsx`, `color-swatch-picker.tsx`, `product-live-preview.tsx`, `product-detail-image-field.tsx` |
| Storefront PDP | `product-detail-view.tsx`, `product-purchase-panel.tsx`, `product-card.tsx` |
| Shop | `shop-breadcrumb.tsx`, `shop-listing.tsx`, `filter-panel.tsx` |
| Header / theme | `storefront-header.tsx`, `storefront-mega-menu.tsx`, `theme-provider.tsx`, `storefront-theme.tsx` |
| Orders dates | `src/features/orders/date-range.ts`, `orders-date-filter.tsx` |
| Media library | `bundled-assets.ts`, `media/api/service.ts`, `media-library-page.tsx`, `media-picker-dialog.tsx` |
| Archive | `archiveProduct` in catalog `service.ts`, `getAdminProducts`, `cell-action.tsx`, `product-tables/index.tsx` |

---

# Part 5 — Test checklist

**Product edit**

- [ ] Remove a color → row gone immediately; variants for that color gone; toast still shows
- [ ] Add Cream → swatch is cream, not black; hex updates; existing row hex saves
- [ ] Color Photos attach once; all sizes of that color share them on PDP
- [ ] Variant barcode field absent; saving price/stock does not clear DB barcode
- [ ] Sizes display S → M → L → XL (admin chips, preview, PDP, shop filters, variant rows)
- [ ] Live preview is the shop card only; updates as name/price/images/options change
- [ ] Save button still required for title/price/description; options persist without it

**Storefront**

- [ ] Dashboard dark/light toggle does not flip the storefront tab (and vice versa)
- [ ] PDP stacked images on desktop; color changes gallery
- [ ] Size & Fit image in accordion only if set
- [ ] Sticky header hamburger + mega menu; hero nav unchanged
- [ ] Wishlist heart black fill when active (card + PDP)
- [ ] Archived product 404 on `/product/{slug}` and absent from shop

**Media**

- [ ] Library shows Home / Products / Swatches files plus uploads
- [ ] Info icon tooltip explains locked files; no delete
- [ ] Delete on an uploaded unused image still hits Cloudinary + DB
- [ ] Picker cannot select bundled files

**Orders / archive**

- [ ] Orders date filter uses Asia/Dhaka day bounds
- [ ] Archive active product → Archived tab; gone from Active; still off storefront
- [ ] Pre-fix archived rows: show on Archived; Edit slug after SQL cleanup

---

# Part 6 — Out of scope / already decided by the user

- Live preview must **not** repeat PDP title, description, ATC, Size/Fit/Composition/Care.
- Barcode stays in the database; only the variant UI field was removed.
- Bundled media is read-only in the dashboard library; not Cloudinary management.
- Archive is a **status**, not a delete.

When in doubt, prefer the latest user request in this chat over the original six-phase PDF.
