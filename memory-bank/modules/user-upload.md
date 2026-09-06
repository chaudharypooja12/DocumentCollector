# Module Context — User Upload Flow (Public)

**Module path (code):** `app/(public)/u/`, `modules/user-upload/`
**Related docs:** `PRD.md` §8–14, `DESIGN.md` §4.2

## Purpose
The unauthenticated, token-based flow the User experiences: landing/state resolution, document list, review/edit, submission, success/expired/locked screens.

## Current Implementation Status
- Phase 1 architecture finalized; implementation not started.

## Key Screens / Components
- Link Landing/Loading, Document Upload List, Review/Edit, Submission Confirmation, Success/Download, Expired, Locked/Already-Submitted.

## Data It Owns / Reads
- Phase 1: decodes document configuration and expiry from the URL fragment,
  then owns current-page capture and generated-PDF state in memory.
- Phase 2: resolves an opaque token, uploads `document_captures`, and creates a
  persistent `submission`.

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

## Decisions Log
- None yet.
- 2026-09-07: Module context moved to the flat `modules/user-upload.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: Public upload, success, expired, and locked states retain the
  MBWays logo and `Powered by MBWays` endorsement without adding account or
  profile features.
- 2026-09-07: Phase 1 opens `/u#request=<payload>` directly with no login,
  keeps all files in current-page memory, and generates PDFs on-device.

## Next Steps
- See `PHASE_1_FRONTEND.md` — User Upload Flow task groups.
