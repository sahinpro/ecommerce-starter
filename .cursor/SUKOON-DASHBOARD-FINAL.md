# Sukoon --- Final Dashboard & Store Management Plan

## 0. Current Codebase Baseline

This document is based on the latest Cursor implementation report and
the agreed project requirements.

The current repository is a Next.js 16 / React 19 / TypeScript project
based on the Kiranism shadcn dashboard starter, with a largely completed
Sukoon storefront.

The implementation report confirms that:

-   Storefront UI is largely complete.
-   Storefront catalog is still mock data.
-   Cart/wishlist are client-only.
-   Checkout/order placement is still mock.
-   Dashboard is still largely starter/demo functionality.
-   Clerk is currently used and must be removed.
-   Supabase schema/client preparation exists, but feature services are
    not yet wired to Supabase.
-   Product/customer dashboard screens currently use starter mock data.
-   Workspaces, Teams, Billing and other starter dashboard features
    remain.
-   The dashboard currently uses the `sukoon` theme rather than the
    required WhatsApp-style admin theme.
-   Categories, Inventory, Orders, Media, Settings and other Sukoon
    admin modules are not yet implemented. fileciteturn4file3
    fileciteturn4file1

This document is the implementation plan for the next phase.

------------------------------------------------------------------------

# 1. Main Objective

Convert the existing dashboard starter into the actual **Sukoon store
management dashboard**.

The dashboard must allow authorized admin users to manage the store
without rebuilding the existing storefront.

Core management areas:

-   Dashboard overview
-   Products
-   Categories
-   Product variants
-   Inventory
-   Product/media images
-   Orders
-   Store customers as business records
-   Store settings
-   Admin authentication
-   Admin account/profile
-   Required integrations

Do not rebuild the dashboard framework.

Do not replace the existing shadcn dashboard architecture.

Do not redesign the completed storefront.

------------------------------------------------------------------------

# 2. Authentication --- Admin Only

## 2.1 Remove Clerk

The current implementation uses Clerk end-to-end, including dashboard
protection and Clerk-specific profile, organization and billing pages.
fileciteturn4file2

Remove Clerk completely from the application.

Remove:

-   `@clerk/nextjs`
-   `ClerkProvider`
-   `clerkMiddleware`
-   `auth.protect()`
-   Clerk sign-in/sign-up
-   Clerk `<UserProfile />`
-   Clerk Organizations
-   Clerk Billing
-   Clerk-specific hooks
-   Clerk-specific navigation logic
-   Clerk environment variables
-   Clerk-only routes/pages
-   `clerk_user_id` assumptions in the database schema

------------------------------------------------------------------------

# 3. Supabase Auth --- Dashboard Administrators Only

Use:

**Supabase Auth**

for dashboard authentication.

### Current MVP scope

Only authorized dashboard users need authentication.

Possible admin roles:

``` text
admin
manager
staff
```

The exact role permissions can be refined later, but the authentication
system must be designed around dashboard access.

## Customer authentication is NOT required

Because of the current tight budget, do NOT implement customer
authentication.

Do not build:

-   customer registration
-   customer login
-   customer logout
-   customer password reset
-   customer account page
-   customer profile authentication
-   customer auth middleware
-   customer Supabase Auth users
-   customer authentication UI

The storefront remains a **guest storefront** for the current MVP.

Customers may still exist as business/order records in the database. A
store customer record is not the same thing as a Supabase Auth user.

This distinction is important.

``` text
Supabase Auth
    │
    └── Dashboard Admin / Staff only


Store Customers
    │
    └── Database records from orders/checkout
        NOT Supabase Auth accounts
```

Do not spend implementation time on customer authentication until it is
explicitly approved.

------------------------------------------------------------------------

# 4. Admin Authentication Architecture

Target:

``` text
                SUPABASE AUTH
                     │
          ┌──────────┴──────────┐
          │                     │
        Admin                Manager/Staff
          │                     │
          └──────────┬──────────┘
                     │
                /dashboard
```

Protect all dashboard routes server-side.

Example:

``` text
/dashboard
/dashboard/products
/dashboard/categories
/dashboard/inventory
/dashboard/orders
/dashboard/customers
/dashboard/settings
```

An unauthenticated user must be redirected to the admin sign-in page.

Do not rely only on hiding sidebar items.

------------------------------------------------------------------------

# 5. Admin Role Authorization

Use the authenticated Supabase user ID to associate the admin with an
application profile/role.

Recommended:

``` text
profiles
├── id
├── email
├── full_name
├── avatar_url
├── role
├── created_at
└── updated_at
```

Roles:

``` text
admin
manager
staff
```

Do not add a `customer` authentication role for the current MVP.

At minimum:

``` text
admin
→ full dashboard access
```

Additional role restrictions can be implemented after the core
authentication migration.

------------------------------------------------------------------------

# 6. Current Supabase State

The implementation report confirms that Supabase is prepared but not yet
wired into the actual feature services.

Existing items include:

-   Supabase environment placeholders
-   browser client stub
-   `supabase/schema.sql`
-   intended tables including categories, products, images, colors,
    variants, stories, profiles, carts and orders

Not yet complete:

-   server Supabase client
-   Supabase auth middleware
-   RLS-aware helpers
-   migrations wired into the repository
-   feature services using Supabase
-   removal of Clerk-era schema assumptions. fileciteturn4file2

Therefore:

**Do not assume the database is already fully integrated.**

Before implementing business modules, inspect the existing schema and
current Supabase project.

Reuse existing structures where appropriate.

Do not create duplicate tables.

------------------------------------------------------------------------

# 7. Cloudinary --- Media Storage

Do NOT use Supabase Storage for store media.

Use:

**Cloudinary**

for:

-   product images
-   category images
-   editorial images
-   other store media

Supabase should handle:

-   database
-   admin authentication

Cloudinary should handle:

-   image/file storage
-   image delivery
-   transformations
-   optimization

Architecture:

``` text
Next.js
   │
   ├── Supabase
   │     ├── Auth
   │     └── Database
   │
   └── Cloudinary
         ├── Product Images
         ├── Category Images
         ├── Editorial Images
         └── Store Media
```

Never expose:

``` text
CLOUDINARY_API_SECRET
```

to client-side code.

------------------------------------------------------------------------

# 8. Dashboard Theme

The dashboard must use the **WhatsApp theme shown in the provided
screenshot**.

Target characteristics:

-   dark dashboard
-   dark sidebar
-   WhatsApp-style green accent
-   green active navigation
-   dark cards
-   subtle borders
-   compact admin controls

Do not make the dashboard look like the Sukoon storefront.

The storefront and dashboard have separate visual purposes:

``` text
Storefront
→ Sukoon editorial/fashion UI

Dashboard
→ WhatsApp-inspired dark admin UI
```

Do not expose unrelated starter theme presets in production.

------------------------------------------------------------------------

# 9. Dashboard Starter Cleanup

The implementation report confirms that some starter demos have already
been removed, but Workspaces, Teams and Billing remain.
fileciteturn4file1

Remove all confirmed unnecessary starter functionality.

## Remove from header

-   GitHub button/icon

## Remove from sidebar/navigation

-   Workspaces
-   Teams
-   Billing
-   Kanban
-   Chat
-   AI Chat
-   Icons
-   Pro
-   other unrelated demo sections

Do not remove core infrastructure such as:

-   sidebar
-   header
-   responsive navigation
-   dialogs
-   tables
-   forms
-   shadcn components
-   theme infrastructure
-   reusable layout components

Do not delete files blindly. Inspect dependencies before removing demo
code.

------------------------------------------------------------------------

# 10. Store-Focused Dashboard Navigation

Replace the starter navigation with a store-focused structure.

Target:

``` text
Overview

Catalog
  Products
  Categories
  Inventory

Orders

Customers

Media

Settings
  Store
  Payments
  Shipping
  Admin Users
  Integrations
```

Only create navigation items when their underlying page/module exists.

Do not create empty placeholder routes just to fill the sidebar.

------------------------------------------------------------------------

# 11. Dashboard Overview

Replace hardcoded starter analytics.

The current report confirms the overview still uses hardcoded demo
metrics and Recharts. fileciteturn4file1

Use real Supabase data once the relevant tables are live.

Possible metrics:

``` text
Total Sales
Orders
Customers
Products
Low Stock
Pending Orders
```

Do not display fake values such as:

``` text
$1,250.00
1,234
45,678
4.5%
```

If there is no store data yet:

``` text
$0
0 orders
0 customers
0 products
```

or use intentional empty states.

------------------------------------------------------------------------

# 12. Products

The existing starter product CRUD is based on mock starter data and is
not the Sukoon product model. fileciteturn4file1

Replace it with the actual Sukoon catalog.

Admin must be able to:

-   create product
-   edit product
-   archive product
-   publish/unpublish product
-   edit title
-   edit slug
-   edit description
-   edit price
-   edit compare-at price
-   edit SKU
-   assign category
-   manage images
-   manage variants
-   manage inventory
-   manage featured state

Suggested status:

``` text
Draft
Active
Archived
```

Prefer archive/soft-delete over permanent deletion unless explicitly
required.

------------------------------------------------------------------------

# 13. Product Data

Reuse the existing Supabase schema if it already supports the required
structure.

Conceptually:

``` text
products
├── id
├── title
├── slug
├── description
├── price
├── compare_at_price
├── sku
├── category_id
├── status
├── featured
├── created_at
├── updated_at
└── deleted_at
```

Variants:

``` text
product_variants
├── id
├── product_id
├── sku
├── size
├── color
├── price
├── stock_quantity
├── created_at
└── updated_at
```

Do not create these tables if the existing schema already represents
them differently and correctly.

First inspect the actual schema.

------------------------------------------------------------------------

# 14. Categories

Admin should be able to:

-   create category
-   edit category
-   archive category
-   assign products
-   set name
-   set slug
-   set description
-   assign category image

The actual category names must come from the approved Sukoon catalog
requirements.

------------------------------------------------------------------------

# 15. Inventory

Inventory management should support:

``` text
Product
SKU
Variant
Available
Reserved
Low Stock
Status
```

Actions:

-   adjust stock
-   update stock quantity
-   identify low stock
-   identify out-of-stock

Do not allow negative inventory unless business requirements explicitly
allow overselling.

------------------------------------------------------------------------

# 16. Orders

Build real order management after the checkout/order schema is ready.

Order list:

``` text
Order #
Customer
Date
Items
Total
Payment
Fulfillment
Status
```

Potential statuses:

``` text
Pending
Paid
Processing
Shipped
Delivered
Cancelled
Refunded
```

Use only statuses supported by the actual payment/order workflow.

Order detail should include:

-   customer information
-   billing information
-   shipping information
-   products
-   quantities
-   prices
-   subtotal
-   shipping
-   discount
-   total
-   payment status
-   order status
-   timestamps

------------------------------------------------------------------------

# 17. Customers

Customer management does NOT mean customer authentication.

Customers are store/business records.

They can originate from checkout/order information.

Admin should eventually see:

``` text
Customer
Email
Orders
Total spent
Joined
Status
```

Customer detail:

-   customer information
-   email
-   order history
-   total spend
-   addresses if supported
-   first/last order dates

Do not expose passwords because there are no customer auth accounts in
this MVP.

------------------------------------------------------------------------

# 18. Checkout and Customer Model

Current storefront checkout is still mock and does not persist orders.
fileciteturn4file17

When real checkout is implemented:

``` text
Guest Customer
      ↓
Checkout
      ↓
Order
      ↓
Customer record
```

The customer record should not require a Supabase Auth account.

This keeps the MVP budget-friendly while still allowing customer/order
management in the admin dashboard.

------------------------------------------------------------------------

# 19. Media Management

Use Cloudinary.

Recommended flow:

``` text
Admin opens product
        ↓
Selects image
        ↓
Upload to Cloudinary
        ↓
Cloudinary returns URL + public ID
        ↓
Save media metadata in Supabase
        ↓
Product references media
        ↓
Storefront reads media URL
```

Do not store image binaries in Supabase.

Do not upload product media to Supabase Storage.

------------------------------------------------------------------------

# 20. Supabase Database Integration

Before changing the schema:

1.  inspect current schema
2.  inspect existing Supabase project/tables
3.  identify existing relationships
4.  identify Clerk-era fields
5.  remove/replace Clerk assumptions
6.  create migrations only where required
7.  configure RLS
8.  connect feature services

Do not duplicate existing tables.

Do not hard-code production store data in React components.

------------------------------------------------------------------------

# 21. Feature Service Architecture

The implementation report states that the project already uses a feature
service/query pattern designed to swap mock data for a real backend.
fileciteturn4file18

Preserve that architecture.

Preferred flow:

``` text
UI
 ↓
React Query
 ↓
feature service.ts
 ↓
Supabase
```

Do not scatter direct Supabase queries throughout UI components.

Keep data access centralized inside feature services/hooks.

------------------------------------------------------------------------

# 22. Storefront Integration

The dashboard and storefront must share the same source of truth.

Target:

``` text
Dashboard
     ↓
Supabase
     ↓
Products / Categories / Inventory
     ↓
Storefront
```

When admin changes:

``` text
title
price
image
category
status
inventory
```

the storefront should eventually reflect those changes.

Do not maintain separate dashboard and storefront product datasets.

The current storefront catalog is still mock and must eventually be
wired to Supabase. fileciteturn4file3

------------------------------------------------------------------------

# 23. Demo Data Removal

Remove starter demo records such as:

``` text
Olivia Martin
Jackson Lee
Isabella Nguyen
William Kim
Sofia Davis
```

and fake revenue/chart values.

The implementation report confirms these are starter/mock data.
fileciteturn4file1

Use:

-   real Supabase data
-   or intentional empty states

Never replace fake starter records with new fake Sukoon records.

------------------------------------------------------------------------

# 24. Loading / Error / Empty States

Every admin screen should have:

-   loading state
-   skeleton where useful
-   empty state
-   error state
-   success feedback
-   form validation

Example:

``` text
No products yet

Add your first product to start building the Sukoon catalog.

[ Add Product ]
```

Do not leave blank or broken tables.

------------------------------------------------------------------------

# 25. Security

Do not trust client-side authorization.

Protect sensitive operations with:

-   Supabase Auth
-   server-side session validation
-   Supabase RLS
-   role checks
-   protected dashboard routes

Protect at minimum:

``` text
products
categories
inventory
orders
customers
admin users
settings
media
```

Cloudinary secrets must remain server-side.

------------------------------------------------------------------------

# 26. Implementation Order

Do not implement every module in one Cursor prompt.

Use this order:

## Phase 1 --- Dashboard Cleanup

-   remove Clerk UI/dependencies where applicable
-   remove GitHub button
-   remove Workspaces
-   remove Teams
-   remove Billing
-   remove Kanban
-   remove Chat
-   remove AI Chat
-   remove Icons
-   remove Pro
-   remove unrelated demo navigation
-   set WhatsApp theme
-   remove fake demo data

**Stop and review.**

------------------------------------------------------------------------

## Phase 2 --- Admin Authentication

-   Supabase server client
-   Supabase browser client
-   admin sign-in
-   admin sign-out
-   protected `/dashboard`
-   session handling
-   admin profile
-   admin role
-   remove Clerk middleware
-   remove Clerk auth routes

Customer authentication is **not implemented**.

**Stop and review.**

------------------------------------------------------------------------

## Phase 3 --- Supabase Database Audit

-   inspect existing schema
-   inspect actual Supabase tables
-   remove Clerk-era assumptions
-   create/refine migrations
-   configure RLS
-   establish admin access policies
-   generate/align types if appropriate

**Stop and review.**

------------------------------------------------------------------------

## Phase 4 --- Cloudinary

-   configure Cloudinary
-   server-side upload/signing
-   media metadata
-   product image upload
-   image reorder/remove
-   secure media handling

**Stop and review.**

------------------------------------------------------------------------

## Phase 5 --- Catalog

-   Products
-   Product detail/edit
-   Categories
-   Variants
-   Inventory
-   Product media

**Stop and review.**

------------------------------------------------------------------------

## Phase 6 --- Connect Storefront Catalog

Replace mock catalog services with Supabase-backed services.

Connect:

-   Home featured products
-   Shop
-   Category pages
-   Product detail
-   filters
-   sorting
-   product images

Do not change the existing visual design.

**Stop and review.**

------------------------------------------------------------------------

## Phase 7 --- Checkout and Orders

Replace mock checkout.

Implement:

``` text
Guest checkout
      ↓
Order creation
      ↓
Order items
      ↓
Customer record
      ↓
Admin Orders
```

Payment integration should be implemented according to the actual
approved payment provider.

**Stop and review.**

------------------------------------------------------------------------

## Phase 8 --- Customers

Build admin customer records from real store data.

Do not add customer authentication.

**Stop and review.**

------------------------------------------------------------------------

## Phase 9 --- Dashboard Overview

Connect:

-   sales
-   orders
-   customers
-   products
-   low stock
-   pending orders
-   recent orders

to real database data.

**Stop and review.**

------------------------------------------------------------------------

## Phase 10 --- Final Hardening

-   RLS audit
-   server authorization audit
-   Cloudinary security audit
-   Clerk dependency search
-   mock data search
-   unused starter route search
-   responsive dashboard QA
-   storefront regression QA
-   production build
-   lint/type checks

------------------------------------------------------------------------

# 27. Cursor Execution Rule

Do not ask Cursor to implement the whole document at once.

Always use:

``` text
Phase 1
↓
Review
↓
Phase 2
↓
Review
↓
Phase 3
↓
Review
↓
...
```

After every phase, Cursor must:

1.  run the relevant checks
2.  verify the app
3.  report changed files
4.  report remaining issues
5.  stop

Do not allow it to silently continue to the next phase.

------------------------------------------------------------------------

# 28. Cursor --- Initial Prompt

Use this prompt to begin the dashboard work:

``` text
Read .cursor/SUKOON-DASHBOARD.md completely before making any changes.

Also read the latest Cursor implementation report if it is available in the project.

IMPORTANT CURRENT STATE:

The Sukoon storefront UI is largely complete.

The current dashboard is still based on the Kiranism starter and contains mock/demo functionality.

The implementation report confirms:

- Clerk is currently used
- Supabase is prepared but feature services are not yet wired
- Product and customer dashboard screens use starter mock data
- Workspaces / Teams / Billing remain
- Dashboard theme is currently "sukoon"
- Categories, inventory, orders, settings and real admin modules are not yet implemented

Do not assume these systems are already production-ready.

==================================================
AUTHENTICATION
==================================================

REMOVE CLERK.

Use Supabase Auth ONLY for dashboard/admin users.

Customer authentication is NOT required.

Do NOT implement:

- customer registration
- customer login
- customer accounts
- customer password reset
- customer auth middleware

Customers are guest storefront users for the current MVP.

Customer records may exist in the database for orders/checkout, but they are NOT Supabase Auth users.

==================================================
STORAGE
==================================================

Use Cloudinary for store media.

Do NOT use Supabase Storage.

Supabase:
- database
- admin authentication

Cloudinary:
- product images
- category images
- store media

==================================================
THEME
==================================================

Use the WhatsApp-style dark admin theme shown in the provided reference screenshot.

Do not expose unrelated starter themes.

==================================================
FIRST TASK
==================================================

Implement PHASE 1 ONLY.

Inspect the current repository before changing anything.

Remove confirmed starter/demo functionality:

- GitHub header button
- Workspaces
- Teams
- Billing
- Kanban
- Chat
- AI Chat
- Icons
- Pro
- other unrelated starter navigation

Preserve core dashboard infrastructure.

Set the WhatsApp-style theme.

Remove fake starter dashboard data where appropriate.

Do not create fake Sukoon data.

Do not implement products, orders, Cloudinary or Supabase business services yet.

Do not redesign the storefront.

After Phase 1:

- run the app
- verify dashboard navigation
- verify WhatsApp theme
- verify removed starter items are gone
- verify storefront routes still work
- report changed files
- report remaining starter dependencies
- stop

Do not proceed to Phase 2.
```

------------------------------------------------------------------------

# 29. Final Target Architecture

``` text
                         SUKOON
                            │
               ┌────────────┴────────────┐
               │                         │
          STOREFRONT                 DASHBOARD
               │                         │
          Guest Users             Admin Auth Only
               │                         │
               └────────────┬────────────┘
                            │
                         SUPABASE
                            │
              ┌─────────────┴─────────────┐
              │                           │
           Database                    Auth
              │                           │
      Products / Categories          Admin Users
      Variants / Inventory
      Orders / Customers
      Store Settings
      Media Metadata
              │
              │
          CLOUDINARY
              │
       Product / Store Media
```

The key rule is:

**One store database, one admin authentication system, guest customers
for the MVP, and Cloudinary for media.**

------------------------------------------------------------------------

# 30. Final Quality Gate

Before calling the dashboard foundation complete:

-   [ ] Clerk fully removed
-   [ ] Supabase Auth implemented for admin users
-   [ ] Customer authentication explicitly not implemented
-   [ ] Dashboard routes protected server-side
-   [ ] Admin role model implemented
-   [ ] GitHub button removed
-   [ ] Workspaces removed
-   [ ] Teams removed
-   [ ] Billing removed
-   [ ] Kanban removed
-   [ ] Chat removed
-   [ ] AI Chat removed
-   [ ] Icons removed
-   [ ] Pro removed
-   [ ] Unrelated starter navigation removed
-   [ ] WhatsApp-style theme active
-   [ ] Starter theme gallery removed/disabled
-   [ ] Fake dashboard data removed
-   [ ] Existing Supabase schema audited
-   [ ] Clerk-era database assumptions removed
-   [ ] Supabase RLS configured
-   [ ] Cloudinary used for media
-   [ ] Supabase Storage not used for media
-   [ ] Products connected to Supabase
-   [ ] Categories connected to Supabase
-   [ ] Inventory connected to Supabase
-   [ ] Orders connected to Supabase
-   [ ] Customer records connected to orders
-   [ ] Storefront catalog connected to Supabase
-   [ ] Dashboard and storefront use the same source of truth
-   [ ] No customer auth implementation
-   [ ] Storefront visual design remains unchanged
-   [ ] Dashboard remains responsive
-   [ ] Production build passes
-   [ ] Type/lint checks pass
