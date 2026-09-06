# Phase 3 — Payment Gateway

**Scope:** Introduce payment processing for paid features/plans. Not included in Phase 1 or Phase 2 per `PRD.md` §22, §28.
**Status:** Not started — requirements below are a planning-level checklist to be refined once paid-feature scope is finalized.
**Related docs:** `PRD.md` §22, `ARCHITECTURE.md` §8

---

## 1. Requirements Gathering

- [ ] Define which features/limits become paid (e.g., number of users beyond a free tier, storage retention duration, priority PDF processing, additional admin seats)
- [ ] Define pricing model (one-time, subscription/monthly, usage-based, credits)
- [ ] Define currency/region support requirements (based on target markets)
- [ ] Document the finalized paid-feature list back into `PRD.md` (update MVP/Phase 3 scope section)

---

## 2. Payment Gateway Selection

- [ ] Evaluate candidate providers (e.g., Razorpay, Stripe, PayU) against: supported regions/currencies, fee structure, webhook reliability, compliance support
- [ ] Select provider and record decision + reasoning in `ARCHITECTURE.md` §9 decision log
- [ ] Set up sandbox/test account
- [ ] Set up production account (business verification/KYC as required by provider)

---

## 3. Data Model Extensions

- [ ] Add `plans` table (plan name, price, billing interval, feature limits)
- [ ] Add `subscriptions` (or `billing_accounts`) table linked to `admins`
- [ ] Add `payments` / `invoices` table (transaction records, status, provider reference id)
- [ ] Add `admin_id` scoping consistent with existing single-admin schema, structured to extend to multi-admin later
- [ ] Migration scripts + RLS policies for all new tables

---

## 4. Checkout & Billing UI

- [ ] Pricing/plans page (Admin-facing)
- [ ] Checkout flow (redirect or embedded, per provider's recommended integration)
- [ ] Payment success/failure screens
- [ ] Admin billing dashboard: current plan, usage vs. limits, invoice history, payment method management

---

## 5. Backend Integration

- [ ] Server-side endpoint to create checkout session / order
- [ ] Webhook endpoint to receive payment confirmation events
- [ ] Webhook signature verification (security-critical)
- [ ] Idempotent webhook handling (avoid double-processing on retries)
- [ ] Update `subscriptions`/`payments` records on confirmed payment
- [ ] Enforce plan limits in application logic (e.g., block user creation beyond free-tier cap unless subscribed)

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
