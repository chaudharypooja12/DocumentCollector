"use client";

import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Button } from "@/components/ui/button";
import {
  assessGuideFrame,
  correctPerspective,
  detectDocument,
  loadOpenCv,
  normalizeImage,
  type DocumentDetection,
  type GuideAssessment,
  type NormalizedImage,
} from "@/lib/image-processing";

type OpenCv = Awaited<ReturnType<typeof loadOpenCv>>;

type CameraError = "insecure" | "denied" | "unavailable" | "busy" | "unknown";

export function CameraDialog({
  title,
  onAccept,
  onClose,
}: {
  title: string;
  onAccept: (image: NormalizedImage) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const openCvRef = useRef<OpenCv | null>(null);
  const detectionRef = useRef<DocumentDetection | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [starting, setStarting] = useState(true);
  const [guide, setGuide] = useState<GuideAssessment>({
    ready: false,
    brightness: "balanced",
    detail: "low",
    hint: "Center the document and show all four corners.",
  });
  const [stableFrames, setStableFrames] = useState(0);
  const [manual, setManual] = useState(false);
  const [review, setReview] = useState<
    (NormalizedImage & { previewUrl: string }) | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [visionAvailable, setVisionAvailable] = useState(false);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    const requestId = cameraRequestRef.current;
    setStarting(true);
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext ? "unavailable" : "insecure");
      setStarting(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if (requestId !== cameraRequestRef.current) return;
      setStarting(false);
      void loadOpenCv()
        .then((cv) => {
          if (requestId !== cameraRequestRef.current) return;
          openCvRef.current = cv;
          setVisionAvailable(true);
        })
        .catch(() => {
          if (requestId !== cameraRequestRef.current) return;
          setVisionAvailable(false);
        });
    } catch (caught) {
      if (requestId !== cameraRequestRef.current) return;
      const name = caught instanceof DOMException ? caught.name : "";
      setError(
        name === "NotAllowedError"
          ? "denied"
          : name === "NotFoundError"
            ? "unavailable"
            : name === "NotReadableError"
              ? "busy"
              : "unknown",
      );
      setStarting(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    const start = window.setTimeout(() => void startCamera(), 0);
    return () => {
      window.clearTimeout(start);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(
    () => () => {
      if (review) URL.revokeObjectURL(review.previewUrl);
    },
    [review],
  );

  useEffect(() => {
    if (starting || error || review) return;
    const interval = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const width = 240;
      const height = Math.max(
        1,
        Math.round(width * (video.videoHeight / video.videoWidth)),
      );
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(video, 0, 0, width, height);
      const result = assessGuideFrame(
        context.getImageData(0, 0, width, height).data,
        width,
        height,
      );
      let detection: DocumentDetection | null = null;
      if (openCvRef.current) {
        try {
          detection = detectDocument(canvas, openCvRef.current);
        } catch {
          openCvRef.current = null;
          setVisionAvailable(false);
          setMessage(
            "Automatic edge detection stopped. Continue with manual capture.",
          );
        }
      }
      detectionRef.current = detection;
      const detectedResult: GuideAssessment = detection
        ? {
            ...result,
            ready: result.ready,
            hint: result.ready
              ? "All four corners detected. Hold steady and capture."
              : result.hint,
          }
        : {
            ...result,
            ready: false,
            hint: visionAvailable
              ? "Show all four document corners inside the guide."
              : "Preparing document detection. Manual capture is available.",
          };
      setGuide(detectedResult);
      setStableFrames((current) =>
        detectedResult.ready ? Math.min(current + 1, 5) : 0,
      );
    }, 150);
    return () => window.clearInterval(interval);
  }, [starting, error, review, visionAvailable]);

  async function processBlob(blob: Blob) {
    setProcessing(true);
    setMessage("");
    try {
      const image = await normalizeImage(blob);
      setReview({ ...image, previewUrl: URL.createObjectURL(image.blob) });
      stopCamera();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : "The image could not be processed.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) return;
    const detection = detectionRef.current;
    const cv = openCvRef.current;
    if (detection && cv && !manual) {
      try {
        await processBlob(
          await correctPerspective(canvas, detection.points, cv),
        );
      } catch {
        setManual(true);
        setMessage(
          "Automatic perspective correction failed. Use manual capture or choose an image.",
        );
      }
      return;
    }
    await processBlob(blob);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) await processBlob(file);
    event.target.value = "";
  }

  const guideReady = stableFrames >= 3;
  const errorCopy: Record<CameraError, string> = {
    insecure: "Camera access requires HTTPS. Choose an image instead.",
    denied:
      "Camera permission was denied. Allow it in browser settings or choose an image.",
    unavailable: "No compatible camera is available. Choose an image instead.",
    busy: "The camera is being used by another app. Close it or choose an image.",
    unknown: "The camera could not start. Choose an image instead.",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Capture ${title}`}
      className="fixed inset-0 z-50 flex min-h-svh flex-col bg-[#050609] text-white"
    >
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-4 pt-[env(safe-area-inset-top)]">
        <div>
          <p className="text-xs text-white/50">Capture</p>
          <h2 className="font-bold">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-11 items-center justify-center rounded-xl bg-white/8"
          aria-label="Close camera"
        >
          <X className="size-5" />
        </button>
      </header>

      {review ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-auto p-4">
          {/* Blob URL is local to this tab and is revoked on retake or accept. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.previewUrl}
            alt={`Review ${title}`}
            className="max-h-[65svh] max-w-full rounded-2xl object-contain"
          />
          <div className="flex w-full max-w-md gap-3">
            <Button
              variant="secondary"
              className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={() => {
                URL.revokeObjectURL(review.previewUrl);
                setReview(null);
                void startCamera();
              }}
            >
              <RotateCcw className="size-4" /> Retake
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                URL.revokeObjectURL(review.previewUrl);
                onAccept(review);
              }}
            >
              <CheckCircle2 className="size-4" /> Use photo
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              aria-label="Live camera preview"
            />
            <canvas ref={analysisCanvasRef} className="hidden" />
            {!error && !starting ? (
              <div
                className={`pointer-events-none absolute inset-[10%] rounded-3xl border-4 transition ${
                  guideReady
                    ? "border-success shadow-[0_0_30px_rgba(32,199,122,.45)]"
                    : "border-danger shadow-[0_0_30px_rgba(255,82,99,.35)]"
                }`}
              >
                <span className="absolute -top-11 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/75 px-3 py-2 text-xs font-semibold">
                  {guideReady ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <AlertCircle className="size-4 text-danger" />
                  )}
                  {guideReady ? "Ready to capture" : guide.hint}
                </span>
              </div>
            ) : null}
            {starting ? (
              <p className="text-sm text-white/65">Starting camera…</p>
            ) : null}
            {error ? (
              <div className="mx-5 max-w-md rounded-2xl border border-red-300/20 bg-red-300/8 p-5 text-center">
                <CameraOff className="mx-auto size-7 text-red-200" />
                <p className="mt-3 text-sm leading-6 text-red-100">
                  {errorCopy[error]}
                </p>
              </div>
            ) : null}
          </div>

          <footer className="safe-bottom grid gap-3 border-t border-white/10 bg-[#090b11] p-4 sm:grid-cols-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 text-sm font-semibold">
              <ImagePlus className="size-4" /> Choose image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={chooseFile}
                className="sr-only"
              />
            </label>
            <Button
              type="button"
              onClick={captureFrame}
              disabled={Boolean(error) || starting || (!guideReady && !manual)}
              loading={processing}
            >
              <Camera className="size-4" /> Capture
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              disabled={Boolean(error) || starting}
              onClick={() => setManual(true)}
            >
              Use manual capture
            </Button>
            {!visionAvailable && !starting && !error ? (
              <p className="text-center text-xs text-white/45 sm:col-span-3">
                Computer-vision guidance is still loading. You may continue with
                manual capture.
              </p>
            ) : null}
            {message ? (
              <p role="alert" className="text-sm text-red-200 sm:col-span-3">
                {message}
              </p>
            ) : null}
          </footer>
        </>
      )}
    </div>
  );
}
