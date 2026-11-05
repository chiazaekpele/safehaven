"use client";

import { useEffect, useState } from "react";
import type { PublicImpact } from "@/lib/impact-types";
import { formatNaira } from "@/lib/money";

const POLL_MS = 30_000;

export function ImpactCounter({ initial }: { initial: PublicImpact }) {
  const [impact, setImpact] = useState(initial);

  // Lightweight polling while the tab is visible.
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/impact", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PublicImpact;
        if (!cancelled) setImpact(data);
      } catch {
        /* keep last known figures */
      }
    }
    const id = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const { current, mealCostKobo } = impact;
  const progressPct = current
    ? Math.floor((current.remainderKobo * 100) / mealCostKobo)
    : 0;

  return (
    <section id="impact" aria-labelledby="impact-title" className="bg-cream-dark">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 id="impact-title" className="font-display text-3xl font-bold text-brown sm:text-4xl">
          Our impact
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Historical milestones */}
          <div className="rounded-2xl bg-cream p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-burgundy">
              Since January
            </h3>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-brown-light">Raised</dt>
                <dd className="font-display text-3xl font-bold text-brown">
                  {impact.historicalRaisedLabel}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-brown-light">Students reached</dt>
                <dd className="font-display text-3xl font-bold text-brown">
                  {impact.historicalStudentsLabel}
                </dd>
              </div>
            </dl>
          </div>

          {/* Current edition — verified donations only */}
          <div className="rounded-2xl bg-brown p-6 text-cream shadow-sm" aria-live="polite">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-yellow">
              3rd edition: verified donations
            </h3>
            {current ? (
              <>
                <dl className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-cream/80">Raised</dt>
                    <dd className="font-display text-3xl font-bold">
                      {formatNaira(current.totalKobo)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-cream/80">Meals funded</dt>
                    <dd className="font-display text-3xl font-bold">
                      {current.meals.toLocaleString("en-NG")}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <p className="text-sm text-cream/80">
                    {formatNaira(current.remainderKobo)} of{" "}
                    {formatNaira(mealCostKobo)} towards the next meal
                  </p>
                  <div
                    className="mt-2 h-3 overflow-hidden rounded-full bg-cream/20"
                    role="progressbar"
                    aria-label="Progress towards the next meal"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPct}
                  >
                    <div className="h-full bg-yellow" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-5 text-cream/80">Live totals are loading. Please check back shortly.</p>
            )}
            <p className="mt-6 text-xs text-cream/70">
              Meals funded by donations to this edition, at{" "}
              {formatNaira(mealCostKobo)} per meal. They are counted separately
              from students already reached.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
