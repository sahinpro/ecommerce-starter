# Product Archive — Implementation Report for Claude

> **Full chat report (all phases + follow-ups):** [`docs/implementation-report.md`](./implementation-report.md)  
> This file is archive-only detail. Prefer the complete report unless you are implementing Restore / archive UX.

**Project:** Sukoon (Next.js 16 + Supabase catalog)  
**Date:** 2026-08-19  
**Audience:** Claude (follow-up implementation)  
**Status:** List tab works after a recent fix. Archive is **not complete** as a product lifecycle.

Do **not** change COD checkout, `place_cod_order`, or stock-decrement RPCs.

---

## Verdict

Archive is **good enough to list archived products**, not **perfect**.

| Question | Answer |
| --- | --- |
| Does Archive now move a product to the Archived tab? | **Yes**, after the 2026-08-19 fix |
| Is archive a complete, reversible workflow? | **No** |
| Can staff restore from the table? | **No** dedicated Restore action |
| Does the confirm dialog tell the truth? | **No** — it says “cannot be undone” |
| Are older archived rows safe? | **Partially** — rows archived *before* the fix may still have `deleted_at` set |

---

## What “Archive” is supposed to mean

Two different fields exist on `products`:

| Field | Intended meaning |
| --- | --- |
| `status` | `active` \| `draft` \| `archived` — catalog lifecycle |
| `deleted_at` | Soft-delete / hide from normal lists |

**Correct model**

- **Archive** = `status = 'archived'`, `deleted_at = null`
- Hidden from **storefront** because storefront queries `status = 'active'`
- Visible in dashboard **Archived** tab (`status = 'archived'`)
- Reversible by setting status back to `draft` or `active`

**Wrong model (the bug)**

- Archive was implemented as **status + soft-delete**:

```558:565:src/features/catalog/service.ts
export async function archiveProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived', deleted_at: null })
    .eq('id', id);
```

**Before the fix**, that update was:

```ts
.update({ status: 'archived', deleted_at: new Date().toISOString() })
```

Admin list always skipped deleted rows:

```232:234:src/features/catalog/service.ts
  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null);
  }
```

`getAdminProducts` used `includeDeleted: false` by default. Result: toast said “archived”, **Archived tab stayed empty**.

---

## What was fixed (already in the repo)

### 1. Archive no longer soft-deletes

`archiveProduct` now sets `status: 'archived'` and **clears** `deleted_at`.

New archives appear in:

- **Archived** tab (`status = 'archived'`)
- **All** tab (status filter `all`, `deleted_at` is null)

They stay off the storefront:

```39:42:src/features/storefront/api/service.ts
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await catalogGetProductBySlug(slug);
  if (!product || product.status !== 'active' || product.deleted_at) return null;
```

### 2. Archived tab includes leftover soft-deleted rows

```869:876:src/features/catalog/service.ts
export async function getAdminProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const status = filters.status ?? 'all';
  return getProducts({
    ...filters,
    status,
    includeDeleted: filters.includeDeleted ?? status === 'archived'
  });
}
```

This is a compatibility shim for products archived **before** the fix (`status = archived` AND `deleted_at` set). Those rows show on **Archived**, but not on **All**.

---

## Remaining issues (implement these)

### P0 — Confirm copy is wrong

Row Archive uses the generic `AlertModal`:

```44:48:src/features/products/components/product-tables/cell-action.tsx
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => archiveMutation.mutate(data.id)}
        loading={archiveMutation.isPending}
      />
```

Defaults are title **“Are you sure?”** and description **“This action cannot be undone.”** Archive **can** be undone via the product Status field.

**Do this**

- Title: `Archive {product.name}?`
- Description: `Hidden from the storefront. It will appear under the Archived tab. You can restore it later.`
- Confirm label: `Archive` (not Continue)
- Prefer a non-destructive confirm style if the modal supports it

Bulk Archive in `src/features/products/components/product-tables/index.tsx` has **no confirm at all**. Add the same copy.

### P0 — No Restore / Unarchive in the table

`CellAction` always shows **Archive**, even when `data.status === 'archived'`. There is no Restore.

**Do this**

- If `status !== 'archived'`: show Archive
- If `status === 'archived'`: show **Restore** (set `status: 'draft'` or `'active'`)
- Add `restoreProduct(id)` (or reuse `updateProduct`) that sets `{ status: 'draft', deleted_at: null }`
- Guard restore-to-active with the existing rule: at least one non-archived variant (`updateProduct` already throws if publishing with zero sellable variants)
- Hide Archive in bulk bar when the Archived tab is selected; show Restore there instead

Recommended restore default: **`draft`**, not `active`, so nothing goes live by accident.

### P1 — Opening old archived products by slug can 404

Dashboard edit URL is `/dashboard/product/{slug}`.

`getProductByIdOrSlug` → `getProductBySlug` filters `.is('deleted_at', null)`.

Legacy archived rows still have `deleted_at`. **Edit from the Archived tab can 404** for those rows.

**Do this (pick one, preferably both)**

1. Admin loader must not hide `deleted_at` rows. Keep the storefront check in `src/features/storefront/api/service.ts` only.
2. One-time data cleanup (Supabase SQL):

```sql
UPDATE public.products
SET deleted_at = NULL
WHERE status = 'archived' AND deleted_at IS NOT NULL;
```

After cleanup, the `includeDeleted` shim for the Archived tab is optional.

### P1 — Two ways to archive, still inconsistent UX

| Path | What it does |
| --- | --- |
| Row / bulk **Archive** | `archiveProduct` → `status = archived`, `deleted_at = null` |
| Product form **Status** dropdown | `updateProduct` → only `status`, does not touch `deleted_at` |

If a legacy row still has `deleted_at` and someone sets Status to `archived` in the form, it can stay hidden from **All**.

**Do this:** when `updateProduct` sets `status` to `archived`, also set `deleted_at: null`. When it sets `active` or `draft`, also set `deleted_at: null` unless you introduce a real Delete later.

### P2 — Dashboard overview counts archived as live catalog

```15:15:src/app/dashboard/overview/layout.tsx
    supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
```

This counts archived products. If the metric should be “sellable catalog”, filter `status = 'active'` (and maybe `draft` separately).

### P2 — Archive does not archive variants

Product-level archive leaves variant rows `active`. That is OK if storefront never loads the parent. If you later query variants without joining product status, archived-product stock could still look sellable.

Optional: when archiving a product, set its variants to `archived` too. Only do this if you also restore them on Restore. **Do not** call stock-decrement RPCs.

### P2 — All tab includes archived

Tabs: All / Active / Draft / Archived.

All = every non-deleted product, including archived. That matches the label. If merchants expect All = “not archived”, change All to `status in ('active','draft')`. Confirm with the user before changing.

---

## How it works today (for tests)

### Archive entry points

1. Row menu → Archive → confirm modal → `archiveProductMutation` → `archiveProduct`
2. Bulk bar → Archive → `archiveProduct` per selected id
3. Product edit form → Organization → Status = Archived → Save → `updateProduct`

### List filters

`src/features/products/components/product-tables/index.tsx`

- nuqs `status` default `'all'`
- Tabs pass `active` \| `draft` \| `archived` \| `all`
- Query: `adminProductsQueryOptions` → `getAdminProducts`

### Storefront safety (keep this)

- `getProducts` storefront wrapper forces `status: 'active'`
- PDP `getProductBySlug` rejects non-active and `deleted_at`
- `getActiveProductSlugs` is `status = active` AND `deleted_at IS NULL`

Do not weaken those checks.

---

## Suggested implementation order

1. SQL cleanup: clear `deleted_at` on `status = 'archived'`.
2. Admin `getProductBySlug` / `getProductByIdOrSlug`: allow archived rows for staff.
3. `updateProduct`: if status is `archived` | `draft` | `active`, set `deleted_at: null`.
4. Cell action: Archive vs Restore; honest modal copy.
5. Bulk bar: Archive on Active/Draft/All; Restore on Archived.
6. Overview product count: decide active-only vs all non-deleted.

---

## Files to touch

| File | Why |
| --- | --- |
| `src/features/catalog/service.ts` | `archiveProduct`, `getAdminProducts`, `getProductBySlug` (admin vs storefront), `updateProduct` |
| `src/features/storefront/api/service.ts` | Keep storefront hide rules; do not use admin slug loader here |
| `src/features/products/components/product-tables/cell-action.tsx` | Restore, copy, hide Archive when already archived |
| `src/features/products/components/product-tables/index.tsx` | Bulk restore, confirms |
| `src/features/products/api/mutations.ts` | `restoreProductMutation` if you add a dedicated function |
| `src/app/dashboard/overview/layout.tsx` | Optional count fix |
| Supabase SQL editor | One-time `deleted_at` cleanup |

---

## Test plan

1. Archive an **Active** product from the row menu.
   - Leaves Active tab.
   - Appears on Archived with status badge Archived.
   - Appears on All.
   - `/product/{slug}` on the storefront is 404 / not listed.
2. Open it from Archived → Edit still works.
3. Restore (after you add it) → product is Draft (or Active if that was chosen) → storefront stays hidden until Active.
4. Archive from bulk select on Active tab.
5. Set Status = Archived on the product form Save path.
6. If any product was archived **before** this fix, confirm it shows on Archived; after SQL cleanup, Edit by slug works.
7. Confirm a product with **no variants** cannot Restore/Save as Active (existing publish guard).

---

## Do not do

- Do not treat Archive as Delete.
- Do not set `deleted_at` on archive again.
- Do not show archived products on the shop, home, related, or wishlist loaders.
- Do not touch `place_cod_order` or inventory decrement RPCs.
- Do not add a hard delete unless the user asks; if you do, use `deleted_at` only for that path.
