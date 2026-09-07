# Tech Stack & Technical Requirements

**Project:** DocumentCollector - Powered by MBWays
**Status:** Phase 1 stack implemented and locally verified
**Related docs:** `COMPANY.md`, `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`,
`MODELS.md`, `PHASE_1_FRONTEND.md`, `PHASE_2_BACKEND.md`,
`PHASE_3_PAYMENT_GATEWAY.md`

## 1. Phase Boundaries

### Phase 1 - Frontend-only working product

Phase 1 delivers a complete, deployable Admin and public User interface with a
real cross-device link, camera capture, client-side image processing, and local
PDF generation.

Phase 1 has:

- no backend;
- no database;
- no API routes for product data;
- no authentication;
- no server-side file storage;
- no `localStorage`, `sessionStorage`, IndexedDB, cookies, or persisted browser
  cache for users, requests, captures, link state, or PDFs;
- no upload of captured documents to Vercel, MBWays, or any third party.

All mutable data exists only in React memory for the current page session.
Refreshing, closing, or navigating away from the flow discards it.

### Phase 2 - Persistent and authoritative product

Phase 2 adds Supabase Postgres, Auth, Storage, and server/Edge Functions. It
makes link expiry, submission locks, reactivation, Admin history, and document
delivery authoritative and persistent.

### Phase 3 - Payments

Phase 3 adds the selected payment provider after pricing and paid-feature scope
are approved.

## 2. Final Phase 1 Stack

| Concern | Selected technology | Decision |
|---|---|---|
| Runtime | Node.js 22 LTS | Local tooling and CI |
| Package manager | npm | Use the committed lockfile |
| Web framework | Next.js 16, App Router | Static/client-first frontend with route-based code splitting |
| UI runtime | React 19 | Client state and interactive camera/PDF workflows |
| Language | TypeScript 5, strict mode | No `any`; shared schemas/types across Admin and User flows |
| Styling | Tailwind CSS 4 | Mobile-first utilities and MBWays design tokens |
| UI primitives | shadcn/ui with Base UI primitives | Accessible dialogs, sheets, fields, and menus |
| Icons | `lucide-react` | No emoji-based controls |
| Forms | React Hook Form + Zod | Typed Admin request builder and client validation |
| Reordering | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Pointer, keyboard, and touch document ordering |
| Camera | Native MediaDevices API (`getUserMedia`) | Rear-camera request with manual file-input fallback |
| Image analysis | OpenCV.js WASM, pinned and lazy-loaded locally | Edge/corner detection and perspective correction |
| Image rendering | Canvas API + `createImageBitmap` | Crop, resize, normalize, and JPEG encode |
| PDF generation | `pdf-lib` | A4 combined and individual PDFs entirely on-device |
| Link transport | Versioned Base64URL JSON in URL fragment | Cross-device request configuration without storage |
| Link validation | Zod schema + strict limits | Reject malformed, oversized, unsupported, or expired payloads |
| Link sharing | Clipboard API, Web Share API, `mailto:`, `wa.me`, `qrcode.react` | Easy transfer from Admin desktop or phone to User phone |
| State | React Context + `useReducer` | In-memory only; no persistence middleware |
| Unit/component tests | Vitest + React Testing Library + user-event | Fast logic and accessibility coverage |
| Browser E2E | Playwright | Mobile viewport, camera fallback, link, and PDF workflows |
| Lint/format | ESLint + Prettier | CI-enforced consistency |
| Hosting | Vercel over HTTPS | Camera APIs require a secure context |
| Source/CI | GitHub + GitHub Actions | Lint, type-check, test, and build on pull requests |

### Explicit Phase 1 exclusions

Do not install or configure Supabase, another database, an ORM, a server-side
session library, an upload service, analytics that record request content, a
service worker that caches sensitive pages, or any authentication provider.

## 3. Phase 1 Link Contract

### 3.1 Why the request is carried in the link

An Admin-created link must open on another phone, but Phase 1 has no server or
shared storage. Therefore the link itself carries the minimum request
configuration required to render the User flow.

Recommended shape:

```text
https://<deployment>/u#request=<base64url-encoded-json>
```

The URL fragment is preferred over a query string because browsers do not send
the fragment to the web server in HTTP requests, access logs, or referrer
headers.

### 3.2 Payload

```ts
type Phase1RequestPayload = {
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
```

Rules:

- `requestId` uses `crypto.randomUUID()`.
- Expiry is one to six hours and is checked by the User browser.
- The payload contains document labels and types only.
- Never place name, phone, email, country, document images, or other PII in the
  URL.
- Limit requests to 20 document items and reject duplicate ids, blank labels,
  unsupported types, invalid dates, or oversized payloads.
- The payload is encoded, not encrypted or cryptographically trusted. A user
  can modify it. Phase 2 replaces it with an opaque, server-issued token.

### 3.3 Session behavior

- Opening a valid link renders the configured document checklist immediately;
  no login or account screen is shown.
- Captures are held as `Blob` objects and object URLs in memory.
- Submission validates completeness and generates PDFs locally.
- The current tab transitions to a submitted/success state after generation.
- Refreshing or reopening the link starts a fresh session. Persistent lock,
  cross-device submission history, Admin access to captures, and reactivation
  are Phase 2 features.
- Show a clear privacy/session notice and a `beforeunload` warning after the
  first capture.

## 4. Mobile-First Responsive Requirements

Both Admin and User interfaces are mobile-first. Desktop is an enhancement, not
the baseline.

### 4.1 Required viewport coverage

| Class | Validation widths |
|---|---|
| Small phone | 320px, 360px |
| Standard phone | 375px, 390px |
| Large phone | 412px, 430px |
| Tablet | 768px, 820px |
| Small desktop | 1024px, 1280px |
| Large desktop | 1440px and above |

Every screen must:

- avoid horizontal scrolling at 320px;
- use at least 44 x 44px interactive targets;
- respect `env(safe-area-inset-*)`;
- use `dvh`/`svh` rather than fixed `100vh` for full-screen mobile views;
- support portrait and landscape camera orientations;
- keep the primary action reachable with one hand where practical;
- collapse Admin tables into cards or horizontally contained data views;
- preserve keyboard navigation and visible focus indicators;
- honor `prefers-reduced-motion`;
- meet WCAG 2.2 AA contrast.

### 4.2 Performance budgets

- Initial `/u` route JavaScript: target under 170 KB compressed before the
  optional computer-vision chunk.
- Lazy-load OpenCV.js only when the capture screen is opened.
- Native camera preview target: 24-30 fps on a mid-range phone.
- Sample edge detection at 6-10 fps; do not process every video frame.
- Run expensive image transforms in a Web Worker where supported; provide a
  throttled main-thread fallback.
- Normalize each capture to a maximum long edge of 2400px and JPEG quality near
  0.86 unless quality tests justify a change.
- Revoke obsolete object URLs immediately after retake, replacement, submit,
  or teardown.
- Combined PDF generation for up to 10 typical normalized documents should
  complete in under 10 seconds on a mid-range phone.

## 5. Camera and Image Pipeline

1. Confirm a secure context and request `video: { facingMode: { ideal:
   "environment" } }`.
2. If permission is denied, no rear camera exists, or capture fails, offer an
   `<input type="file" accept="image/*" capture="environment">` fallback.
3. Lazy-load OpenCV.js and sample reduced-resolution frames.
4. Detect the largest plausible document quadrilateral.
5. Require four corners, adequate area, acceptable skew, focus/sharpness, and
   stable detection for several samples before turning the guide green.
6. Capture the full-resolution frame only after user action.
7. Apply perspective correction, crop, orientation correction, resize, and
   JPEG normalization.
8. Show a review screen with Retake and Use Photo actions.
9. Keep only the accepted normalized Blob in memory.

Manual capture remains available through an explicit accessible override when
automatic detection cannot succeed after guidance, rather than trapping the
user.

## 6. PDF Rules

- A4 portrait: 595.28 x 841.89 points.
- Use consistent margins and preserve source aspect ratio.
- `SINGLE`: one image on one page.
- `FRONT_BACK`: front in the upper region and back in the lower region of one
  shared page.
- Preserve Admin document order.
- Produce `Complete_Documents.pdf`.
- Support one sanitized individual PDF per document for the Admin-side PDF
  capability and layout tests.
- Generated document pages remain unbranded unless a future requirement
  explicitly approves a cover or watermark.
- The public User result screen exposes the combined PDF only.
- Use the Web Share API for the combined PDF when supported; otherwise provide
  a download.
- Clear working capture blobs after the user downloads/shares or leaves the
  result screen.

## 7. Phase 1 UX Improvements

The following improvements are included in the Phase 1 plan:

1. **QR code beside every generated link** so an Admin can move the request
   directly to a phone camera.
2. **Privacy notice** stating that images stay on the device and disappear on
   refresh/close.
3. **Session-loss warning** after capture because there is intentionally no
   persistence.
4. **Camera readiness diagnostics** for HTTPS, permission, device availability,
   and browser support.
5. **Quality checks** for blur, glare/overexposure, clipped corners, and low
   document coverage.
6. **Guided capture instructions** that explain why the frame is red and what
   the user should change.
7. **Web Share support** for the final combined PDF with download fallback.
8. **Adaptive processing** that reduces analysis resolution/rate on slower
   devices while keeping the camera preview responsive.
9. **No sensitive analytics or error payloads**; diagnostics contain only
   generic error codes.
10. **Accessibility-first fallback** allowing manual capture when automatic
    edge detection is not usable.

## 8. Phase 1 Security and Privacy

- Phase 1 is a frontend prototype, not an authoritative secure collection
  service.
- The link payload is user-editable and expiry relies on the device clock.
- No PII is allowed in the link.
- Validate accepted file MIME type, decoded type, dimensions, and size before
  processing.
- Do not log file names, image bytes, payload contents, or personal data.
- Do not send images or PDFs through telemetry, crash reporting, or remote
  optimization services.
- Use a restrictive Content Security Policy compatible with locally hosted
  OpenCV WASM and required browser APIs.
- Add `Permissions-Policy: camera=(self)`.
- Add `Referrer-Policy: no-referrer`.

## 9. Testing and CI

### Unit and component tests

- Link encode/decode round trip, Unicode labels, schema version, expiry limits,
  max item count, malformed payload, and duplicate ids.
- Single/front-back completeness rules.
- Document ordering and keyboard/touch reorder controls.
- Capture guide state transitions and manual fallback.
- Image orientation, aspect-ratio fit, and object URL cleanup.
- PDF page count, ordering, filenames, and front/back layout.
- In-memory submitted state and reset-on-refresh design.

### Browser and device tests

- Playwright projects for Chromium mobile and WebKit mobile viewports.
- Real-device checks on Android Chrome and iOS Safari.
- Camera permission granted, denied, dismissed, unavailable, and insecure
  context states.
- 320px through large desktop viewport matrix.
- Portrait/landscape rotation and safe-area behavior.
- Slow CPU/memory sanity test for image analysis and PDF generation.

### CI commands

```text
npm run lint
npm run type-check
npm run test
npm run build
```

## 10. GitHub and Vercel Deployment

The private
[chaudharypooja12/DocumentCollector](https://github.com/chaudharypooja12/DocumentCollector)
repository is the source of truth, and Vercel is the Phase 1 hosting platform.
Use Vercel's Git integration rather than a custom deployment script. Access to
the repository and its deployments must remain limited to authorized GitHub and
Vercel team members.

### Branch and environment mapping

| Git event | Vercel environment | Purpose |
|---|---|---|
| Pull request | Preview Deployment | Review responsive UI and test shareable links |
| Push/merge to `main` | Production Deployment | Public DocumentCollector release |
| Local branch | Local Next.js development | Development and automated tests |

### Vercel project settings

- Import the GitHub repository into Vercel.
- Authorize Vercel to access the private repository without making it public.
- Framework preset: Next.js.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output setting: Next.js default; do not configure a separate static export
  unless camera, routing, and security headers are revalidated.
- Node.js runtime: 22 LTS.
- Production branch: `main`.
- Enable PR Preview Deployments.
- Require GitHub quality checks before promoting/merging to production.
- Keep `.vercel/` local metadata out of source control.

### Phase 1 deployment behavior

- The repository includes `vercel.json` with the Next.js framework, `npm ci`,
  and `npm run build` settings.
- Generate request links from `window.location.origin` so links automatically
  use the current Vercel preview or production domain.
- Camera testing must use the HTTPS Vercel URL; browser camera permission is not
  expected to work on an insecure remote origin.
- No Phase 1 product secret or backend environment variable is required.
- Do not add Supabase or payment variables until their respective phases.
- Vercel Web Analytics and custom event tracking are off by default in Phase 1.
  If enabled later, they must never capture URL fragments, request
  configuration, filenames, images, PDFs, or PII.
- Configure security headers in `next.config.ts` and verify them on both Preview
  and Production deployments.
- Development CSP adds `'unsafe-eval'` only for React/Turbopack diagnostics.
  Production omits it while retaining `'wasm-unsafe-eval'` for the locally
  hosted OpenCV runtime.
- Use Vercel deployment logs only for build/runtime diagnostics; never log
  request payload or document data.

### Deployment acceptance

- GitHub pull request creates a working Preview URL.
- Preview and Production run lint, type-check, tests, and build successfully.
- `/admin` and `/u` load directly without a 404.
- A link generated on one Vercel deployment opens on another physical phone
  using the same origin.
- Camera permission works on Android Chrome and iOS Safari over HTTPS.
- Refreshing or closing the User flow leaves no recoverable app data.

## 11. Phase 2 and Phase 3 Stack

| Layer | Phase 2 | Phase 3 |
|---|---|---|
| Backend | Supabase Postgres, Auth, Storage, Edge Functions | Existing backend plus billing domain |
| Admin auth | Supabase Auth | Existing |
| Public links | Opaque, random server-issued token | Existing |
| Images/PDFs | Private buckets and signed URLs | Existing |
| Server validation | Link expiry, state, upload, completeness, and lock | Plan/entitlement checks |
| Payments | None | Selected hosted payment gateway + signed webhooks |

Phase 2 API details remain in `PHASE_2_BACKEND.md`. Phase 3 payment planning
remains in `PHASE_3_PAYMENT_GATEWAY.md`.
