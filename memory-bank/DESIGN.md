# Design Document — UI/UX & Visual System

**Project:** DocumentCollector - Powered by MBWays
**Related docs:** `COMPANY.md`, `PRD.md`, `TECH_STACK.md`, `PHASE_1_FRONTEND.md`

---

## 1. Design Principles

1. **MBWays Orbital Glass** — light-first semantic surfaces with an optional
   dark theme, subtle glass depth, orange accents, and clear borders.
2. **Clarity over decoration** — the User side is a task (upload documents); it must never feel confusing.
3. **Mobile-first** — most Users open the link on a phone camera; Admin panel is desktop-friendly but responsive.
4. **No emojis** — all iconography via a proper icon library (`lucide-react`).
5. **Immediate, unambiguous feedback** — every state (capturing, uploading, success, error, expired, locked) has a distinct visual treatment.
6. **Visible ownership** — shared shells show the MBWays logo, the
   DocumentCollector name, and `Powered by MBWays`.

---

## 2. Visual Language

### 2.1 Surface and Card Spec

- Default light card: solid white with a visible neutral border.
- Optional dark card: near-black surface with a visible slate border.
- Glass backgrounds are reserved for headers/overlays rather than every panel.
- Backdrop filter: `blur(24px)`.
- Border radius: `12-24px` according to shadcn component role.
- Shadow: large, soft MBWays orange glow used sparingly.

### 2.2 MBWays Color Palette

| Token                | Usage                                          | Example                   |
| -------------------- | ---------------------------------------------- | ------------------------- |
| `--color-primary`    | Primary actions, accents, glow                 | `#FF6B00`                 |
| `--color-secondary`  | Gradients and hover states                     | `#FF8F1F`                 |
| `--color-accent`     | Highlights                                     | `#FFB347`                 |
| `--color-background` | Page background, Light by default              | `#F7F8FA`                 |
| `--color-card`       | Card and panel surface                         | `#FFFFFF`                 |
| `--color-border`     | Sidebar, header, card, and input separation    | `#D9DEE7`                 |
| `--color-sidebar`    | Admin navigation surface                       | `#FFFFFF`                 |
| `--color-header`     | Sticky top-bar surface                         | Translucent theme surface |
| `--text-primary`     | Theme-aware primary text                       | `#131722` in Light        |
| `--text-secondary`   | Theme-aware secondary text                     | `#667085` in Light        |
| `--state-success`    | Success, GREEN capture box                     | Green                     |
| `--state-error`      | Error, RED capture box, expired/locked banners | Red                       |
| `--state-warning`    | Expiry countdown warnings                      | Amber                     |

### 2.3 Typography

- Headings: Space Grotesk, weight 700.
- Body: Inter, weight 400.
- Buttons: Sora, weight 500–600.
- Clear hierarchy: Page title → Section heading → Body → Caption.
- Sufficient contrast maintained against blurred/translucent backgrounds (WCAG AA minimum).

### 2.4 Iconography

- Single consistent icon set (`lucide-react`).
- Icons used for: capture, retake, upload, success, error/warning, expired, lock/reactivate, download, drag-handle, add-user, settings.

### 2.5 Brand Lockup

- Render the theme-aware logo inline with unique SVG mask ids, using
  `/brand/logo-neutral-mask.png` and `/brand/logo-orange-layer.png`. Do not load
  the nested-resource `/brand/logo.svg` through `next/image`.
- Use `/brand/logo.png` when a standalone raster asset is required.
- Display **DocumentCollector** with the supporting line **Powered by MBWays**.
- Use the MBWays tagline only where additional corporate context is appropriate:
  **Opening Pathways to Opportunities.**
- Do not redraw, recolor, distort, crop, or replace the MBWays logo.
- Keep generated document PDFs unbranded unless a separate approved requirement
  introduces a cover or watermark.

---

## 3. Core Interaction States

| State                            | Visual Treatment                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Capture box — incorrect position | RED outline/box, subtle shake or pulsing hint                                             |
| Capture box — correct position   | GREEN outline/box, capture button becomes active                                          |
| Processing locally               | Progress indicator per document (glass progress bar)                                      |
| Documents ready                  | Success glass card + confirmation icon + Download/Share PDF actions                       |
| Link expired                     | Full-screen glass card, neutral/error tone, contact-admin message, no upload UI           |
| Link already submitted (locked)  | Full-screen glass card, info tone, "contact admin for changes" message                    |
| Admin reactivated / edit mode    | Pre-filled document thumbnails shown as "already uploaded", each individually replaceable |

All state screens retain the shared DocumentCollector and MBWays brand lockup.

---

## 4. Screen Inventory

### 4.1 Admin Panel (mobile-first and desktop-enhanced)

- [x] **Landing and Admin Sign-in Preview** — MBWays-branded entry with an
      explicitly local-only, non-authenticating Phase 1 form.
- [x] **Dashboard** — clearly labeled Phase 1 demonstration cards and activity fixtures.
- [x] **Admin Shell** — desktop sidebar, sticky top bar, responsive navigation
      sheet, in-memory Light/Dark switch, and Phase 1 Logout-to-preview action.
- [x] **Users (list)** — responsive demonstration table/cards; no saved records in Phase 1.
- [x] **Create Request** — select document requirements and expiry without adding PII to the link.
- [x] **Document Templates** — select documents required for this user; drag-and-drop ordering; toggle Single vs Front+Back per document.
- [x] **Document Requests / Link Generation** — set expiry (max 6h), generate link, share options (Copy / WhatsApp / Email).
- [x] **Share Request** — copy link, QR code, native share, WhatsApp, and email.
- [x] **Submission Management** — complete demonstration UI; no real User captures are available to Admin in Phase 1.
- [x] **PDF Management** — complete demonstration UI using fixtures.
- [x] **Settings** — demonstration UI; values reset on refresh.

### 4.2 User Upload Flow (simple, mobile-first)

- [x] **Link Landing / Loading** — decodes and validates the URL-fragment request, then opens the document checklist automatically.
- [x] **Document Upload List** — list of required documents with capture buttons (Front/Back where applicable), progress indicators.
- [x] **Camera Capture Screen** — live preview, positioning guide box (red/green), capture button, retake button.
- [x] **Review/Edit Screen** — thumbnail of captured image(s), retake/replace controls, per-document status.
- [x] **Generation Confirmation** — confirms local PDF generation and explains the current session will lock afterward.
- [x] **Success / Download Screen** — Documents Ready message + Download and supported Share actions.
- [x] **Expired Link Screen** — static message, no interactive upload elements.
- [x] **Locked/Already-Submitted Screen** — current-tab state only in Phase 1; preserve generated download actions while memory remains.

---

## 5. Responsive Behavior

- [x] Validate 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, and 1440px widths.
- [x] Both Admin and User screens are mobile-first; desktop adds space and density.
- [x] Admin-side tables/lists collapse into stacked cards on mobile.
- [x] Drag-and-drop document ordering has a touch-friendly fallback (e.g., up/down reorder buttons on small screens).
- [x] Full-screen camera views use `dvh`/`svh`, safe-area padding, and portrait/landscape layouts.
- [x] No horizontal scrolling at 320px.

---

## 6. Accessibility Notes

- [x] All interactive elements reachable via keyboard on Admin panel.
- [x] Color is never the only indicator of state (icon + text label accompany red/green box, success/error banners).
- [x] Sufficient tap-target sizes (≥ 44px) on the mobile capture UI.
- [x] Alt text / ARIA labels for all icons and capture states.

---

## 7. Empty / Edge States

- [x] No users created yet — Admin dashboard provides a Create Request CTA and
      labels all current records as demonstrations.
- [x] No documents configured for a user — block link generation until at least one document is configured.
- [x] Camera permission denied — fallback to manual file picker with a short explanatory note.
- [x] Slow local processing — progress feedback, adaptive processing, and an actionable error state.
- [x] Refresh/close after capture — warn that unsaved captures will be lost.
- [x] Slow device — reduce detection sampling while keeping preview responsive.
- [x] Blur, glare, clipped corners, or low coverage — show a specific corrective hint.
