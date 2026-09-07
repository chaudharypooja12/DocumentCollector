export const MAX_CAPTURE_BYTES = 15 * 1024 * 1024;
export const MAX_CAPTURE_EDGE = 2400;
export const JPEG_QUALITY = 0.86;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type NormalizedImage = {
  blob: Blob;
  width: number;
  height: number;
};

export type GuideAssessment = {
  ready: boolean;
  brightness: "dark" | "balanced" | "bright";
  detail: "low" | "adequate";
  hint: string;
};

export type RelativePoint = {
  x: number;
  y: number;
};

export type DocumentDetection = {
  points: [RelativePoint, RelativePoint, RelativePoint, RelativePoint];
  coverage: number;
};

type OpenCv = typeof import("@techstark/opencv-js");

declare global {
  interface Window {
    cv?: OpenCv | Promise<OpenCv>;
  }
}

export function validateImageFile(file: Blob) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size <= 0 || file.size > MAX_CAPTURE_BYTES) {
    throw new Error("Choose an image smaller than 15 MB.");
  }
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The image could not be encoded.")),
      type,
      quality,
    );
  });
}

export async function normalizeImage(file: Blob): Promise<NormalizedImage> {
  validateImageFile(file);
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    if (bitmap.width < 120 || bitmap.height < 120) {
      throw new Error("The image resolution is too low.");
    }
    const scale = Math.min(
      1,
      MAX_CAPTURE_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Image processing is unavailable.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    return {
      blob: await canvasBlob(canvas, "image/jpeg", JPEG_QUALITY),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}

export function assessGuideFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): GuideAssessment {
  if (width < 2 || height < 2 || data.length < width * height * 4) {
    return {
      ready: false,
      brightness: "dark",
      detail: "low",
      hint: "Keep the whole document inside the guide.",
    };
  }
  let luminanceTotal = 0;
  let luminanceSquared = 0;
  let samples = 0;
  const stride = Math.max(1, Math.floor((width * height) / 5000));
  for (let pixel = 0; pixel < width * height; pixel += stride) {
    const offset = pixel * 4;
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    luminanceTotal += luminance;
    luminanceSquared += luminance * luminance;
    samples += 1;
  }
  const mean = luminanceTotal / samples;
  const variance = luminanceSquared / samples - mean * mean;
  const brightness = mean < 55 ? "dark" : mean > 225 ? "bright" : "balanced";
  const detail = variance < 250 ? "low" : "adequate";
  const ready = brightness === "balanced" && detail === "adequate";
  return {
    ready,
    brightness,
    detail,
    hint:
      brightness === "dark"
        ? "Move to brighter, even lighting."
        : brightness === "bright"
          ? "Reduce glare on the document."
          : detail === "low"
            ? "Move closer and hold the phone steady."
            : "Document looks clear. Hold steady and capture.",
  };
}

let openCvPromise: Promise<OpenCv> | null = null;

export function loadOpenCv(): Promise<OpenCv> {
  if (openCvPromise) return openCvPromise;
  openCvPromise = new Promise<OpenCv>((resolve, reject) => {
    const resolveRuntime = async () => {
      const candidate = window.cv;
      if (!candidate) {
        reject(new Error("OpenCV did not expose its runtime."));
        return;
      }
      try {
        resolve(await candidate);
      } catch {
        reject(new Error("OpenCV could not initialize."));
      }
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-document-collector-opencv="true"]',
    );
    if (existing) {
      if (window.cv) {
        void resolveRuntime();
        return;
      }
      existing.addEventListener("load", () => void resolveRuntime(), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => reject(new Error("OpenCV could not be loaded.")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "/opencv/opencv.js";
    script.async = true;
    script.dataset.documentCollectorOpencv = "true";
    script.addEventListener("load", () => void resolveRuntime(), {
      once: true,
    });
    script.addEventListener(
      "error",
      () => reject(new Error("OpenCV could not be loaded.")),
      { once: true },
    );
    document.head.append(script);
  });
  return openCvPromise;
}

function orderCorners(points: RelativePoint[]) {
  const topLeft = points.reduce((best, point) =>
    point.x + point.y < best.x + best.y ? point : best,
  );
  const bottomRight = points.reduce((best, point) =>
    point.x + point.y > best.x + best.y ? point : best,
  );
  const topRight = points.reduce((best, point) =>
    point.x - point.y > best.x - best.y ? point : best,
  );
  const bottomLeft = points.reduce((best, point) =>
    point.x - point.y < best.x - best.y ? point : best,
  );
  return [topLeft, topRight, bottomRight, bottomLeft] as [
    RelativePoint,
    RelativePoint,
    RelativePoint,
    RelativePoint,
  ];
}

export function detectDocument(
  canvas: HTMLCanvasElement,
  cv: OpenCv,
): DocumentDetection | null {
  const source = cv.imread(canvas);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  let best: DocumentDetection | null = null;
  try {
    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edges, 60, 160);
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );
    const frameArea = canvas.width * canvas.height;
    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const approximation = new cv.Mat();
      try {
        const perimeter = cv.arcLength(contour, true);
        cv.approxPolyDP(contour, approximation, perimeter * 0.025, true);
        if (approximation.rows !== 4 || !cv.isContourConvex(approximation)) {
          continue;
        }
        const coverage = Math.abs(cv.contourArea(approximation)) / frameArea;
        if (coverage < 0.25 || coverage > 0.96) continue;
        const points: RelativePoint[] = [];
        for (let row = 0; row < 4; row += 1) {
          points.push({
            x: (approximation.data32S[row * 2] ?? 0) / canvas.width,
            y: (approximation.data32S[row * 2 + 1] ?? 0) / canvas.height,
          });
        }
        if (!best || coverage > best.coverage) {
          best = { points: orderCorners(points), coverage };
        }
      } finally {
        contour.delete();
        approximation.delete();
      }
    }
    return best;
  } finally {
    source.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  }
}

function distance(left: RelativePoint, right: RelativePoint) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export async function correctPerspective(
  sourceCanvas: HTMLCanvasElement,
  points: DocumentDetection["points"],
  cv: OpenCv,
): Promise<Blob> {
  const scalePoint = (point: RelativePoint) => ({
    x: point.x * sourceCanvas.width,
    y: point.y * sourceCanvas.height,
  });
  const scaled = [
    scalePoint(points[0]),
    scalePoint(points[1]),
    scalePoint(points[2]),
    scalePoint(points[3]),
  ] as const;
  const [topLeft, topRight, bottomRight, bottomLeft] = scaled;
  const width = Math.max(
    1,
    Math.round(
      Math.max(distance(topLeft, topRight), distance(bottomLeft, bottomRight)),
    ),
  );
  const height = Math.max(
    1,
    Math.round(
      Math.max(distance(topLeft, bottomLeft), distance(topRight, bottomRight)),
    ),
  );
  const source = cv.imread(sourceCanvas);
  const destination = new cv.Mat();
  const sourcePoints = cv.matFromArray(
    4,
    1,
    cv.CV_32FC2,
    scaled.flatMap((point) => [point.x, point.y]),
  );
  const destinationPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    width,
    0,
    width,
    height,
    0,
    height,
  ]);
  const transform = cv.getPerspectiveTransform(sourcePoints, destinationPoints);
  try {
    cv.warpPerspective(
      source,
      destination,
      transform,
      new cv.Size(width, height),
      cv.INTER_LINEAR,
      cv.BORDER_REPLICATE,
    );
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    cv.imshow(output, destination);
    return canvasBlob(output, "image/jpeg", 0.92);
  } finally {
    source.delete();
    destination.delete();
    sourcePoints.delete();
    destinationPoints.delete();
    transform.delete();
  }
}
