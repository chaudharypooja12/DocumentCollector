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
  controls, progress, local generation confirmation, submitted lock, combined
  PDF download, and supported file sharing are functional.
- The public shell shares the deployment-safe MBWays logo, Light-default theme
  tokens, and in-memory theme control without adding persistence or login.
- Each link accepts exactly one submission; after PDF generation the current
  tab locks against further edits.

## Key Screens / Components

- Link Landing/Loading, Basic Details Form, Document Upload List, Review/Edit, Submission Confirmation, Success/Download, Expired, Locked/Already-Submitted.

## Data It Owns / Reads

- Phase 1: decodes document configuration and expiry from the URL fragment,
  then owns current-page Basic Details form state, capture state, and
  generated-PDF state entirely in memory. Basic Details are validated with
  Zod/React Hook Form but never encoded into the link, uploaded, or persisted.
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

## Next Steps

- Complete physical-device and deployed HTTPS camera/share checks, then begin
  the Phase 2 opaque-token and upload adapters.
