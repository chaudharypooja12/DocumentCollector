# Module Context — PDF Generation

**Module path (code):** `src/lib/pdf.ts`
**Related docs:** `PRD.md` §16–18, `TECH_STACK.md` §5

## Purpose

Assembling processed document images into A4-formatted PDFs: one page per single document, one shared page per front+back document, combined PDF, and individual per-document PDFs.

## Current Implementation Status

- Phase 1 client-side generation is implemented in `src/lib/pdf.ts`. Phase 2 still adds authoritative server-side
  generation via Edge Function.
- Combined and individual helpers produce A4 portrait PDFs, preserve Admin
  order and image aspect ratio, and place front/back on one shared page.

## Key Logic

- A4 page layout engine, front/back split-page composition, page ordering per `document_template_items.sort_order`, combined vs individual PDF assembly, deterministic regeneration for reactivation.

## Data It Owns / Reads

- Phase 1 reads in-memory capture Blobs and request configuration, then produces
  in-memory PDF Blobs for download/share.
- Phase 2 reads persisted captures and writes `generated_pdfs`.

## Dependencies

- `modules/document-capture` (source images)
- `modules/link-management` (only generate after submission is validated)

## Known Issues

- Phase 1 PDFs are unavailable after refresh/close and are not visible to Admin.
- Large image sets can exceed mobile memory; normalization, Blob URL cleanup,
  and the 20-document request cap are mandatory.

## Decisions Log

- None yet.
- 2026-09-07: Module context moved to the flat `modules/pdf-generation.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: MBWays branding applies to application UI, not generated document
  pages. PDFs remain content-only unless a separate approved requirement adds a
  cover or watermark.
- 2026-09-07: Phase 1 PDF generation and file sharing occur entirely on the
  User device; no upload or persistent generated-PDF record exists.

## Next Steps

- Validate large real-device capture sets, then implement the Phase 2
  authoritative generation adapter.
