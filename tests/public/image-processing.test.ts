import { describe, expect, it } from "vitest";
import { assessGuideFrame, validateImageFile } from "@/lib/image-processing";

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
