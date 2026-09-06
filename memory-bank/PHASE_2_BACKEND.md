# Phase 2 — Backend (Supabase)

**Stack:** Supabase (Postgres, Auth, Storage, Edge Functions), integrated into the existing Next.js app.
**Scope:** Add the first persistent data layer to the complete Phase 1 UI:
Supabase-backed records, private uploads, authoritative links/locks,
server-generated PDFs, and Admin authentication. Phase 1 has no persistence to
migrate.
**Related docs:** `PRD.md`, `TECH_STACK.md` §7, `ARCHITECTURE.md` §3–5, `MODELS.md`

---

## 1. Supabase Project Setup

- [ ] Create Supabase project (dev + production environments)
- [ ] Configure environment variables/secrets in Vercel and GitHub Actions (never expose service role key client-side)
- [ ] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr` or equivalent for Next.js)
- [ ] Set up local Supabase CLI + migrations folder (`supabase/migrations`)

---

## 2. Database Schema & Migrations

- [ ] Create migration for `admins` table
- [ ] Create migration for `users` table
- [ ] Create migration for `document_template_items` table
- [ ] Create migration for `links` table
- [ ] Create migration for `document_captures` table
- [ ] Create migration for `submissions` table
- [ ] Create migration for `generated_pdfs` table
- [ ] Create all enum types per `MODELS.md` §3
- [ ] Create all indexes per `MODELS.md` §5
- [ ] Add foreign key constraints + cascade rules (define delete behavior per entity)
- [ ] Seed script for local/dev testing (sample admin + user + template)

---

## 3. Storage Buckets

- [ ] Create `raw-captures` bucket (private)
- [ ] Create `generated-pdfs` bucket (private)
- [ ] Configure storage policies: no public listing; access only via signed URLs
- [ ] Define storage path conventions per `MODELS.md` §6
- [ ] Implement cleanup/retention job for `raw-captures` after successful PDF generation (decision: keep or purge — record in architecture decision log)

---

## 4. Admin Authentication

- [ ] Enable Supabase Auth (email/password, or magic link — decide and record)
- [ ] Build Admin login screen
- [ ] Build session/middleware protection for all `app/(admin)/*` routes
- [ ] Handle logout
- [ ] Handle session expiry/refresh
- [ ] Unit/integration test: unauthenticated request to any admin route/API is rejected

---

## 5. Row Level Security (RLS) Policies

- [ ] Enable RLS on all tables
- [ ] Policy: `admins` can only read/write rows scoped to their own `admin_id`
- [ ] Policy: public token-based flows do **not** use RLS-authenticated client access — routed through Edge Functions using service role internally
- [ ] Test policies with both authenticated admin and anonymous requests to confirm isolation

---

## 6. Edge Functions — Link Management (Authoritative)

- [ ] `generate-link` — creates `links` row with secure token, computes `expires_at` (validate `expiry_hours` 1–6)
- [ ] `resolve-link` — given token, returns current state (`ACTIVE`/`EXPIRED`/`SUBMITTED`) + required documents; computes expiry at read-time
- [ ] `reactivate-link` — admin-only; resets link to `ACTIVE`, increments `reactivated_count`, preserves existing `document_captures`
- [ ] Centralized validation helper used by every public endpoint: token exists → not expired → not already submitted (unless reactivated)
- [ ] Rate limiting on `resolve-link` and other public endpoints (basic IP/token-based throttling)
- [ ] Unit tests: expiry boundary (exactly 6h, just before/after), already-submitted rejection, reactivation flow

---

## 7. Edge Functions / API — Document Capture Upload

- [ ] `upload-document-capture` — validates link is `ACTIVE`, validates MIME type + size, stores image in `raw-captures`, writes `document_captures` row
- [ ] Support replace/retake (increment `replaced_count`, overwrite storage object or version it — decide and record)
- [ ] Reject uploads if link is `EXPIRED` or `SUBMITTED` (unless in reactivated edit mode)

---

## 8. Edge Functions — Submission & PDF Generation

- [ ] `submit-documents` — re-validates link state, checks all required documents present (per `MODELS.md` §7 validation rules), marks `submissions.status = PROCESSING`, sets `links.status = SUBMITTED`
- [ ] Server-side PDF generation function (authoritative, using `pdf-lib`/`pdfkit` in the Edge/serverless runtime)
  - [ ] Single-document page generation
  - [ ] Front+Back combined-page generation
  - [ ] Combined PDF assembly
  - [ ] Individual PDF assembly
  - [ ] Write outputs to `generated-pdfs` bucket, create `generated_pdfs` rows
  - [ ] Update `submissions.status = COMPLETED`, `pdf_status = GENERATED` (or `REGENERATED` on re-submission)
- [ ] Handle generation failure: `submissions.status = FAILED`, surfaced to Admin for retry
- [ ] Unit/integration test: full upload→submit→generate flow against a Supabase test project

---

## 9. Admin-Side API Wiring (Replace Fixtures and Ephemeral State)

- [ ] Users: create/list/detail wired to Supabase (`users` table)
- [ ] Document Templates: CRUD + reorder wired to Supabase (`document_template_items`)
- [ ] Link Generation & Reactivation: wired to Edge Functions from §6
- [ ] Submission Management: wired to real `submissions` + `document_captures` data
- [ ] PDF Management: download combined/individual PDFs via signed URLs from `generated-pdfs`
- [ ] Dashboard counts: real aggregate queries (total users, active/expired/submitted links)

---

## 10. Public-Side API Wiring (Replace URL Payload and Local-Only Result)

- [ ] Link landing/state resolver wired to `resolve-link` Edge Function
- [ ] Document capture upload wired to `upload-document-capture`
- [ ] Submission wired to `submit-documents`
- [ ] Success/download screen wired to signed URL for combined PDF
- [ ] Expired/Locked screens driven by real server-computed state (no client-only mock logic remaining)

---

## 11. Security Hardening

- [ ] Confirm no service role key or Supabase secret is present in any client bundle (build audit)
- [ ] Confirm signed URLs for storage have short expiry
- [ ] Confirm rate limiting is active on all public endpoints
- [ ] Confirm structured logs contain no PII/raw document data (per `TECH_STACK.md` §10)
- [ ] Penetration-style manual test: attempt to access another user's link data via guessed/incremented tokens

---

## 12. CI/CD Extension

- [ ] Add Supabase CLI to GitHub Actions pipeline
- [ ] Add migration-apply step (dev/preview and production, gated appropriately)
- [ ] Manage Supabase secrets via GitHub Environments
- [ ] Add integration test job that spins up/uses a test Supabase project

---

## 13. Monitoring & Logging

- [ ] Integrate error tracking (e.g., Sentry) for Edge Functions and frontend
- [ ] Structured event logs: link created, submitted, expired-hit, reactivated, PDF generated/failed
- [ ] Basic ops dashboard or query set for support/debugging

---

## 14. Testing & QA

- [ ] Integration test suite covering full end-to-end flow against real Supabase (test project)
- [ ] Regression test: Phase 1 UI still functions correctly against real backend (no behavior drift)
- [ ] Load/performance sanity check on PDF generation Edge Function

---

## 15. Wrap-Up

- [ ] Update `MODELS.md` if schema deviated during implementation
- [ ] Update `ARCHITECTURE.md` §9 decision log with any resolved decisions (expiry storage approach, reactivation semantics, retention policy, etc.)
- [ ] Update `modules/*.md` for every module touched
- [ ] Update `RECENT_CHANGES.md`
- [ ] Update `memory-bank/INDEX.md` status snapshot (Phase 2 → In Progress/Complete)
