# Safe Haven Foundation --- Technical Requirements Document

**Product:** Safe Haven Foundation --- 3rd Edition Food Drive\
**Version:** 1.1\
**Stack:** Next.js, TypeScript, Tailwind CSS, Neon Postgres, Paystack,
Vercel

## 1. Architecture

Use a single Next.js application deployed on Vercel. Next.js server
route handlers perform payment initialization, verification and webhook
processing. Neon provides managed PostgreSQL storage.

Core components: 1. Next.js frontend: landing page, donation form,
impact display and thank-you states. 2. Next.js server routes: create
and verify Paystack transactions; receive webhooks. 3. Neon Postgres:
campaign settings and donation records. 4. Paystack: hosted checkout and
payment processing. 5. Vercel: hosting and environment-variable
management.

Do not add Supabase. Do not add a separate backend service, queue,
microservice or admin dashboard for the MVP.

## 2. Suggested project structure

``` text
app/
  page.tsx
  layout.tsx
  donate/success/page.tsx
  api/
    payments/initialize/route.ts
    payments/verify/route.ts
    payments/webhook/route.ts
components/
  Hero.tsx
  About.tsx
  ImpactCounter.tsx
  DonationSection.tsx
  ProvisionSection.tsx
  ContactSection.tsx
  ThankYou.tsx
lib/
  db.ts
  paystack.ts
  donations.ts
  impact.ts
  validation.ts
public/
  images/
  flyer/
```

Adapt this structure if the selected Next.js version uses a different
convention. Avoid creating abstractions that do not simplify the
implementation.

## 3. Database: Neon Postgres

Use Neon as the PostgreSQL provider. Connect from server-side code only.
Use the Neon serverless driver or another compatible PostgreSQL client
appropriate for Vercel serverless functions. Keep the connection string
private.

### 3.1 `donations`

Suggested schema:

``` sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  amount_kobo BIGINT NOT NULL CHECK (amount_kobo > 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  donor_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'successful', 'failed')),
  campaign_edition INTEGER NOT NULL DEFAULT 3,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX donations_status_edition_idx
  ON donations (status, campaign_edition);
```

Store donor email only if required for payment reconciliation/receipts.
Do not expose it publicly.

### 3.2 `campaign_settings`

A simple singleton settings row can hold: - `campaign_edition` -
`historical_raised_kobo` (nullable until exact historical total is
known) - `historical_raised_label` (initially `₦400,000+`) -
`historical_students_label` (initially `300+`) - `meal_cost_kobo`
(initially `120000`) - `updated_at`

The historical amount is currently a milestone, not an exact number. Do
not seed ₦400,000 as an exact amount and then present it as precise.
Keep the display label `₦400,000+` until an exact verified baseline is
supplied.

## 4. Payment flow

### 4.1 `POST /api/payments/initialize`

Input: - donor email - donation amount in naira (or an explicitly
defined integer-kobo contract; use one consistently)

Server responsibilities: 1. Validate email format. 2. Validate amount is
finite, positive and above the configured minimum. 3. Convert naira to
integer kobo safely. 4. Generate a unique, unpredictable payment
reference. 5. Insert a pending donation row before or as part of
transaction initialization. 6. Initialize a Paystack transaction using
the secret key, amount in kobo, email, reference and callback URL. 7.
Return only the authorization URL and reference needed by the browser.

Do not accept a client-supplied status, amount-in-kobo override or
Paystack secret.

### 4.2 `GET /api/payments/verify?reference=...`

Server responsibilities: 1. Validate the reference format. 2. Retrieve
the corresponding pending donation. 3. Verify the reference with
Paystack's transaction verification endpoint. 4. Confirm status is
successful, currency is NGN, and the verified amount equals the expected
stored amount. 5. Mark the donation successful in an idempotent database
transaction. 6. Return a minimal public result: payment state, verified
amount and meal equivalent.

A browser redirect is not proof of payment. The success page must show a
verifying/pending state until the server confirms success.

### 4.3 `POST /api/payments/webhook`

Responsibilities: 1. Read the raw request body. 2. Validate the
`x-paystack-signature` using HMAC SHA512 with the Paystack secret key
and a timing-safe comparison. 3. Parse the event only after signature
validation. 4. For successful charge events, independently verify the
transaction with Paystack. 5. Match the Paystack reference, amount and
currency to the pending database record. 6. Mark the record successful
exactly once. 7. Return a successful response for already-processed
valid events to prevent repeated retries.

Webhook processing must be idempotent. Enforce uniqueness on payment
reference and use a conditional update or database transaction to
prevent duplicate totals.

Do not rely only on the webhook payload for the amount or payment
status.

## 5. Impact counter

Query only successful donations for campaign edition 3.

-   Third-edition raised total: `SUM(amount_kobo)` for successful
    edition-3 donations.
-   Full meal equivalents: integer floor division by `120000`.
-   Remainder: `total_kobo % 120000`, if displaying progress towards the
    next meal.

Historical metrics: - Display historical fundraising as `₦400,000+`. -
Display historical students reached as `300+`. - Do not add new
donation-derived meal equivalents to the historical student count. - If
the exact historical amount is later confirmed, cumulative raised can be
calculated from the exact historical amount plus current-edition
donations.

Expose a narrowly scoped server endpoint or server-rendered aggregate
for public totals. Never expose private donation rows or donor email
addresses.

For live updates, use lightweight polling (for example every 15--30
seconds while the page is visible) or Neon-compatible server
refresh/revalidation. Do not use Supabase Realtime; Neon is the
database. A simple refresh strategy is sufficient for this MVP.

## 6. Frontend requirements

-   One responsive landing page.
-   Sections: Hero, About, Impact, Donate, Provisions, Contact.
-   Suggested donation buttons: ₦1,200, ₦2,400, ₦5,000, ₦10,000.
-   Custom amount field.
-   Display meal equivalent as the amount changes.
-   Clear pending, success and failure states.
-   Provision list: custard, cornflakes, milk, sugar, Milo and bread.
-   WhatsApp contact link using +234 705 389 8056.
-   WhatsApp share link containing campaign copy and the deployed site
    URL.
-   Thank-you message exactly as supplied in the PRD.

Use the approved flyer as the design reference: cream, dark brown,
orange/yellow and burgundy, with warm food photography. Do not invent
extra branding.

## 7. Environment variables

Configure in local `.env.local` and Vercel project settings:

``` env
DATABASE_URL=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
```

Only expose the Paystack public key if the chosen checkout integration
needs it in the browser. The secret key and database URL must remain
server-only. Never commit `.env.local`.

## 8. Security and privacy

-   HTTPS in production.
-   Server-side validation for all donation input.
-   Keep Neon credentials and Paystack secret server-side.
-   Validate Paystack webhook signatures against the raw body.
-   Verify transactions with Paystack's API.
-   Enforce unique payment references.
-   Make webhook and verification processing idempotent.
-   Public endpoints return aggregate totals only.
-   Do not expose donor email or private payment records.
-   Add basic request validation and sensible rate limiting to payment
    initialization.
-   Do not store card details.

## 9. Testing

### Payment

-   Valid successful payment.
-   Failed payment.
-   Abandoned checkout.
-   Invalid reference.
-   Wrong amount or currency.
-   Invalid webhook signature.
-   Duplicate webhook event.
-   Webhook arrives before browser return.
-   Browser return occurs before webhook.
-   Payment verification retry.

### Counter

-   Only successful edition-3 donations count.
-   Pending/failed payments do not count.
-   Duplicate event does not increase total twice.
-   Meal conversion handles partial amounts correctly.
-   Historical labels remain unchanged.

### UI

-   Suggested and custom amount selection.
-   Email validation.
-   Pending/success/failure states.
-   WhatsApp contact and sharing.
-   Mobile, tablet and desktop layouts.

## 10. Deployment

1.  Create the Next.js TypeScript project.
2.  Add the visual assets and build the landing page.
3.  Create a Neon project and database.
4.  Add schema/migrations.
5.  Implement Paystack initialization.
6.  Implement verification and webhook processing.
7.  Implement public impact aggregate.
8.  Test using Paystack test credentials.
9.  Configure production credentials and webhook URL.
10. Deploy to Vercel and test a real low-value transaction before public
    launch.

## 11. MVP completion criteria

-   Site is deployed on Vercel.
-   Neon database is connected securely.
-   Paystack checkout works.
-   Payments are independently verified.
-   Duplicate webhook events cannot double-count donations.
-   Public impact counter reflects successful current-edition donations.
-   Historical milestones are labelled accurately.
-   Provisions and WhatsApp contact work.
-   Mobile layout is usable.
