"use client";

import { useEffect, useState } from "react";
import type { PublicImpact } from "@/lib/impact-types";
import { formatNaira } from "@/lib/money";
import { Section } from "./Section";

const POLL_MS = 30_000;

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-brown-light">{label}</dt>
      <dd className={`text-2xl font-bold tabular-nums ${accent ? "text-burgundy" : "text-brown"}`}>
        {value}
      </dd>
    </div>
  );
}

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
  const progressPct = current ? Math.floor((current.remainderKobo * 100) / mealCostKobo) : 0;
  const card = "rounded-2xl border border-brown/10 bg-cream/60 p-5 sm:p-6";
  const heading = "text-sm font-semibold uppercase tracking-widest";

  return (
    <Section id="impact" title="Our impact">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <h3 className={`${heading} text-brown-light`}>Since January</h3>
          <dl className="mt-2 divide-y divide-brown/10">
            <Stat label="Raised" value={impact.historicalRaisedLabel} />
            <Stat label="Students reached" value={impact.historicalStudentsLabel} />
          </dl>
        </div>

        <div className={card} aria-live="polite">
          <h3 className={`${heading} text-burgundy`}>3rd edition</h3>
          <dl className="mt-2 divide-y divide-brown/10">
            <Stat label="Raised" value={current ? formatNaira(current.totalKobo) : "—"} accent />
            <Stat
              label="Meals funded"
              value={current ? current.meals.toLocaleString("en-NG") : "—"}
              accent
            />
          </dl>
          {current && (
            <div className="mt-3">
              <div
                className="h-2 overflow-hidden rounded-full bg-brown/10"
                role="progressbar"
                aria-label="Next meal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
              >
                <div className="h-full bg-orange" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-brown-light">
                Next meal: {formatNaira(current.remainderKobo)} / {formatNaira(mealCostKobo)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
