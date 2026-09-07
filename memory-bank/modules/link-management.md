# Module Context — Link Management

**Module path (code):** `src/lib/request-link.ts`, (Phase 2) Supabase Edge Functions
**Related docs:** `PRD.md` §13–15, `TECH_STACK.md` §6, `MODELS.md` §2.4

## Purpose

Temporary link token issuance, expiry enforcement (max 6h), post-submission lock, and admin reactivation. This is the module responsible for the system's most critical business rule.

## Current Implementation Status

- Phase 1 implemented in `src/lib/request-link.ts`. The Admin builder and public resolver share
  the same typed schema, limits, encoder, decoder, and error model.
- Phase 2 still adds opaque server-issued tokens and authoritative enforcement.

## Key Logic

- Phase 1: versioned PII-free request payload encoded in `/u#request=...`,
  `crypto.randomUUID()` request id, one-to-six-hour expiry, Zod validation, and
  current-tab state. Oversized encoded links are rejected with actionable Admin
  feedback; valid links beyond conservative QR capacity retain copy and share
  actions without attempting QR rendering.
- Phase 2: opaque random tokens and centralized server validation for expiry,
  submission lock, and reactivation.

## Data It Owns / Reads

- Phase 1 owns no stored data.
- Phase 2 owns the `links` table.

## Dependencies

- Consumed by `modules/user-upload` (state resolution) and `modules/admin` (generation/reactivation).

## Known Issues

- Phase 1 payloads are encoded but not secret, signed, or tamper-proof.
- Phase 1 expiry depends on the User device clock.
- Phase 1 submitted state and reactivation cannot persist across reloads or
  devices.

## Decisions Log

- Whether `EXPIRED` is a stored status or computed at read-time from `expires_at` — decide during Phase 2 implementation and record here.
- 2026-09-07: Module context moved to the flat `modules/link-management.md` Memory Bank path; implementation status and scope are unchanged.
- 2026-09-07: Phase 1 uses a URL fragment because it must work across devices
  without a backend and fragments are not sent to the server. Only document
  configuration and timestamps are allowed; PII is prohibited.

## Next Steps

- Replace the self-contained payload with the Phase 2 opaque-token adapter while
  preserving the public no-login experience.
