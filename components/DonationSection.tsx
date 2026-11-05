"use client";

import { useState } from "react";
import { MIN_DONATION_NAIRA, SUGGESTED_AMOUNTS_NAIRA } from "@/lib/config";
import { formatNaira, mealsFromKobo, parseNairaToKobo } from "@/lib/money";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "error";

export function DonationSection({ mealCostKobo }: { mealCostKobo: number }) {
  const [selected, setSelected] = useState<number | null>(SUGGESTED_AMOUNTS_NAIRA[0]);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const rawAmount = custom !== "" ? custom : selected ?? "";
  const parsed = rawAmount === "" ? null : parseNairaToKobo(String(rawAmount));
  const meals = parsed?.ok ? mealsFromKobo(parsed.kobo, mealCostKobo) : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!parsed || !parsed.ok) {
      setError(parsed && !parsed.ok ? parsed.error : "Choose or enter an amount.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address for your Paystack receipt.");
      return;
    }
    setStatus("submitting");
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
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const btn =
    "rounded-xl border-2 px-4 py-3 text-lg font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange";

  return (
    <section id="donate" aria-labelledby="donate-title" className="bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-16 md:py-20">
        <h2 id="donate-title" className="font-display text-3xl font-bold text-brown sm:text-4xl">
          Give a meal
        </h2>
        <p className="mt-4 text-lg text-brown-light">
          <strong className="text-burgundy">{formatNaira(mealCostKobo)} = one meal</strong>{" "}
          for a student this exam season. Give any amount you can. Payments
          are processed securely by Paystack. Donations are anonymous; we never
          display donor names.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
          <fieldset>
            <legend className="mb-3 font-semibold">Choose an amount</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SUGGESTED_AMOUNTS_NAIRA.map((n) => {
                const active = custom === "" && selected === n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelected(n);
                      setCustom("");
                    }}
                    className={`${btn} ${
                      active
                        ? "border-burgundy bg-burgundy text-cream"
                        : "border-brown/30 bg-white text-brown hover:border-burgundy"
                    }`}
                  >
                    {formatNaira(n * 100)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="custom-amount" className="mb-2 block font-semibold">
              Or enter another amount (₦)
            </label>
            <input
              id="custom-amount"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder={`Minimum ${formatNaira(MIN_DONATION_NAIRA * 100)}`}
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
              className="w-full rounded-xl border-2 border-brown/30 bg-white px-4 py-3 text-lg focus:border-burgundy focus:outline-none"
            />
          </div>

          <p className="rounded-xl bg-cream-dark px-4 py-3 text-brown" aria-live="polite">
            {parsed?.ok
              ? meals >= 1
                ? `${formatNaira(parsed.kobo)} funds ${meals} meal${meals === 1 ? "" : "s"}.`
                : `${formatNaira(parsed.kobo)} goes towards a meal.`
              : "Choose an amount to see how many meals it funds."}
          </p>

          <div>
            <label htmlFor="email" className="mb-2 block font-semibold">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-help"
              className="w-full rounded-xl border-2 border-brown/30 bg-white px-4 py-3 text-lg focus:border-burgundy focus:outline-none"
            />
            <p id="email-help" className="mt-2 text-sm text-brown-light">
              Paystack needs this to send your receipt. We never share it.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border-2 border-burgundy bg-burgundy/5 px-4 py-3 text-burgundy">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-burgundy px-7 py-4 text-lg font-semibold text-cream shadow-sm transition hover:bg-burgundy-dark disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            {status === "submitting"
              ? "Taking you to Paystack…"
              : parsed?.ok
                ? `Donate ${formatNaira(parsed.kobo)}`
                : "Donate"}
          </button>
        </form>
      </div>
    </section>
  );
}
