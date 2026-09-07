# Module Context — Admin Panel

**Module path (code):** `src/app/(admin)/admin/`, `src/components/admin/`,
`src/components/ui/`, `src/data/admin-fixtures.ts`
**Related docs:** `PRD.md` §4–5,16–17, `DESIGN.md` §4.1, `MODELS.md`

## Purpose

All Admin-facing functionality: user management, document template configuration, link generation/sharing, submission review, PDF downloads, settings, dashboard.

## Current Implementation Status

- Phase 1 implemented under `src/app/(admin)/admin/`,
  `src/components/admin/`, `src/components/ui/`, and `src/data/`.
- The MBWays landing page routes to a local-only Admin sign-in preview. It
  validates input in memory but deliberately does not authenticate, transmit, or
  store credentials; secure access control remains Phase 2.
- Dashboard, Users, Submissions, PDF Management, Settings, request creation,
  link/QR sharing, oversized-link guidance, and same-link reactivation
  demonstration are implemented.
- The responsive shell includes a desktop sidebar, sticky top bar, mobile
  navigation sheet, Light-default in-memory theme control, clear structural
  borders, and Logout back to the local sign-in preview.

## Key Screens / Components

- Mobile-first Dashboard, demonstration Users/Submissions/PDF/Settings screens,
  and a functional Create Request flow with document configuration, expiry,
  self-contained link generation, QR when the link fits QR capacity, and share
  actions that remain available for longer valid links.
- Reusable shadcn components provide buttons, cards, fields, selects, badges,
  alerts, sheets, menus, separators, tooltips, skeletons, progress, and tables.
- Users, submissions, and PDF previews use a shared responsive data table with
  client-side search, pagination, and CSV export. Phase 1 exports only static
  demonstration data and does not read from or write to persistent storage.

## Data It Owns / Reads

- Phase 1: current-page request-builder state and typed static fixtures only.
- Phase 2: `admins`, `users`, `document_template_items`, `links`,
  `submissions`, and `generated_pdfs`.

## Dependencies

- `modules/link-management` (to generate/reactivate links)
- `modules/pdf-generation` (to fetch generated PDFs)
- `public/brand/` and `COMPANY.md` (fixed MBWays ownership and brand identity)

## Known Issues

- Phase 1 cannot receive User captures, show real submissions, persist Admin
  changes, or reactivate a link on another device.
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

## Next Steps

- Connect the private repository to Vercel and complete the physical-device
  acceptance items in `PHASE_1_FRONTEND.md`.
