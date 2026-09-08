# Data Models

**Project:** DocumentCollector - Powered by MBWays
**Related docs:** `TECH_STACK.md`, `ARCHITECTURE.md`, `PHASE_2_BACKEND.md`

> These models are the source of truth for the Phase 2 Postgres schema
> (Supabase). Phase 1 has no database or browser persistence and uses only the
> transient link/session types below.

## 0. Phase 1 Transient Types (Not Stored)

```ts
type Phase1RequestPayloadV1 = {
  version: 1;
  requestId: string;
  createdAt: string;
  expiresAt: string;
  documents: Array<{
    id: string;
    name: string;
    type: "SINGLE" | "FRONT_BACK";
    sortOrder: number;
  }>;
};

type Phase1RequestPayloadV2 = Omit<Phase1RequestPayloadV1, "version"> & {
  version: 2;
  payment: {
    countryCode: "IN" | "AE";
    currency: "INR" | "AED";
    amountMinor: number;
    gateway: "RAZORPAY_MOCK";
    priceRevision: number;
    linkRevision: number;
  };
};

type Phase1RequestPayload = Phase1RequestPayloadV1 | Phase1RequestPayloadV2;

type Phase1Capture = {
  documentId: string;
  side: "SINGLE" | "FRONT" | "BACK";
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
};
```

- `Phase1RequestPayload` is encoded in the generated URL fragment.
- It contains no User name, phone, email, address, image, payment credential, or
  other PII. Version 2 includes only a billing country code and fixed-price
  snapshot selected by the Admin.
- `Phase1Capture` exists only in current-page React memory.
- No Phase 1 type is written to localStorage, sessionStorage, IndexedDB,
  cookies, a backend, or a database.
- The implemented types and validation live in `../src/lib/request-link.ts`
  and `../src/features/user-upload/`; captures are released after local PDF
  generation or flow teardown.
- The entities below are Phase 2 persistence targets, not Phase 1 stores.

---

## 1. Entity Overview

```
Admin
  └── has many → User
                   ├── has many → DocumentTemplateItem (ordered, per-user document config)
                   ├── has one  → Link (temporary access token)
                   │                 └── has many → DocumentCapture (front/back images)
                   └── has one  → Submission
                                     └── has one → GeneratedPdfSet (combined + individual)
```

---

## 2. Entities

### 2.1 `admins`

| Field      | Type         | Notes                |
| ---------- | ------------ | -------------------- |
| id         | uuid, PK     |                      |
| email      | text, unique | Supabase Auth linked |
| name       | text         |                      |
| created_at | timestamptz  |                      |

### 2.2 `users` (the person whose documents are being collected — not an app "account")

| Field        | Type                  | Notes |
| ------------ | --------------------- | ----- |
| id           | uuid, PK              |       |
| admin_id     | uuid, FK → admins.id  |       |
| name         | text                  |       |
| phone_number | text                  |       |
| email        | text                  |       |
| country      | text                  |       |
| created_at   | timestamptz           |       |
| submitted_at | timestamptz, nullable |       |

### 2.3 `document_template_items` (per-user configured required documents, ordered)

| Field         | Type                         | Notes                          |
| ------------- | ---------------------------- | ------------------------------ |
| id            | uuid, PK                     |                                |
| user_id       | uuid, FK → users.id          |                                |
| document_name | text                         | e.g. "Passport", "Photograph"  |
| document_type | enum(`SINGLE`, `FRONT_BACK`) |                                |
| sort_order    | integer                      | drag-and-drop order, ascending |
| created_at    | timestamptz                  |                                |

### 2.4 `links`

| Field             | Type                                   | Notes                                     |
| ----------------- | -------------------------------------- | ----------------------------------------- |
| id                | uuid, PK                               |                                           |
| user_id           | uuid, FK → users.id, unique            | one active link per user                  |
| token             | text, unique, indexed                  | random ≥128-bit token, used in public URL |
| status            | enum(`ACTIVE`, `EXPIRED`, `SUBMITTED`) |                                           |
| expiry_hours      | integer                                | admin-configured, max 6                   |
| expires_at        | timestamptz                            | computed at creation/reactivation         |
| reactivated_count | integer, default 0                     | audit trail of reactivations              |
| created_at        | timestamptz                            |                                           |
| submitted_at      | timestamptz, nullable                  |                                           |

### 2.5 `document_captures` (uploaded images per document/side)

| Field                     | Type                                  | Notes                                |
| ------------------------- | ------------------------------------- | ------------------------------------ |
| id                        | uuid, PK                              |                                      |
| link_id                   | uuid, FK → links.id                   |                                      |
| document_template_item_id | uuid, FK → document_template_items.id |                                      |
| side                      | enum(`SINGLE`, `FRONT`, `BACK`)       | `SINGLE` when document_type = SINGLE |
| storage_path              | text                                  | path in `raw-captures` bucket        |
| width                     | integer                               | post-processing pixel width          |
| height                    | integer                               | post-processing pixel height         |
| captured_at               | timestamptz                           |                                      |
| replaced_count            | integer, default 0                    | increments on retake/replace         |

### 2.6 `submissions`

| Field        | Type                                                 | Notes |
| ------------ | ---------------------------------------------------- | ----- |
| id           | uuid, PK                                             |       |
| link_id      | uuid, FK → links.id, unique                          |       |
| status       | enum(`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) |       |
| submitted_at | timestamptz                                          |       |
| pdf_status   | enum(`NOT_GENERATED`, `GENERATED`, `REGENERATED`)    |       |

### 2.7 `generated_pdfs`

| Field                     | Type                           | Notes                           |
| ------------------------- | ------------------------------ | ------------------------------- |
| id                        | uuid, PK                       |                                 |
| submission_id             | uuid, FK → submissions.id      |                                 |
| type                      | enum(`COMBINED`, `INDIVIDUAL`) |                                 |
| document_template_item_id | uuid, nullable, FK             | set only when type=INDIVIDUAL   |
| storage_path              | text                           | path in `generated-pdfs` bucket |
| page_count                | integer                        |                                 |
| generated_at              | timestamptz                    |                                 |

---

## 3. Enumerations Summary

| Enum                     | Values                                         |
| ------------------------ | ---------------------------------------------- |
| `document_type`          | `SINGLE`, `FRONT_BACK`                         |
| `link.status`            | `ACTIVE`, `EXPIRED`, `SUBMITTED`               |
| `document_captures.side` | `SINGLE`, `FRONT`, `BACK`                      |
| `submissions.status`     | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `pdf_status`             | `NOT_GENERATED`, `GENERATED`, `REGENERATED`    |
| `generated_pdfs.type`    | `COMBINED`, `INDIVIDUAL`                       |

> Note: `EXPIRED` may be computed at read-time (`now() > expires_at`) rather than stored, to avoid stale state; `REACTIVATED` is represented as `status = ACTIVE` with `reactivated_count > 0`, not a separate stored status — keep implementation consistent with whichever approach is chosen and document the decision in `ARCHITECTURE.md` §9.

---

## 4. Relationships Diagram (textual)

```
admins (1) ───< users (many)
users (1) ───< document_template_items (many, ordered)
users (1) ─── links (1, unique)
links (1) ───< document_captures (many)
links (1) ─── submissions (1, unique)
submissions (1) ───< generated_pdfs (many: 1 combined + N individual)
document_template_items (1) ───< document_captures (many: up to 2 — front/back)
document_template_items (1) ─── generated_pdfs (0..1 individual)
```

---

## 5. Indexing Requirements

- [ ] `links.token` — unique index (primary lookup path for the entire public flow).
- [ ] `users.admin_id` — index for Admin dashboard listing/filtering.
- [ ] `document_captures.link_id` — index for assembling a submission's documents.
- [ ] `document_template_items.user_id, sort_order` — composite index for ordered retrieval.
- [ ] `submissions.link_id` — unique index.
- [ ] `generated_pdfs.submission_id` — index for PDF retrieval.
- [ ] Consider partial index on `links` where `status = 'ACTIVE'` for fast active-link expiry sweep jobs.

---

## 6. Storage Layout

```
raw-captures/
  {link_id}/
    {document_template_item_id}/
      front.jpg
      back.jpg          (only if FRONT_BACK)

generated-pdfs/
  {submission_id}/
    combined/Complete_Documents.pdf
    individual/{document_name_sanitized}.pdf
```

---

## 7. Validation Rules (Data-Level)

- [ ] `links.expiry_hours` must be `1 ≤ x ≤ 6`.
- [ ] A `links` row cannot transition to `ACTIVE` writes once `status = 'SUBMITTED'` except via the explicit reactivation operation.
- [ ] `document_captures.side = 'FRONT'/'BACK'` only valid when the related `document_template_items.document_type = 'FRONT_BACK'`; `SINGLE` only valid when `document_type = 'SINGLE'`.
- [ ] A submission cannot be marked `COMPLETED` unless every required `document_template_items` row has its corresponding capture(s) present (front+back both present for FRONT_BACK; one for SINGLE).
