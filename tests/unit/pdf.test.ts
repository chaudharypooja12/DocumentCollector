import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createCombinedPdf, fitImage, sanitizePdfFilename } from "@/lib/pdf";
import type { Phase1RequestPayload } from "@/lib/request-link";
import type { Phase1Capture } from "@/features/user-upload/capture-store";

const pixelPng = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  ),
  (character) => character.charCodeAt(0),
);

describe("PDF layout", () => {
  it("fits images within the available box without changing aspect ratio", () => {
    const result = fitImage(1200, 600, {
      x: 10,
      y: 20,
      width: 300,
      height: 300,
    });
    expect(result).toEqual({ x: 10, y: 95, width: 300, height: 150 });
  });

  it("creates safe individual PDF filenames", () => {
    expect(sanitizePdfFilename("  Passport / Front  ")).toBe(
      "Passport_Front.pdf",
    );
    expect(sanitizePdfFilename("***")).toBe("Document.pdf");
  });

  it("uses one page per document and shares a page for front/back", async () => {
    const request: Phase1RequestPayload = {
      version: 1,
      requestId: "11111111-1111-4111-8111-111111111111",
      createdAt: "2026-09-07T00:00:00.000Z",
      expiresAt: "2026-09-07T03:00:00.000Z",
      documents: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Photo",
          type: "SINGLE",
          sortOrder: 0,
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Passport",
          type: "FRONT_BACK",
          sortOrder: 1,
        },
      ],
    };
    const capture = (
      documentId: string,
      side: Phase1Capture["side"],
    ): Phase1Capture => ({
      documentId,
      side,
      blob: new Blob([pixelPng], { type: "image/png" }),
      previewUrl: `blob:${documentId}:${side}`,
      width: 100,
      height: 100,
    });
    const blob = await createCombinedPdf(request, {
      "22222222-2222-4222-8222-222222222222:SINGLE": capture(
        "22222222-2222-4222-8222-222222222222",
        "SINGLE",
      ),
      "33333333-3333-4333-8333-333333333333:FRONT": capture(
        "33333333-3333-4333-8333-333333333333",
        "FRONT",
      ),
      "33333333-3333-4333-8333-333333333333:BACK": capture(
        "33333333-3333-4333-8333-333333333333",
        "BACK",
      ),
    });
    const pdf = await PDFDocument.load(await blob.arrayBuffer());

    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getPage(0).getSize()).toEqual({
      width: 595.28,
      height: 841.89,
    });
  });
});
