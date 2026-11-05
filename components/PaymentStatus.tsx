"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatNaira } from "@/lib/money";

type Result =
  | { state: "checking" }
  | { state: "successful"; amountKobo: number; meals: number }
  | { state: "pending" }
  | { state: "failed" }
  | { state: "not_found" };

const INTERVAL_MS = 3_000;
const MAX_ATTEMPTS = 20; // about a minute

export function PaymentStatus({ reference }: { reference: string | null }) {
  const [result, setResult] = useState<Result>(
    reference ? { state: "checking" } : { state: "not_found" },
  );
  const [gaveUp, setGaveUp] = useState(false);
  const attempts = useRef(0);

  const check = useCallback(async (): Promise<Result["state"]> => {
    try {
      const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.state === "successful") {
        setResult({ state: "successful", amountKobo: data.amountKobo, meals: data.meals });
      } else if (data.state === "failed" || data.state === "not_found") {
        setResult({ state: data.state });
      }
      return data.state;
    } catch {
      return "pending";
    }
  }, [reference]);

  const poll = useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const run = async () => {
      attempts.current += 1;
      const state = await check();
      if (stopped || state === "successful" || state === "failed" || state === "not_found") return;
      if (attempts.current >= MAX_ATTEMPTS) return setGaveUp(true);
      timer = setTimeout(run, INTERVAL_MS);
    };
    run();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [check]);

  useEffect(() => {
    if (!reference) return;
    return poll();
  }, [reference, poll]);

  if (result.state === "successful") {
    return <SuccessSummary amountKobo={result.amountKobo} meals={result.meals} />;
  }

  const link =
    "inline-block rounded-full bg-burgundy px-7 py-3 font-semibold text-cream transition hover:bg-burgundy-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange";

  if (result.state === "failed") {
    return (
      <div role="alert">
        <h1 className="text-2xl font-bold sm:text-3xl">Payment not completed</h1>
        <p className="mt-3 text-lg text-brown-light">No money was counted for this attempt.</p>
        <Link href="/#donate" className={`${link} mt-8`}>Try again</Link>
      </div>
    );
  }

  if (result.state === "not_found") {
    return (
      <div role="alert">
        <h1 className="text-2xl font-bold sm:text-3xl">We couldn&apos;t find this payment</h1>
        <Link href="/#donate" className={`${link} mt-8`}>Back to donate</Link>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      <h1 className="text-2xl font-bold sm:text-3xl">
        {gaveUp ? "Still waiting for Paystack" : "Confirming your payment…"}
      </h1>
      <p className="mt-3 text-lg text-brown-light">
        {gaveUp
          ? "If you were charged, your donation will be counted once Paystack confirms it."
          : "This usually takes a few seconds."}
      </p>
      {gaveUp && (
        <button
          type="button"
          onClick={() => {
            attempts.current = 0;
            setGaveUp(false);
            poll();
          }}
          className={`${link} mt-8`}
        >
          Check again
        </button>
      )}
    </div>
  );
}

export function SuccessSummary({ amountKobo, meals }: { amountKobo: number; meals: number }) {
  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Payment confirmed</h1>
      <p className="mt-3 text-lg text-brown-light">
        {formatNaira(amountKobo)}
        {meals >= 1 ? ` · ${meals} meal${meals === 1 ? "" : "s"}` : ""}
      </p>
    </div>
  );
}
