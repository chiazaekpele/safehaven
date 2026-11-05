-- Safe Haven Foundation schema. Safe to re-run: every statement is idempotent.
-- Apply with: npm run db:migrate
-- All money is stored as integer kobo (₦1 = 100 kobo).

CREATE TABLE IF NOT EXISTS donations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        TEXT NOT NULL UNIQUE,
  amount_kobo      BIGINT NOT NULL CHECK (amount_kobo > 0),
  currency         TEXT NOT NULL DEFAULT 'NGN',
  donor_email      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'successful', 'failed')),
  campaign_edition INTEGER NOT NULL DEFAULT 3,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS donations_status_edition_idx
  ON donations (status, campaign_edition);

-- Singleton settings row (id is always TRUE).
CREATE TABLE IF NOT EXISTS campaign_settings (
  id                        BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  campaign_edition          INTEGER NOT NULL,
  -- NULL until an exact, verified historical total is supplied.
  historical_raised_kobo    BIGINT CHECK (historical_raised_kobo IS NULL OR historical_raised_kobo >= 0),
  historical_raised_label   TEXT NOT NULL,
  historical_students_label TEXT NOT NULL,
  meal_cost_kobo            BIGINT NOT NULL CHECK (meal_cost_kobo > 0),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed once; re-running never overwrites edited settings.
INSERT INTO campaign_settings
  (id, campaign_edition, historical_raised_kobo, historical_raised_label,
   historical_students_label, meal_cost_kobo)
VALUES
  (TRUE, 3, NULL, '₦400,000+', '300+', 120000)
ON CONFLICT (id) DO NOTHING;
