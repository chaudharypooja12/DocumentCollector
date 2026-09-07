# Index — DocumentCollector Memory Bank

Entry point for all agent and contributor tasks. Read this file first.

## Project Identity

- Product: **DocumentCollector**
- Owner: **MBWays**
- Presentation: **DocumentCollector - Powered by MBWays**
- Repository: [chaudharypooja12/DocumentCollector](https://github.com/chaudharypooja12/DocumentCollector) (private)
- Company and brand source: `COMPANY.md`

## How to Use This Memory Bank

1. Read this index.
2. Identify the relevant module from the Module Map.
3. Read that module's file under `modules/`.
4. Review `RECENT_CHANGES.md`.
5. Read the relevant phase checklist.
6. Inspect the implementation before making changes.
7. After the task, update the module file, phase checklist, and changelog.

## Documents

| File | Purpose |
|---|---|
| [PRD.md](./PRD.md) | Product requirements, business rules, scope, and acceptance criteria |
| [COMPANY.md](./COMPANY.md) | MBWays ownership, company facts, contact details, brand system, and logo usage |
| [TECH_STACK.md](./TECH_STACK.md) | Technical requirements, stack, APIs, quality requirements, and pipelines |
| [DESIGN.md](./DESIGN.md) | UI/UX principles, visual system, screens, responsive behavior, and accessibility |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow, security, deployment, and decision log |
| [MODELS.md](./MODELS.md) | Data model, database schema, storage layout, indexes, and validation rules |
| [PHASE_1_FRONTEND.md](./PHASE_1_FRONTEND.md) | Phase 1 frontend implementation checklist |
| [PHASE_2_BACKEND.md](./PHASE_2_BACKEND.md) | Phase 2 Supabase backend checklist |
| [PHASE_3_PAYMENT_GATEWAY.md](./PHASE_3_PAYMENT_GATEWAY.md) | Phase 3 payment gateway checklist |
| [RECENT_CHANGES.md](./RECENT_CHANGES.md) | Chronological, append-only implementation log |

## Modules

| Module | File | Scope |
|---|---|---|
| Admin Panel | [modules/admin.md](./modules/admin.md) | Dashboard, users, templates, submissions, PDFs, and settings |
| User Upload | [modules/user-upload.md](./modules/user-upload.md) | Public token flow, required-document list, review, submission, and state screens |
| Document Capture | [modules/document-capture.md](./modules/document-capture.md) | Camera UI, edge detection, perspective correction, crop, resize, and compression |
| PDF Generation | [modules/pdf-generation.md](./modules/pdf-generation.md) | A4 layout, front/back composition, combined PDFs, and individual PDFs |
| Link Management | [modules/link-management.md](./modules/link-management.md) | Token generation, expiry, submission lock, and admin reactivation |

## Module Map

| If the task involves... | Read |
|---|---|
| User records, dashboard, document templates, submission review, PDF downloads, or settings | `modules/admin.md` |
| Public link landing, document list, submission confirmation, success, expired, or locked screens | `modules/user-upload.md` |
| Camera preview, positioning guide, edge/corner detection, perspective correction, crop, or resize | `modules/document-capture.md` |
| A4 layout, combined/individual PDF assembly, or front/back page composition | `modules/pdf-generation.md` |
| Link tokens, expiry enforcement, submission lock, or reactivation | `modules/link-management.md` |

## Project Status

| Phase | Status |
|---|---|
| Phase 1 — Frontend | Implementation complete and locally verified; Vercel and physical-device acceptance pending |
| Phase 2 — Backend | Not started |
| Phase 3 — Payment Gateway | Not started |

## Core Rules

- Public users never have accounts, login, or profiles.
- DocumentCollector remains an MBWays-owned tool and displays `Powered by MBWays`.
- Phase 1 saves no information: no backend, database, upload, authentication,
  or browser persistence.
- Phase 1 links carry only non-sensitive request configuration; captures and
  PDFs remain in current-page memory on the User device.
- Link expiry must never exceed six hours and must be server-authoritative in production.
- Phase 1 locks only the current tab; Phase 2/production must keep a submitted
  link locked until an Admin explicitly reactivates the same token.
- Front and back images share one A4 page; each single document gets its own page.
- Reactivation reuses the existing token.
- Privileged secrets must never be shipped to the client.
- Payment work is out of scope until Phase 3.

> Admin decides which documents are required; the user captures only those documents through a temporary link; the system validates, formats, and combines them into A4 PDFs, then locks the link after submission.
