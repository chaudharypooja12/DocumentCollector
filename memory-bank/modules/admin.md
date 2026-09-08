# Module Context — Admin Panel

**Module path (code):** `src/app/(admin)/admin/`, `src/components/admin/`,
`src/components/ui/`, `src/data/admin-fixtures.ts`
**Related docs:** `PRD.md` §4–5,16–17, `DESIGN.md` §4.1, `MODELS.md`

## Purpose

All Admin-facing functionality: dashboard stats, profile/submission review and management, document template configuration, link generation/sharing, settings, activity logs.

## Current Implementation Status

- Phase 1 implemented under `src/app/(admin)/admin/`,
  `src/components/admin/`, `src/components/ui/`, and `src/data/`.
- The MBWays landing page routes to a local-only Admin sign-in preview. It
  validates input in memory but deliberately does not authenticate, transmit, or
  store credentials; secure access control remains Phase 2.
- Dashboard, Users (merged Profiles + Submissions preview, now including a
  per-profile Payment status), Settings, Logs, request creation, link/QR
  sharing, oversized-link guidance, and in-memory India/UAE pricing are
  implemented.
- The responsive shell includes a desktop sidebar, sticky top bar, mobile
  navigation sheet, Light-default in-memory theme control, clear structural
  borders, and Logout back to the local sign-in preview. Settings and Logs are
  ordered at the bottom of the navigation list.

## Key Screens / Components

- **Dashboard**: four stat cards only — Total profiles (with a View link to
  Users), Pending (hover reveals "Links Created but data not received"), Male
  users, and Female users — computed from typed static fixtures.
- **Users**: a single merged page replacing the former separate Submissions
  and PDF Management pages. Status, gender, and Payment status Select filters
  sit above a responsive data table with search, pagination, and CSV export.
  A Payment column shows each profile's payment status (Paid, Awaiting
  payment, Cancelled, Failed, Expired) with its country and fixed demo amount;
  the View dialog repeats this detail. Each row's Actions column provides View
  submission (Eye, opens a Dialog with profile details and demonstration
  document downloads), Update profile (Pencil, opens an editable Dialog
  including a "same as permanent address" checkbox), and Delete profile
  (Trash, opens a confirmation Dialog). All mutations are in-memory `useState`
  only and reset on refresh.
- **Settings**: demonstration preferences form spanning the full page width
  (a two-column field grid inside a single full-width `Card`, matching every
  other Admin page); values reset on refresh. A second full-width Payment demo
  Card below it lets the Admin edit India/UAE prices and enabled status.
- **Logs**: demonstration activity log fixtures with search, pagination, and
  CSV export.
- A functional Create Request flow with document configuration, expiry,
  billing-country selection, snapshotted INR/AED demo pricing, self-contained
  version-2 link generation, QR when the link fits capacity, and share actions.
- Reusable shadcn components provide buttons, cards, fields, selects,
  checkboxes, dialogs, badges, alerts, sheets, menus, separators, tooltips,
  skeletons, progress, and tables. `Input` and the `Select` trigger use a
  themed inset "hollow" shadow (`.field-shadow`) instead of a raised shadow so
  empty fields read as containers waiting for input.
- No Admin content page constrains its primary `Card` with a `max-w-*` class;
  every page (Dashboard, Create Request, Users, Settings, Logs) fills the
  full `page-shell` content width for visual consistency.
- The reusable Admin data table (`src/components/admin/data-table.tsx`)
  supports per-column `searchable`/`exportable` flags so an Actions column can
  be excluded from search matching and CSV export.
- All scrollable surfaces use a themed scrollbar (MBWays orange thumb on a
  muted track) defined once in `src/app/globals.css`.

## Data It Owns / Reads

- Phase 1: current-page request-builder state and typed static fixtures only.
- Phase 1 payment settings (India/UAE price, enabled status) live in an
  Admin-layout React context and reset on refresh. Each fixture profile's
  payment status/country/amount is static demo data, not derived from a real
  transaction.
- Phase 2: `admins`, `users`, `document_template_items`, `links`,
  `submissions`, and `generated_pdfs`.

## Dependencies

- `modules/link-management` (to generate/reactivate links)
- `modules/pdf-generation` (to fetch generated PDFs)
- `public/brand/` and `COMPANY.md` (fixed MBWays ownership and brand identity)

## Known Issues

- Phase 1 cannot receive real User captures or Basic Details, persist Admin
  changes, or reactivate a link on another device. The Users page View/Update/
  Delete actions operate only on in-memory static fixtures.
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

## Next Steps

- Connect the private repository to Vercel and complete the physical-device
  acceptance items in `PHASE_1_FRONTEND.md`.
