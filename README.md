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
