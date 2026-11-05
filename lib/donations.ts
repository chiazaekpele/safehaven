// Server-only donation persistence. Never return these rows to the browser.
import { CAMPAIGN_EDITION } from "./config";
import { db } from "./db";

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
