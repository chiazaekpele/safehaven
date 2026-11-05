// Shared payment confirmation used by both /verify (browser return) and /webhook.
// Paystack's verify API is the source of truth; neither the redirect nor the
// webhook payload is trusted on its own.
import * as donations from "./donations";
import * as paystack from "./paystack";

export type PaymentState = "successful" | "pending" | "failed" | "not_found";

export type ConfirmResult = {
  state: PaymentState;
  /** Set only when state is "successful". */
  amountKobo?: number;
  /** True only for the one call that moved the donation to successful. */
  newlyConfirmed?: boolean;
};

export type ConfirmDeps = {
  getDonation: typeof donations.getDonation;
  markSuccessful: typeof donations.markSuccessful;
  markFailed: typeof donations.markFailed;
  verifyTransaction: typeof paystack.verifyTransaction;
  log?: (message: string) => void;
};

const defaultDeps: ConfirmDeps = {
  getDonation: donations.getDonation,
  markSuccessful: donations.markSuccessful,
  markFailed: donations.markFailed,
  verifyTransaction: paystack.verifyTransaction,
  log: (m) => console.warn(m),
};

/** Paystack statuses after which the donor can no longer complete this payment. */
const FINAL_FAILURES = new Set(["failed", "reversed"]);

/**
 * Confirm a payment by reference. Safe to call any number of times, in any
 * order, from verify and webhook concurrently: the conditional UPDATE in
 * markSuccessful guarantees a donation is marked successful at most once.
 * Throws only on infrastructure errors (DB/Paystack unreachable).
 */
export async function confirmPayment(
  reference: string,
  deps: ConfirmDeps = defaultDeps,
): Promise<ConfirmResult> {
  const donation = await deps.getDonation(reference);
  if (!donation) return { state: "not_found" };

  if (donation.status === "successful") {
    return { state: "successful", amountKobo: donation.amountKobo, newlyConfirmed: false };
  }

  const tx = await deps.verifyTransaction(reference);

  if (tx.reference !== reference) {
    deps.log?.(`confirm ${reference}: Paystack returned a different reference`);
    return { state: "failed" };
  }

  if (tx.status === "success") {
    // The donation is the amount we requested. If the account passes Paystack fees
    // to the donor, `amount` is higher than `requestedAmount`; we count only the donation.
    const amountMatches =
      tx.requestedAmount === donation.amountKobo && tx.amount >= donation.amountKobo;
    if (tx.currency !== "NGN" || donation.currency !== "NGN" || !amountMatches) {
      // Never count a payment whose amount or currency differs from what we recorded.
      deps.log?.(
        `confirm ${reference}: mismatch (requested ${tx.requestedAmount}, charged ${tx.amount} ${tx.currency}; expected ${donation.amountKobo} ${donation.currency})`,
      );
      return { state: "failed" };
    }
    const changed = await deps.markSuccessful({
      reference,
      amountKobo: donation.amountKobo,
      currency: tx.currency,
      paidAt: tx.paidAt,
    });
    if (!changed) {
      // Another request confirmed it first (or the row changed): re-read to report truthfully.
      const latest = await deps.getDonation(reference);
      if (latest?.status !== "successful") return { state: "pending" };
    }
    return { state: "successful", amountKobo: donation.amountKobo, newlyConfirmed: changed };
  }

  if (FINAL_FAILURES.has(tx.status)) {
    await deps.markFailed(reference);
    return { state: "failed" };
  }

  // abandoned / ongoing / pending / processing / queued: donor may still pay.
  return { state: "pending" };
}
