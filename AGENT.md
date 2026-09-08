# Agent Instructions

## Context Continuity

Always read `memory-bank/INDEX.md` before making changes. The Memory Bank is the
persistent source of project requirements, technical decisions, implementation
status, and task history.

## Before Starting Work

1. Read `memory-bank/INDEX.md`.
2. Read `memory-bank/COMPANY.md` when a task affects branding, company copy,
   contact details, shared layouts, or public-facing identity.
3. Use its Module Map to identify and read each relevant
   `memory-bank/modules/<module>.md` file.
4. Read `memory-bank/RECENT_CHANGES.md`.
5. Read the relevant phase file:
   - `memory-bank/PHASE_1_FRONTEND.md`
   - `memory-bank/PHASE_2_BACKEND.md`
   - `memory-bank/PHASE_3_PAYMENT_GATEWAY.md`
6. Inspect the existing implementation before writing code.

Do not skip these steps, even for small tasks.

## Memory Bank Updates

After every implementation or documentation task:

1. Update each affected module file with its current status, decisions, known
   issues, and next steps.
2. Update the relevant phase checklist.
3. Add a newest-first entry to `memory-bank/RECENT_CHANGES.md`; never rewrite
   existing history.
4. Update `memory-bank/ARCHITECTURE.md` and/or `memory-bank/MODELS.md` when the
   architecture, API surface, or data model changes.
5. Update the status snapshot in `memory-bank/INDEX.md` when a phase status
   changes.

A task is not complete until the Memory Bank reflects it.

## Non-Negotiable Product Rules

- Public users have no account, login, or profile.
- DocumentCollector is owned by MBWays and uses the approved MBWays logo with
  the endorsement `Powered by MBWays`.
- Phase 1 has no backend, database, auth, upload, localStorage, sessionStorage,
  IndexedDB, cookies, or persistent product data.
- Phase 1 request links may encode document configuration and expiry but must
  never contain User PII or document content.
- Initial request-link expiry never exceeds six hours. Admin renewal may add
  1–24 hours from the renewal action and is server-authoritative in production.
- Phase 1 locks only the current in-memory tab after local generation. Phase 2
  must enforce `SUBMITTED` links and Admin reactivation authoritatively.
- Front and back documents render on one shared A4 page; single documents get
  one page each.
- Reactivation may extend the existing token or issue a new token that
  authoritatively revokes the old one.
- Never expose a Supabase service-role key or another privileged secret to the
  client bundle.
- Phase 1 may demonstrate payment UX with clearly labeled, in-memory mock
  outcomes only. Real gateway SDKs, APIs, keys, charges, verification, and
  settlement remain Phase 3 work.

## Documentation Rules

- Use Markdown checkboxes for task-level progress.
- Keep module files factual and remove stale implementation-status statements.
- Keep `RECENT_CHANGES.md` append-only.
- Use relative links between Memory Bank documents.

## Related Files

- `README.md` — project overview and setup.
- `memory-bank/COMPANY.md` — MBWays company and brand source for this product.
- `memory-bank/INDEX.md` — Memory Bank entry point.
