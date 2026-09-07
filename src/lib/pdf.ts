import { PDFDocument, type PDFImage, type PDFPage } from "pdf-lib";
import type { Phase1RequestPayload, RequestDocument } from "@/lib/request-link";
import type {
  CaptureSide,
  Phase1Capture,
} from "@/features/user-upload/capture-store";

export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;
export const PDF_MARGIN = 32;
export const COMPLETE_PDF_NAME = "Complete_Documents.pdf";

export type ImageFit = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function fitImage(
  sourceWidth: number,
  sourceHeight: number,
  box: { x: number; y: number; width: number; height: number },
): ImageFit {
  const scale = Math.min(box.width / sourceWidth, box.height / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

export function sanitizePdfFilename(value: string) {
  const name = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/gu, "")
    .trim()
    .replace(/[\s-]+/gu, "_")
    .slice(0, 80);
  return `${name || "Document"}.pdf`;
}

async function embedCapture(
  pdf: PDFDocument,
  capture: Phase1Capture,
): Promise<PDFImage> {
  const bytes = await capture.blob.arrayBuffer();
  return capture.blob.type === "image/png"
    ? pdf.embedPng(bytes)
    : pdf.embedJpg(bytes);
}

function findCapture(
  captures: Record<string, Phase1Capture>,
  documentId: string,
  side: CaptureSide,
) {
  const capture = captures[`${documentId}:${side}`];
  if (!capture) throw new Error("A required capture is missing.");
  return capture;
}

async function drawInBox(
  page: PDFPage,
  pdf: PDFDocument,
  capture: Phase1Capture,
  box: { x: number; y: number; width: number; height: number },
) {
  const image = await embedCapture(pdf, capture);
  page.drawImage(image, fitImage(image.width, image.height, box));
}

async function addDocumentPage(
  pdf: PDFDocument,
  document: RequestDocument,
  captures: Record<string, Phase1Capture>,
) {
  const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  const contentWidth = A4_WIDTH - PDF_MARGIN * 2;
  const contentHeight = A4_HEIGHT - PDF_MARGIN * 2;

  if (document.type === "SINGLE") {
    await drawInBox(page, pdf, findCapture(captures, document.id, "SINGLE"), {
      x: PDF_MARGIN,
      y: PDF_MARGIN,
      width: contentWidth,
      height: contentHeight,
    });
    return;
  }

  const gap = 18;
  const halfHeight = (contentHeight - gap) / 2;
  await drawInBox(page, pdf, findCapture(captures, document.id, "FRONT"), {
    x: PDF_MARGIN,
    y: PDF_MARGIN + halfHeight + gap,
    width: contentWidth,
    height: halfHeight,
  });
  await drawInBox(page, pdf, findCapture(captures, document.id, "BACK"), {
    x: PDF_MARGIN,
    y: PDF_MARGIN,
    width: contentWidth,
    height: halfHeight,
  });
}

async function savePdf(
  documents: RequestDocument[],
  captures: Record<string, Phase1Capture>,
) {
  const pdf = await PDFDocument.create();
  for (const document of documents) {
    await addDocumentPage(pdf, document, captures);
  }
  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: "application/pdf" });
}

export async function createCombinedPdf(
  request: Phase1RequestPayload,
  captures: Record<string, Phase1Capture>,
) {
  const documents = [...request.documents].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  return savePdf(documents, captures);
}

export async function createIndividualPdfs(
  request: Phase1RequestPayload,
  captures: Record<string, Phase1Capture>,
) {
  return Promise.all(
    [...request.documents]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(async (document) => ({
        filename: sanitizePdfFilename(document.name),
        blob: await savePdf([document], captures),
      })),
  );
}
