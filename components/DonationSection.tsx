"use client";

import { useState } from "react";
import { MIN_DONATION_NAIRA, SUGGESTED_AMOUNTS_NAIRA } from "@/lib/config";
import { formatNaira, mealsFromKobo, parseNairaToKobo } from "@/lib/money";
import { Section } from "./Section";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mealsLabel(n: number) {
  return `${n} meal${n === 1 ? "" : "s"}`;
}

export function DonationSection({ mealCostKobo }: { mealCostKobo: number }) {
  const [selected, setSelected] = useState<number>(SUGGESTED_AMOUNTS_NAIRA[0]);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = custom !== "";
  const parsed = parseNairaToKobo(usingCustom ? custom : String(selected));
  const customMeals = usingCustom && parsed.ok ? mealsFromKobo(parsed.kobo, mealCostKobo) : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parsed.ok) return setError(parsed.error);
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), amountNaira: parsed.kobo / 100 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.authorizationUrl !== "string") {
        throw new Error(data.error || "We couldn't start the payment. Please try again.");
      }
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const field =
    "w-full rounded-xl border-2 border-brown/20 bg-white px-4 py-3 text-lg focus:border-burgundy focus:outline-none";

  return (
    <Section id="donate" title="Give a meal">
      <p className="text-lg text-brown-light">
        <strong className="text-burgundy">{formatNaira(mealCostKobo)} = one meal.</strong>{" "}
        Payments are secured by Paystack.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        <fieldset>
          <legend className="sr-only">Choose an amount</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUGGESTED_AMOUNTS_NAIRA.map((n) => {
              const active = !usingCustom && selected === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelected(n);
                    setCustom("");
                  }}
                  className={`flex flex-col items-center rounded-xl border-2 px-3 py-3 transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange ${
                    active
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-brown/20 bg-white text-brown hover:border-burgundy"
                  }`}
                >
                  <span className="text-lg font-semibold">{formatNaira(n * 100)}</span>
                  <span className={`text-sm ${active ? "text-cream/85" : "text-brown-light"}`}>
                    {mealsLabel(mealsFromKobo(n * 100, mealCostKobo))}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="custom-amount" className="mb-2 block font-semibold">
            Other amount (₦)
          </label>
          <input
            id="custom-amount"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder={`Minimum ${formatNaira(MIN_DONATION_NAIRA * 100)}`}
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
            aria-describedby="custom-meals"
            className={field}
          />
          <p id="custom-meals" className="mt-2 min-h-6 text-sm text-brown-light" aria-live="polite">
            {usingCustom && parsed.ok
              ? customMeals >= 1
                ? `= ${mealsLabel(customMeals)}`
                : "Goes towards a meal"
              : ""}
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-semibold">
            Email <span className="font-normal text-brown-light">(for your receipt)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border-2 border-burgundy bg-burgundy/5 px-4 py-3 text-burgundy">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-burgundy px-7 py-4 text-lg font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          {submitting
            ? "Taking you to Paystack…"
            : parsed.ok
              ? `Donate ${formatNaira(parsed.kobo)}`
              : "Donate"}
        </button>
      </form>
    </Section>
  );
}
