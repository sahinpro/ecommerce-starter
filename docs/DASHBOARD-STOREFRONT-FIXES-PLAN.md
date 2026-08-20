# Sukoon — Dashboard & Storefront Fixes Plan (Cursor-executable)

> **Target repo:** `sukoonbd/Sukoon-Next-App` (same underlying `sukon` app, new remote — confirmed identical stack: Next.js App Router, Supabase, shadcn/ui, TanStack Query/Table/Form, Zustand, Cloudinary).
> This plan was written by directly reading the current codebase against each requested fix — file paths, current behavior, and confirmed gaps are all verified, not assumed. Where something needs live-browser reproduction (Phase 4, the theme-toggle bug), that's called out explicitly instead of guessed.
> Follow `AGENTS.md` / `CLAUDE.md` in the repo root for existing code-style conventions (React Query pattern, `api/types.ts → service.ts → queries.ts` → `mutations.ts`, nuqs for URL state, icons only from `@/components/icons`, forms via `useAppForm`/TanStack Form) for all new code in every phase below.

---

## Execution rules for Cursor

1. Work **one phase at a time**. Stop after each phase, verify, and report changed files before continuing.
2. **Self-verify each phase until it genuinely passes — both functionally and on code quality.** Run the verification steps listed per phase. If something fails or doesn't match the spec, fix it and re-verify — repeat until actually correct, not just "didn't crash." Then check your own diff against the **"Code quality bar"** section near the end of this document (scalable, readable, maintainable, no dead code, no AI-flavored comments, no dirty code) — this is a mandatory second pass, not optional polish. Only stop and report once you're satisfied on both fronts. If truly stuck after several real attempts on the same issue, stop and explain what's blocking you rather than guessing further or shipping something broken.
3. `src/features/storefront/**` **visual design** is in scope for Phases 5–6 only (this plan explicitly asks for storefront UI changes there — shop/category page in Phase 5, product detail page + header in Phase 6). For all other phases, storefront visual design is off-limits — but non-visual storefront changes are explicitly in scope where a phase calls for them: Phase 1's data-model change requires a corresponding read-side update on the product detail page's color-gallery logic (Phase 6.2), and Phase 10 touches storefront data-fetching/caching (`cache()` wrapping, `revalidate` values) as a performance change, not a design change. Neither of those is scope creep — they're called out explicitly in their respective phases.
4. Never touch the COD checkout flow, `place_cod_order` RPC, or stock-decrement logic **except in Phase 8**, where hardening exactly these for concurrency is the explicit, scoped task — and even there, the constraint still holds in spirit: Phase 8 may only change *locking/atomicity behavior*, never checkout pricing, discounting, or order-total logic.
5. Verification after every phase:
   ```bash
   bun install        # first time only
   npx tsc --noEmit
   bun run build
   ```
6. Don't invent scope. If a phase's spec is ambiguous, implement the most literal reading and note the assumption in your end-of-phase report rather than guessing silently.

---

## Phase 1 — Product variants: rebuild to Shopify's color-first media model

**Problem (confirmed in code):** `ProductVariant.media_asset_ids: string[]` means every single size/color combination (Black/L, Black/M, Black/XL, Black/S...) has its own independent media list. In practice this forces re-uploading the same product photo for every size under a color — exactly what the screenshots show (`Save variant` + `Media` button per row, 100 stock hand-typed per row). Shopify's real model ties media to the **option value** (e.g. "Color: Black"), not to the full variant combination — upload once per color, every size under that color inherits it automatically.

### 1.1 Data model change

- Add media linkage at the **option-value** level instead of (or in addition to, during migration) the variant level. Two viable approaches — pick based on how deep `product_option_values` already goes in the schema (inspect `supabase/migrations/` for the options/variants tables before choosing):
  - **Option A (cleaner):** add a `product_option_value_media` join table (`option_value_id`, `media_asset_id`, `sort_order`) for values on the "Color" option specifically (`isColorOptionName` already exists in `variant-engine.ts` to detect this). A variant's effective media = its color option-value's media list, resolved at read time — no per-variant media needed at all.
  - **Option B (less migration, more app-layer):** keep `media_asset_ids` on variant but auto-sync it: when media is set on a color value, cascade-write that same list to every existing variant sharing that color value. Simpler migration, but keeps redundant data and needs the cascade logic kept correct forever. **Prefer Option A** unless the existing schema makes it clearly harder — it matches Shopify's actual model and avoids sync bugs.
- Migration: new table (Option A) or new sync trigger/function (Option B), under `supabase/migrations/` following the existing naming/RLS pattern.
- Backfill: for each existing product, take the Black/Pink/etc. variant that currently has the most complete `media_asset_ids` for that color and use it to seed the new color-value media (don't just pick the first one arbitrarily — dedupe by actual asset IDs, keep the union across sizes of that color if they differ).

### 1.2 Dashboard UI — image upload moves to the Color option row, not the variant row

- In `ProductOptionsSection` (`product-nested-sections.tsx`), when the option is Color, each color chip/value gets its own small media picker (reuse the existing `MediaPickerDialog` already used for product-level images) — this is where photos are uploaded, once per color.
- In `ProductVariantsSection`, remove the per-variant `Media` button entirely. The variant row shows a small thumbnail (read-only, pulled from its color's media) instead of an upload control.
- If a product has no Color option (rare, but the schema allows options other than Color), fall back to the current product-level image behavior — don't break products without a Color axis.

### 1.3 Variant table — make it small and clean like Shopify's actual admin (per your screenshot reference)

Currently: full editable `Price` / `Compare at` / `Barcode` / `Inventory` inputs inline, in an expanded per-color accordion. Rebuild the interaction pattern, not just the visuals:

- **Grouped/collapsed by color** (already partially done via `Group by: Color`) — keep this, but make each color group collapsed by default showing only a summary row (thumbnail, color name, size count, price range, total stock), expandable to see individual size rows — matches your Shopify reference screenshot exactly (the `4 variants` / `$0 - 10.00` / collapsed-with-chevron pattern).
- Row height and type scale should match the rest of the Shopify-style admin theme already shipped in Phase 1 of the earlier redesign (compact, ~13-14px, tight padding) — don't reintroduce the old bulky spacing.
- Bulk-edit bar (already exists for selected rows — bulk price/stock) stays, but restyle to match the new compact row height.
- Inline edit fields (price, compare-at, barcode, inventory) can stay inline-editable per row (Shopify does this too), but the per-row `Save variant` button should debounce/auto-save on blur instead of requiring an explicit click per field per row, if that's a reasonable lift — otherwise keep explicit Save but make it visually lighter (icon button, not a full-width labeled button per row).

### 1.4 Verification
```bash
npx tsc --noEmit
bun run build
```
- Open a product with 3 colors × 4 sizes. Confirm uploading one image on the "Black" color value makes it appear on Black/L, Black/M, Black/S, Black/XL without separately uploading to each.
- Confirm changing/removing a color's image updates all sizes under that color.
- Confirm the variant table renders collapsed-by-color by default, compact row height, and expands cleanly.
- Confirm existing products (with old-style per-variant media) still render correctly after the backfill — no broken thumbnails.

**Stop and review.**

---

## Phase 2 — Product edit page: live preview sidebar

**Goal:** add a "Live preview" card to the product edit page's right sidebar (next to the existing Organization panel), showing the product roughly as a customer would see it, updating as the admin edits — per your reference screenshot (image 4).

1. New component `product-live-preview.tsx` in `src/features/products/components/`, placed in the right sidebar column of `product-view-page.tsx` alongside the existing Organization card.
2. Reads the in-progress form state (title, price, compare-at price, primary image, badge, status, color swatches, size list) directly from the same form/state the edit form already holds — **do not** make a separate network round-trip for this; it should update live as fields change, before saving.
3. Visual content: reuse the actual storefront `ProductCard`/`ProductBadgeLabel` styling conventions where practical so the preview looks like a real product card, not a re-invented mini design — but this is a dashboard-side component, so it doesn't need to import storefront components directly (avoid cross-feature coupling); replicate the visual pattern with dashboard-local markup instead.
4. Fields to reflect live: title, price + struck-through compare-at price, primary image (falls back to a placeholder if none set yet), status badge (Active/Draft/Archived), one selected color swatch + size row like the reference screenshot.
5. Keep it read-only — no interaction, purely a preview. No "Add to cart"/"Buy now" buttons needed (those imply real storefront behavior this isn't wired to); a static "Preview" label is enough context.

### Verification
```bash
npx tsc --noEmit
bun run build
```
- Edit a product's title/price/image and confirm the preview card updates without saving.
- Confirm it renders sensibly for a brand-new, still-empty product (no crash on missing image/price).

**Stop and review.**

---

## Phase 3 — Orders: date filter (day / weekly / this month / custom range)

**Problem (confirmed):** `OrderFilters` type only has `search`, `status`, `page`, `limit` — no date filtering exists at all today.

1. Extend `OrderFilters` (`src/features/orders/types.ts`) with `date_from?: string` and `date_to?: string` (ISO date strings).
2. Extend the orders query/service layer (`src/features/orders/service.ts` / `queries.ts`) to apply a `created_at` range filter against these when present.
3. Dashboard UI (`orders-listing.tsx`): add a date-filter control next to the existing search/status filters — a dropdown with presets **Today / This Week / This Month / Custom Range**, where Custom Range opens a date-range picker (check if a range-capable date picker component already exists under `src/components/ui/` — shadcn's calendar/popover primitives are likely already installed per `components.json`; use those rather than adding a new date-picker dependency).
4. Sync selected range to the URL via `nuqs` (matching the existing pattern used for search/status/page in this table) so filtered views are shareable/bookmarkable and survive a refresh.
5. "This Week" and "This Month" should use the store's actual local timezone consistently with how order dates are already displayed elsewhere in the dashboard (check `date-fns` usage elsewhere in the repo, already a dependency, for the existing formatting convention — don't introduce a second date-formatting approach).

### Verification
```bash
npx tsc --noEmit
bun run build
```
- Confirm Today/This Week/This Month presets return the expected subset of the 4 seeded test orders (or whatever test orders exist) by checking against their dates.
- Confirm Custom Range with an explicit from/to correctly bounds results (inclusive of both ends).
- Confirm the filter persists across a page reload (URL-driven).
- Confirm clearing the date filter returns to the full unfiltered list.

**Stop and review.**

---

## Phase 4 — Fix: dashboard theme toggle stops working when a storefront tab is open

**Problem (root cause investigated, not yet 100% confirmed — needs live reproduction):** The app has two separate theme concepts stacked together:
- `ActiveThemeProvider` (`active-theme.tsx`) — controls the *color scheme* (`sukoon` vs the admin theme), stored via a **cookie**, state initialized once from `STOREFRONT_THEME` at the root layout and overridden client-side per route.
- `next-themes`' own light/dark mode (`ThemeProvider` in `theme-provider.tsx`, `attribute='class'`, `enableSystem`) — stored in **`localStorage`**, and **shared across the entire origin**, including both the storefront and dashboard, since they're the same Next.js app/domain. `next-themes` has built-in cross-tab sync via the browser's `storage` event, so **all tabs of the same site are expected to share one light/dark value** — that part is by design, not a bug.

The reported symptom (dashboard toggle "doesn't work" while a storefront tab is open, works again once it's closed) suggests something in the storefront tab is **writing a stale/old theme value back to `localStorage`** after the dashboard tab changes it — likely on a focus event, visibility change, or a mount effect with a stale closure — which then fires a `storage` event back at the dashboard tab and silently reverts its toggle.

1. **Reproduce first, don't guess-fix.** Open the dashboard in one tab, the storefront in another, toggle dark mode in the dashboard tab, and watch: does `localStorage.theme` actually change and then get reverted? Use the browser devtools' Application → Local Storage panel and watch it live, or add a temporary `window.addEventListener('storage', console.log)` to catch exactly which tab is writing what, when.
2. Once the actual write path is identified, likely culprits to check directly in code:
   - Any `useEffect` in storefront-only theme-related components (`storefront-theme.tsx` was found calling `setTheme`/`setActiveTheme` — check what triggers it to re-run: mount only, or something like a route change / focus / interval that re-fires and re-applies an old value it captured in a stale closure).
   - Whether `ActiveThemeProvider`'s cookie-based color-scheme logic is unintentionally interacting with `next-themes`' localStorage-based dark/light logic (they're separate concerns but sit close together in the same provider tree — confirm they aren't cross-writing).
3. Fix at the actual source of the stale write — don't just silence the symptom (e.g. don't disable cross-tab sync globally if the storefront legitimately needs it for its own dark/light toggle, if it has one; scope the fix to stop the *stale* write, not the *sync itself*, unless product decision is that dashboard and storefront should have fully independent light/dark modes, which is a bigger, separate call to make explicitly rather than assume).

### Verification
```bash
npx tsc --noEmit
bun run build
```
- Manually reproduce: dashboard tab + storefront tab open together, toggle dashboard dark mode repeatedly, confirm it sticks every time regardless of the storefront tab's state.
- Close the storefront tab, confirm dashboard toggle still works (regression check — the fix shouldn't only work when the other tab is closed).
- Confirm the storefront's own theme behavior (whatever `storefront-theme.tsx` was doing) still works correctly after the fix — don't break its intended behavior while fixing the dashboard's.

**Stop and review.**

---

## Phase 5 — Storefront: shop/category page UI fixes

Scope for this phase only: `src/app/(storefront)/shop/**` and its supporting components (`shop-listing.tsx`, `filter-panel.tsx`, `product-card.tsx`). Nothing else in storefront changes.

### 5.1 Breadcrumb with chevron separator on shop/category routes

- No breadcrumb exists today on `/shop` or `/shop/[category]`. Add one above the page title (the empty space marked in your screenshot, directly under the header) — e.g. `Shop / Palestine`, using `Icons.chevronRight` (already in the icon registry) as the separator instead of a plain `/`.
- Reuse the same pattern for the plain `/shop` route (no category) — probably just `Shop` with no further crumb, or `Home / Shop` if there's a clear home-link convention elsewhere in the storefront header/footer.
- Build this as a small reusable `Breadcrumb` component under `src/features/storefront/components/shop/` (or `src/components/` if it's generic enough to reuse elsewhere later) rather than inlining it directly in `shop-listing.tsx`.

### 5.2 "All" option in every filter group

- In `filter-panel.tsx`, each `FilterGroup` (Product Type, Size, Colour) needs an "All" chip as the first item in that group. Clicking it clears just that group's selections (not the other groups) — e.g. clicking "All" under Colour clears only `selectedColors`, leaving Product Type/Size filters untouched.
- "All" should render as active/selected whenever that specific group currently has zero selections (i.e., it's the natural default state, not a separate toggle to track).
- This is a per-group behavior, distinct from the existing page-level "Clear all" button (which resets everything) — both should coexist.

### 5.3 Inline quick-filter row using the same Product Type values from the filter drawer

- Add a horizontal row of quick-filter links/tabs directly on the category page (in the marked empty area from your screenshot, near the page title) — e.g. `Shop All · Tee · Longsleeve · Shirt` — sourced from the **same** `options.product_types` list already used inside `FilterPanel`'s "Product Type" group, so there's one source of truth for these values, not a second hardcoded list.
- Clicking one of these should behave the same as selecting that Product Type inside the filter drawer (same `toggleValue`/URL-param mechanism already wired in `shop-listing.tsx` for `pendingTypes`/`types` — reuse that state and its `setParams` call directly, don't duplicate the filtering logic).
- "Shop All" in this row clears the Product Type filter specifically (same behavior as the new 5.2 "All" chip for that group) — so both UI surfaces stay in sync automatically since they share state.

### 5.4 Product card hover — wishlist heart icon, top-right, black fill when active

- In `product-card.tsx`, add a heart icon button positioned top-right over the product image, visible on hover (desktop) — check whether it should always be visible on mobile/touch (hover doesn't apply there; likely always-visible on small screens, hover-reveal on desktop, matching how `hasHoverSwap`'s image-swap and the existing size-list opacity behavior already handle the same mobile-vs-desktop split in this same file).
- Wire it to the existing `useWishlistStore` (`toggle(product.id)` / `has(product.id)`) — this store and its persistence already exist and are used elsewhere (wishlist drawer), so this is just adding a second consumer, not building new wishlist logic.
- Use `Icons.heart` (already in the registry). **When active (in wishlist): fill black, not red** — per your explicit correction. When inactive: outline only, no fill.
- `stopPropagation`/`preventDefault` on the button's click so it doesn't also trigger the card's `Link` navigation to the product page.

### Verification
```bash
npx tsc --noEmit
bun run build
```
- Visit `/shop/palestine`: confirm breadcrumb renders with a chevron separator in the marked location.
- In the filter drawer, confirm each group's "All" chip clears only its own group and shows as active when that group is empty.
- Confirm the inline quick-filter row's values match the filter drawer's Product Type values exactly (same source), and clicking either surface updates the same URL params / product results.
- Hover a product card (desktop) and confirm the heart appears top-right; click it, confirm it fills black and the product appears in the wishlist drawer; click again, confirm it unfills and is removed.
- Confirm clicking the heart does not navigate to the product page.

**Stop and review.**

---

## Phase 6 — Product detail page & sticky header fixes

### 6.1 Product gallery: stacked images instead of hero + thumbnail rail (desktop only — mobile stays exactly as it is today)

**Current (confirmed in `product-detail-view.tsx`'s `ProductGallery`):** one large active image plus a 4-column thumbnail row below it that swaps the active image on click. This same component currently serves both mobile and desktop.

**Wanted:** on **desktop only**, all product images shown stacked one after another (vertical scroll gallery), while the right-side details panel stays sticky next to it (it already is — `sticky top-40` on that column, keep that as-is). **On mobile, the gallery must stay exactly as it is today — hero image + thumbnail rail, unchanged.** This is an explicit correction: don't touch mobile gallery layout at all in this phase.

- Split the behavior by breakpoint rather than replacing the component outright: keep the existing hero+thumbnail-rail rendering for `<lg` (mobile/tablet, whatever the current breakpoint boundary is elsewhere in this component — check `lg:h-159`/`md:` usage already in `product-card.tsx` for the convention this codebase uses), and add the new stacked-vertical rendering only at `lg:` and above.
- Simplest correct implementation: keep `activeIndex` state and the thumbnail-click interaction fully intact (still needed for mobile), and conditionally render either the current hero+rail markup or the new stacked markup based on breakpoint — don't delete the thumbnail-click logic, since mobile still depends on it.
- `priority` should stay only on the first image in both layouts; don't `priority`-load the whole stack on desktop.

### 6.2 Color-matched gallery — must work on both mobile and desktop, update for Phase 1's new media model

**This already partially exists** — `ProductDetailView`'s `galleryImages` computation already filters images by matching `variant.media_asset_ids` against the selected color, keyed through `product.variants[...].color_id`, and this is passed into `ProductGallery` regardless of breakpoint, so it should already apply to both mobile and desktop today. **Confirm it still does after 6.1's layout split** — since 6.1 branches the rendering by breakpoint, make sure both branches consume the same `images` prop (the already-color-filtered `galleryImages`), not two diverging data sources. **However, once Phase 1 moves media from per-variant to per-color-option-value, this exact code will break** (it reads `variant.media_asset_ids`, which Phase 1 removes/stops populating).

- Update this logic to read from wherever Phase 1 ends up storing color-value media (the new `product_option_value_media` join, if Option A was chosen) instead of `variant.media_asset_ids`.
- Confirm behavior is unchanged from the user's perspective on **both mobile and desktop**: tapping/clicking a color swatch swaps the gallery to that color's images (on mobile: hero + thumbnail rail from that color's set; on desktop: the new stacked list from that color's set); if a color has no dedicated images, fall back to the full product image list exactly as the current fallback already does.
- **Do this as part of Phase 1's own verification**, not as an afterthought here — when Phase 1 changes the media model, its own checklist should include "confirm the product detail page's color-swap gallery still works on both mobile and desktop," since that's a direct consumer of the data being restructured. Listing it here too so it isn't missed.

### 6.3 Size/Fit section — allow an image to be attached from the dashboard

Your message references "the third shared image" for this one, but based on what's actually in the screenshots, the dashboard-side reference (marked empty area under the Composition/Care/Size & Fit fields on the product edit page) is the relevant one — flagging this assumption explicitly since the image numbering in your message didn't line up cleanly with the content; confirm/correct if this reading is wrong.

- On the dashboard product edit page, add an optional image attachment to the Size & Fit field (and/or Composition/Care if you want the same capability there — confirm scope, but building it as one small reusable "field + optional image" component makes it trivial to apply to all three later even if only Size & Fit is needed now).
- Storage: reuse the existing `MediaPickerDialog`/Cloudinary media pattern already used for product images — add a nullable `size_fit_image_id`/`size_fit_image_url` (or generalize as needed) to the product record via a small migration, rather than inventing a separate upload pipeline.
- Storefront: in `DetailTabs`'s "Size / Fit" accordion panel, render this image above or beside the existing text if one is set; if none is set, render exactly as today (text-only) — this must be fully optional, not a required field on every product.

### 6.4 Sticky (scrolled) header: hamburger instead of inline horizontal nav

**Confirmed in code:** the desktop header already has two states — the top/hero state (`stackedNav = true`, vertical category list, semi-transparent) and the sticky/scrolled state (`stackedNav = false`, horizontal inline `primaryNav.map(...)` list, white background — this is exactly what's marked in your third screenshot). A `HeaderMenuButton` (hamburger icon + "Menu" label) **already exists** but today only renders on mobile (`md:hidden` block) — desktop has no hamburger, just the inline list. `StorefrontMegaMenu` already supports a full open/close off-canvas panel interface (confirmed in `storefront-mega-menu.tsx`), so this is primarily a wiring/layout change, not new component work.

- In `HeaderChrome`, for the **sticky state only** (`stackedNav={false}`, i.e. the scrolled header — leave the top/hero state's vertical list alone unless you want it changed too, confirm if so), replace the inline `<nav>...primaryNav.map...</nav>` block with the same `HeaderMenuButton` already used on mobile, shown on desktop too for this state.
- Wire `HeaderMenuButton`'s trigger to both **click and hover** (currently it's click-only via `onToggle`/`onMenuToggle`) — add an `onPointerEnter`/`onMouseEnter` handler that also opens the menu on desktop hover, matching the "click or hover" requirement, while keeping click-to-toggle for touch/keyboard users where hover doesn't apply.
- Confirm `StorefrontMegaMenu`'s existing `open`/`onClose` wiring needs no structural change — just needs to be triggered from this new hamburger-only sticky state instead of (or in addition to) the per-item hover it currently also supports (`onNavItemHover`) for the top/hero state.
- Don't change the top/hero header's stacked vertical nav unless explicitly confirmed — your screenshots only marked the sticky/scrolled state.

### Verification
```bash
npx tsc --noEmit
bun run build
```
- **Mobile:** confirm the gallery is pixel-for-pixel unchanged from today — hero image + thumbnail rail, thumbnail click still swaps the active image. Nothing about this phase should alter mobile gallery layout.
- **Desktop:** confirm all images render stacked vertically, details panel stays sticky beside them, no leftover thumbnail-click UI on this breakpoint.
- **Both mobile and desktop:** select each color swatch on a product with color-specific images (post Phase 1 migration) and confirm the gallery updates correctly on each breakpoint's respective layout; confirm a color with no dedicated images falls back to the full set without erroring, on both.
- Dashboard: attach an image to a product's Size & Fit field, save, confirm it renders on the storefront's Size/Fit accordion; confirm a product with no such image still renders text-only correctly.
- Scroll the storefront until the header goes sticky: confirm the horizontal category list is gone, only a hamburger/menu icon remains, and both clicking and hovering it opens the full mega-menu off-canvas panel. Confirm the top/hero header (before scrolling) is unaffected.

**Stop and review.**

---

## Phases 7–11 — Launch hardening batch

Scope for this batch: archive/delete correctness, stock + color-variant concurrency safety, rate limiting, DB call reduction, and perceived-speed polish. This is a launch-readiness pass, not new feature work.

**Out of scope for this batch — do not touch:** customer auth/accounts, payment gateways, full schema migration backfill, CI/testing infra, security headers, error tracking. Those are tracked separately and are not launch blockers for a COD-only, admin-managed store.

**This batch directly closes a bug flagged in an earlier PR review of this codebase** (`getProductByIdOrSlug` still filtering `deleted_at`, causing legacy-archived products to 404 in the dashboard) — Phase 7 below supersedes that finding with a complete Archive/Restore/Delete rework rather than a one-line patch, since the review surfaced that Restore didn't exist in the UI at all, not just that one query was wrong.

**Execution order within this batch:**
1. Phase 7 (Archive/Restore/Delete) — self-contained, no DB schema changes, ship first.
2. Phase 8 (stock/variant concurrency) — requires pulling real SQL from Supabase first; do not skip the `supabase db pull` step or guess at the function bodies.
3. Phase 9 (rate limiting) — independent, can run in parallel with Phase 8.
4. Phase 10 (caching/DB call reduction) — independent, can run in parallel with Phases 8–9.
5. Phase 11 (polish) — last, after everything else is verified working.

---

## Phase 7 — Archive / Restore / Delete correctness

**Problem (confirmed in current code):**
- `src/components/modal/alert-modal.tsx` defaults `description` to `'This action cannot be undone.'`. `CellAction` (`src/features/products/components/product-tables/cell-action.tsx`) uses this default for **Archive**, which is reversible. False warning trains admins to fear a safe action.
- `CellAction` has no **Restore** option at all — an archived product can never be brought back from the UI once archived.
- `CellAction`'s dropdown always shows "Archive" regardless of the product's current status — clicking Archive on an already-archived product is a no-op that still shows a scary confirm dialog.
- Bulk archive (`src/features/products/components/product-tables/index.tsx`, `archiveMutation`) has **no confirm dialog at all** — selecting rows and clicking the bulk Archive button archives immediately.
- There is no `deleteProduct` (hard delete, sets `deleted_at`) function or UI action anywhere in `src/features/catalog/service.ts` / `cell-action.tsx`. "Delete" as a real destructive action doesn't exist yet — only archive does.
- `updateProduct` (`src/features/catalog/service.ts:525`) lets an admin change `status` via the product edit form's Save button without ever touching `deleted_at`. If a product was previously archived+deleted_at (legacy row) and an admin edits it back to `active` from the form, `deleted_at` is never cleared, so it can silently stay hidden from storefront queries that check both `status` and `deleted_at`. **This is the exact mechanism behind the `getProductByIdOrSlug` 404 bug found in the prior PR review** — the row exists, is set to a non-archived status, but `deleted_at` is still set, so any filtered query still hides it.

**Fix:**

1. In `src/features/catalog/service.ts`, add two functions next to `archiveProduct`:
   ```ts
   export async function restoreProduct(id: string): Promise<void> {
     const supabase = getSupabase();
     const { error } = await supabase
       .from('products')
       .update({ status: 'draft', deleted_at: null })
       .eq('id', id);
     if (error) throw catalogError('Failed to restore product', error);
   }

   export async function deleteProduct(id: string): Promise<void> {
     const supabase = getSupabase();
     const { error } = await supabase
       .from('products')
       .update({ deleted_at: new Date().toISOString() })
       .eq('id', id);
     if (error) throw catalogError('Failed to delete product', error);
   }
   ```
   Restore always lands on `draft` (never `active`) — forces the admin to consciously republish, matching the existing `updateProduct` guard that blocks publishing a product with zero sellable variants.

2. In `updateProduct` (`src/features/catalog/service.ts:525`), whenever `payload.status` is present and is **not** `'archived'`, force `deleted_at: null` into the update payload so a status change out of archived always clears any stale `deleted_at`:
   ```ts
   if (payload.status && payload.status !== 'archived') {
     Object.assign(payload, { deleted_at: null });
   }
   ```

3. In `src/features/products/api/mutations.ts`, add `restoreProductMutation` and `deleteProductMutation` following the exact shape of `archiveProductMutation` (same `mutationOptions` pattern, same query invalidation).

4. Rewrite `CellAction` (`cell-action.tsx`) to be status-aware:
   - If `data.status !== 'archived'`: show **Archive** → confirm modal with `description="Archived products are hidden from the storefront. You can restore them anytime."` (no "cannot be undone" copy).
   - If `data.status === 'archived'`: show **Restore** (no confirm needed — non-destructive, restores to draft) **and** **Delete** → confirm modal with the real `'This action cannot be undone.'` copy, only shown for the true hard-delete path.
   - Delete option only ever appears for already-archived products — never allow deleting an active/draft product directly, to avoid one-click accidental data loss on a live listing.

5. In `src/features/products/components/product-tables/index.tsx`:
   - Wrap the bulk Archive action in the same `AlertModal` pattern used by `CellAction` — do not fire on click, require confirmation.
   - Add a bulk **Restore** button that only renders when `params.status === 'archived'` (i.e., only visible on the Archived tab), calling `restoreProduct` for each selected id the same way the existing bulk archive does.

6. **Also fix the admin product-loader query directly** (this is the specific bug the prior PR review flagged, and steps 1–5 above don't automatically fix it on their own): `getProductByIdOrSlug` currently chains `getProductBySlug` (which filters `.is('deleted_at', null)`, correct for the storefront but wrong for the dashboard) and then falls back to `getProductById(key)` — passing a **slug string** into a function that queries `.eq('id', id)`, which can never match. Give the dashboard its own admin-safe lookup that doesn't filter `deleted_at` and doesn't restrict by `status`, instead of reusing the storefront-safe `getProductBySlug`.

**Acceptance criteria:**
- [ ] Archiving a product shows accurate, non-scary copy and requires one click through a real confirm dialog (single and bulk).
- [ ] An archived product's row shows Restore + Delete, never Archive.
- [ ] Restore sets `status='draft', deleted_at=null` and the product reappears on the "Draft" and "All" tabs immediately (optimistic cache patch, same pattern as existing archive).
- [ ] Delete only reachable from an already-archived row, requires the real "cannot be undone" confirm, sets `deleted_at`, and the product disappears from every admin tab except if `includeDeleted` is explicitly passed (matches current `getProducts` filter behavior).
- [ ] Editing an archived+`deleted_at` legacy product's status back to `draft`/`active` via the main product-edit Save button clears `deleted_at` in the same request.
- [ ] A legacy archived+`deleted_at` product's dashboard edit page (`/dashboard/product/{slug}`) loads successfully instead of 404ing — confirms the `getProductByIdOrSlug` fix from step 6.

**Stop and review.**

---

## Phase 8 — Stock decrement & color-variant concurrency

**Problem:** The actual SQL bodies of `place_cod_order`, `decrement_variant_stock`, `cancel_order_and_restore_stock`, and `set_variant_inventory` live only in the Supabase project (not in `supabase/migrations/`), so their current locking behavior can't be verified from the repo. Given two guest checkouts can race on the same low-stock variant, this needs to be provably atomic, not assumed atomic.

**Fix — pull, verify, patch, don't guess:**

1. Run `supabase db pull` (or `pg_dump --schema-only` against the project) to get the real current definitions of these 4 functions into `supabase/migrations/` as a baseline migration. This is required before Phase 8 can be verified at all — you cannot safely harden logic you cannot read.

2. Once pulled, confirm each function follows this shape (patch in a new migration if it doesn't — do not edit the pulled baseline file directly):

   - **`decrement_variant_stock(p_variant_id, p_quantity)`** must do the check-and-decrement in a single atomic statement, not a `SELECT` followed by an `UPDATE`:
     ```sql
     UPDATE public.product_variants
     SET stock = stock - p_quantity
     WHERE id = p_variant_id
       AND stock >= p_quantity
     RETURNING stock INTO v_new_stock;

     IF NOT FOUND THEN
       RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id
         USING ERRCODE = 'P0001';
     END IF;
     ```
     A `SELECT stock ... IF stock >= qty THEN UPDATE` pattern is **not safe** — two concurrent requests can both pass the check before either commits, both decrement, and stock goes negative. The `WHERE stock >= p_quantity` clause inside the `UPDATE` is what makes it atomic — Postgres row-locks on the `UPDATE` itself.

   - **`place_cod_order`** must call `decrement_variant_stock` (or inline the same atomic pattern) **per line item inside its own transaction**, and if any line item fails the stock check, the whole function must raise and roll back — no partial orders with some variants decremented and others not. If it currently loops and swallows per-item errors, fix that first.

   - **`set_variant_inventory`** (manual admin stock correction) should keep writing an audit row (it already accepts `p_reason` and `p_actor_id` per `src/types/database.ts:550` — confirm the pulled SQL actually writes an inventory-log row using these, not just updating `stock` directly with the params ignored).

   - **`cancel_order_and_restore_stock`** must be idempotent — restoring stock for an order that's already cancelled/restored should be a no-op, not a double-credit. Add a `WHERE status <> 'cancelled'` guard on the order update and only restore stock inside that same conditional branch.

3. Color-variant specific: confirm `generate_product_variants` and `upsert_product_variant_full` don't allow two variants with the same `(product_id, color_value_id, size_value_id)` pair to exist — add a partial unique index if missing:
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS product_variants_unique_combo
     ON public.product_variants (product_id, color_option_value_id, size_option_value_id)
     WHERE deleted_at IS NULL;
   ```
   Without this, "Generate combinations" clicked twice (e.g. double-click, or two admin tabs open) can silently create duplicate Black/M variants with split stock, and the storefront will nondeterministically show whichever one the query returns first.

4. Frontend: `src/features/catalog/service.ts` — any function calling `decrement_variant_stock` or `place_cod_order` should surface the Postgres exception message (`Insufficient stock for variant ...`) directly to the checkout UI as "This item just sold out — please remove it and try again," not a generic "Something went wrong."

**Acceptance criteria:**
- [ ] All 4 RPCs exist as readable SQL in `supabase/migrations/` (pulled from prod, checked in).
- [ ] Load-test locally: fire 20 concurrent `place_cod_order` calls for the same variant with `stock = 5`, `qty = 1` each → exactly 5 succeed, 15 fail with a stock error, final `stock = 0`, never negative.
- [ ] Cancelling the same order twice in a row does not double-restore stock.
- [ ] Duplicate unique index prevents a second identical color/size variant from being created.

**Stop and review — do not merge this phase until the load-test acceptance criterion has actually been run once locally against a pulled copy of the real RPCs. This is the one phase where "looks right" isn't enough, since a race condition won't show up in manual testing.**

---

## Phase 9 — Rate limiting

**Problem:** `placeCodOrderAction` (`src/features/orders/actions.ts`) and every admin mutation server action are open to unlimited calls per client. No rate-limit infra exists in the repo (`package.json` has no redis/upstash dependency).

**Fix — in-memory limiter, no new infra dependency (repo runs standalone/Docker, single instance for launch):**

1. Create `src/lib/rate-limit.ts`:
   ```ts
   const buckets = new Map<string, { count: number; resetAt: number }>();

   export function rateLimit(key: string, limit: number, windowMs: number): boolean {
     const now = Date.now();
     const bucket = buckets.get(key);
     if (!bucket || now > bucket.resetAt) {
       buckets.set(key, { count: 1, resetAt: now + windowMs });
       return true;
     }
     if (bucket.count >= limit) return false;
     bucket.count += 1;
     return true;
   }

   // Periodic cleanup so the Map doesn't grow unbounded on a long-running process.
   setInterval(() => {
     const now = Date.now();
     for (const [key, bucket] of buckets) {
       if (now > bucket.resetAt) buckets.delete(key);
     }
   }, 60_000).unref();
   ```
   This is process-local — correct for a single Docker instance, which matches the existing `Dockerfile`/`BUILD_STANDALONE` setup. Flag clearly in a code comment (a *why*-comment, per the Code quality bar below — explaining a real constraint, not narrating the code) that this must move to Upstash Redis (`@upstash/ratelimit`) the moment the app runs on more than one instance/region, since in-memory buckets don't share state across processes.

2. In `src/features/orders/actions.ts`, at the top of `placeCodOrderAction`, get the client IP from `headers()` (`x-forwarded-for`, fallback to a constant for local dev) and gate:
   ```ts
   import { headers } from 'next/headers';
   import { rateLimit } from '@/lib/rate-limit';

   const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
   if (!rateLimit(`checkout:${ip}`, 5, 10 * 60 * 1000)) {
     return { error: 'Too many orders submitted. Please wait a few minutes and try again.' };
   }
   ```
   5 orders per 10 minutes per IP is generous for a real customer, punishing for a script.

3. Apply the same pattern to the Cloudinary sign/delete routes (`src/app/api/cloudinary/sign/route.ts`, `.../delete/route.ts`) and the media register/check-hash routes — key by the authenticated admin's user id (from `getAdminUser()`) rather than IP, limit ~60/min, since these are behind auth but still shouldn't be hammerable if a session is compromised or a client bug loops.

**Acceptance criteria:**
- [ ] 6th checkout submission from the same IP within 10 minutes is rejected with a clear message, not a 500.
- [ ] Rate limit state doesn't leak memory over a multi-day process lifetime (cleanup interval confirmed running).
- [ ] Admin media endpoints reject runaway loops without blocking normal dashboard use.

**Stop and review.**

---

## Phase 10 — Cut redundant DB requests / caching

**Problem (confirmed):**
- `src/app/(storefront)/product/[slug]/page.tsx` calls `getProductBySlug(slug)` **twice** per request — once in `generateMetadata`, once in the page body. Neither call is wrapped in React's `cache()`, and these go through Supabase (not native `fetch`), so Next's automatic fetch memoization does not dedupe them. Every product page view currently does 2x the necessary DB round trips for the main query alone.
- `src/lib/query-client.ts` sets a single global `staleTime: 60 * 1000` for **every** React Query key — catalog/category lists (which change rarely) and live dashboard data get the same 60s staleness, which is either too aggressive for slow-changing data or too loose for things like stock counts an admin is actively editing.
- Storefront layout has `export const revalidate = 120; export const fetchCache = 'force-cache'` at the `(storefront)` layout level, but individual pages (`shop/page.tsx`, `shop/[category]/page.tsx`) don't set their own `revalidate`, so it's unclear/inherited rather than explicit — verify and make explicit per route.

**Fix:**

1. Wherever a service function is called more than once per request across `generateMetadata` + the page body (start with `getProductBySlug` in `src/features/storefront/api/service.ts`), wrap it in React's `cache()`:
   ```ts
   import { cache } from 'react';
   // ...
   export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
     // existing body
   });
   ```
   `cache()` dedupes calls with identical arguments within a single render pass — this turns the 2x-per-pageview cost on every product page into 1x, for free, with a one-line change. Apply the same treatment to any other read function called from both `generateMetadata` and a page/layout body (grep for functions imported in both a `generateMetadata` and the default export in the same file).

2. In `src/lib/query-client.ts`, split `staleTime` by data shape instead of one global value: give catalog reference data (categories, collections) a longer `staleTime` (e.g. 5 min) via that specific `queryOptions` call's own override, and leave fast-moving dashboard data (stock, order status) at a short or zero `staleTime` so an admin editing inventory never acts on stale numbers. Don't lower the global default — override per-query where it matters, using the `staleTime` option already supported by each `*QueryOptions` factory in `src/features/*/api/queries.ts`.

3. Add explicit `export const revalidate = <n>` to `shop/page.tsx` and `shop/[category]/page.tsx` — these are read-heavy, admin-edited-occasionally pages, good ISR candidates (60–120s, matching the layout default) rather than fully dynamic per-request rendering. Confirm neither page reads request-specific data (cookies/headers) that would force it dynamic anyway.

4. Product images already restrict `remotePatterns` to `res.cloudinary.com` in `next.config.ts` — good, leave as-is. Confirm every `<Image>` usage in `product-card.tsx` / `product-detail-view.tsx` sets explicit `sizes` so Next serves correctly-sized images instead of the largest variant everywhere (grep `<Image` calls missing a `sizes` prop).

**Acceptance criteria:**
- [ ] Product page DB calls confirmed halved via server logs / query count (add a temporary counter in dev if needed, remove after verifying).
- [ ] Shop/category pages serve from cache within their revalidate window (verify via response headers or a build + `next start` + repeated curl timing test — second request should be near-instant).
- [ ] No admin-facing stock/inventory view can show data older than the actual last write (verify by editing stock in one tab, confirming it reflects within one refetch cycle elsewhere).

**Stop and review.**

---

## Phase 11 — Perceived speed polish (admin + storefront)

Only start after Phases 7–10 are done and verified. Quick wins, not a redesign:

1. **Dashboard product table:** confirm `useDataTable` (`src/hooks/use-data-table.ts`) debounces search input (an earlier report claims `debounceMs: 500` is already set on `ProductTable` — confirm this is actually wired to the `name` filter param, not just the table sort, since `500ms` on `parseAsString` for `name` needs `useQueryStates`' own debounce or a manual debounce wrapper around `setParams`).
2. **Optimistic mutations:** confirm every nested-catalog mutation (`src/features/products/api/mutations.ts`) that already has the `onSettled`-invalidate + optimistic-cache-patch pattern (per the earlier implementation report) is applied consistently to the new `restoreProductMutation`/`deleteProductMutation` from Phase 7 — don't let those two be the one mutation pair that waits for a full refetch before the UI updates.
3. **Storefront cart:** confirm cart state (`src/features/storefront/components/cart`) is fully client-side (Zustand/local state) with no DB round-trip per add-to-cart click — only checkout submission should hit the network. If any DB call currently fires per cart-add, move it to be batched into the checkout submission instead.

**Acceptance criteria:**
- [ ] Typing in the product search box doesn't fire a request per keystroke.
- [ ] Archive/Restore/Delete update the row instantly (optimistic), not after a round trip.
- [ ] Adding items to cart is instant with zero network calls; only "Place order" hits the server.

**Stop and review.**

---

## Code quality bar — applies to every phase, no exceptions

This is production code, not a prototype. Every phase in this plan must meet this bar before being reported as done:

- **Scalable:** don't hardcode what should be data-driven (this plan's own Phase 5's "Product Type" gets this right — reusing the same source list in two places — hold every other change to that same standard). Don't write logic that only works for today's exact data shape (5 colors, 4 sizes) if the underlying feature is supposed to support arbitrary future products.
- **Readable:** clear names, small functions, no clever one-liners that need a comment to explain what they do — if it needs a comment to explain *what* it does, rewrite it instead of commenting it.
- **Maintainable:** follow the existing patterns in this codebase exactly (`api/types.ts → service.ts → queries.ts → mutations.ts`, React Query hooks, nuqs for URL state, the icons registry, TanStack Form) — don't introduce a second way of doing something this codebase already has a way of doing.
- **No dead code:** no unused variables, unused imports, unused components, commented-out old implementations left "just in case," or leftover feature flags/branches for approaches you tried and abandoned mid-phase. If you wrote something and later replaced it, delete the old version — don't leave both.
- **No AI-flavored comments or filler:** no comments like `// This function handles the logic for...`, `// Added this to fix the bug`, `// TODO: improve this later` (either actually improve it now, or don't mention it), or comments that just restate the line below them in English. A comment should only exist to explain *why* something non-obvious is done a certain way (e.g. a workaround for a library quirk) — never to narrate *what* the code is doing, since the code itself should already make that clear.
- **No dirty code:** no leftover `console.log`, no commented-out blocks, no inconsistent formatting, no copy-pasted near-duplicate components/functions where one shared, parameterized one would do.

**Self-verification requirement:** at the end of every phase, before reporting it as done, re-read your own diff with this checklist in hand — not just "does it type-check and build," but "would a senior engineer reviewing this PR ask me to clean anything up?" If yes, clean it up yourself first. Repeat until you're genuinely satisfied the code meets this bar, the same way you already repeat the fix → re-verify loop for functional correctness (Execution rule #2 above) — code quality gets the same treatment as functional correctness, not a lesser one. This applies to every phase in this document equally, not just new phases going forward.

---

## Notes for follow-up

Phases 7–11 (launch hardening: archive/restore/delete, stock concurrency, rate limiting, DB call reduction, perceived-speed polish) were merged into this document from a separate hardening spec — this is now the single authoritative plan for the app, superseding that standalone document. Any further changes should continue as **Phase 12, 13...** in this same file rather than a new document.
