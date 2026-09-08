# Module Context — User Upload Flow (Public)

**Module path (code):** `src/app/(public)/u/`, `src/features/user-upload/`
**Related docs:** `PRD.md` §8–14, `DESIGN.md` §4.2

## Purpose

The unauthenticated, token-based flow the User experiences: landing/state resolution, Basic Details entry, document list, review/edit, submission, success/expired/locked screens.

## Current Implementation Status

- Phase 1 implemented under `src/app/(public)/u/` and
  `src/features/user-upload/`.
- The hash resolver, loading/invalid/expired states, in-browser Basic Details
  form (Full Name, Age, Gender, Phone, Permanent/Residence Address with a
  "same as permanent address" checkbox), ordered checklist, capture/review
  controls, progress, no-charge mock checkout for version-2 links, local
  generation confirmation, submitted lock, combined PDF download, and supported
  file sharing are functional.
- The public shell shares the deployment-safe MBWays logo, Light-default theme
  tokens, and in-memory theme control without adding persistence or login.
- Each link accepts exactly one submission; after PDF generation the current
  tab locks against further edits.
- Cancelled and declined mock payments keep captures in current-page memory for
  retry until expiry. PDF generation and result actions remain gated on mock
  success.

## Key Screens / Components

- Link Landing/Loading, Basic Details Form, Document Upload List, Review/Edit, Submission Confirmation, Success/Download, Expired, Locked/Already-Submitted.

## Data It Owns / Reads

- Phase 1: decodes document configuration and expiry from the URL fragment,
  plus a version-2 non-sensitive country/price snapshot when present, then owns
  current-page Basic Details, capture, mock-payment, and generated-PDF state
  entirely in memory. Basic Details are validated with Zod/React Hook Form but
  never encoded into the link, uploaded, or persisted.
- Phase 2: resolves an opaque token, uploads `document_captures` and the
  submitted Basic Details, and creates a persistent `submission`.

## Dependencies

- `modules/link-management` (state resolution: active/expired/submitted)
- `modules/document-capture` (capture UI + processed images)
- `modules/pdf-generation` (post-submission download link)
- `public/brand/` and `COMPANY.md` (shared MBWays identity)

## Known Issues

- Phase 1 refresh/close loses captures and generated files.
- Phase 1 expiry and submitted state are client-side only and can be reset by
  reopening the link.
- Phase 1 payment success is a deterministic UI outcome, not provider
  verification, and must never be used for real collection.
- Admin cannot access Phase 1 results unless the User explicitly shares the
  downloaded PDF outside the application.
- Physical Android Chrome and iOS Safari camera acceptance remains pending.

## Decisions Log

- None yet.
- 2026-09-07: Module context moved to the flat `modules/user-upload.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: Public upload, success, expired, and locked states retain the
  MBWays logo and `Powered by MBWays` endorsement without adding account or
  profile features.
- 2026-09-07: Phase 1 opens `/u#request=<payload>` directly with no login,
  keeps all files in current-page memory, and generates PDFs on-device.
- 2026-09-07: Version-2 links add an Admin-selected India/UAE price snapshot and
  a mock checkout after capture. Cancel/failure supports retry; only mock success
  unlocks local PDF generation.
- 2026-09-08: Progress now counts per-document completion (each document, not
  each capture side) so a front+back document counts as 1 of N rather than 2,
  matching what the User requested. Removed redundant page copy: the
  "Capture your documents"/"Follow the checklist below" heading, the
  single-submission reminder alert, the "Entered on this device only"
  subheading under Basic Details, and the "Front and back · one shared A4
  page" subheading (the "One image · one A4 page" subheading remains for
  single-capture documents). The per-slot Capture button now uses the primary
  MBWays orange gradient with white text instead of the neutral secondary
  style.

## Next Steps

- Complete physical-device and deployed HTTPS camera/share checks, then begin
  the Phase 2 opaque-token and upload adapters.
