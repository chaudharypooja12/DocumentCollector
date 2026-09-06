# Module Context — Document Capture & Image Processing

**Module path (code):** `components/capture/`, `modules/document-capture/`, `lib/image-processing/`
**Related docs:** `PRD.md` §8–9, `TECH_STACK.md` §4

## Purpose
Camera-based capture UI (positioning guide, red/green states) and the client-side image processing pipeline (corner detection, perspective correction, crop, resize, A4 prep).

## Current Implementation Status
- Phase 1 stack finalized; implementation not started.

## Key Logic
- Edge/corner detection loop, frame-stability debounce, red/green state computation, perspective warp, crop, resize, compression.

## Data It Owns / Reads
- Produces normalized image Blobs held only in the current User page session.
  Phase 2 adds upload/storage adapters.

## Dependencies
- None upstream; consumed by `modules/user-upload`.

## Known Issues
- Mobile browser performance and camera behavior must be verified on real
  Android Chrome and iOS Safari devices.
- A refresh cannot restore captures because Phase 1 intentionally saves
  nothing.

## Decisions Log
- 2026-09-07: Use a pinned, locally hosted OpenCV.js WASM build, lazy-loaded on
  the capture route, for edge detection and perspective correction. Use Canvas
  for resize/normalization and a throttled fallback when workers are unavailable.
- 2026-09-07: Module context moved to the flat `modules/document-capture.md` Memory Bank path; implementation status and scope are unchanged.

## Next Steps
- See `PHASE_1_FRONTEND.md` — Camera Capture Module task groups.
