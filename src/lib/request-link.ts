import { z } from "zod";
import {
  demoPaymentConfigSchema,
  type DemoPaymentConfig,
} from "@/lib/payment-demo";

export const MAX_DOCUMENTS = 20;
export const MAX_LINK_LENGTH = 7000;
export const MAX_QR_VALUE_LENGTH = 2200;
export const MAX_DOCUMENT_NAME_LENGTH = 80;

export type DocumentType = "SINGLE" | "FRONT_BACK" | "PDF_UPLOAD";

export type RequestDocument = {
  id: string;
  name: string;
  type: DocumentType;
  sortOrder: number;
};

/** Short human label describing a document's capture requirement, used as a
 * badge suffix in the Templates and Create Request UI. */
export function documentTypeLabel(type: DocumentType) {
  return type === "FRONT_BACK"
    ? "Front + Back"
    : type === "PDF_UPLOAD"
      ? "PDF upload"
      : null;
}

type RequestPayloadBase = {
  requestId: string;
  createdAt: string;
  expiresAt: string;
  documents: RequestDocument[];
};

export type Phase1RequestPayloadV1 = RequestPayloadBase & {
  version: 1;
};

export type Phase1RequestPayloadV2 = RequestPayloadBase & {
  version: 2;
  payment: DemoPaymentConfig;
};

export type Phase1RequestPayload =
  | Phase1RequestPayloadV1
  | Phase1RequestPayloadV2;

export type RequestLinkErrorCode =
  | "MALFORMED"
  | "UNSUPPORTED_VERSION"
  | "EXPIRED"
  | "TOO_LARGE"
  | "INVALID_EXPIRY"
  | "INVALID_DOCUMENTS";

export class RequestLinkError extends Error {
  constructor(
    public readonly code: RequestLinkErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "RequestLinkError";
  }
}

const documentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(MAX_DOCUMENT_NAME_LENGTH),
  type: z.enum(["SINGLE", "FRONT_BACK", "PDF_UPLOAD"]),
  sortOrder: z
    .number()
    .int()
    .min(0)
    .max(MAX_DOCUMENTS - 1),
});

const payloadBaseSchema = {
  requestId: z.string().uuid(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  documents: z.array(documentSchema).min(1).max(MAX_DOCUMENTS),
};

const payloadV1Schema = z
  .object({
    version: z.literal(1),
    ...payloadBaseSchema,
  })
  .strict();

const payloadV2Schema = z
  .object({
    version: z.literal(2),
    ...payloadBaseSchema,
    payment: demoPaymentConfigSchema,
  })
  .strict();

const payloadSchema = z.discriminatedUnion("version", [
  payloadV1Schema,
  payloadV2Schema,
]);

function assertDocumentSet(documents: RequestDocument[]) {
  const ids = new Set<string>();
  const names = new Set<string>();
  const orders = new Set<number>();

  for (const document of documents) {
    const normalizedName = document.name.trim().toLocaleLowerCase();
    if (
      ids.has(document.id) ||
      names.has(normalizedName) ||
      orders.has(document.sortOrder)
    ) {
      throw new RequestLinkError(
        "INVALID_DOCUMENTS",
        "Document ids, names, and order values must be unique.",
      );
    }
    ids.add(document.id);
    names.add(normalizedName);
    orders.add(document.sortOrder);
  }

  const ordered = [...documents].sort((a, b) => a.sortOrder - b.sortOrder);
  if (ordered.some((document, index) => document.sortOrder !== index)) {
    throw new RequestLinkError(
      "INVALID_DOCUMENTS",
      "Document order must be contiguous and start at zero.",
    );
  }
}

function parsePayload(value: unknown): Phase1RequestPayload {
  if (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version !== 1 &&
    value.version !== 2
  ) {
    throw new RequestLinkError(
      "UNSUPPORTED_VERSION",
      "This request link uses an unsupported version.",
    );
  }

  const result = payloadSchema.safeParse(value);
  if (!result.success) {
    throw new RequestLinkError(
      "MALFORMED",
      "The request link contains invalid data.",
    );
  }

  assertDocumentSet(result.data.documents);
  return {
    ...result.data,
    documents: [...result.data.documents].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    ),
  };
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value: string): string {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new RequestLinkError("MALFORMED", "The request link is malformed.");
  }
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new RequestLinkError("MALFORMED", "The request link is malformed.");
  }
}

export function createRequestPayload(
  documents: Array<Pick<RequestDocument, "id" | "name" | "type">>,
  expiryHours: number,
  now = new Date(),
): Phase1RequestPayloadV1 {
  if (!Number.isInteger(expiryHours) || expiryHours < 1 || expiryHours > 6) {
    throw new RequestLinkError(
      "INVALID_EXPIRY",
      "Expiry must be between one and six hours.",
    );
  }

  const ordered = documents.map((document, sortOrder) => ({
    ...document,
    name: document.name.trim(),
    sortOrder,
  }));

  const payload = parsePayload({
    version: 1,
    requestId: crypto.randomUUID(),
    createdAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + expiryHours * 60 * 60 * 1000,
    ).toISOString(),
    documents: ordered,
  });
  assertExpiry(payload);
  if (payload.version !== 1) {
    throw new RequestLinkError("MALFORMED", "Request data is invalid.");
  }
  return payload;
}

export function createPaidRequestPayload(
  documents: Array<Pick<RequestDocument, "id" | "name" | "type">>,
  expiryHours: number,
  payment: DemoPaymentConfig,
  now = new Date(),
): Phase1RequestPayloadV2 {
  if (!Number.isInteger(expiryHours) || expiryHours < 1 || expiryHours > 6) {
    throw new RequestLinkError(
      "INVALID_EXPIRY",
      "Expiry must be between one and six hours.",
    );
  }

  const ordered = documents.map((document, sortOrder) => ({
    ...document,
    name: document.name.trim(),
    sortOrder,
  }));
  const payload = parsePayload({
    version: 2,
    requestId: crypto.randomUUID(),
    createdAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + expiryHours * 60 * 60 * 1000,
    ).toISOString(),
    documents: ordered,
    payment,
  });
  assertExpiry(payload);
  if (payload.version !== 2) {
    throw new RequestLinkError("MALFORMED", "Payment data is missing.");
  }
  return payload;
}

export function hasDemoPayment(
  payload: Phase1RequestPayload,
): payload is Phase1RequestPayloadV2 {
  return payload.version === 2;
}

function assertExpiry(payload: Phase1RequestPayload, now?: Date) {
  const createdAt = Date.parse(payload.createdAt);
  const expiresAt = Date.parse(payload.expiresAt);
  const duration = expiresAt - createdAt;
  if (
    !Number.isFinite(duration) ||
    duration < 60 * 60 * 1000 ||
    duration > 6 * 60 * 60 * 1000
  ) {
    throw new RequestLinkError(
      "INVALID_EXPIRY",
      "The request expiry is outside the permitted range.",
    );
  }
  if (now && expiresAt <= now.getTime()) {
    throw new RequestLinkError("EXPIRED", "This request link has expired.");
  }
}

export function encodeRequestPayload(payload: Phase1RequestPayload): string {
  const parsed = parsePayload(payload);
  assertExpiry(parsed);
  const encoded = toBase64Url(JSON.stringify(parsed));
  if (encoded.length > MAX_LINK_LENGTH) {
    throw new RequestLinkError("TOO_LARGE", "The request link is too large.");
  }
  return encoded;
}

export function decodeRequestPayload(
  encoded: string,
  now = new Date(),
): Phase1RequestPayload {
  if (!encoded || encoded.length > MAX_LINK_LENGTH) {
    throw new RequestLinkError(
      encoded.length > MAX_LINK_LENGTH ? "TOO_LARGE" : "MALFORMED",
      "The request link is missing or too large.",
    );
  }
  let value: unknown;
  try {
    value = JSON.parse(fromBase64Url(encoded));
  } catch (error) {
    if (error instanceof RequestLinkError) throw error;
    throw new RequestLinkError("MALFORMED", "The request link is malformed.");
  }
  const payload = parsePayload(value);
  assertExpiry(payload, now);
  return payload;
}

export function buildRequestUrl(
  origin: string,
  payload: Phase1RequestPayload,
): string {
  const normalizedOrigin = origin.replace(/\/+$/u, "");
  const url = `${normalizedOrigin}/u#request=${encodeRequestPayload(payload)}`;
  if (url.length > MAX_LINK_LENGTH) {
    throw new RequestLinkError("TOO_LARGE", "The request link is too large.");
  }
  return url;
}

export function getEncodedRequestFromHash(hash: string): string | null {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(value).get("request");
}
