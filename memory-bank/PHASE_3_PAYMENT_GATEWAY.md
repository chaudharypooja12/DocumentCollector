# Phase 3 — Payment Gateway

**Scope:** Replace the Phase 1 mock-payment UI with secure one-time payment per
document request.
**Status:** Not started — Phase 1 contains UI simulation only.
**Related docs:** `PRD.md` §22, `ARCHITECTURE.md` §8

---

## 1. Requirements Gathering

- [x] Define paid action: one-time payment after upload and before PDF access
- [x] Define initial markets: India/INR and UAE/AED
- [x] Define initial provider direction: Razorpay behind a gateway-neutral adapter
- [ ] Document the finalized paid-feature list back into `PRD.md` (update MVP/Phase 3 scope section)

---

## 2. Payment Gateway Selection

- [x] Select Razorpay as the first provider direction for an Indian GST business
- [ ] Confirm international-payment activation, AED presentment, fees, settlement, and export documentation with Razorpay
- [ ] Set up sandbox/test account
- [ ] Set up production account (business verification/KYC as required by provider)

---

## 3. Data Model Extensions

- [ ] Add country pricing and immutable request price revisions
- [ ] Add payment attempts/events with provider references and idempotency keys
- [ ] Add `admin_id` scoping consistent with existing single-admin schema, structured to extend to multi-admin later
- [ ] Migration scripts + RLS policies for all new tables

---

## 4. Checkout & Billing UI

- [ ] Replace Admin demo pricing with persistent country pricing
- [ ] Checkout flow (redirect or embedded, per provider's recommended integration)
- [ ] Payment success/failure screens
- [ ] Add Admin request payment, refund, and reconciliation status

---

## 5. Backend Integration

- [ ] Server-side endpoint to create checkout session / order
- [ ] Webhook endpoint to receive payment confirmation events
- [ ] Webhook signature verification (security-critical)
- [ ] Idempotent webhook handling (avoid double-processing on retries)
- [ ] Update request/payment records on confirmed payment
- [ ] Generate and expose PDFs only after authoritative payment confirmation

---

## 6. Invoicing & Receipts

- [ ] Generate invoice/receipt on successful payment (PDF or provider-hosted invoice link)
- [ ] Email receipt to Admin
- [ ] Store invoice reference in `payments` table

---

## 7. Subscription Lifecycle Management

- [ ] Handle renewal events
- [ ] Handle failed payment / dunning flow
- [ ] Handle cancellation/downgrade
- [ ] Handle plan upgrade (proration if applicable)

---

## 8. Security & Compliance

- [ ] No raw card data ever touches application servers (use provider-hosted checkout / tokenization)
- [ ] Store only provider-issued tokens/references, never full card numbers
- [ ] Review PCI-DSS applicability given chosen integration method
- [ ] Secrets (API keys, webhook secrets) managed via environment secrets, never committed to repo

---

## 9. Testing

- [ ] Sandbox end-to-end test: checkout → webhook → plan activation
- [ ] Failure-path tests: declined payment, webhook signature mismatch, duplicate webhook delivery
- [ ] Regression test: existing free-tier flows (Phase 1/2) remain unaffected for non-paying admins

---

## 10. Deployment & Monitoring

- [ ] Add payment-related secrets to production environment
- [ ] Add monitoring/alerting on webhook failures
- [ ] Add basic revenue/usage reporting view for the Admin

---

## 11. Wrap-Up

- [ ] Update `MODELS.md` with finalized billing schema
- [ ] Update `ARCHITECTURE.md` with payment integration details and decision log entries
- [ ] Update `RECENT_CHANGES.md`
- [ ] Update `memory-bank/INDEX.md` status snapshot (Phase 3 → In Progress/Complete)
