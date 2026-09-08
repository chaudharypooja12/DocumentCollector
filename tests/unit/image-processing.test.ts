import { describe, expect, it } from "vitest";
import {
  assessGuideFrame,
  cornersMovement,
  evaluateReadiness,
  mapObjectCoverPoint,
  validateImageFile,
  type DocumentDetection,
} from "@/lib/image-processing";

function frame(values: number[]) {
  return new Uint8ClampedArray(
    values.flatMap((value) => [value, value, value, 255]),
  );
}

describe("capture quality assessment", () => {
  it("rejects unsupported and oversized images", () => {
    expect(() =>
      validateImageFile(new Blob(["x"], { type: "text/plain" })),
    ).toThrow(/JPEG/u);
    expect(() =>
      validateImageFile(
        new Blob([new Uint8Array(15 * 1024 * 1024 + 1)], {
          type: "image/jpeg",
        }),
      ),
    ).toThrow(/15 MB/u);
  });

  it("reports dark and bright frames with corrective guidance", () => {
    expect(assessGuideFrame(frame([10, 12, 9, 11]), 2, 2)).toMatchObject({
      ready: false,
      brightness: "dark",
    });
    expect(assessGuideFrame(frame([250, 245, 248, 252]), 2, 2)).toMatchObject({
      ready: false,
      brightness: "bright",
    });
  });

  it("accepts a balanced frame with sufficient contrast", () => {
    expect(assessGuideFrame(frame([30, 220, 45, 205]), 2, 2)).toMatchObject({
      ready: true,
      brightness: "balanced",
      detail: "adequate",
    });
  });
});

const square: DocumentDetection["points"] = [
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.1 },
  { x: 0.9, y: 0.9 },
  { x: 0.1, y: 0.9 },
];

describe("automatic capture readiness", () => {
  it("is never ready without a detected document", () => {
    expect(
      evaluateReadiness(null, {
        ready: true,
        brightness: "balanced",
        detail: "adequate",
        hint: "",
      }),
    ).toMatchObject({ ready: false });
  });

  it("requires balanced lighting even with a detected document", () => {
    const detection: DocumentDetection = { points: square, coverage: 0.5 };
    expect(
      evaluateReadiness(detection, {
        ready: false,
        brightness: "dark",
        detail: "low",
        hint: "",
      }),
    ).toMatchObject({ ready: false, hint: expect.stringMatching(/bright/iu) });
    expect(
      evaluateReadiness(detection, {
        ready: false,
        brightness: "bright",
        detail: "low",
        hint: "",
      }),
    ).toMatchObject({ ready: false, hint: expect.stringMatching(/glare/iu) });
  });

  it("is ready once a document is detected under balanced lighting", () => {
    const detection: DocumentDetection = { points: square, coverage: 0.5 };
    expect(
      evaluateReadiness(detection, {
        ready: false,
        brightness: "balanced",
        detail: "low",
        hint: "",
      }),
    ).toMatchObject({ ready: true });
  });
});

describe("corner stability", () => {
  it("reports zero movement for identical corners", () => {
    expect(cornersMovement(square, square)).toBe(0);
  });

  it("reports movement proportional to corner displacement", () => {
    const shifted = square.map((point) => ({
      x: point.x + 0.05,
      y: point.y,
    })) as DocumentDetection["points"];
    expect(cornersMovement(square, shifted)).toBeCloseTo(0.2, 5);
  });
});

describe("object-cover coordinate mapping", () => {
  it("returns the same point when container and media share an aspect ratio", () => {
    const point = mapObjectCoverPoint(
      { x: 0.25, y: 0.75 },
      { width: 400, height: 300 },
      { width: 800, height: 600 },
    );
    expect(point.x).toBeCloseTo(0.25, 5);
    expect(point.y).toBeCloseTo(0.75, 5);
  });

  it("accounts for horizontal cropping when the media is relatively wider", () => {
    // A 16:9 video rendered in a 4:3 container crops the video's left/right
    // edges, so a point near the raw frame's edge maps outside the visible
    // container range (and should be clamped by callers if drawn).
    const point = mapObjectCoverPoint(
      { x: 0, y: 0.5 },
      { width: 400, height: 400 },
      { width: 1600, height: 900 },
    );
    expect(point.x).toBeLessThan(0);
    expect(point.y).toBeCloseTo(0.5, 5);
  });
});
