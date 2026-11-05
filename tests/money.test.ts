import { describe, expect, it } from "vitest";
import { MAX_DONATION_NAIRA, MIN_DONATION_NAIRA } from "../lib/config";
import { formatNaira, mealsFromKobo, parseNairaToKobo, remainderKobo } from "../lib/money";
import { computeImpact } from "../lib/impact";

describe("parseNairaToKobo", () => {
  it.each([
    [1200, 120_000],
    ["2400", 240_000],
    [" 5000 ", 500_000],
    [MIN_DONATION_NAIRA, MIN_DONATION_NAIRA * 100],
    [MAX_DONATION_NAIRA, MAX_DONATION_NAIRA * 100],
  ])("converts %p naira to %p kobo", (input, kobo) => {
    expect(parseNairaToKobo(input)).toEqual({ ok: true, kobo });
  });

  it.each([
    ["below minimum", MIN_DONATION_NAIRA - 1],
    ["zero", 0],
    ["negative", -1200],
    ["fractional", 1200.5],
    ["fractional string", "1200.50"],
    ["above maximum", MAX_DONATION_NAIRA + 1],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["text", "abc"],
    ["exponent string", "1e5"],
    ["null", null],
    ["object", { amount: 1200 }],
  ])("rejects %s", (_label, input) => {
    expect(parseNairaToKobo(input).ok).toBe(false);
  });

  it("always returns an integer kobo amount", () => {
    for (const n of [100, 999, 1201, 123_457]) {
      const r = parseNairaToKobo(n);
      expect(r.ok && Number.isInteger(r.kobo)).toBe(true);
    }
  });
});

describe("meal equivalents (₦1,200 = 120000 kobo)", () => {
  const MEAL = 120_000;
  it.each([
    [0, 0, 0],
    [119_999, 0, 119_999],
    [120_000, 1, 0],
    [240_000, 2, 0],
    [500_000, 4, 20_000],
    [1_000_000, 8, 40_000],
  ])("%p kobo -> %p meals, %p remainder", (kobo, meals, rem) => {
    expect(mealsFromKobo(kobo, MEAL)).toBe(meals);
    expect(remainderKobo(kobo, MEAL)).toBe(rem);
  });

  it("computeImpact keeps historical labels unchanged", () => {
    const impact = computeImpact({
      historicalRaisedLabel: "₦400,000+",
      historicalStudentsLabel: "300+",
      mealCostKobo: MEAL,
      totalKobo: 620_000,
    });
    expect(impact).toEqual({
      historicalRaisedLabel: "₦400,000+",
      historicalStudentsLabel: "300+",
      mealCostKobo: MEAL,
      current: { totalKobo: 620_000, meals: 5, remainderKobo: 20_000 },
    });
  });
});

describe("formatNaira", () => {
  it.each([
    [120_000, "₦1,200"],
    [40_000_000, "₦400,000"],
    [12_345, "₦123.45"],
    [0, "₦0"],
  ])("%p kobo -> %p", (kobo, text) => {
    expect(formatNaira(kobo)).toBe(text);
  });
});
