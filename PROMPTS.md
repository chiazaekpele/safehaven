# Claude Code Prompts --- Safe Haven Foundation MVP

Use these prompts in order from the root of the project. Give Claude
Code the PRD and TRD files as context. Do not ask it to build everything
in one pass.

## Prompt 1 --- Inspect and plan

Read `PRD.md` and `TRD.md` fully. Inspect the existing repository before
changing anything.

We are building the Safe Haven Foundation 3rd Edition donation website.
Keep the implementation deliberately simple. Stack: Next.js App Router,
TypeScript, Tailwind CSS, Neon Postgres, Paystack and Vercel.

First report: 1. Current repository structure and existing setup. 2.
What is already implemented, if anything. 3. A short implementation plan
aligned with the PRD/TRD. 4. Any genuine blockers or missing
credentials/assets.

Do not modify files yet. Do not introduce Supabase, authentication, an
admin dashboard, a CMS, AI features, microservices or unnecessary
dependencies.

## Prompt 2 --- Set up the application

Implement or configure the Next.js TypeScript application and Tailwind
CSS, respecting the existing repository where possible.

Create a clean, minimal structure for the one-page campaign site and
server-side payment routes. Add a `.env.example` containing only
variable names: - DATABASE_URL - PAYSTACK_PUBLIC_KEY -
PAYSTACK_SECRET_KEY - NEXT_PUBLIC_SITE_URL

Never put real credentials in source control. Add or confirm
`.gitignore` excludes `.env*` files except `.env.example`.

Do not invent credentials. Summarize changed files and exact setup
commands.

## Prompt 3 --- Build the landing page

Implement the responsive single-page website from `PRD.md`.

Sections: - Hero: Safe Haven Foundation, 3rd Edition Food Drive, clear
Donate CTA. - About: communicate the philosophy that students carry so
much; we cannot fix every problem, but we can offer a meal when it is
needed most. State that the initiative has reached 300+ students since
January and is led by the Holy Spirit through Anokwu Chiaza Daniella, a
500-level Computer Engineering student. - Impact: historical milestones
and clearly separated current-edition totals. - Donate: suggested
amounts ₦1,200, ₦2,400, ₦5,000, ₦10,000 plus custom amount. -
Provisions: custard, cornflakes, milk, sugar, Milo and bread. - Contact:
Daniella, +234 705 389 8056.

Use the approved flyer as the visual reference: cream/off-white, dark
brown, orange/yellow and burgundy, warm prepared-food photography. Do
not add unrelated decorative elements or invent a logo. Do not use
placeholder statistics that look real. Historical fundraising must
display `₦400,000+`, not an exact ₦400,000 total.

Make the layout mobile-first, accessible and quick to load. Use the
supplied flyer/food images if available in the repository; otherwise
leave clearly named image slots and tell me what assets are needed. Do
not generate new images unless explicitly asked.

## Prompt 4 --- Neon database

Implement Neon Postgres connectivity on the server only.

Use `DATABASE_URL` and a Neon-compatible serverless Postgres driver
appropriate for Vercel. Add a migration or SQL schema for: - donations:
unique payment reference, amount in kobo, currency, optional donor
email, pending/successful/failed status, campaign edition, timestamps. -
campaign settings: edition, historical display labels, optional exact
historical amount, meal cost in kobo.

Use integer kobo for all money. Seed the historical display labels as
`₦400,000+` and `300+`, and meal cost as `120000` kobo. Do not seed
₦400,000 as an exact historical amount.

Keep database access server-side. Do not expose donor records or emails.
Include clear migration/setup instructions.

## Prompt 5 --- Paystack payment initialization

Implement `POST /api/payments/initialize`.

Requirements: - Validate email and donation amount on the server. - Use
a configurable minimum donation amount; if it has not been decided,
choose a conservative temporary default and clearly document where to
change it. - Convert naira to integer kobo safely. - Generate a unique
unpredictable reference. - Create a pending donation record. -
Initialize Paystack using the secret key, amount, email, reference and
callback URL. - Return the authorization URL and reference only. - Never
trust a client-provided payment status. - Never expose the secret key. -
Handle provider/API errors safely without leaking secrets.

Do not mark a donation successful during initialization.

## Prompt 6 --- Paystack verification and webhook

Implement: - `GET /api/payments/verify?reference=...` -
`POST /api/payments/webhook`

Verification: - Verify the reference with Paystack's API. - Match
reference, amount and NGN currency against the pending database
record. - Mark successful only after independent verification. - Return
a minimal public result.

Webhook: - Read the raw request body. - Validate `x-paystack-signature`
using HMAC SHA512 and a timing-safe comparison. - Verify the transaction
independently with Paystack. - Match reference, amount and currency. -
Make processing idempotent using the unique reference and conditional
database updates/transactions. - Handle duplicate webhook delivery
safely.

The browser redirect is not proof of payment. The success page must show
a pending/verifying state until the server confirms payment. Never
double-count a transaction.

## Prompt 7 --- Impact counter

Implement a public aggregate query for: - Total verified donations for
campaign edition 3. - Full meal equivalents: floor(total amount in kobo
/ 120000). - Optional remainder towards the next meal.

Display historical `₦400,000+` and `300+ students` as separate
historical milestones. Do not automatically increase students reached
from donation amounts. Do not expose private donation records or donor
emails.

Use a simple polling/revalidation approach for updates; do not use
Supabase Realtime. Ensure pending and failed payments never affect
totals.

## Prompt 8 --- Thank-you and sharing

Implement the post-payment experience. Display the exact message:

"Thank you for helping us get someone food this exam season. We can't
fix all the problems in the world but we can give one person a meal. God
bless you."

Show the verified donation amount and its meal equivalent. Add a
WhatsApp share action with a pre-written message and the configured
public site URL. Add a WhatsApp contact action for +234 705 389 8056.

Do not show the success message before server-side payment verification
succeeds.

## Prompt 9 --- Test and review

Review the entire implementation against `PRD.md` and `TRD.md`.

Run available lint, typecheck, build and tests. Add focused tests for: -
Amount validation and naira-to-kobo conversion. - Meal-equivalent
calculation. - Failed/pending payments excluded from totals. -
Successful transaction verification. - Duplicate webhook delivery. -
Invalid webhook signature. - Amount/currency/reference mismatch. -
Browser return before webhook and webhook before browser return.

Fix issues found. Do not claim a test passed unless it was actually run.
Report remaining manual tests and configuration steps.

## Prompt 10 --- Vercel deployment readiness

Prepare the project for Vercel deployment.

Check: - Build succeeds. - All server-only secrets remain server-side. -
`DATABASE_URL`, Paystack keys and site URL are documented. - Neon
schema/migrations can be applied. - Paystack webhook endpoint and
configuration steps are documented. - Test and live Paystack credentials
are not mixed. - Production callback URL uses the deployed site URL. -
No credentials are committed.

Do not deploy or change production settings without my explicit
approval. Provide a concise launch checklist.

## Rules for the whole build

-   Prefer the smallest implementation that meets the requirements.
-   Reuse the existing project structure when reasonable.
-   Do not add features that are not in the PRD.
-   Do not invent historical totals, donor records, credentials, domains
    or assets.
-   Keep all currency arithmetic in integer kobo.
-   Keep private donor/payment data private.
-   Treat Paystack's verified transaction as the source of truth.
-   Explain any necessary deviation from the PRD/TRD before making it.
