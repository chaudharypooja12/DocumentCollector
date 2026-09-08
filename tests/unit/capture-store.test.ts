import { describe, expect, it } from "vitest";
import {
  isCaptureSetComplete,
  nextCaptureTarget,
  orderedCaptureTargets,
  requiredCaptureKeys,
  type Phase1Capture,
} from "@/features/user-upload/capture-store";
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

describe("auto-advance capture ordering", () => {
  const singleTarget = {
    documentId: "22222222-2222-4222-8222-222222222222",
    documentName: "Photo",
    side: "SINGLE" as const,
  };
  const frontTarget = {
    documentId: "33333333-3333-4333-8333-333333333333",
    documentName: "Passport",
    side: "FRONT" as const,
  };
  const backTarget = {
    documentId: "33333333-3333-4333-8333-333333333333",
    documentName: "Passport",
    side: "BACK" as const,
  };

  it("orders targets by document then front before back", () => {
    expect(orderedCaptureTargets(request)).toEqual([
      singleTarget,
      frontTarget,
      backTarget,
    ]);
  });

  it("advances to the next uncaptured target after the current one", () => {
    expect(nextCaptureTarget(request, {}, singleTarget)).toEqual(frontTarget);
    expect(nextCaptureTarget(request, {}, frontTarget)).toEqual(backTarget);
    expect(nextCaptureTarget(request, {}, backTarget)).toBeNull();
  });

  it("skips targets that already have a capture", () => {
    const captures = {
      "33333333-3333-4333-8333-333333333333:FRONT": capture(
        "33333333-3333-4333-8333-333333333333",
        "FRONT",
      ),
    };
    expect(nextCaptureTarget(request, captures, singleTarget)).toEqual(
      backTarget,
    );
  });
});
