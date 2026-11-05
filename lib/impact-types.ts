// Client-safe shape of the public impact figures. Aggregates only — no donor data.

export type PublicImpact = {
  historicalRaisedLabel: string;
  historicalStudentsLabel: string;
  mealCostKobo: number;
  /** null when live totals could not be loaded. */
  current: {
    totalKobo: number;
    meals: number;
    remainderKobo: number;
  } | null;
};
