# Architecture Document

**Project:** DocumentCollector - Powered by MBWays
**Related docs:** `COMPANY.md`, `PRD.md`, `TECH_STACK.md`, `MODELS.md`, `PHASE_1_FRONTEND.md`, `PHASE_2_BACKEND.md`, `PHASE_3_PAYMENT_GATEWAY.md`

---

## 1. High-Level System Overview

### 1.1 Phase 1 - Frontend only

```
Admin browser
  -> builds request in React memory
  -> encodes non-sensitive config in /u#request=<payload>
  -> shares link or QR

User phone browser
  -> opens the static Next.js /u route
  -> decodes and validates the URL fragment
  -> captures and processes images in browser memory
  -> generates PDFs locally
  -> downloads or shares files
```

There is no Phase 1 backend, database, authentication, upload, or persistence.
Vercel serves only the frontend assets.

### 1.2 Phase 2 - Persistent architecture

Phase 2 connects the existing Next.js UI to Supabase Postgres, Auth, private
Storage, and Edge Functions. The target backend design is defined in Section 3.

---

## 2. Frontend Architecture (Next.js)

### 2.1 Routing

- `src/app/page.tsx` - MBWays-branded public product landing page.
- `src/app/(admin)/admin/login/page.tsx` - local-only Phase 1 sign-in UI preview;
  no authentication or route protection.
- `src/app/(admin)/admin/...` - Phase 1 Admin UI with no authentication; protected by
  Supabase Auth in Phase 2.
- `src/app/(public)/u/page.tsx` - public, unauthenticated Phase 1 flow that reads the
  request payload from `location.hash`.
- Phase 2 may introduce `app/(public)/u/[token]/...` for opaque server-issued
  tokens while preserving the public no-login behavior.

### 2.2 Folder Structure

```
project/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── page.tsx            (dashboard/demo overview)
│   │   │       ├── requests/new/        (functional link builder)
│   │   │       ├── users/               (Phase 1 fixture UI)
│   │   │       ├── submissions/         (Phase 1 fixture UI)
│   │   │       ├── pdf/                 (Phase 1 fixture UI)
│   │   │       └── settings/            (ephemeral UI)
│   │   └── (public)/
│   │       └── u/
│   │           └── page.tsx             (hash resolver + complete User flow)
│
│   ├── components/
│   │   ├── admin/                     (shell, forms, fixture views)
│   │   ├── brand/                     (deployment-safe inline MBWays logo)
│   │   ├── capture/                   (camera view and capture controls)
│   │   ├── shared/                    (brand lockup and theme control)
│   │   └── ui/                        (reusable shadcn primitives)
│
│   ├── data/
│   │   └── admin-fixtures.ts          (typed Phase 1 demonstration data)
│
│   ├── features/
│   │   └── user-upload/               (public-flow state and composed UI)
│
│   ├── providers/
│   │   └── theme-provider.tsx         (in-memory Light/Dark state)
│
│   └── lib/
│       ├── image-processing.ts        (detection, perspective, normalization)
│       ├── pdf.ts                     (pdf-lib helpers and A4 layout engine)
│       ├── request-link.ts            (payload schema, encoder, decoder)
│       └── utils.ts                   (shared class composition)
│
├── tests/
│   ├── component/
│   ├── e2e/
│   ├── privacy/
│   └── unit/
├── .artifacts/                     (ignored generated reports and metadata)
├── public/
│   └── brand/                      (canonical MBWays logo assets)
├── memory-bank/
├── AGENT.md
└── README.md
```

### 2.3 State Management

- Phase 1 uses React Context + `useReducer` only.
- Light/Dark UI state uses a root React context, defaults to Light, survives
  client navigation, and intentionally resets on refresh instead of using
  browser persistence.
- State is current-page memory and is never persisted to browser storage.
- Captures are `Blob` objects with revocable object URLs.
- Static fixture files may populate demonstration Admin screens but never accept
  or retain real User data.
- Phase 2 introduces repositories/adapters that map the UI types to Supabase.

---

## 3. Backend Architecture (Phase 2 — Supabase)

### 3.1 Components

- **Postgres Database** - core entities (see `MODELS.md`): `admins`, `users`,
  `document_template_items`, `links`, `document_captures`, `submissions`, and
  `generated_pdfs`.
- **Auth** — Supabase Auth for Admin only (email/password or magic link). No auth for the public User flow.
- **Storage** — two buckets:
  - `raw-captures` (or transient) — processed capture images pending submission.
  - `generated-pdfs` — combined + individual PDFs post-submission.
- **Edge Functions** — privileged operations that must not be trusted to the client:
  - Link token issuance & expiry calculation.
  - Server-side re-validation of link state before any mutation.
  - PDF generation (authoritative), triggered on submission and on re-submission after reactivation.

### 3.2 Row Level Security (RLS)

- [ ] Admin-authenticated tables (`admins`, admin-side views) restricted to the authenticated admin's own session.
- [ ] Public token-based access does **not** use end-user auth; instead, all public endpoints run through Edge Functions / server routes that validate the token server-side and use a service role internally (never expose service role key to the client).
- [ ] Storage objects are never publicly listable; access via signed URLs with short expiry.

### 3.3 API Style

- REST-like via Supabase client (`select`/`insert`/`update`) for straightforward CRUD from the authenticated Admin context.
- Edge Functions (HTTPS endpoints) for anything requiring token validation, expiry enforcement, or PDF generation — see `TECH_STACK.md` §7 for the endpoint list.

---

## 4. Data Flow — Key Scenarios

### 4.1 Phase 1 Link Generation

```
Admin selects document requirements and expiry (1-6h)
   -> Browser validates configuration
   -> Browser creates versioned request payload (no PII)
   -> Payload is Base64URL encoded into /u#request=<payload>
   -> Admin shares by Copy / QR / Web Share / WhatsApp / Email
```

### 4.2 Phase 1 User Capture, Mock Payment, and Local PDF

```
User opens /u#request=<payload>
   -> Browser decodes and validates schema + client-side expiry
   -> Document checklist opens automatically; no login
   -> User grants camera permission or selects the file fallback
   -> Browser processes captures into in-memory Blobs
   -> Version 1: User confirms generation
   -> Version 2: User completes a clearly labeled no-charge mock checkout
   -> Mock cancellation/failure preserves current-tab captures for retry
   -> Browser creates combined and individual PDFs with pdf-lib
   -> Current tab enters in-memory SUBMITTED state
   -> User downloads or shares PDFs
```

Closing or refreshing clears the session. Admin does not receive the captures in
Phase 1.

The Phase 1 Admin payment lifecycle page uses independent fixtures to preview
1–24 hour renewal, token rotation, repricing, retained uploads, and deletion. It
does not synchronize with or authoritatively control the public flow.

### 4.3 Phase 2 Persistent Flow

Phase 2 replaces the URL payload with an opaque server token and adds upload,
Admin retrieval, authoritative state, and reactivation:

```
Admin creates request -> server stores request and issues token
   -> User opens token -> server resolves state
   -> Captures upload to private Storage
   -> Server locks submission and generates authoritative PDFs
   -> Admin can extend the token or rotate it and revoke the old token
```

---

## 5. Security Architecture

- [x] Phase 1 links contain no PII and use a URL fragment to avoid server logs/referrers.
- [x] Phase 1 never writes request/capture/PDF data to browser persistence.
- [x] Phase 1 never sends document bytes to a server or telemetry provider.
- [x] Phase 1 UI clearly labels expiry and lock as client-side prototype behavior.
- [ ] Link tokens: cryptographically random (≥128-bit), stored hashed if feasible, never derived from predictable data (user id, timestamp, etc.).
- [ ] Expiry enforcement centralized in one Edge Function/middleware used by every public endpoint (avoid duplicated logic drifting out of sync).
- [ ] Submission lock enforcement centralized the same way.
- [ ] Admin auth required for every admin-side mutation; session validated server-side, not just hidden in UI.
- [ ] File upload validation: MIME-type allowlist (image/jpeg, image/png, image/webp), max size limit, dimension sanity checks.
- [ ] No service role keys or Supabase secrets ever shipped to the client bundle.

---

## 6. Deployment Architecture

- **Phase 1 frontend:** Vercel over HTTPS, connected to GitHub main branch
  (auto-deploy) with PR previews. No runtime product-data API.
- **Backend:** Supabase Cloud project (Phase 2); migrations version-controlled in repo (`supabase/migrations`).
- **CI/CD:** GitHub Actions runs lint, type-check, tests, and build. Vercel Git
  integration creates previews for pull requests and deploys `main` to
  Production.
- **Phase 1 environments:** local development, Vercel Preview per pull request,
  and Vercel Production from `main`; none requires product-data secrets.
- **Phase 2 environments:** add local/dev and production Supabase projects,
  migrations, and environment secrets without changing the Git-to-Vercel
  frontend flow.

---

## 7. Scalability Considerations

- Single-admin scope today; schema fields (e.g., `admin_id` foreign keys) included from the start to ease future multi-admin support without migration pain.
- Storage buckets partitioned by user/link id to keep listing and cleanup efficient.
- PDF generation is stateless per submission — can be scaled horizontally via Edge Function concurrency.

---

## 8. Third-Party Integrations

| Integration                                    | Phase | Purpose                           |
| ---------------------------------------------- | ----- | --------------------------------- |
| WhatsApp share (`wa.me` link)                  | 1     | Manual link sharing               |
| Email share (`mailto:` or transactional email) | 1–2   | Manual/automated link sharing     |
| Supabase                                       | 2     | DB, Auth, Storage, Edge Functions |
| Razorpay behind a gateway-neutral adapter      | 3     | One-time request payments          |

---

## 9. Architecture Decision Log (living section)

> Add new entries here whenever an architectural decision is made or changed. Also mirror significant entries into `RECENT_CHANGES.md`.

| Date       | Decision                                                                                                                | Reason                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-07 | GitHub is the source repository; Vercel Git integration creates pull-request previews and deploys `main` to Production. | This provides HTTPS for camera APIs, reviewable previews, and a simple frontend-only Phase 1 delivery path.                              |
| 2026-09-07 | Phase 1 uses a versioned Base64URL JSON request in the URL fragment and includes no PII.                                | A cross-device link must work without a backend; fragments are not sent in HTTP requests.                                                |
| 2026-09-07 | Phase 1 state is React memory only, with no browser or server persistence.                                              | The approved Phase 1 scope explicitly saves no information.                                                                              |
| 2026-09-07 | Phase 1 lock, expiry, Admin history, and reactivation are demonstrations, not security boundaries.                      | These behaviors cannot be authoritative without shared server state and are implemented in Phase 2.                                      |
| 2026-09-07 | OpenCV.js is locally hosted and lazy-loaded for document detection; Canvas handles normalized image output.             | Provides robust perspective correction without sending document images off-device while protecting the initial mobile bundle.            |
| 2026-09-07 | DocumentCollector uses the canonical MBWays logo from `public/brand/` and the endorsement `Powered by MBWays`.          | The product is an MBWays-owned tool and must share the parent company's identity.                                                        |
| 2026-09-07 | Generated document PDFs remain unbranded by default.                                                                    | Adding a cover, watermark, or logo would alter collected-document output and requires a separate explicit product decision.              |
| 2026-09-07 | Use the standard Next.js `src/` layout for application routes, components, modules, and libraries.                      | Keeps framework code separate from root configuration, assets, tests, and the Memory Bank.                                               |
| 2026-09-07 | The Phase 1 Admin sign-in is an explicitly non-authenticating UI preview and never submits credentials.                 | The requested entry experience can be demonstrated without contradicting the no-backend/no-auth Phase 1 boundary or leaking credentials. |
| 2026-09-07 | Development CSP allows `unsafe-eval`, while production omits it and retains `wasm-unsafe-eval`.                         | React/Turbopack require eval-based diagnostics only in development; production remains stricter while allowing local OpenCV WASM.        |
| _pending_  | _pending_                                                                                                               | _pending_                                                                                                                                |
