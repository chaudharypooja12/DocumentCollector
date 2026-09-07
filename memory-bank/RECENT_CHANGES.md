# Changelog / Recent Changes

**Project:** DocumentCollector - Powered by MBWays

This file is a chronological, append-only log. Every coding agent **must** add an entry here after completing a task (see `../AGENT.md`). Newest entries appear at the top.

Entry format:
```
## YYYY-MM-DD — <short title>
- Module(s): <module names>
- Summary: <what changed and why>
- Files touched: <key files/dirs>
- Follow-ups: <anything left for later, or "none">
```

---

## 2026-09-07 — Phase 1 frontend implemented and locally verified
- Module(s): admin, user-upload, document-capture, pdf-generation, link-management, project setup and deployment
- Summary: Implemented the complete mobile-first Phase 1 frontend in a standard `src/` Next.js structure. Added the MBWays landing page, local-only Admin sign-in preview, responsive Admin demonstration screens, functional request builder and sharing, PII-free URL-fragment contract, no-login User resolver/checklist, camera and file fallback, pinned local OpenCV contour/perspective pipeline, in-memory capture lifecycle, client-side A4 combined/individual PDF generation, current-tab submitted lock, CI, privacy guards, unit/component tests, cross-browser Playwright journeys, viewport-matrix validation, and Vercel-ready configuration. Development CSP now permits React/Turbopack `unsafe-eval` diagnostics while production omits that source. Final release review also added cancellation-safe camera startup, actionable oversized-link validation, and a non-crashing share fallback when a valid link exceeds QR capacity.
- Files touched: `src/**`, `tests/**`, `e2e/**`, `public/opencv/**`, `.github/workflows/ci.yml`, `package*.json`, `next.config.ts`, `vercel.json`, project configuration, `README.md`, and affected `memory-bank/**` files
- Follow-ups: Connect the private repository to Vercel, confirm GitHub/Vercel deployment checks, and complete the physical Android/iOS camera, rotation, QR, Web Share, and low-memory acceptance matrix before marking Phase 1 fully complete.

## 2026-09-07 — Project foundation published to GitHub
- Module(s): project setup and deployment
- Summary: Published the MBWays-branded DocumentCollector foundation to the private GitHub repository's `main` branch, including the Memory Bank, root agent guidance, project README, ignore rules, and canonical brand assets.
- Files touched: `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Scaffold the Phase 1 Next.js application, configure GitHub Actions, and connect the private repository to Vercel.

## 2026-09-07 — Private GitHub repository connected
- Module(s): project setup and deployment
- Summary: Connected the local DocumentCollector workspace to the private `chaudharypooja12/DocumentCollector` GitHub repository, preserved its existing initialization commit, documented the repository as the source of truth, and added Next.js, Vercel, environment, test-output, log, editor, and operating-system ignore rules for the first project-content commit.
- Files touched: `.gitignore`, `README.md`, `memory-bank/INDEX.md`, `memory-bank/TECH_STACK.md`, `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Push the committed project foundation when explicitly requested, then import the private repository into Vercel after the Next.js application is scaffolded.

## 2026-09-07 — GitHub-to-Vercel deployment stack finalized
- Module(s): project setup and deployment
- Summary: Confirmed GitHub as the source repository and Vercel Git integration as the hosting/deployment path. Defined pull-request Preview Deployments, `main`-branch Production deployment, Node.js 22 LTS, `npm ci`/`npm run build`, HTTPS camera verification, active-origin request links, security-header checks, and zero Phase 1 product secrets.
- Files touched: `README.md`, `memory-bank/TECH_STACK.md`, `memory-bank/ARCHITECTURE.md`, `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Apply these settings after the Next.js project is scaffolded and the GitHub repository is created.

## 2026-09-07 — Phase 1 stack and frontend-only architecture finalized
- Module(s): admin, user-upload, document-capture, pdf-generation, link-management
- Summary: Finalized Phase 1 as a mobile-first, frontend-only implementation with no backend, database, authentication, upload, or browser persistence. Selected Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui with Base UI, React Hook Form, Zod, dnd-kit, locally hosted OpenCV.js, Canvas, pdf-lib, qrcode.react, Vitest/RTL, and Playwright. Defined PII-free URL-fragment request links, in-memory captures, on-device PDF generation, current-tab-only lock behavior, responsive viewport coverage, privacy limits, and Phase 1 UX improvements.
- Files touched: `README.md`, `AGENT.md`, `memory-bank/INDEX.md`, `memory-bank/PRD.md`, `memory-bank/TECH_STACK.md`, `memory-bank/DESIGN.md`, `memory-bank/ARCHITECTURE.md`, `memory-bank/MODELS.md`, `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/PHASE_2_BACKEND.md`, `memory-bank/modules/*.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Scaffold the Next.js application and implement `PHASE_1_FRONTEND.md` in checklist order.

## 2026-09-07 — MBWays ownership and branding documented
- Module(s): admin, user-upload, pdf-generation, shared design (documentation and assets)
- Summary: Established DocumentCollector as an MBWays-owned tool presented as `DocumentCollector - Powered by MBWays`; imported the canonical theme-aware logo asset set; documented current company identity, contact/social details, visual tokens, compliance positioning, UI placement rules, and the decision to keep generated document PDFs unbranded by default.
- Files touched: `public/brand/*`, `README.md`, `AGENT.md`, `memory-bank/COMPANY.md`, `memory-bank/INDEX.md`, `memory-bank/PRD.md`, `memory-bank/DESIGN.md`, `memory-bank/ARCHITECTURE.md`, `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/modules/admin.md`, `memory-bank/modules/user-upload.md`, `memory-bank/modules/pdf-generation.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Implement the documented MBWays brand lockup when the Phase 1 Next.js shared layouts are built.

## 2026-09-07 — Agent guidance consolidated
- Module(s): all (documentation only)
- Summary: Removed the reserved `AGENTS.md` placeholder and consolidated the project to a single root `AGENT.md` instruction file as requested.
- Files touched: `AGENT.md`, `AGENTS.md`, `README.md`, `memory-bank/ARCHITECTURE.md`, `memory-bank/PRD.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: none

## 2026-09-07 — Memory Bank flattened and agent guidance separated
- Module(s): all (documentation only)
- Summary: Reorganized the Memory Bank using the portfolio repository's flat convention while preserving all product, technical, module, phase, and historical content. Moved project-owned workflow and non-negotiable rules to `AGENT.md`; reserved `AGENTS.md` for framework/tool-generated guidance.
- Files touched: `memory-bank/**`, `AGENT.md`, `AGENTS.md`, `README.md`
- Follow-ups: Begin the remaining Phase 1 implementation tasks.

## Template Entry (example — remove or replace once real entries exist)

## 2026-09-05 — Memory Bank initialized
- Module(s): all (documentation only)
- Summary: Initial Memory Bank scaffolded from PRD source document — created `PRD/prd.md`, `TRD/trd.md`, `design/design.md`, `architecture/architecture.md`, `models/models.md`, `phases/phase_1_frontend.md`, `phases/phase_2_backend.md`, `phases/phase_3_payment_gateway.md`, module `context.md` files, `index.md`, `AGENTS.md`, `README.md`. No code written yet.
- Files touched: `memory-bank/**`, `AGENTS.md`, `README.md`
- Follow-ups: Begin Phase 1 task list in `phases/phase_1_frontend.md`.

> Historical paths above record the structure that existed on that date and were
> superseded by the 2026-09-07 migration.
