# Module Context — Document Capture & Image Processing

**Module path (code):** `src/components/capture/`,
`src/lib/image-processing.ts`
**Related docs:** `PRD.md` §8–9, `TECH_STACK.md` §4

## Purpose

Camera-based capture UI with live CamScanner-style edge detection and
automatic capture, plus the client-side image processing pipeline (corner
detection, perspective correction, crop, resize, A4 prep).

## Current Implementation Status

- Phase 1 implemented in `src/components/capture/`,
  `src/features/user-upload/capture-store.tsx`, and
  `src/lib/image-processing.ts`.
- The flow supports secure-context diagnostics, rear-camera requests, all
  camera error states, file fallback, throttled lighting guidance, pinned
  local OpenCV contour detection, a live overlay that tracks the detected
  document quadrilateral (mapped through the video's `object-fit: cover`
  crop), corner-position stability tracking, automatic capture with
  perspective correction, EXIF-aware decode, resize, and JPEG normalization.
- The guide border and readiness state now require an actual detected
  document (`evaluateReadiness`), not lighting/contrast heuristics alone,
  fixing a prior bug where the border was disconnected from real edge
  detection.
- Automatic capture fires once the detected quadrilateral is present and held
  stable (`cornersMovement` below tolerance) for several consecutive analysis
  ticks, mirroring CamScanner. A manual override remains available for
  damaged/atypical documents, and file selection still uses the original
  Retake/Use Photo review step.
- After an automatic capture, the camera session stays open (no dialog
  restart) and auto-advances to the next required document/side
  (`nextCaptureTarget` in `capture-store.tsx`) so each page auto-clears and
  the live view is ready for the next physical document without closing the
  dialog. A brief cooldown and "Captured — show the next page" indicator
  prevent the same still-held page from being captured twice.
- Camera startup is cancellation-safe: streams that resolve after the dialog
  closes or capture is cancelled are stopped immediately.

## Key Logic

- Edge/corner detection loop, live overlay coordinate mapping
  (`mapObjectCoverPoint`), corner-stability comparison (`cornersMovement`),
  readiness derivation (`evaluateReadiness`), automatic-capture triggering,
  perspective warp, crop, resize, compression, and auto-advance ordering
  (`orderedCaptureTargets`/`nextCaptureTarget`).

## Data It Owns / Reads

- Produces normalized image Blobs held only in the current User page session.
  Phase 2 adds upload/storage adapters.

## Dependencies

- None upstream; consumed by `modules/user-upload`.

## Known Issues

- Mobile browser performance and camera behavior must be verified on real
  Android Chrome and iOS Safari devices, including the new auto-capture
  stability/cooldown thresholds.
- A refresh cannot restore captures because Phase 1 intentionally saves
  nothing.
- OpenCV/document quality behavior still requires calibration on physical
  low-memory Android and iOS devices; manual capture remains the accessible
  fallback.
- The live overlay assumes a roughly rectangular document; extreme skew or
  partially visible pages may still require manual capture.

## Decisions Log

- 2026-09-07: Use a pinned, locally hosted OpenCV.js WASM build, lazy-loaded on
  the capture route, for edge detection and perspective correction. Use Canvas
  for resize/normalization and a throttled fallback when workers are unavailable.
- 2026-09-07: Module context moved to the flat `modules/document-capture.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: Redesigned capture to CamScanner-style behavior: the ready/border
  state now requires a real detected document instead of a lighting-only
  heuristic; capture is automatic once the detection is stable, with a live
  edge overlay and auto-advance to the next required page without closing the
  camera. Manual capture and file selection remain as explicit fallbacks with
  their existing review step. No change to the Phase 1 no-upload/no-persistence
  contract — everything still runs and clears in the User's page memory.

## Next Steps

- Complete the physical-device matrix and tune stability/cooldown thresholds
  only from verified fixtures/device findings.
