// confirmPayment against an in-memory store that mimics the real conditional UPDATE.
import { describe, expect, it, vi } from "vitest";
import type { DonationRecord } from "../lib/donations";
import { confirmPayment, type ConfirmDeps } from "../lib/payments";
import type { VerifiedTransaction } from "../lib/paystack";

const REF = "SH3-" + "a".repeat(32);

function setup(opts: {
  donation?: Partial<DonationRecord> | null;
  tx?: Partial<VerifiedTransaction>;
}) {
  const rows = new Map<string, DonationRecord>();
  if (opts.donation !== null) {
    rows.set(REF, {
      reference: REF,
      amountKobo: 120_000,
      currency: "NGN",
      status: "pending",
      ...opts.donation,
    });
  }
  let tx: VerifiedTransaction = {
    status: "success",
    reference: REF,
    amount: 120_000,
    requestedAmount: 120_000,
    currency: "NGN",
    paidAt: "2026-11-05T10:00:00.000Z",
    ...opts.tx,
  };

  const deps: ConfirmDeps = {
    getDonation: vi.fn(async (ref: string) => {
      const r = rows.get(ref);
      return r ? { ...r } : null;
    }),
    // Same semantics as the SQL: only pending/failed rows with matching amount+currency change.
    markSuccessful: vi.fn(async ({ reference, amountKobo, currency }) => {
      await Promise.resolve(); // let concurrent callers interleave
      const r = rows.get(reference);
      if (!r || r.status === "successful" || r.amountKobo !== amountKobo || r.currency !== currency) {
        return false;
      }
      r.status = "successful";
      return true;
    }),
    markFailed: vi.fn(async (reference: string) => {
      const r = rows.get(reference);
      if (r?.status === "pending") r.status = "failed";
    }),
    verifyTransaction: vi.fn(async () => tx),
    log: () => {},
  };

  const totalKobo = () =>
    [...rows.values()].filter((r) => r.status === "successful").reduce((s, r) => s + r.amountKobo, 0);
  const setTx = (next: Partial<VerifiedTransaction>) => (tx = { ...tx, ...next });

  return { deps, rows, totalKobo, setTx };
}

describe("confirmPayment", () => {
  it("marks a verified successful transaction successful", async () => {
    const { deps, rows, totalKobo } = setup({});
    const r = await confirmPayment(REF, deps);
    expect(r).toEqual({ state: "successful", amountKobo: 120_000, newlyConfirmed: true });
    expect(rows.get(REF)?.status).toBe("successful");
    expect(totalKobo()).toBe(120_000);
  });

  it("returns not_found for an unknown reference without calling Paystack", async () => {
    const { deps } = setup({ donation: null });
    expect(await confirmPayment(REF, deps)).toEqual({ state: "not_found" });
    expect(deps.verifyTransaction).not.toHaveBeenCalled();
  });

  it("does not call Paystack again once a donation is successful", async () => {
    const { deps } = setup({ donation: { status: "successful" } });
    const r = await confirmPayment(REF, deps);
    expect(r.state).toBe("successful");
    expect(r.newlyConfirmed).toBe(false);
    expect(deps.verifyTransaction).not.toHaveBeenCalled();
  });

  describe("mismatches are never counted", () => {
    it.each([
      ["requested amount differs", { requestedAmount: 100_000, amount: 100_000 }],
      ["charged less than requested", { amount: 119_999 }],
      ["currency differs", { currency: "USD" }],
      ["reference differs", { reference: "SH3-" + "b".repeat(32) }],
    ])("%s", async (_label, tx) => {
      const { deps, totalKobo } = setup({ tx });
      expect((await confirmPayment(REF, deps)).state).toBe("failed");
      expect(deps.markSuccessful).not.toHaveBeenCalled();
      expect(totalKobo()).toBe(0);
    });

    it("stored currency is not NGN", async () => {
      const { deps, totalKobo } = setup({ donation: { currency: "USD" } });
      expect((await confirmPayment(REF, deps)).state).toBe("failed");
      expect(totalKobo()).toBe(0);
    });
  });

  it("counts only the donation when Paystack fees are passed to the donor", async () => {
    const { deps, totalKobo } = setup({ tx: { amount: 121_827, requestedAmount: 120_000 } });
    const r = await confirmPayment(REF, deps);
    expect(r).toMatchObject({ state: "successful", amountKobo: 120_000 });
    expect(totalKobo()).toBe(120_000);
  });

  it.each(["abandoned", "ongoing", "pending", "processing", "queued"])(
    "leaves a %s transaction pending and uncounted",
    async (status) => {
      const { deps, rows, totalKobo } = setup({ tx: { status } });
      expect((await confirmPayment(REF, deps)).state).toBe("pending");
      expect(rows.get(REF)?.status).toBe("pending");
      expect(totalKobo()).toBe(0);
    },
  );

  it("marks a failed transaction failed, then counts a successful retry once", async () => {
    const { deps, rows, totalKobo, setTx } = setup({ tx: { status: "failed" } });
    expect((await confirmPayment(REF, deps)).state).toBe("failed");
    expect(rows.get(REF)?.status).toBe("failed");
    expect(totalKobo()).toBe(0);

    setTx({ status: "success" }); // donor retried on the same Paystack checkout
    expect((await confirmPayment(REF, deps)).state).toBe("successful");
    expect(totalKobo()).toBe(120_000);
  });

  it("propagates infrastructure errors so the webhook can be retried", async () => {
    const { deps } = setup({});
    deps.verifyTransaction = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(confirmPayment(REF, deps)).rejects.toThrow("network down");
  });
});

describe("duplicate and out-of-order delivery", () => {
  it("duplicate webhook deliveries count once", async () => {
    const { deps, totalKobo } = setup({});
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await confirmPayment(REF, deps));
    expect(results.every((r) => r.state === "successful")).toBe(true);
    expect(results.filter((r) => r.newlyConfirmed)).toHaveLength(1);
    expect(totalKobo()).toBe(120_000);
  });

  it("concurrent verify + webhooks count once", async () => {
    const { deps, totalKobo } = setup({});
    const results = await Promise.all([1, 2, 3, 4].map(() => confirmPayment(REF, deps)));
    expect(results.every((r) => r.state === "successful")).toBe(true);
    expect(results.filter((r) => r.newlyConfirmed)).toHaveLength(1);
    expect(totalKobo()).toBe(120_000);
  });

  it("browser return before webhook", async () => {
    const { deps, totalKobo } = setup({});
    const browser = await confirmPayment(REF, deps);
    const webhook = await confirmPayment(REF, deps);
    expect(browser.newlyConfirmed).toBe(true);
    expect(webhook).toMatchObject({ state: "successful", newlyConfirmed: false });
    expect(totalKobo()).toBe(120_000);
  });

  it("webhook before browser return", async () => {
    const { deps, totalKobo } = setup({});
    const webhook = await confirmPayment(REF, deps);
    const browser = await confirmPayment(REF, deps);
    expect(webhook.newlyConfirmed).toBe(true);
    expect(browser).toMatchObject({ state: "successful", amountKobo: 120_000, newlyConfirmed: false });
    expect(totalKobo()).toBe(120_000);
  });

  it("browser return before payment completes stays pending, then confirms", async () => {
    const { deps, totalKobo, setTx } = setup({ tx: { status: "ongoing" } });
    expect((await confirmPayment(REF, deps)).state).toBe("pending");
    expect(totalKobo()).toBe(0);
    setTx({ status: "success" });
    expect((await confirmPayment(REF, deps)).state).toBe("successful");
    expect(totalKobo()).toBe(120_000);
  });
});
