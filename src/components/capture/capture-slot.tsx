"use client";

import { Camera, CheckCircle2, FileText, RotateCcw, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { NormalizedImage } from "@/lib/image-processing";
import type { CaptureSide } from "@/features/user-upload/capture-store";
import { useCaptures } from "@/features/user-upload/capture-store";

export function CaptureSlot({
  documentId,
  documentName,
  side,
  isPdfUpload,
  onCapture,
  onUploadPdf,
}: {
  documentId: string;
  documentName: string;
  side: CaptureSide;
  isPdfUpload?: boolean;
  onCapture: (target: {
    documentId: string;
    documentName: string;
    side: CaptureSide;
  }) => void;
  onUploadPdf?: (file: File) => void;
}) {
  const { getCapture, removeCapture, status } = useCaptures();
  const capture = getCapture(documentId, side);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label =
    side === "SINGLE"
      ? documentName
      : `${documentName} — ${side === "FRONT" ? "Front" : "Back"}`;

  if (isPdfUpload) {
    return (
      <div className="rounded-2xl border border-border bg-muted/35 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUploadPdf?.(file);
          }}
        />
        {capture ? (
          <div className="flex items-center gap-3">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="truncate">Uploaded</span>
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {capture.fileName ?? "document.pdf"}
              </p>
            </div>
            {status === "COLLECTING" ? (
              <div className="flex">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Replace ${label}`}
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeCapture(documentId, side)}
                  className="inline-flex size-11 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${label}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Button
            type="button"
            className="w-full"
            disabled={status !== "COLLECTING"}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="size-4" />
            Upload PDF
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/35 p-3">
      {capture ? (
        <div className="flex items-center gap-3">
          {/* Local Blob URL; no request leaves the browser. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.previewUrl}
            alt={`Preview of ${label}`}
            className="size-16 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="size-4 shrink-0 text-success" />
              <span className="truncate">
                {side === "SINGLE" ? "Captured" : side}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {capture.width} × {capture.height}
            </p>
          </div>
          {status === "COLLECTING" ? (
            <div className="flex">
              <button
                type="button"
                onClick={() => onCapture({ documentId, documentName, side })}
                className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Retake ${label}`}
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => removeCapture(documentId, side)}
                className="inline-flex size-11 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10"
                aria-label={`Remove ${label}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          className="w-full"
          disabled={status !== "COLLECTING"}
          onClick={() => onCapture({ documentId, documentName, side })}
        >
          <Camera className="size-4" />
          Capture {side === "SINGLE" ? "document" : side.toLocaleLowerCase()}
        </Button>
      )}
    </div>
  );
}

export type CaptureAcceptHandler = (
  target: {
    documentId: string;
    documentName: string;
    side: CaptureSide;
  },
  image: NormalizedImage,
) => void;
