# Module Context — Admin Panel

**Module path (code):** `app/(admin)/`, `components/admin/`, `modules/admin/`
**Related docs:** `PRD.md` §4–5,16–17, `DESIGN.md` §4.1, `MODELS.md`

## Purpose
All Admin-facing functionality: user management, document template configuration, link generation/sharing, submission review, PDF downloads, settings, dashboard.

## Current Implementation Status
- Phase 1 architecture finalized; implementation not started.

## Key Screens / Components
- Mobile-first Dashboard, demonstration Users/Submissions/PDF/Settings screens,
  and a functional Create Request flow with document configuration, expiry,
  self-contained link generation, QR, and share actions.

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

## Next Steps
- See `PHASE_1_FRONTEND.md` — Admin Panel task groups.
