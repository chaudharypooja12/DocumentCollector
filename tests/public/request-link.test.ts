import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequestUrl,
  createRequestPayload,
  decodeRequestPayload,
  encodeRequestPayload,
  RequestLinkError,
} from "@/lib/request-link";

const now = new Date("2026-09-07T00:00:00.000Z");

describe("Phase 1 request links", () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("round-trips UTF-8 document labels in order", () => {
    const payload = createRequestPayload(
      [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "पासपोर्ट",
          type: "FRONT_BACK",
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Photograph",
          type: "SINGLE",
        },
      ],
      3,
      now,
    );

    const decoded = decodeRequestPayload(
      encodeRequestPayload(payload),
      new Date("2026-09-07T01:00:00.000Z"),
    );

    expect(decoded).toEqual(payload);
    expect(buildRequestUrl("https://example.test/", payload)).toMatch(
      /^https:\/\/example\.test\/u#request=/u,
    );
  });

  it.each([0, 7, 1.5])("rejects invalid expiry %s", (expiry) => {
    expect(() =>
      createRequestPayload(
        [
          {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Passport",
            type: "SINGLE",
          },
        ],
        expiry,
        now,
      ),
    ).toThrow(RequestLinkError);
  });

  it("distinguishes an expired request", () => {
    const payload = createRequestPayload(
      [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Passport",
          type: "SINGLE",
        },
      ],
      1,
      now,
    );
    expect(() =>
      decodeRequestPayload(
        encodeRequestPayload(payload),
        new Date("2026-09-07T01:00:01.000Z"),
      ),
    ).toThrow(expect.objectContaining({ code: "EXPIRED" }));
  });

  it("rejects duplicate document names", () => {
    expect(() =>
      createRequestPayload(
        [
          {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Passport",
            type: "SINGLE",
          },
          {
            id: "33333333-3333-4333-8333-333333333333",
            name: " passport ",
            type: "SINGLE",
          },
        ],
        2,
        now,
      ),
    ).toThrow(expect.objectContaining({ code: "INVALID_DOCUMENTS" }));
  });

  it("rejects malformed and unsupported payloads", () => {
    expect(() => decodeRequestPayload("not-json", now)).toThrow(
      expect.objectContaining({ code: "MALFORMED" }),
    );
    const unsupported = btoa(
      JSON.stringify({
        version: 2,
        requestId: "11111111-1111-4111-8111-111111111111",
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 3600000).toISOString(),
        documents: [],
      }),
    )
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/u, "");
    expect(() => decodeRequestPayload(unsupported, now)).toThrow(
      expect.objectContaining({ code: "UNSUPPORTED_VERSION" }),
    );
  });

  it("rejects request payloads that exceed the encoded-link limit", () => {
    const documents = Array.from({ length: 20 }, (_, index) => ({
      id: `22222222-2222-4222-8222-${String(index).padStart(12, "0")}`,
      name: `${String(index).padStart(2, "0")}-${"界".repeat(77)}`,
      type: "SINGLE" as const,
    }));

    expect(() =>
      buildRequestUrl(
        "https://example.test",
        createRequestPayload(documents, 3, now),
      ),
    ).toThrow(expect.objectContaining({ code: "TOO_LARGE" }));
  });
});
