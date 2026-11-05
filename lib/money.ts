// Integer-kobo money helpers. Never do currency arithmetic with floats.

import { MAX_DONATION_NAIRA, MIN_DONATION_NAIRA } from "./config";

export type AmountResult =
  | { ok: true; kobo: number }
  | { ok: false; error: string };

/**
 * Parse a donation amount given in whole naira (number or digit string)
 * and convert it to integer kobo. Fractional naira are rejected.
 */
export function parseNairaToKobo(input: unknown): AmountResult {
  let naira: number;
  if (typeof input === "number") {
    naira = input;
  } else if (typeof input === "string" && /^\s*\d{1,9}\s*$/.test(input)) {
    naira = Number(input.trim());
  } else {
    return { ok: false, error: "Enter a whole naira amount." };
  }

  if (!Number.isSafeInteger(naira)) {
    return { ok: false, error: "Enter a whole naira amount." };
  }
  if (naira < MIN_DONATION_NAIRA) {
    return {
      ok: false,
      error: `The minimum donation is ${formatNaira(MIN_DONATION_NAIRA * 100)}.`,
    };
  }
  if (naira > MAX_DONATION_NAIRA) {
    return {
      ok: false,
      error: `For gifts above ${formatNaira(MAX_DONATION_NAIRA * 100)}, please contact us.`,
    };
  }
  return { ok: true, kobo: naira * 100 };
}

/** Full meals funded by an amount: floor(kobo / mealCost). */
export function mealsFromKobo(kobo: number, mealCostKobo: number): number {
  if (!Number.isSafeInteger(kobo) || kobo <= 0 || mealCostKobo <= 0) return 0;
  return Math.floor(kobo / mealCostKobo);
}

/** Kobo already put towards the next (not yet complete) meal. */
export function remainderKobo(kobo: number, mealCostKobo: number): number {
  if (!Number.isSafeInteger(kobo) || kobo <= 0 || mealCostKobo <= 0) return 0;
  return kobo % mealCostKobo;
}

/** Format integer kobo as naira, e.g. 120000 -> "₦1,200". */
export function formatNaira(kobo: number): string {
  const naira = Math.trunc(kobo / 100);
  const k = Math.abs(kobo % 100);
  const whole = "₦" + naira.toLocaleString("en-NG");
  return k === 0 ? whole : `${whole}.${String(k).padStart(2, "0")}`;
}
