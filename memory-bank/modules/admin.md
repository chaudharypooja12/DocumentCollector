# Module Context — Admin Panel

**Module path (code):** `src/app/(admin)/admin/`, `src/components/admin/`,
`src/components/ui/`, `src/data/admin-fixtures.ts`
**Related docs:** `PRD.md` §4–5,16–17, `DESIGN.md` §4.1, `MODELS.md`

## Purpose

All Admin-facing functionality: dashboard stats, document template
management, request creation, profile/submission review and management, and
workspace settings (including activity logs).

## Current Implementation Status

- Phase 1 implemented under `src/app/(admin)/admin/`,
  `src/components/admin/`, `src/components/ui/`, `src/providers/`, and
  `src/data/`.
- The MBWays landing page routes to a local-only Admin sign-in preview. It
  validates input in memory but deliberately does not authenticate, transmit, or
  store credentials; secure access control remains Phase 2. The sign-in page
  now has its own `<header>` bar (logo + theme toggle) matching every other
  page instead of an absolutely positioned toggle with no visible header.
- Dashboard, Templates, Create Request, Users (merged Profiles + Submissions
  preview, now including a per-profile Payment status), and Settings
  (including merged Activity Logs and Payment demo pricing) are implemented,
  with in-memory India/UAE demo pricing and oversized-link QR guidance.
- The responsive shell includes a desktop sidebar, sticky top bar, mobile
  navigation sheet, Light-default in-memory theme control, clear structural
  borders, and Logout back to the local sign-in preview. The top bar no
  longer shows a page-title/breadcrumb ("Dashboard · DocumentCollector ·
  Powered by MBWays"); it only contains navigation, theme toggle, and Logout.
  Navigation order is: Dashboard, Templates, Create request, Users, Settings.
- Page headings across every Admin page (Dashboard, Templates, Create
  Request, Users, Settings) no longer show an eyebrow label ("Admin
  workspace", "Functional Phase 1 workflow", "People", "Workspace") or an
  explanatory subheading; only the icon, title, and (where relevant) the
  "Phase 1 demonstration" badge remain, vertically centered against the icon.

## Key Screens / Components

- **Dashboard**: four stat cards only — Total profiles (with a View link to
  Users), Pending (hover reveals "Links Created but data not received"), Male
  users, and Female users — computed from typed static fixtures. The stat
  grid uses 2 columns on mobile (`grid-cols-2`) and 4 columns at `xl`.
- **Templates** (`/admin/templates`, new): Admin can create, edit, and delete
  reusable document-template checklists (name + ordered documents with
  Single/Front+Back capture type) via `TemplateFormDialog`/
  `DeleteTemplateDialog`, backed by `src/providers/templates-provider.tsx`
  (in-memory `useState`, seeded with one default "Passport & Photograph"
  template). This is the only place the document-builder UI
  (add/remove/reorder documents, drag-and-drop, per-document capture type)
  exists; it was moved out of the request-creation flow.
- **Create Request** (`/admin/requests/new`): `RequestBuilder` picks an
  existing template from a Select, a billing country (India/UAE, using live
  demo pricing from `usePaymentDemo()`), and an expiry (1–6 hours), previews
  the template's documents as read-only badges, then always generates a
  payment-aware (v2) temporary link/QR/share panel via
  `createPaidRequestPayload`. If no templates exist, it shows an inline
  prompt linking to `/admin/templates`; if the selected country's demo price
  is disabled in Settings, generation is blocked with an inline error. The
  "Add labels only. Never include a person's name or contact details."
  subheading no longer appears here since document authoring lives on the
  Templates page.
- **Users**: a single merged page replacing the former separate Submissions
  and PDF Management pages. Status, gender, and Payment status Select filters
  render in the same toolbar row as the table's search input (filters first,
  then search, then the Export as CSV button, via the `DataTable` `filters`
  prop). A Payment column shows each profile's payment status (Paid, Awaiting
  payment, Cancelled, Failed, Expired) with its country and fixed demo
  amount; the View dialog repeats this detail. Each row's Actions column
  provides View submission (Eye, opens a Dialog with profile details and
  demonstration document downloads), Update profile (Pencil, opens an
  editable Dialog including a "same as permanent address" checkbox), and
  Delete profile (Trash, opens a confirmation Dialog). The Update dialog
  validates Age (15–90) and Full name (at most 40 words) before saving,
  showing inline errors. All mutations are in-memory `useState` only and
  reset on refresh.
- **Settings**: demonstration preferences form spanning the full page width
  (a two-column field grid inside a single full-width `Card`, matching every
  other Admin page), with no page-level or card-level subheading. A second
  full-width Payment demo Card lets the Admin edit India/UAE prices and
  enabled status. Below it, an "Activity logs" section renders the same
  demonstration log fixtures that previously lived on a standalone
  `/admin/logs` page (now removed) using the shared `DataTable`.
- Reusable shadcn components provide buttons, cards, fields, selects,
  checkboxes, dialogs, badges, alerts, sheets, menus, separators, tooltips,
  skeletons, progress, and tables. `Input` and the `Select` trigger use a
  themed inset "hollow" shadow (`.field-shadow`) instead of a raised shadow so
  empty fields read as containers waiting for input.
- No Admin content page constrains its primary `Card` with a `max-w-*` class;
  every page fills the full `page-shell` content width for visual
  consistency.
- The reusable Admin data table (`src/components/admin/data-table.tsx`)
  supports per-column `searchable`/`exportable` flags so an Actions column can
  be excluded from search matching and CSV export, and an optional `filters`
  slot rendered before the search input in the same toolbar row.
- All scrollable surfaces use a themed scrollbar (MBWays orange thumb on a
  muted track) defined once in `src/app/globals.css`.
- The Logout control uses the primary MBWays orange button style (white
  text) instead of a neutral outline, matching the "fill theme color, white
  text" direction used elsewhere (e.g. the capture button).

## Data It Owns / Reads

- Phase 1: current-page request-builder state, in-memory document templates
  (`src/providers/templates-provider.tsx`), and typed static fixtures only.
- Phase 1 payment settings (India/UAE price, enabled status) live in an
  Admin-layout React context and reset on refresh. Each fixture profile's
  payment status/country/amount is static demo data, not derived from a real
  transaction.
- Phase 2: `admins`, `users`, `document_template_items` (persisted version of
  the Phase 1 in-memory templates), `links`, `submissions`, and
  `generated_pdfs`.

## Dependencies

- `modules/link-management` (to generate/reactivate links)
- `modules/pdf-generation` (to fetch generated PDFs)
- `public/brand/` and `COMPANY.md` (fixed MBWays ownership and brand identity)

## Known Issues

- Phase 1 cannot receive real User captures or Basic Details, persist Admin
  changes (including templates), or reactivate a link on another device. The
  Users page View/Update/Delete actions and the Templates CRUD actions all
  operate only on in-memory state that resets on refresh.
- Payment UI performs no real gateway request, charge, verification, refund, or
  cross-tab synchronization.
- Vercel project connection and physical-device acceptance remain external.

## Decisions Log

- None yet.
- 2026-09-07: Module context moved to the flat `modules/admin.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: Admin surfaces use the MBWays logo with
  `DocumentCollector - Powered by MBWays`; settings cannot replace the core
  owner identity.
- 2026-09-07: Phase 1 provides no Admin login or saved records. Its functional
  workflow is the request builder; data-dependent management screens use
  clearly labeled static fixtures.
- 2026-09-07: Cross-device requests use a PII-free URL-fragment payload and QR
  code. Persistent Admin operations are deferred to Phase 2.
- 2026-09-07: `/admin/login` is a clearly labeled UI demonstration with no
  native form submission, network request, persistence, or route protection.
  This preserves the Phase 1 no-auth contract while showing the intended entry
  experience.
- 2026-09-07: Merged the separate Submissions and PDF Management pages into
  the Users page as per-row actions to reduce navigation depth and reflect
  that Phase 1 has no independent submission or PDF store. Simplified the
  Dashboard to four stat cards and removed static "recent activity"/"private
  by design" cards in favor of the dedicated Logs page. Reordered navigation
  so Settings and Logs sit at the bottom.
- 2026-09-07: Added a no-charge Phase 1 payment prototype for India/INR and
  UAE/AED plus a standalone lifecycle simulator. All settings and actions remain
  in memory; production Razorpay behavior is deferred to Phase 3.
- 2026-09-08: Removed the standalone Admin payment lifecycle demo page
  (`/admin/payments/demo`) and its nav entry. Payment status now surfaces
  directly per profile in the Users table (column + filter) and in the View
  dialog instead. Fixed the Payment demo Settings Card to match the full-width
  layout used by every other Admin page.
- 2026-09-08: Added an in-memory document-template feature
  (`templates-provider.tsx`, `template-builder.tsx`, `/admin/templates`) and
  moved the entire document-builder UI (add/reorder/remove documents,
  per-document capture type) out of the request-creation flow and into
  Template create/edit dialogs; Create Request now selects a template,
  billing country, and expiry, and always generates a payment-aware link.
  Merged the standalone Logs page into Settings and removed the
  separate route/nav item. Removed the Admin top bar's page-title/breadcrumb
  text entirely. Removed eyebrow labels ("Admin workspace", "Functional
  Phase 1 workflow", "People", "Workspace") and page-level subheadings from
  Dashboard, Create Request, Users, and Settings, aligning each page's icon
  and title vertically. Changed the Dashboard stat grid to 2 columns on
  mobile. Changed Logout to the primary orange/white button style. Moved
  each Admin table's filter controls into the same toolbar row as the search
  input, before the search box. Added Age (15–90) and Full name (≤40 words)
  validation with inline errors to the Users "Update profile" dialog. Gave
  the local-only Admin sign-in page a proper `<header>` bar instead of an
  absolutely positioned theme toggle with no visible header bar.
- 2026-09-08: Reconciled the document-templates feature with the parallel
  Phase 1 payment prototype: Create Request combines the template Select with
  the payment prototype's billing-country/pricing Select and always calls
  `createPaidRequestPayload`; the Users table combines the filters-before-
  search layout with the Payment column/filter; Settings keeps both the
  Payment demo Card and the merged Activity logs section; the Users "Update
  profile" dialog keeps both the Payment detail row and the Age/name
  validation.

## Next Steps

- Connect the private repository to Vercel and complete the physical-device
  acceptance items in `PHASE_1_FRONTEND.md`.
