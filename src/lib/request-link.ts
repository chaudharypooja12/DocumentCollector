import { z } from "zod";

export const MAX_DOCUMENTS = 20;
export const MAX_LINK_LENGTH = 7000;
export const MAX_QR_VALUE_LENGTH = 2200;
export const MAX_DOCUMENT_NAME_LENGTH = 80;

export type DocumentType = "SINGLE" | "FRONT_BACK";

export type RequestDocument = {
  id: string;
  name: string;
  type: DocumentType;
  sortOrder: number;
};

export type Phase1RequestPayload = {
  version: 1;
  requestId: string;
  createdAt: string;
  expiresAt: string;
  documents: RequestDocument[];
};

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
  type: z.enum(["SINGLE", "FRONT_BACK"]),
  sortOrder: z
    .number()
    .int()
    .min(0)
    .max(MAX_DOCUMENTS - 1),
});

const payloadSchema = z.object({
  version: z.literal(1),
  requestId: z.string().uuid(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  documents: z.array(documentSchema).min(1).max(MAX_DOCUMENTS),
});

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
    value.version !== 1
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
): Phase1RequestPayload {
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
  return payload;
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
