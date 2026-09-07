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
  cornersMovement,
  detectDocument,
  evaluateReadiness,
  loadOpenCv,
  mapObjectCoverPoint,
  normalizeImage,
  type DocumentDetection,
  type NormalizedImage,
  type RelativePoint,
} from "@/lib/image-processing";

type OpenCv = Awaited<ReturnType<typeof loadOpenCv>>;

type CameraError = "insecure" | "denied" | "unavailable" | "busy" | "unknown";

/** Consecutive ~150ms analysis ticks the document must stay detected and
 * still for before an automatic capture fires. */
const AUTO_CAPTURE_STABLE_FRAMES = 4;
/** Sum of per-corner relative movement below which a detection is "still". */
const STABILITY_TOLERANCE = 0.035;
/** Pause after an automatic capture so the same physical page held in place
 * cannot immediately capture again before the user shows the next page. */
const AUTO_CAPTURE_COOLDOWN_MS = 1400;

export function CameraDialog({
  title,
  sessionKey,
  onAccept,
  onClose,
}: {
  title: string;
  /** Identifies the current capture target (e.g. `${documentId}:${side}`).
   * When this changes while the dialog stays mounted, per-target guide
   * state resets without restarting the live camera stream. */
  sessionKey?: string;
  onAccept: (image: NormalizedImage) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const openCvRef = useRef<OpenCv | null>(null);
  const detectionRef = useRef<DocumentDetection | null>(null);
  const previousPointsRef = useRef<DocumentDetection["points"] | null>(null);
  const autoCaptureLockRef = useRef(false);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [starting, setStarting] = useState(true);
  const [readyHint, setReadyHint] = useState(
    "Show all four document corners inside the guide.",
  );
  const [overlayPoints, setOverlayPoints] = useState<
    [RelativePoint, RelativePoint, RelativePoint, RelativePoint] | null
  >(null);
  const [stableFrames, setStableFrames] = useState(0);
  const [manual, setManual] = useState(false);
  const [review, setReview] = useState<
    (NormalizedImage & { previewUrl: string }) | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [autoCaptured, setAutoCaptured] = useState(false);
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
    // Intentionally runs once per mount only: the camera stream is reused
    // across auto-advanced targets within the same scanning session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset per-target guide/review state when the capture target changes
  // (e.g. auto-advancing from a document's front to its back) without
  // tearing down the still-running camera stream. This follows React's
  // "adjust state during render" pattern rather than an Effect, since it is
  // a synchronous response to a prop change, not a synchronization with an
  // external system.
  const [previousSessionKey, setPreviousSessionKey] = useState(sessionKey);
  if (sessionKey !== previousSessionKey) {
    setPreviousSessionKey(sessionKey);
    setOverlayPoints(null);
    setStableFrames(0);
    setManual(false);
    setMessage("");
    setAutoCaptured(false);
    setReview((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  // Refs are not part of render output, so they reset in a real Effect keyed
  // to the same target-change signal above.
  useEffect(() => {
    detectionRef.current = null;
    previousPointsRef.current = null;
    autoCaptureLockRef.current = false;
  }, [sessionKey]);

  useEffect(
    () => () => {
      if (review) URL.revokeObjectURL(review.previewUrl);
    },
    [review],
  );

  const autoCapture = useCallback(async () => {
    const video = videoRef.current;
    const detection = detectionRef.current;
    const cv = openCvRef.current;
    if (!video || video.videoWidth === 0 || !detection || !cv) {
      autoCaptureLockRef.current = false;
      return;
    }
    setProcessing(true);
    setMessage("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Capture is unavailable.");
      context.drawImage(video, 0, 0);
      const corrected = await correctPerspective(canvas, detection.points, cv);
      const image = await normalizeImage(corrected);
      if (navigator.vibrate) navigator.vibrate(40);
      setAutoCaptured(true);
      onAccept(image);
      window.setTimeout(() => setAutoCaptured(false), AUTO_CAPTURE_COOLDOWN_MS);
    } catch {
      setMessage(
        "Automatic capture failed. Use manual capture or choose an image.",
      );
    } finally {
      setProcessing(false);
      setStableFrames(0);
      previousPointsRef.current = null;
      window.setTimeout(() => {
        autoCaptureLockRef.current = false;
      }, AUTO_CAPTURE_COOLDOWN_MS);
    }
  }, [onAccept]);

  useEffect(() => {
    if (starting || error || review || processing) return;
    const interval = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      const container = containerRef.current;
      if (!video || !canvas || !container || video.readyState < 2) return;
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
      const { ready, hint } = evaluateReadiness(detection, result);
      setReadyHint(hint);

      if (detection) {
        const rect = container.getBoundingClientRect();
        const mapped = detection.points.map((point) =>
          mapObjectCoverPoint(
            point,
            { width: rect.width, height: rect.height },
            { width: video.videoWidth, height: video.videoHeight },
          ),
        ) as [RelativePoint, RelativePoint, RelativePoint, RelativePoint];
        setOverlayPoints(mapped);

        const previous = previousPointsRef.current;
        const stillEnough =
          previous !== null &&
          cornersMovement(detection.points, previous) < STABILITY_TOLERANCE;
        previousPointsRef.current = detection.points;
        setStableFrames((current) => {
          if (!ready) return 0;
          return stillEnough
            ? Math.min(current + 1, AUTO_CAPTURE_STABLE_FRAMES)
            : 1;
        });
      } else {
        previousPointsRef.current = null;
        setOverlayPoints(null);
        setStableFrames(0);
      }
    }, 150);
    return () => window.clearInterval(interval);
  }, [starting, error, review, processing]);

  // Fire the automatic shutter once the document has been detected and held
  // still for AUTO_CAPTURE_STABLE_FRAMES ticks. Manual override skips this.
  // Deferred via setTimeout so the state updates inside `autoCapture` happen
  // outside this Effect's synchronous body; the lock is set inside the
  // timeout so a cancelled/re-run effect can still retrigger correctly.
  useEffect(() => {
    if (manual || autoCaptureLockRef.current) return;
    if (stableFrames < AUTO_CAPTURE_STABLE_FRAMES) return;
    const timeout = window.setTimeout(() => {
      if (autoCaptureLockRef.current) return;
      autoCaptureLockRef.current = true;
      void autoCapture();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [stableFrames, manual, autoCapture]);

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
    if (detection && cv) {
      try {
        await processBlob(
          await correctPerspective(canvas, detection.points, cv),
        );
      } catch {
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

  const guideReady = stableFrames >= AUTO_CAPTURE_STABLE_FRAMES;
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
          <div
            ref={containerRef}
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black"
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              aria-label="Live camera preview"
            />
            <canvas ref={analysisCanvasRef} className="hidden" />
            {!error && !starting ? (
              overlayPoints ? (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <polygon
                    points={overlayPoints
                      .map((point) => `${point.x * 100},${point.y * 100}`)
                      .join(" ")}
                    fill={
                      guideReady
                        ? "rgba(32,199,122,0.18)"
                        : "rgba(255,82,99,0.12)"
                    }
                    stroke={guideReady ? "#20c77a" : "#ff5263"}
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div
                  className={`pointer-events-none absolute inset-[10%] rounded-3xl border-4 transition ${
                    guideReady
                      ? "border-success shadow-[0_0_30px_rgba(32,199,122,.45)]"
                      : "border-danger shadow-[0_0_30px_rgba(255,82,99,.35)]"
                  }`}
                />
              )
            ) : null}
            {!error && !starting ? (
              <span className="pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/75 px-3 py-2 text-xs font-semibold">
                {guideReady ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <AlertCircle className="size-4 text-danger" />
                )}
                {guideReady ? "Ready — capturing automatically" : readyHint}
              </span>
            ) : null}
            {autoCaptured ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/10">
                <span className="flex items-center gap-2 rounded-full bg-success/90 px-4 py-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="size-4" /> Captured — show the next
                  page
                </span>
              </span>
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
              onClick={() => setManual((current) => !current)}
            >
              {manual ? "Resume automatic capture" : "Use manual capture"}
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
