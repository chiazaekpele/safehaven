import Link from "next/link";
import { THANK_YOU_MESSAGE, whatsappContactUrl, whatsappShareUrl } from "@/lib/config";
import { formatNaira } from "@/lib/money";

/** Rendered only after the server has independently verified the payment. */
export function ThankYou({ amountKobo, meals }: { amountKobo: number; meals: number }) {
  const btn =
    "rounded-full px-6 py-3 text-center font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-orange";
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-burgundy">
        Payment confirmed
      </p>
      <p className="mt-4 text-2xl font-bold leading-snug text-brown sm:text-3xl">
        {THANK_YOU_MESSAGE}
      </p>

      <dl className="mt-8 divide-y divide-brown/10 rounded-2xl border border-brown/10 bg-cream/60 px-5">
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-brown-light">Your donation</dt>
          <dd className="text-2xl font-bold tabular-nums text-burgundy">{formatNaira(amountKobo)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-brown-light">Meals</dt>
          <dd className="text-2xl font-bold tabular-nums text-burgundy">
            {meals >= 1 ? meals.toLocaleString("en-NG") : "Towards a meal"}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <a
          href={whatsappShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-burgundy text-cream hover:bg-burgundy-dark`}
        >
          Share on WhatsApp
        </a>
        <a
          href={whatsappContactUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} border-2 border-brown text-brown hover:bg-brown hover:text-cream`}
        >
          Message Daniella
        </a>
      </div>
      <Link
        href="/"
        className="mt-6 inline-block text-brown underline decoration-brown/30 underline-offset-4 hover:decoration-brown"
      >
        Back to the site
      </Link>
    </div>
  );
}
