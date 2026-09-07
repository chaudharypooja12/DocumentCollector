"use client";

import { Camera, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NormalizedImage } from "@/lib/image-processing";
import type { CaptureSide } from "@/features/user-upload/capture-store";
import { useCaptures } from "@/features/user-upload/capture-store";

export function CaptureSlot({
  documentId,
  documentName,
  side,
  onCapture,
}: {
  documentId: string;
  documentName: string;
  side: CaptureSide;
  onCapture: (target: {
    documentId: string;
    documentName: string;
    side: CaptureSide;
  }) => void;
}) {
  const { getCapture, removeCapture, status } = useCaptures();
  const capture = getCapture(documentId, side);
  const label =
    side === "SINGLE"
      ? documentName
      : `${documentName} — ${side === "FRONT" ? "Front" : "Back"}`;

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
          variant="secondary"
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
