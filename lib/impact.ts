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

/**
 * The public aggregate. Only successful donations for the given edition count;
 * pending and failed never do. $1 = campaign edition.
 */
export const IMPACT_SQL = `
  SELECT
    s.historical_raised_label,
    s.historical_students_label,
    s.meal_cost_kobo,
    (SELECT COALESCE(SUM(d.amount_kobo), 0)
       FROM donations d
      WHERE d.status = 'successful' AND d.campaign_edition = $1) AS total_kobo
  FROM campaign_settings s
  LIMIT 1
`;

type ImpactRow = {
  historical_raised_label: string;
  historical_students_label: string;
  meal_cost_kobo: string | number;
  total_kobo: string | number;
};

export function impactFromRow(row: ImpactRow | undefined): PublicImpact {
  if (!row) throw new Error("campaign_settings row missing; run npm run db:migrate");
  return computeImpact({
    historicalRaisedLabel: row.historical_raised_label,
    historicalStudentsLabel: row.historical_students_label,
    mealCostKobo: toSafeInt(row.meal_cost_kobo),
    totalKobo: toSafeInt(row.total_kobo),
  });
}

export async function getPublicImpact(): Promise<PublicImpact> {
  const rows = (await db().query(IMPACT_SQL, [CAMPAIGN_EDITION])) as ImpactRow[];
  return impactFromRow(rows[0]);
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
