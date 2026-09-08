<p align="center">
  <img src="public/brand/logo.png" alt="MBWays - Opening Pathways to Opportunities" width="280" />
</p>

# DocumentCollector

**Powered by MBWays**

A mobile-first, link-based document collection tool. An Admin configures which documents are required from a person, generates a temporary link, and that person captures the requested documents through a camera-guided flow - no account or login required. The browser then arranges the documents into a combined A4 PDF.

DocumentCollector is an MBWays-owned tool. MBWays is a career, professional
development, and global opportunities consultancy helping individuals build
skills, improve employability, and access opportunities in India and abroad.

## Phase 1 Privacy Model

Phase 1 is a frontend-only implementation:

- the Admin generates a self-contained request link with no User PII;
- the link opens the document checklist directly on a phone with no login;
- camera captures, processed images, and PDFs remain in current-page memory;
- no backend, database, authentication, upload, or browser persistence is used;
- India/INR and UAE/AED payment outcomes are clearly labeled no-charge UI
  simulations with no provider SDK, API, key, or payment credential;
- the User downloads or shares the locally generated PDF only after mock success
  on version-2 links;
- refresh or close clears the session.

Persistent Admin records, uploads, authoritative expiry/locking, and
reactivation are introduced in Phase 2.

## Phase 1 Implementation

The complete frontend implementation is available under `src/`:

- `/` — MBWays-branded product landing page;
- `/admin/login` — local-only Admin sign-in UI preview (no authentication or
  credential storage in Phase 1);
- `/admin` — responsive demonstration dashboard and management screens;
- `/admin/requests/new` — functional request builder and link/QR sharing;
- `/admin/payments/demo` — standalone renewal and payment lifecycle fixtures;
- `/u#request=<payload>` — no-login capture, mock payment, local PDF, and
  download flow.

OpenCV.js is pinned under `public/opencv/` and loaded only when the camera
workflow starts. Captures are normalized and PDFs are generated entirely in the
browser.

## Core Flow

```
Admin → Configure Required Documents + Country Price → Generate Link / QR
   → User Opens Link → Captures Documents → Completes Mock Payment
   → Browser Generates A4 PDF Locally → User Downloads / Shares
   → Current Tab Locks (Persistent Lock/Reactivation in Phase 2)
```

## Tech Stack

| Phase              | Stack                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Phase 1 — Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, OpenCV.js, pdf-lib, Vercel |
| Phase 2 — Backend  | Supabase (Database, Storage, Auth, Edge Functions), REST/RPC                              |
| Phase 3 — Payment  | Replace the no-charge India/UAE UI prototype with Razorpay-backed request payments       |

## Deployment

- Repository: [chaudharypooja12/DocumentCollector](https://github.com/chaudharypooja12/DocumentCollector) (private)
- Source control: GitHub, with `main` as the production branch
- Hosting: Vercel
- Pull requests: Vercel Preview Deployments
- Production: automatic Vercel deployment from `main`
- Install/build: `npm ci` then `npm run build`
- Runtime: Node.js 22 LTS

Request links use the active deployment origin, so a Preview link stays on its
Preview deployment and a Production link stays on the Production domain.
Phase 1 requires no backend or product-data environment variables.

## Project Documentation — Memory Bank

This project maintains a full **Memory Bank** under `memory-bank/` as the persistent source of truth for product, technical, and implementation context. **Any contributor or coding agent must read `AGENT.md` and `memory-bank/INDEX.md` before making changes.**

```
memory-bank/
├── INDEX.md                       Start here
├── PRD.md                         Product requirements
├── COMPANY.md                     MBWays ownership, company facts, and branding
├── TECH_STACK.md                  Technical requirements and stack
├── DESIGN.md                      UI/UX and visual system
├── ARCHITECTURE.md                System architecture and decisions
├── MODELS.md                      Data models, schema, and indexing
├── PHASE_1_FRONTEND.md            Phase 1 task checklist
├── PHASE_2_BACKEND.md             Phase 2 task checklist
├── PHASE_3_PAYMENT_GATEWAY.md     Phase 3 task checklist
├── RECENT_CHANGES.md
└── modules/
    ├── admin.md
    ├── user-upload.md
    ├── document-capture.md
    ├── pdf-generation.md
    └── link-management.md
```

## Getting Started (Phase 1)

```bash
# install exact dependencies
npm ci

# run the dev server
npm run dev

# quality checks
npm run lint
npm run type-check
npm test
npm run test:e2e

# build
npm run build
```

Use Node.js 22 (`.nvmrc`). Playwright browser binaries can be installed with
`npx playwright install chromium webkit`.

> Environment variables and Supabase setup instructions will be added here once Phase 2 begins (see `memory-bank/PHASE_2_BACKEND.md`).

## Folder Structure

```
project/
├── src/
│   ├── app/         Next.js routes ((admin) and (public) groups)
│   ├── components/  Admin, brand, capture, shared, and shadcn UI components
│   ├── data/        Typed Phase 1 demonstration fixtures
│   ├── features/    Feature state and composed flows
│   ├── providers/   In-memory application providers
│   └── lib/         Flat shared libraries (image processing, PDF, request links)
├── tests/
│   ├── component/   React component behavior
│   ├── e2e/         Playwright browser journeys and responsive matrix
│   ├── privacy/     Phase 1 source guards
│   └── unit/        Domain and library tests
├── public/brand/   Canonical MBWays logo assets
├── memory-bank/    Persistent project context (see above)
├── AGENT.md         Mandatory project workflow and business rules
└── README.md        This file
```

Playwright reports, screenshots, traces, and TypeScript incremental metadata are
generated under ignored `.artifacts/`; they are not source files.

## Contributing

1. Read `AGENT.md`.
2. Read `memory-bank/INDEX.md`.
3. Follow the relevant flat phase checklist in `memory-bank/`.
4. Update the Memory Bank after every change (mandatory — see `AGENT.md`).
