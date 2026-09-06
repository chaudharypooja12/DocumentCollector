# Phase 1 - Frontend-Only Working UI

**Status:** Planning complete; implementation not started
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

- [ ] Initialize Next.js 16 with App Router, React 19, and TypeScript 5
- [ ] Use Node.js 22 LTS and npm with a committed lockfile
- [ ] Enable strict TypeScript and no unchecked unsafe casts
- [ ] Configure Tailwind CSS 4
- [ ] Configure ESLint and Prettier
- [ ] Install and configure:
  - [ ] shadcn/ui with Base UI primitives
  - [ ] `lucide-react`
  - [ ] React Hook Form and Zod
  - [ ] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - [ ] `pdf-lib`
  - [ ] `qrcode.react`
  - [ ] Vitest, React Testing Library, and user-event
  - [ ] Playwright
- [ ] Add a pinned local OpenCV.js WASM asset; do not load it from a runtime CDN
- [ ] Configure scripts: `dev`, `build`, `start`, `lint`, `type-check`, `test`,
  and `test:e2e`
- [ ] Configure security headers:
  - [ ] `Permissions-Policy: camera=(self)`
  - [ ] `Referrer-Policy: no-referrer`
  - [ ] Content Security Policy compatible with local WASM
- [x] Create the private GitHub repository with `main` as the production branch
- [x] Configure the local repository to track the private GitHub origin
- [ ] Configure GitHub Actions for lint, type-check, unit tests, and build
- [ ] Import the GitHub repository into Vercel using the Next.js preset
- [ ] Configure Vercel to run `npm ci` and `npm run build` on Node.js 22 LTS
- [ ] Enable Vercel Preview Deployments for pull requests
- [ ] Map pushes/merges to `main` to Vercel Production
- [x] Keep `.vercel/` local metadata ignored
- [x] Scaffold Memory Bank and root `AGENT.md`
- [x] Import canonical MBWays assets into `public/brand/`

## 2. Phase 1 Data and Privacy Guardrails

- [ ] Implement a repository-level rule: no product-data API routes in Phase 1
- [ ] Do not install/configure Supabase, an ORM, auth, or upload SDK
- [ ] Keep all mutable state in React Context + `useReducer`
- [ ] Store accepted captures as in-memory `Blob` objects
- [ ] Revoke replaced/discarded object URLs
- [ ] Do not use localStorage, sessionStorage, IndexedDB, or cookies
- [ ] Do not add a service worker that caches request/capture/result pages
- [ ] Do not include name, phone, email, country, or image data in generated URLs
- [ ] Do not log request payloads, filenames, images, PDFs, or PII
- [ ] Display a privacy notice: files stay on this device and are not uploaded
- [ ] Add a refresh/close warning after the first accepted capture
- [ ] Clear in-memory capture/PDF state on flow teardown
- [ ] Add an automated source scan/test for prohibited persistence APIs and
  backend SDK imports

## 3. MBWays Design System and Shared Shells

- [ ] Define MBWays colors, typography, radii, blur, and shadows from
  `COMPANY.md` and `DESIGN.md`
- [ ] Build a shared brand lockup using `/brand/logo.svg`
  - [ ] Product name: `DocumentCollector`
  - [ ] Supporting line: `Powered by MBWays`
- [ ] Build accessible primitives:
  - [ ] Button
  - [ ] Card
  - [ ] Input, Select, Checkbox, and FormField
  - [ ] Dialog and confirmation sheet
  - [ ] Toast and inline alert
  - [ ] Progress indicator
  - [ ] Status badge
  - [ ] Skeleton and empty state
- [ ] Build a mobile-first Admin shell
- [ ] Build a minimal mobile-first public User shell
- [ ] Retain the brand lockup on success, expired, invalid, and locked screens
- [ ] Meet WCAG 2.2 AA contrast and visible-focus requirements
- [ ] Honor reduced-motion preferences

## 4. Admin UI

### 4.1 Dashboard and Demonstration Screens

- [ ] Build `/admin` responsive dashboard
- [ ] Clearly label Phase 1 data-dependent cards as demonstrations
- [ ] Add static fixtures for counts and recent activity
- [ ] Build responsive Users, Submissions, PDF Management, and Settings screens
  from typed static fixtures
- [ ] Ensure no form on these demonstration screens claims that data was saved
- [ ] Reset all interactive demonstration state on refresh

### 4.2 Functional Request Builder

- [ ] Build `/admin/requests/new`
- [ ] Add/remove required document rows
- [ ] Validate document label length and uniqueness
- [ ] Choose `SINGLE` or `FRONT_BACK` per document
- [ ] Reorder documents with dnd-kit
- [ ] Provide keyboard and touch-friendly Up/Down alternatives
- [ ] Choose expiry from one to six hours
- [ ] Show a live request summary
- [ ] Require at least one valid document before link generation
- [ ] Do not request or encode User PII

### 4.3 Link Generation and Sharing

- [ ] Define Zod schema for `Phase1RequestPayload`
- [ ] Generate `requestId` with `crypto.randomUUID()`
- [ ] Generate ISO `createdAt` and `expiresAt`
- [ ] Sort and encode a versioned payload as UTF-8 Base64URL
- [ ] Build the link as `/u#request=<payload>`
- [ ] Enforce a maximum of 20 documents and a safe total URL length
- [ ] Show Copy Link action with feedback
- [ ] Render a scannable QR code
- [ ] Add native Web Share when supported
- [ ] Add WhatsApp and email share links
- [ ] Add Regenerate Link to create a new payload from the current form
- [ ] Unit test Unicode names, ordering, expiry, malformed data, and size limits

## 5. Public Link and User Flow

### 5.1 Resolver

- [ ] Build the public `/u` route
- [ ] Read `request` from `location.hash` after mount
- [ ] Decode and validate the payload with Zod
- [ ] Reject unsupported schema versions
- [ ] Reject malformed, oversized, empty, or expired requests
- [ ] Render dedicated loading, invalid-link, and expired-link states
- [ ] Open the configured document checklist automatically when valid
- [ ] Never render a login, signup, account, or profile prompt

### 5.2 Document Checklist

- [ ] Render documents in Admin-defined order
- [ ] Render one capture target for `SINGLE`
- [ ] Render separate Front and Back targets for `FRONT_BACK`
- [ ] Show completed/remaining progress
- [ ] Show thumbnail, Retake, and Remove actions
- [ ] Disable Generate Documents until every required side is accepted
- [ ] Keep the primary action reachable on small screens

### 5.3 Camera Permission and Fallback

- [ ] Detect secure context and MediaDevices support
- [ ] Request rear camera with `facingMode: environment`
- [ ] Handle permission granted, denied, dismissed, unavailable, and device-busy
  states
- [ ] Stop all media tracks when leaving capture
- [ ] Provide file input fallback with
  `accept="image/*" capture="environment"`
- [ ] Explain that selected/captured files stay on the device

### 5.4 Guided Capture

- [ ] Lazy-load OpenCV.js only on the capture screen
- [ ] Render a safe-area-aware guide frame over the native preview
- [ ] Detect the largest plausible document quadrilateral
- [ ] Sample analysis at 6-10 fps independently from preview fps
- [ ] Require stable corners/coverage for several samples before GREEN
- [ ] Show corrective hints for:
  - [ ] Move closer/farther
  - [ ] Show all four corners
  - [ ] Hold steady
  - [ ] Reduce glare
  - [ ] Improve lighting/focus
- [ ] Keep automatic capture off; User explicitly presses Capture
- [ ] Provide an accessible manual override after guidance cannot succeed
- [ ] Adapt analysis resolution/rate on slower devices

### 5.5 Image Processing and Review

- [ ] Correct EXIF/device orientation
- [ ] Apply perspective transform
- [ ] Crop to the detected boundary
- [ ] Preserve aspect ratio
- [ ] Normalize to a maximum long edge of 2400px
- [ ] Encode JPEG near 0.86 quality, adjustable after real-device testing
- [ ] Validate MIME type, decoded type, file size, and dimensions
- [ ] Show review preview with Retake and Use Photo
- [ ] Store only the accepted normalized Blob in memory
- [ ] Test portrait, landscape, skewed, low-light, and high-glare fixtures

## 6. Client-Side PDF Generation

- [ ] Implement A4 portrait layout with `pdf-lib`
- [ ] Render each `SINGLE` document on its own page
- [ ] Render Front above Back on one shared page for `FRONT_BACK`
- [ ] Preserve image aspect ratios and margins
- [ ] Preserve Admin document order
- [ ] Generate `Complete_Documents.pdf`
- [ ] Implement one sanitized individual PDF per document for Admin-side
  capability tests/fixtures
- [ ] Keep document pages unbranded
- [ ] Show local processing progress and actionable errors
- [ ] Provide the combined PDF download on the User result screen
- [ ] Provide Web Share for the combined PDF where supported
- [ ] Revoke PDF object URLs on replacement/teardown
- [ ] Test page count, order, filenames, aspect ratios, and large inputs

## 7. Phase 1 Submission State

- [ ] Confirm before local generation
- [ ] Explain that Phase 1 does not upload or save documents
- [ ] Transition the current tab to in-memory `SUBMITTED` after successful PDF
  generation
- [ ] Prevent capture/edit actions in that tab after generation
- [ ] Keep generated download/share actions available while memory remains
- [ ] Document and test that refresh/reopen starts a fresh session
- [ ] Build Admin reactivation and locked-state demonstrations with fixtures
- [ ] Label persistent lock/reactivation as Phase 2 behavior

## 8. Mobile Responsiveness and Accessibility

- [ ] Verify every Admin and User screen at 320, 360, 375, 390, 412, and 430px
- [ ] Verify tablet widths at 768 and 820px
- [ ] Verify desktop widths at 1024, 1280, and 1440px
- [ ] Confirm no horizontal overflow at 320px
- [ ] Use minimum 44 x 44px touch targets
- [ ] Use `dvh`/`svh` and safe-area insets on camera/full-screen states
- [ ] Test portrait and landscape orientation changes
- [ ] Collapse Admin tables to cards or contained scroll regions
- [ ] Test keyboard-only Admin request creation and reordering
- [ ] Test screen-reader names, status announcements, dialogs, and errors
- [ ] Ensure red/green status always has text and icon equivalents
- [ ] Test reduced-motion mode

## 9. Testing Matrix

### Automated

- [ ] Unit: payload encode/decode and validation
- [ ] Unit: expiry boundaries including one and six hours
- [ ] Unit: document completeness and ordering
- [ ] Unit: capture guide state/debounce
- [ ] Unit: image fit/layout calculations
- [ ] Unit: PDF page count and filenames
- [ ] Component: request builder and share actions
- [ ] Component: resolver invalid/expired states
- [ ] Component: camera fallback and review workflow
- [ ] E2E: Admin creates link -> User opens link -> captures/selects files ->
  generates and downloads PDF
- [ ] E2E: mobile Chromium and mobile WebKit viewport projects

### Real device

- [ ] Android Chrome camera and file fallback
- [ ] iOS Safari camera and file fallback
- [ ] Low-memory/mid-range Android processing pass
- [ ] Permission denial and recovery
- [ ] Rotation during capture
- [ ] QR scan from another screen/device
- [ ] Web Share supported and download fallback paths

## 10. Deployment and Completion

- [ ] Confirm GitHub pull requests receive a Vercel Preview URL
- [ ] Confirm `main` deploys to Vercel Production
- [ ] Confirm GitHub checks pass before production merge/deployment
- [ ] Verify Vercel HTTPS camera access
- [ ] Verify direct navigation to `/admin` and `/u`
- [ ] Verify generated links use the active Vercel origin
- [ ] Verify security headers on Preview and Production
- [ ] Confirm no backend/database/auth/upload environment variables exist
- [ ] Confirm production bundle does not include a persistence or backend SDK
- [ ] Confirm OpenCV is route-lazy and locally hosted
- [ ] Confirm lint, type-check, unit tests, and build pass
- [ ] Confirm Playwright Phase 1 journey passes
- [ ] Run a privacy check: no document bytes leave the browser
- [ ] Update all affected module files
- [ ] Update `RECENT_CHANGES.md`
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
