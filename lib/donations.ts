// Server-only donation persistence. Never return these rows to the browser.
import { CAMPAIGN_EDITION, DEFAULT_MEAL_COST_KOBO } from "./config";
import { db, toSafeInt } from "./db";

export async function createPendingDonation(input: {
  reference: string;
  amountKobo: number;
  email: string;
}): Promise<void> {
  await db()`
    INSERT INTO donations (reference, amount_kobo, currency, donor_email, status, campaign_edition)
    VALUES (${input.reference}, ${input.amountKobo}, 'NGN', ${input.email}, 'pending', ${CAMPAIGN_EDITION})
  `;
}

/** Only moves pending -> failed; never touches a successful donation. */
export async function markFailed(reference: string): Promise<void> {
  await db()`
    UPDATE donations SET status = 'failed', updated_at = NOW()
    WHERE reference = ${reference} AND status = 'pending'
  `;
}

export type DonationRecord = {
  reference: string;
  amountKobo: number;
  currency: string;
  status: "pending" | "successful" | "failed";
};

export async function getDonation(reference: string): Promise<DonationRecord | null> {
  const rows = await db()`
    SELECT reference, amount_kobo, currency, status
    FROM donations WHERE reference = ${reference}
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    reference: row.reference,
    amountKobo: toSafeInt(row.amount_kobo),
    currency: row.currency,
    status: row.status,
  };
}

/**
 * Mark successful exactly once. The WHERE clause makes this idempotent:
 * a donation already 'successful' is never updated again, and the stored
 * amount/currency must match what Paystack verified.
 * Returns true only for the single call that performed the transition.
 */
export async function markSuccessful(input: {
  reference: string;
  amountKobo: number;
  currency: string;
  paidAt: string | null;
}): Promise<boolean> {
  const rows = await db()`
    UPDATE donations
    SET status = 'successful', paid_at = COALESCE(${input.paidAt}::timestamptz, NOW()), updated_at = NOW()
    WHERE reference = ${input.reference}
      AND status IN ('pending', 'failed')
      AND amount_kobo = ${input.amountKobo}
      AND currency = ${input.currency}
    RETURNING reference
  `;
  return rows.length === 1;
}

export async function getMealCostKobo(): Promise<number> {
  const rows = await db()`SELECT meal_cost_kobo FROM campaign_settings LIMIT 1`;
  return rows[0] ? toSafeInt(rows[0].meal_cost_kobo) : DEFAULT_MEAL_COST_KOBO;
}
