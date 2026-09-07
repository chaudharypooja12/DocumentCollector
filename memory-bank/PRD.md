# Product Requirements Document (PRD)

**Project:** DocumentCollector - Document Collection & Auto-PDF Generator
**Doc owner:** Product / Memory Bank
**Status:** Phase 1 implemented and locally verified; deployed and
physical-device acceptance pending
**Related docs:** `COMPANY.md`, `TECH_STACK.md`, `DESIGN.md`, `ARCHITECTURE.md`, `PHASE_1_FRONTEND.md`, `PHASE_2_BACKEND.md`, `PHASE_3_PAYMENT_GATEWAY.md`, `MODELS.md`

---

## 1. Product Overview

**Product Name:** DocumentCollector
**Functional Name:** Document Collection & Auto-PDF Generator
**Product Type:** Link-based document collection system (no end-user account required); secure authoritative collection begins in Phase 2
**Owner:** MBWays
**Brand Line:** Powered by MBWays

The purpose of this application is to let an Admin prepare a required set of
documents for a person (referred to as **User**) without that person ever
needing to sign up or create a profile.

The Admin configures exactly which documents are required. The system generates
a temporary link that the User opens on a phone. The User captures only the
requested documents and the browser arranges them into a combined A4 PDF.

In Phase 1 the link configuration travels inside the URL, all captures stay in
memory on the User's device, and the User downloads or shares the generated
PDF. Nothing is uploaded or saved. Persistent Admin access, submission history,
authoritative locking, and reactivation begin in Phase 2.

### 1.1 Ownership and Brand Requirements

- DocumentCollector is a tool owned and operated under the MBWays brand.
- Admin and public User interfaces use the canonical MBWays logo from
  `public/brand/`.
- The product name and endorsement are presented as
  **DocumentCollector - Powered by MBWays**.
- Core MBWays ownership is fixed and cannot be removed through Admin branding
  settings.
- Company facts, contact details, visual tokens, logo rules, and compliance
  positioning are maintained in `COMPANY.md`.
- Generated document PDFs are not watermarked or branded by default.

---

## 2. Core Concept — End to End Flow

```
Admin (no login in Phase 1)
  ↓
Select Required Documents
  ↓
Configure Document Type (Single / Front+Back)
  ↓
Choose Expiry (1-6 hours)
  ↓
Generate Self-Contained Temporary Link
  ↓
Send Link (Copy / QR / Web Share / WhatsApp / Email)
  ↓
User Opens Link
  ↓
Link Opens Document Checklist Automatically
  ↓
Capture Documents (camera permission + file fallback)
  ↓
Generate Documents
  ↓
Browser Validates & Generates PDF On-Device
  ↓
User Downloads / Shares Combined PDF
  ↓
Current Tab Shows Submitted / Success State
```

Phase 1 links use a versioned, Base64URL-encoded request payload in the URL
fragment. The payload includes only document labels/types/order and timestamps;
it never includes User PII or images. This design works across devices without
a backend but is not authoritative or tamper-proof.

---

## 3. User Profile

The **User** has **no login, profile, or account** in the application.

Phase 1 does not create or save a User record. Admin user records begin in
Phase 2.

### Phase 2 User Record Fields

- Name
- Phone Number
- Email
- Country
- Required Documents (configured list)
- Link Status (`ACTIVE` / `EXPIRED` / `SUBMITTED` / `REACTIVATED`)
- Submission Status (`PENDING` / `IN_PROGRESS` / `SUBMITTED`)
- Created Date
- Submitted Date
- Link Expiry (timestamp)
- PDF Status (`NOT_GENERATED` / `GENERATED` / `REGENERATED`)

---

## 4. Admin Panel

- Phase 1 has no authenticated Admin session because there is no backend.
- Phase 1 includes a clearly labeled Admin sign-in UI preview at
  `/admin/login`; it validates locally, transmits/stores no credentials, and
  does not claim to protect routes. Real authentication begins in Phase 2.
- The main functional Phase 1 Admin workflow is a mobile-responsive request
  builder that selects document requirements, expiry, and generates a link.
- Dashboard, Users, Submissions, PDF Management, and Settings are complete
  responsive UI demonstrations backed only by static fixtures or current-page
  memory. They do not claim to show real saved records.
- Phase 2 adds the single authenticated Admin and persistent records.

### Admin Modules

```
Admin Panel
│
├── Dashboard
├── Users
├── Create Request
├── Document Templates
├── Document Requests
├── Submission Management
├── PDF Management
└── Settings
```

---

## 5. Document Configuration

Admin independently decides which documents are required for each generated
request.

**Example — User A**

| #   | Document        | Type         |
| --- | --------------- | ------------ |
| 1   | Passport        | Front + Back |
| 2   | Driving License | Front + Back |
| 3   | Aadhaar Card    | Front + Back |
| 4   | Photograph      | Single Image |
| 5   | Residence Proof | Single Image |

- Admin can **drag & drop** documents to arrange the required order.

### Document Types

- **Type 1 — Single:** one image/document → one A4 PDF page.
- **Type 2 — Front + Back:** two images → one A4 PDF page (both sides on the same page).

---

## 6. Front + Back Document Logic

If a document is configured as Front + Back, the user must perform two captures:

```
Document Name
   ↓
Capture Front
   ↓
Capture Back
   ↓
System combines both
   ↓
One A4 PDF Page
```

**Important requirement:** Front and Back appear on the **same PDF page**. The system automatically resizes and positions both images so they fit properly within a single A4 page (front on top, back on bottom).

---

## 7. Single Document Logic

```
Capture Document
   ↓
Image Processing
   ↓
A4 Page
```

Every "single" document gets its own separate A4 PDF page.

---

## 8. Camera Capture Interface

- User uploads documents through a **camera-based capture UI**.
- The camera screen shows a **document positioning guide/box**.

### Capture Box States

**Incorrect Position → RED box**, shown when:

- Document is outside the box
- Corners are not clearly visible
- Document is not properly aligned
- Document does not fully fill the frame

**Correct Position → GREEN box**, shown when:

- All four corners are detected
- Document is properly aligned within the frame
- Required area is properly covered

Once green, the user is allowed to capture.

---

## 9. Document Image Processing

After capture, the system processes the image:

- Document detection
- Corner detection
- Alignment
- Perspective correction
- Cropping
- Resize
- A4 formatting

**Goal:** the user should never need to manually crop or edit the image.

---

## 10. Document Upload Flow

- User opens the link.
- Only the documents configured for that specific user are shown.

**Example screen:**

```
Document Upload

1. Photograph            [Capture]
2. Aadhaar Card          Front [Capture]  Back [Capture]
3. Driving License       Front [Capture]  Back [Capture]
4. Residence Proof       [Capture]
5. Passport              Front [Capture]  Back [Capture]

                [Generate PDF]
```

---

## 11. Edit Before Submission

Until the user submits, **edit/retake is always allowed**:

- Retake any image
- Replace an uploaded document
- Recapture Front/Back independently

---

## 12. Submission

Once all required documents are captured, the User taps **Generate Documents**
and confirms. The browser validates completeness and generates the PDF locally.
No network upload or server submission occurs in Phase 1.

**Phase 1 success message:** "Documents are ready."

After this, **Download PDF** and supported **Share PDF** options appear.

---

## 13. Link Expiry

- The user link is **temporary**.
- Admin configures the expiry duration.
- **Maximum allowed: 6 hours.**

```
Link Created → Valid → 2h / 3h / 4h ... up to 6h Maximum → Expired
```

Expired-link message: "This link has expired. Please contact your administrator."

Phase 1 checks `expiresAt` from the URL payload against the device clock. This
is a UX demonstration only. Phase 2 makes expiry server-authoritative.

---

## 14. Post-Submission Link Lock (Critical Business Rule)

Once a User generates the documents, the current Phase 1 tab enters an
in-memory `SUBMITTED` state and no longer allows edits in that tab.

Message shown: "Your documents have already been submitted. Please contact your administrator if changes are required."

Because Phase 1 saves nothing, refresh/reopen cannot preserve this lock. Phase 2
must enforce the lock server-side and across devices before production document
collection.

---

## 15. Admin Reactivation

```
Submitted
   ↓
Admin Reactivates Link
   ↓
User Opens Same Link
   ↓
Edit Mode
   ↓
Replace / Update Documents
   ↓
Submit Again
   ↓
Link Locked
```

No new link is ever generated — the Admin reactivates the **existing** link.

Reactivation is a complete UI demonstration in Phase 1 but cannot affect a link
on another device without shared state. Functional persistent reactivation is a
Phase 2 feature.

---

## 16. PDF Generation

### PDF Standard

- Format: **A4**
- Orientation: predefined system standard (portrait)
- Multiple pages supported
- Every document gets its own page
- Front + Back document = one A4 page
- Single document = one A4 page

**Example (5 documents):**

```
Page 1 → Photograph
Page 2 → Aadhaar Front + Back
Page 3 → Driving License Front + Back
Page 4 → Residence Proof
Page 5 → Passport Front + Back
Total: 5 A4 pages
```

---

## 17. PDF Download Options — Admin

Phase 1 demonstrates the Admin PDF Management UI with static fixtures. Real
User-generated PDFs exist only on the User's current device and are not
available to Admin.

Phase 2 provides:

1. **Combined PDF** — all documents in one PDF.
2. **Individual PDF** — one PDF per document.

```
Download:
├── Complete_Documents.pdf
├── Aadhaar.pdf
├── Driving_License.pdf
├── Residence_Proof.pdf
└── Passport.pdf
```

---

## 18. User/Student Download

In Phase 1 the User result screen provides the combined PDF and a Web Share
action when the device supports file sharing. Individual PDFs remain an
Admin-side capability and become functional with real submissions in Phase 2.

---

## 19. Link Sharing

Admin can manually share the generated link. Initial implementation supports:

- Copy Link
- QR code
- Native Web Share
- WhatsApp sharing
- Email sharing

---

## 20–22. Technology Phases (summary — see phase docs for detail)

| Phase   | Scope                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 | Frontend-only — Next.js, React, TypeScript, Tailwind CSS, self-contained links, in-memory capture, on-device PDFs, Vercel |
| Phase 2 | Backend — Supabase (DB, Storage, Auth, REST/RPC APIs)                                                                     |
| Phase 3 | Payment Gateway & paid features                                                                                           |

---

## 23. CI/CD

GitHub-based CI/CD pipeline:

```
Developer → GitHub → Pull Request → CI Checks → Build/Test → Deploy
```

Frontend deployment integrates with Vercel.

---

## 24. Project Folder Structure

```
project/
│
├── app/
├── components/
├── modules/
├── lib/
├── public/
│
├── memory-bank/
│   ├── INDEX.md
│   ├── PRD.md
│   ├── COMPANY.md
│   ├── TECH_STACK.md
│   ├── DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── MODELS.md
│   ├── PHASE_1_FRONTEND.md
│   ├── PHASE_2_BACKEND.md
│   ├── PHASE_3_PAYMENT_GATEWAY.md
│   ├── RECENT_CHANGES.md
│   ├── modules/
│   │   ├── admin.md
│   │   ├── user-upload.md
│   │   ├── document-capture.md
│   │   ├── pdf-generation.md
│   │   └── link-management.md
│
├── AGENT.md
└── README.md
```

---

## 25. Memory Bank Rules

The Memory Bank is the coding agent's persistent project context. It maintains:

- PRD
- Architecture
- Module context
- Recent changes
- Decisions
- Implementation notes
- Known issues
- Future changes

---

## 26. AGENT.md — Mandatory Instructions (summary)

See `../AGENT.md` for the full, enforceable instruction set. In short:

**Before every task:** read `INDEX.md` → identify the relevant module → read that module file → check `RECENT_CHANGES.md` and the relevant phase checklist → understand the existing implementation → then start coding.

**After every task:** update the relevant module file → update the phase checklist and `RECENT_CHANGES.md` → update `ARCHITECTURE.md` or `MODELS.md` when applicable → leave no new decision or implementation status undocumented. Memory Bank updates are **mandatory**.

---

## 27. UI/UX Direction

- Overall style: **MBWays Orbital Glass** — Light by default with an optional
  Dark theme, orange accents, semantic surfaces, clear border separation,
  restrained blur, and clean typography.
- Responsive, **mobile-first** Admin and User experience from 320px upward.
- Clear visual states (red/green capture box, success/error, loading).
- User side kept intentionally simple (only uploads documents).
- Admin side is comparatively feature-rich.
- No emojis — proper icon library only.

---

## 28. MVP Scope

### Included in MVP

- [x] MBWays logo and `Powered by MBWays` identity across shared Admin and public layouts
- [x] Responsive Admin UI with no Phase 1 authentication
- [x] Request builder with no stored User record or PII in the link
- [x] Document selection & drag-and-drop ordering
- [x] Single document configuration
- [x] Front + Back configuration
- [x] Temporary link (max 6-hour validity)
- [x] QR, clipboard, Web Share, WhatsApp, and email sharing
- [x] Camera capture with positioning box (red/green states)
- [x] Retake/Edit before submission
- [x] Local document generation
- [x] A4 PDF generation (Front+Back on same page)
- [x] Combined PDF + Individual PDF generation helpers
- [x] User combined PDF download and supported file sharing
- [x] Admin submission/PDF/reactivation UI demonstrations
- [x] In-memory current-tab lock after local generation
- [x] Zero persistence audit: no backend, DB, upload, browser storage, or PII in links
- [x] Glassmorphism UI (Next.js + TypeScript + Tailwind CSS)
- [x] GitHub workflow and Vercel-ready repository configuration
- [x] Memory Bank + agent instructions

### Phase 2 (Backend)

- [ ] Supabase backend (Database, Storage, REST APIs)
- [ ] Admin authentication
- [ ] CI/CD
- [ ] Production document management

### Phase 3 (Later)

- [ ] Payment Gateway & paid features

---

## 29. Out of Scope (MVP)

- Backend, database, server API, authentication, or persistent storage
- Server uploads and Admin access to User captures or generated PDFs
- Cross-device submission state, authoritative lock, and real reactivation
- Multi-tenant / multi-organization admin architecture
- End-user login/profile/account
- Payment processing (Phase 3 only)
- Native mobile apps (web-based, mobile-responsive only)
- Automated OCR/data-extraction from documents (beyond corner/edge detection for capture)

---

## 30. Assumptions & Constraints

- Users access the link primarily from mobile browsers.
- Camera/media permissions must be granted by the browser.
- Phase 1 request links carry non-sensitive configuration in a URL fragment.
- Captures and PDFs live only in current-page memory and are lost on refresh or
  close.
- Link expiry and submission lock are client-side UX only in Phase 1 and
  server-authoritative in Phase 2.
- Maximum link validity is hard-capped at 6 hours regardless of Admin input.
- A single Admin account is introduced in Phase 2.

---

## 31. Core Business Rule (One Line)

> Admin generates a temporary request link; the User opens it without login,
> captures the requested documents on a phone, and the browser creates the A4
> PDFs locally. Phase 2 adds secure upload, persistence, Admin delivery, and
> authoritative locking.
