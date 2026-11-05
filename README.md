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
| `npm test` | Unit tests (Vitest, no network) |
| `npm run test:db` | Aggregate test against Neon in a rolled-back transaction (writes nothing) |
| `npm run db:migrate` | Apply `db/schema.sql` |

## Deploying to Vercel

Vercel builds automatically on every push to `main`.

**Environment variables** (Project → Settings → Environment Variables):

| Variable | Production | Preview |
|---|---|---|
| `DATABASE_URL` | Neon connection string | Prefer a separate Neon branch |
| `PAYSTACK_SECRET_KEY` | `sk_live_…` | `sk_test_…` |
| `NEXT_PUBLIC_SITE_URL` | `https://safehaven-orcin.vercel.app` (or custom domain) | leave unset |
| `PAYSTACK_PUBLIC_KEY` | optional, unused | optional, unused |

- `NEXT_PUBLIC_SITE_URL` is baked in at build time: **redeploy after changing it**. If it is unset,
  the site falls back to Vercel's production domain.
- Never put a `sk_live_` key in `.env.local`, and never use `sk_test_` in Production.
  Test and live transactions are invisible to each other: a test reference cannot be verified with a live key.
- The schema must exist before the first deploy: `npm run db:migrate` (safe to re-run).

**Paystack Dashboard → Settings → API Keys & Webhooks, Live mode:**
callback `https://<domain>/donate/success`, webhook `https://<domain>/api/payments/webhook`.
Do the same in Test mode if you test on a preview URL.

## Launch checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set for Production, then redeployed; page source shows the real domain in `og:url`
- [ ] Production uses `sk_live_…`; `.env.local` uses `sk_test_…`
- [ ] Paystack **Live** webhook URL and callback URL set to the production domain
- [ ] Minimum donation confirmed in `lib/config.ts` (`MIN_DONATION_NAIRA`, currently ₦100)
- [ ] `donations` table contains no test rows: `SELECT status, COUNT(*) FROM donations GROUP BY 1;`
- [ ] Real low-value donation on the live site: Paystack checkout → "Confirming…" → thank-you message,
      amount and meals shown → counter increases by that amount within ~30s
- [ ] Same donation appears once in Paystack Dashboard → Transactions, and once in `donations` as `successful`
- [ ] Paystack Dashboard → Webhooks shows the delivery for that payment as successful (2xx)
- [ ] WhatsApp share and contact buttons open correctly on a phone
- [ ] Rotate the Neon password (it was shared during development) and update Vercel + `.env.local`
