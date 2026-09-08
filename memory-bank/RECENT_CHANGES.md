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

## 2026-09-08 — User capture flow simplified and per-document progress fixed

- Module(s): user-upload, document-capture
- Summary: Removed redundant copy from the public capture screen: the "Capture your documents"/"Follow the checklist below" heading, the single-submission reminder alert, the "Entered on this device only" Basic Details subheading, and the "Front and back · one shared A4 page" subheading (single-capture documents keep "One image · one A4 page"). Fixed the progress bar/footer counting bug where a front+back document counted as 2 toward the total instead of 1 — `completed`/`required` in `capture-store.tsx` now count fully-captured documents, not individual capture sides, so requesting 2 documents shows "X of 2" instead of "X of 3". Changed the per-slot Capture button to the primary MBWays orange gradient with white text instead of the neutral secondary style. Updated the affected Playwright flow for the camera dialog's auto-advance-without-closing behavior and fixed a pre-existing `getByLabel` ambiguity between the Permanent Address field and the "same as permanent address" checkbox.
- Files touched: `src/features/user-upload/user-flow.tsx`, `src/features/user-upload/capture-store.tsx`, `src/components/capture/capture-slot.tsx`, `tests/e2e/user-flow.spec.ts`, and affected `memory-bank/**` files
- Follow-ups: none.

## 2026-09-08 — Settings full-width layout and hollow input shadows

- Module(s): admin
- Summary: Fixed the Settings page being visibly narrower than every other Admin page — its `Card` was constrained with `max-w-2xl` while Dashboard, Users, Create Request, and Logs all fill the full `page-shell` width. Removed the constraint and restructured the form into a responsive two-column field grid inside a full-width `Card`, matching the rest of the Admin panel. Added a themed inset "hollow" shadow (`--shadow-field` token and `.field-shadow` utility, tuned per Light/Dark theme) to `Input` and the `Select` trigger, replacing their raised `shadow-sm`, so empty fields visually read as containers waiting for input rather than solid raised buttons.
- Files touched: `src/app/(admin)/admin/settings/page.tsx`, `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/app/globals.css`, and affected `memory-bank/**` files
- Follow-ups: none.

## 2026-09-08 — CamScanner-style automatic document capture

- Module(s): document-capture, user-upload
- Summary: Fixed the guide border's core bug — readiness was previously derived purely from a lighting/contrast heuristic (`assessGuideFrame`) and ignored whether OpenCV had actually detected the document's four corners, so the red/green indicator was disconnected from real edge detection. Added `evaluateReadiness` (requires an actual detection plus acceptable lighting) and `cornersMovement` (stability comparison between frames) as pure, unit-tested functions in `image-processing.ts`. The live camera view now draws an overlay polygon tracking the detected document edges (`mapObjectCoverPoint` correctly accounts for the video's `object-fit: cover` crop). Once the detected quadrilateral is present and held steady for several analysis ticks, the camera captures automatically, perspective-corrects, and calls `onAccept` without a manual tap or review step; the dialog then auto-advances to the next required document/side (`orderedCaptureTargets`/`nextCaptureTarget` in `capture-store.tsx`) while keeping the same live camera session open, so each page auto-clears without reopening the camera. A short cooldown plus a "Captured — show the next page" indicator prevent double-capturing the same still-held page. Manual capture and file selection remain as explicit fallbacks with their original Retake/Use Photo review step, preserving existing test coverage for those paths.
- Files touched: `src/lib/image-processing.ts`, `src/components/capture/camera-dialog.tsx`, `src/features/user-upload/capture-store.tsx`, `src/features/user-upload/user-flow.tsx`, `tests/unit/image-processing.test.ts`, `tests/unit/capture-store.test.ts`, and affected `memory-bank/**` files
- Follow-ups: Verify auto-capture stability/cooldown thresholds on real Android Chrome and iOS Safari devices; tune `STABILITY_TOLERANCE`/`AUTO_CAPTURE_STABLE_FRAMES`/`AUTO_CAPTURE_COOLDOWN_MS` only from verified device findings.

## 2026-09-07 — India/UAE mock payment UI implemented

- Module(s): admin, user-upload, link-management, payment planning
- Summary: Added an explicitly no-charge, frontend-only payment prototype for
  India/INR and UAE/AED. Admin settings now hold country prices in memory, paid
  version-2 request links snapshot the selected country/currency/integer amount,
  and the User flow collects documents before offering deterministic mock
  success, decline, and cancellation outcomes. Cancel/failure preserves captures
  for same-tab retry; mock success exclusively unlocks local PDF generation,
  submission success, download, and sharing. Added a standalone Admin lifecycle
  fixture page for 1–24 hour extension, token rotation, original/latest
  repricing, retained uploads, deletion, late payment, superseded attempts, and
  duplicate-refund states. Version-1 links remain compatible, no payment
  credentials/provider SDK/API/persistence were added, and privacy guards plus
  payment-focused automated coverage were updated.
- Files touched: `src/lib/payment-demo.ts`, `src/lib/request-link.ts`,
  `src/providers/payment-demo-provider.tsx`, Admin settings/request/payment-demo
  surfaces, `src/features/user-upload/**`, affected tests, `README.md`,
  `AGENT.md`, and affected `memory-bank/**` files
- Follow-ups: The added payment tests were not executed per the requested
  lint-and-build-only validation scope. Real Razorpay orders, signed webhooks,
  persistent uploads, authoritative expiry/revocation, payment reconciliation,
  and INR settlement remain Phase 2/3 work.

## 2026-09-07 — Admin dashboard/Users redesign and User Basic Details

- Module(s): admin, user-upload, project setup
- Summary: Simplified the Dashboard to four stat cards (Total profiles with a View link, Pending with a hover explanation, Male users, Female users) and removed the "Collect documents without the back-and-forth" subheading plus the "Recent demonstration activity" and "Private by design" cards. Merged the former separate Submissions and PDF Management pages into a single Users page with status/gender filters and per-row View (submission preview Dialog), Update (editable profile Dialog with a same-as-permanent-address checkbox), and Delete (confirmation Dialog) actions; removed the redundant "static preview" subheading. Added a Logs page and moved Settings/Logs to the bottom of Admin navigation. Added a themed MBWays-colored scrollbar globally, icons on every Admin page heading, a shadcn Dialog and Checkbox primitive, and a new Basic Details step (Full Name, Age, Gender, Phone, Permanent/Residence Address) in the public User flow that stays in-memory only and is never encoded in the link. Clarified in the Memory Bank that each link accepts a single submission before locking.
- Files touched: `src/app/(admin)/admin/**`, `src/components/admin/**`, `src/components/ui/dialog.tsx`, `src/components/ui/checkbox.tsx`, `src/data/admin-fixtures.ts`, `src/features/user-upload/user-flow.tsx`, `src/app/globals.css`, `tests/e2e/**`, and affected `memory-bank/**` files
- Follow-ups: Complete deployed Vercel and physical-device acceptance checks; Phase 2 will persist real profiles/submissions and enforce the single-submission lock authoritatively.

## 2026-09-07 — Reusable Admin data tables added

- Module(s): admin
- Summary: Replaced static Admin record lists with a reusable shadcn-style table pattern across Users, Submissions, and PDF Management. Added responsive contained scrolling, cross-column search, five-row pagination, result counts, empty states, and filtered CSV export while retaining Phase 1's static demonstration-only data contract.
- Files touched: `src/components/admin/data-table.tsx`, `src/components/ui/table.tsx`, Admin list pages, demonstration fixtures, component/E2E tests, and affected `memory-bank/**` files
- Follow-ups: Connect the same table contract to authoritative server-side queries and permission-aware exports in Phase 2.

## 2026-09-07 — UI foundation, Admin shell, and project structure refined

- Module(s): admin, user-upload, document-capture, link-management, pdf-generation, project setup
- Summary: Replaced the fragile nested SVG/Next Image logo path with the canonical inline MBWays layer composition, added semantic Light/Dark tokens with Light as the non-persistent default, introduced reusable shadcn/Radix UI primitives, and migrated the landing, login, Admin, capture, and public flows away from the monolithic custom UI file. Added a bordered responsive Admin sidebar and sticky top bar with page context, theme switch, mobile navigation Sheet, and Logout-to-preview action. Consolidated all tests under `tests/`, moved generated reports and TypeScript metadata under ignored `.artifacts/`, flattened shared libraries, and removed redundant one-line module re-export folders.
- Files touched: `src/app/**`, `src/components/**`, `src/data/**`, `src/features/**`, `src/lib/**`, `src/providers/**`, `tests/**`, `components.json`, `package*.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `.prettierignore`, `README.md`, and affected `memory-bank/**` files
- Follow-ups: Complete deployed Vercel and physical Android/iOS acceptance checks before marking Phase 1 fully complete.

## 2026-09-07 — Phase 1 release published and CI verified

- Module(s): project setup and deployment
- Summary: Published the locally verified Phase 1 implementation to the private repository's `main` branch and confirmed the GitHub Actions quality job passes installation, lint, strict type-checking, 30 unit/component/privacy tests, and the production build on Node.js 22. Updated the official checkout and setup-node actions to their Node.js 24-based v5 runtimes after GitHub reported the v4 runtime deprecation.
- Files touched: `.github/workflows/ci.yml`, `memory-bank/PHASE_1_FRONTEND.md`, `memory-bank/RECENT_CHANGES.md`
- Follow-ups: Connect the repository to Vercel and complete the physical Android/iOS camera, rotation, QR, Web Share, and low-memory acceptance matrix before marking Phase 1 fully complete.

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
