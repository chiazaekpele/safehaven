// Public impact aggregate. Returns totals only — never rows, emails or references.
import { CAMPAIGN_EDITION, DEFAULT_MEAL_COST_KOBO } from "./config";
import { db, toSafeInt } from "./db";
import type { PublicImpact } from "./impact-types";
import { mealsFromKobo, remainderKobo } from "./money";

export const FALLBACK_IMPACT: PublicImpact = {
  historicalRaisedLabel: "₦400,000+",
  historicalStudentsLabel: "300+",
  mealCostKobo: DEFAULT_MEAL_COST_KOBO,
  current: null,
};

/** Pure calculation: integer kobo in, meals and remainder out. */
export function computeImpact(input: {
  historicalRaisedLabel: string;
  historicalStudentsLabel: string;
  mealCostKobo: number;
  totalKobo: number;
}): PublicImpact {
  return {
    // Historical figures are display labels only; donations never change them.
    historicalRaisedLabel: input.historicalRaisedLabel,
    historicalStudentsLabel: input.historicalStudentsLabel,
    mealCostKobo: input.mealCostKobo,
    current: {
      totalKobo: input.totalKobo,
      meals: mealsFromKobo(input.totalKobo, input.mealCostKobo),
      remainderKobo: remainderKobo(input.totalKobo, input.mealCostKobo),
    },
  };
}

export async function getPublicImpact(): Promise<PublicImpact> {
  // Only successful donations for this edition count; pending and failed never do.
  const rows = await db()`
    SELECT
      s.historical_raised_label,
      s.historical_students_label,
      s.meal_cost_kobo,
      (SELECT COALESCE(SUM(d.amount_kobo), 0)
         FROM donations d
        WHERE d.status = 'successful' AND d.campaign_edition = ${CAMPAIGN_EDITION}) AS total_kobo
    FROM campaign_settings s
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) throw new Error("campaign_settings row missing; run npm run db:migrate");
  return computeImpact({
    historicalRaisedLabel: row.historical_raised_label,
    historicalStudentsLabel: row.historical_students_label,
    mealCostKobo: toSafeInt(row.meal_cost_kobo),
    totalKobo: toSafeInt(row.total_kobo),
  });
}

/** Never let a database hiccup break the page. */
export async function getPublicImpactSafe(): Promise<PublicImpact> {
  try {
    return await getPublicImpact();
  } catch (err) {
    console.error("impact:", err instanceof Error ? err.message : err);
    return FALLBACK_IMPACT;
  }
}
