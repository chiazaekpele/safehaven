# Safe Haven Foundation — 3rd Edition Food Drive

One-page donation site. Next.js (App Router) + TypeScript + Tailwind CSS, Neon Postgres, Paystack, Vercel.
See [PRD.md](PRD.md) and [TRD.md](TRD.md) for requirements.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run db:migrate           # create tables + seed campaign settings
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Where it's used | Notes |
|---|---|---|
| `DATABASE_URL` | Server only | Neon connection string (Dashboard → Connect). Wrap in double quotes in `.env.local` — it contains `&`. |
| `PAYSTACK_SECRET_KEY` | Server only | `sk_test_…` locally, `sk_live_…` in production only. |
| `PAYSTACK_PUBLIC_KEY` | Not currently used | Checkout uses Paystack's hosted redirect, so no key is sent to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Server + browser | `http://localhost:3000` locally; the deployed URL in production (used for the Paystack callback and WhatsApp share link). |

Never commit `.env.local`. `.gitignore` excludes every `.env*` file except `.env.example`.

## Database

The schema lives in [db/schema.sql](db/schema.sql). `npm run db:migrate` applies it to `DATABASE_URL`.
Every statement is idempotent, so it is safe to run again; it never overwrites edited settings.

- `donations` — one row per payment attempt, unique `reference`, `amount_kobo` (integer kobo),
  status `pending` → `successful` / `failed`. Only `successful` rows count towards totals.
- `campaign_settings` — a single row: edition `3`, labels `₦400,000+` and `300+`,
  meal cost `120000` kobo (₦1,200), and `historical_raised_kobo` left `NULL`
  until an exact, verified historical total is supplied.

To change a setting later (Neon SQL editor):

```sql
UPDATE campaign_settings SET meal_cost_kobo = 120000, updated_at = NOW();
```

## Paystack

| Setting (Paystack Dashboard → Settings → API Keys & Webhooks) | Value |
|---|---|
| Callback URL | `https://<your-domain>/donate/success` |
| Webhook URL | `https://<your-domain>/api/payments/webhook` |

- Test mode and Live mode have **separate** keys and webhook URL fields. Set both.
- The callback URL is also sent with every transaction from `NEXT_PUBLIC_SITE_URL`, so the
  dashboard value is only a fallback. Keep them the same.
- Paystack cannot reach `localhost`, so webhooks only arrive once the site is deployed.
  Locally, payments are confirmed when the donor returns to `/donate/success`.
- If "pass transaction charges to customer" is on, Paystack charges the donor the donation
  plus fees. The site checks Paystack's `requested_amount` against the stored amount and
  counts only the donation, never the fee.

### How a payment is confirmed

`/api/payments/verify` (donor returns) and `/api/payments/webhook` (Paystack notifies) both call
`confirmPayment` in [lib/payments.ts](lib/payments.ts). It asks Paystack's verify API for the real
status, checks reference, amount and NGN currency, then runs a conditional
`UPDATE … WHERE status IN ('pending','failed')`. A donation can therefore become successful
only once, whichever arrives first and however many times the webhook is retried.
The webhook is rejected unless its `x-paystack-signature` (HMAC-SHA512 of the raw body) matches.

## Configuration in code

- Minimum donation: `MIN_DONATION_NAIRA` in [lib/config.ts](lib/config.ts) — **temporary ₦100, confirm before launch**.
- Suggested amounts, provisions list and contact details: also in `lib/config.ts`.
- Images: [lib/assets.ts](lib/assets.ts). The flyer slot expects `public/flyer/flyer.jpg`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Apply `db/schema.sql` |
