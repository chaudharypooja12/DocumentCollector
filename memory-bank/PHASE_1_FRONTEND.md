# Phase 1 - Frontend-Only Working UI

**Status:** Implementation complete and locally verified; Vercel connection and
physical-device acceptance checks remain external follow-ups
**Primary device:** Mobile phone
**Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4,
shadcn/ui with Base UI, Lucide, React Hook Form, Zod, dnd-kit, OpenCV.js,
Canvas API, pdf-lib, qrcode.react, Vitest, React Testing Library, Playwright
**Deployment:** Vercel over HTTPS
**Related docs:** `COMPANY.md`, `PRD.md`, `TECH_STACK.md`, `DESIGN.md`,
`ARCHITECTURE.md`, `MODELS.md`

## Phase 1 Contract

Phase 1 delivers a complete Admin UI and public User flow, including a
cross-device link, camera capture, local image processing, and local PDF
generation.

Phase 1 intentionally has:

- no backend or API for product data;
- no database or cloud storage;
- no Admin or User authentication;
- no upload of document images or generated PDFs;
- no localStorage, sessionStorage, IndexedDB, cookies, or persistent browser
  cache for product data;
- no authoritative cross-device expiry, submission lock, history, or
  reactivation.

The Admin-generated URL carries only non-sensitive document configuration and
expiry in its fragment. Captures and generated files exist only in the User's
current page memory.

## 1. Project Setup and Quality Gates

- [x] Initialize Next.js 16 with App Router, React 19, and TypeScript 5
- [x] Use Node.js 22 LTS and npm with a committed lockfile
- [x] Enable strict TypeScript and no unchecked unsafe casts
- [x] Configure Tailwind CSS 4
- [x] Configure ESLint and Prettier
- [x] Install and configure:
  - [x] shadcn/ui conventions with Base UI primitives
  - [x] `lucide-react`
  - [x] React Hook Form and Zod
  - [x] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - [x] `pdf-lib`
  - [x] `qrcode.react`
  - [x] Vitest, React Testing Library, and user-event
  - [x] Playwright
- [x] Add a pinned local OpenCV.js WASM asset; do not load it from a runtime CDN
- [x] Configure scripts: `dev`, `build`, `start`, `lint`, `type-check`, `test`,
  and `test:e2e`
- [x] Configure security headers:
  - [x] `Permissions-Policy: camera=(self)`
  - [x] `Referrer-Policy: no-referrer`
  - [x] Content Security Policy compatible with local WASM
- [x] Create the private GitHub repository with `main` as the production branch
- [x] Configure the local repository to track the private GitHub origin
- [x] Publish the project foundation to GitHub `main`
- [x] Configure GitHub Actions for lint, type-check, unit tests, and build
- [ ] Import the GitHub repository into Vercel using the Next.js preset
- [x] Configure repository Vercel settings to run `npm ci` and `npm run build`
  on Node.js 22 LTS
- [ ] Enable Vercel Preview Deployments for pull requests
- [ ] Map pushes/merges to `main` to Vercel Production
- [x] Keep `.vercel/` local metadata ignored
- [x] Scaffold Memory Bank and root `AGENT.md`
- [x] Import canonical MBWays assets into `public/brand/`

## 2. Phase 1 Data and Privacy Guardrails

- [x] Implement a repository-level rule: no product-data API routes in Phase 1
- [x] Do not install/configure Supabase, an ORM, auth, or upload SDK
- [x] Keep all mutable state in React Context + `useReducer`
- [x] Store accepted captures as in-memory `Blob` objects
- [x] Revoke replaced/discarded object URLs
- [x] Do not use localStorage, sessionStorage, IndexedDB, or cookies
- [x] Do not add a service worker that caches request/capture/result pages
- [x] Do not include name, phone, email, country, or image data in generated URLs
- [x] Do not log request payloads, filenames, images, PDFs, or PII
- [x] Display a privacy notice: files stay on this device and are not uploaded
- [x] Add a refresh/close warning after the first accepted capture
- [x] Clear in-memory capture/PDF state on flow teardown
- [x] Add an automated source scan/test for prohibited persistence APIs and
  backend SDK imports

## 3. MBWays Design System and Shared Shells

- [x] Define MBWays colors, typography, radii, blur, and shadows from
  `COMPANY.md` and `DESIGN.md`
- [x] Build a shared brand lockup using `/brand/logo.svg`
  - [x] Product name: `DocumentCollector`
  - [x] Supporting line: `Powered by MBWays`
- [x] Build accessible primitives:
  - [x] Button
  - [x] Card
  - [x] Input, Select, Checkbox, and FormField
  - [x] Dialog and confirmation sheet
  - [x] Toast and inline alert
  - [x] Progress indicator
  - [x] Status badge
  - [x] Skeleton and empty state
- [x] Build a mobile-first Admin shell
- [x] Build a minimal mobile-first public User shell
- [x] Retain the brand lockup on success, expired, invalid, and locked screens
- [x] Meet WCAG 2.2 AA contrast and visible-focus requirements
- [x] Honor reduced-motion preferences

## 4. Admin UI

### 4.1 Dashboard and Demonstration Screens

- [x] Build `/admin` responsive dashboard
- [x] Clearly label Phase 1 data-dependent cards as demonstrations
- [x] Add static fixtures for counts and recent activity
- [x] Build responsive Users, Submissions, PDF Management, and Settings screens
  from typed static fixtures
- [x] Ensure no form on these demonstration screens claims that data was saved
- [x] Reset all interactive demonstration state on refresh

### 4.2 Functional Request Builder

- [x] Build `/admin/requests/new`
- [x] Add/remove required document rows
- [x] Validate document label length and uniqueness
- [x] Choose `SINGLE` or `FRONT_BACK` per document
- [x] Reorder documents with dnd-kit
- [x] Provide keyboard and touch-friendly Up/Down alternatives
- [x] Choose expiry from one to six hours
- [x] Show a live request summary
- [x] Require at least one valid document before link generation
- [x] Do not request or encode User PII

### 4.3 Link Generation and Sharing

- [x] Define Zod schema for `Phase1RequestPayload`
- [x] Generate `requestId` with `crypto.randomUUID()`
- [x] Generate ISO `createdAt` and `expiresAt`
- [x] Sort and encode a versioned payload as UTF-8 Base64URL
- [x] Build the link as `/u#request=<payload>`
- [x] Enforce a maximum of 20 documents and a safe total URL length
- [x] Surface actionable validation when a checklist exceeds URL capacity
- [x] Show Copy Link action with feedback
- [x] Render a scannable QR code when capacity permits and show share fallbacks
  for longer valid links
- [x] Add native Web Share when supported
- [x] Add WhatsApp and email share links
- [x] Add Regenerate Link to create a new payload from the current form
- [x] Unit test Unicode names, ordering, expiry, malformed data, and size limits

## 5. Public Link and User Flow

### 5.1 Resolver

- [x] Build the public `/u` route
- [x] Read `request` from `location.hash` after mount
- [x] Decode and validate the payload with Zod
- [x] Reject unsupported schema versions
- [x] Reject malformed, oversized, empty, or expired requests
- [x] Render dedicated loading, invalid-link, and expired-link states
- [x] Open the configured document checklist automatically when valid
- [x] Never render a login, signup, account, or profile prompt

### 5.2 Document Checklist

- [x] Render documents in Admin-defined order
- [x] Render one capture target for `SINGLE`
- [x] Render separate Front and Back targets for `FRONT_BACK`
- [x] Show completed/remaining progress
- [x] Show thumbnail, Retake, and Remove actions
- [x] Disable Generate Documents until every required side is accepted
- [x] Keep the primary action reachable on small screens

### 5.3 Camera Permission and Fallback

- [x] Detect secure context and MediaDevices support
- [x] Request rear camera with `facingMode: environment`
- [x] Handle permission granted, denied, dismissed, unavailable, and device-busy
  states
- [x] Stop all media tracks when leaving capture
- [x] Stop late-resolving camera streams after dialog teardown or cancellation
- [x] Provide file input fallback with
  `accept="image/*" capture="environment"`
- [x] Explain that selected/captured files stay on the device

### 5.4 Guided Capture

- [x] Lazy-load OpenCV.js only on the capture screen
- [x] Render a safe-area-aware guide frame over the native preview
- [x] Detect the largest plausible document quadrilateral
- [x] Sample analysis at 6-10 fps independently from preview fps
- [x] Require stable corners/coverage for several samples before GREEN
- [x] Show corrective hints for:
  - [x] Move closer/farther
  - [x] Show all four corners
  - [x] Hold steady
  - [x] Reduce glare
  - [x] Improve lighting/focus
- [x] Keep automatic capture off; User explicitly presses Capture
- [x] Provide an accessible manual override after guidance cannot succeed
- [x] Adapt analysis to a reduced 240px analysis frame and 150ms sampling rate

### 5.5 Image Processing and Review

- [x] Correct EXIF/device orientation
- [x] Apply perspective transform
- [x] Crop to the detected boundary
- [x] Preserve aspect ratio
- [x] Normalize to a maximum long edge of 2400px
- [x] Encode JPEG near 0.86 quality, adjustable after real-device testing
- [x] Validate MIME type, decoded type, file size, and dimensions
- [x] Show review preview with Retake and Use Photo
- [x] Store only the accepted normalized Blob in memory
- [x] Test portrait/landscape layout and low-light/high-glare guide states;
  skew/perspective receives OpenCV integration coverage and remains a
  physical-device acceptance item

## 6. Client-Side PDF Generation

- [x] Implement A4 portrait layout with `pdf-lib`
- [x] Render each `SINGLE` document on its own page
- [x] Render Front above Back on one shared page for `FRONT_BACK`
- [x] Preserve image aspect ratios and margins
- [x] Preserve Admin document order
- [x] Generate `Complete_Documents.pdf`
- [x] Implement one sanitized individual PDF per document for Admin-side
  capability tests/fixtures
- [x] Keep document pages unbranded
- [x] Show local processing progress and actionable errors
- [x] Provide the combined PDF download on the User result screen
- [x] Provide Web Share for the combined PDF where supported
- [x] Revoke PDF object URLs on replacement/teardown
- [x] Test page count, order, filenames, aspect ratios, and input limits

## 7. Phase 1 Submission State

- [x] Confirm before local generation
- [x] Explain that Phase 1 does not upload or save documents
- [x] Transition the current tab to in-memory `SUBMITTED` after successful PDF
  generation
- [x] Prevent capture/edit actions in that tab after generation
- [x] Keep generated download/share actions available while memory remains
- [x] Document and test that refresh/reopen starts a fresh session
- [x] Build Admin reactivation and locked-state demonstrations with fixtures
- [x] Label persistent lock/reactivation as Phase 2 behavior

## 8. Mobile Responsiveness and Accessibility

- [x] Verify every Admin and User screen at 320, 360, 375, 390, 412, and 430px
- [x] Verify tablet widths at 768 and 820px
- [x] Verify desktop widths at 1024, 1280, and 1440px
- [x] Confirm no horizontal overflow at 320px
- [x] Use minimum 44 x 44px touch targets
- [x] Use `dvh`/`svh` and safe-area insets on camera/full-screen states
- [x] Test portrait and landscape-responsive layouts
- [x] Collapse Admin tables to cards or contained data views
- [x] Test keyboard/touch-friendly Admin request creation and reordering
- [x] Test screen-reader names, status announcements, dialogs, and errors
- [x] Ensure red/green status always has text and icon equivalents
- [x] Test and implement reduced-motion mode

## 9. Testing Matrix

### Automated

- [x] Unit: payload encode/decode and validation
- [x] Unit: expiry boundaries including one and six hours
- [x] Unit: document completeness and ordering
- [x] Unit: capture guide state and quality classification
- [x] Unit: image fit/layout calculations
- [x] Unit: PDF page count and filenames
- [x] Component: request builder, ordering, and generated share URL
- [x] Component: resolver invalid/expired states
- [x] Component: camera fallback and camera error states
- [x] E2E: Admin creates link -> User opens link -> captures/selects files ->
  generates and downloads PDF
- [x] E2E: mobile Chromium and mobile WebKit viewport projects

### Real device

- [ ] Android Chrome camera and file fallback
- [ ] iOS Safari camera and file fallback
- [ ] Low-memory/mid-range Android processing pass
- [ ] Permission denial and recovery
- [ ] Rotation during capture
- [ ] QR scan from another screen/device
- [ ] Web Share supported and download fallback paths

The items above require physical devices and remain the final external
acceptance pass. Automated Pixel/Chrome and iPhone/WebKit emulation, file
fallback, permission-error states, responsive rotation layouts, and download
paths pass locally.

## 10. Deployment and Completion

- [ ] Confirm GitHub pull requests receive a Vercel Preview URL
- [ ] Confirm `main` deploys to Vercel Production
- [x] Confirm GitHub checks pass before production merge/deployment
- [ ] Verify Vercel HTTPS camera access
- [x] Verify direct navigation to `/admin`, `/admin/login`, and `/u` in the
  production build
- [x] Verify generated links use the active deployment origin
- [x] Verify security headers in the local production build; repeat against
  Vercel Preview and Production after project connection
- [x] Confirm no backend/database/auth/upload environment variables exist
- [x] Confirm production bundle does not include a persistence or backend SDK
- [x] Confirm OpenCV is capture-route-lazy and locally hosted
- [x] Confirm lint, type-check, unit tests, and build pass
- [x] Confirm Playwright Phase 1 journey passes
- [x] Run a privacy check: no document bytes leave the browser
- [x] Update all affected module files
- [x] Update `RECENT_CHANGES.md`
- [ ] Set Phase 1 status to Complete only after all items and device checks pass

## Deferred to Phase 2

- Admin login and route authorization
- User/contact records and dashboards backed by real data
- Opaque server-issued links
- Authoritative expiry and submission lock
- Uploads and private storage
- Admin receipt/review/download of User documents
- Persistent submission history
- Same-token Admin reactivation
- Server-side PDF generation
- Audit events, monitoring, and rate limiting
