import { describe, expect, it } from "vitest";
import {
  isCaptureSetComplete,
  requiredCaptureKeys,
  type Phase1Capture,
} from "@/modules/user-upload/capture-store";
import type { Phase1RequestPayload } from "@/lib/request-link";

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

function capture(
  documentId: string,
  side: Phase1Capture["side"],
): Phase1Capture {
  return {
    documentId,
    side,
    blob: new Blob(["image"], { type: "image/jpeg" }),
    previewUrl: `blob:${documentId}:${side}`,
    width: 800,
    height: 600,
  };
}

describe("capture completeness", () => {
  it("requires one single and both front/back capture keys", () => {
    expect(requiredCaptureKeys(request)).toEqual([
      "22222222-2222-4222-8222-222222222222:SINGLE",
      "33333333-3333-4333-8333-333333333333:FRONT",
      "33333333-3333-4333-8333-333333333333:BACK",
    ]);
  });

  it("is complete only when every required side exists", () => {
    const captures = {
      "22222222-2222-4222-8222-222222222222:SINGLE": capture(
        "22222222-2222-4222-8222-222222222222",
        "SINGLE",
      ),
      "33333333-3333-4333-8333-333333333333:FRONT": capture(
        "33333333-3333-4333-8333-333333333333",
        "FRONT",
      ),
    };
    expect(isCaptureSetComplete(request, captures)).toBe(false);
    expect(
      isCaptureSetComplete(request, {
        ...captures,
        "33333333-3333-4333-8333-333333333333:BACK": capture(
          "33333333-3333-4333-8333-333333333333",
          "BACK",
        ),
      }),
    ).toBe(true);
  });
});
