import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/payments", () => ({ confirmPayment: vi.fn() }));

import { POST } from "../app/api/payments/webhook/route";
import { confirmPayment } from "@/lib/payments";
import { isValidWebhookSignature } from "../lib/paystack";

const SECRET = "sk_test_unit_test_secret";
const REF = "SH3-" + "c".repeat(32);
const confirm = vi.mocked(confirmPayment);

const sign = (body: string, key = SECRET) => createHmac("sha512", key).update(body).digest("hex");

function req(body: string, signature?: string) {
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: signature ? { "x-paystack-signature": signature } : {},
    body,
  });
}

const chargeSuccess = JSON.stringify({
  event: "charge.success",
  data: { reference: REF, amount: 120_000, currency: "NGN", status: "success" },
});

beforeEach(() => {
  process.env.PAYSTACK_SECRET_KEY = SECRET;
  confirm.mockReset();
});

describe("isValidWebhookSignature", () => {
  it("accepts the HMAC-SHA512 of the raw body", () => {
    expect(isValidWebhookSignature(chargeSuccess, sign(chargeSuccess))).toBe(true);
  });
  it("rejects missing, malformed, wrong-key and altered-body signatures", () => {
    expect(isValidWebhookSignature(chargeSuccess, null)).toBe(false);
    expect(isValidWebhookSignature(chargeSuccess, "abc")).toBe(false);
    expect(isValidWebhookSignature(chargeSuccess, sign(chargeSuccess, "other"))).toBe(false);
    expect(isValidWebhookSignature(chargeSuccess + " ", sign(chargeSuccess))).toBe(false);
  });
});

describe("POST /api/payments/webhook", () => {
  it("rejects an invalid signature without processing", async () => {
    const res = await POST(req(chargeSuccess, sign(chargeSuccess, "wrong")));
    expect(res.status).toBe(401);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("rejects a missing signature", async () => {
    expect((await POST(req(chargeSuccess))).status).toBe(401);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("acknowledges unrelated events without processing", async () => {
    const body = JSON.stringify({ event: "transfer.success", data: { reference: REF } });
    const res = await POST(req(body, sign(body)));
    expect(res.status).toBe(200);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("verifies independently and acknowledges a successful charge", async () => {
    confirm.mockResolvedValue({ state: "successful", amountKobo: 120_000, newlyConfirmed: true });
    const res = await POST(req(chargeSuccess, sign(chargeSuccess)));
    expect(res.status).toBe(200);
    expect(confirm).toHaveBeenCalledWith(REF);
  });

  it("acknowledges an already-processed duplicate", async () => {
    confirm.mockResolvedValue({ state: "successful", amountKobo: 120_000, newlyConfirmed: false });
    expect((await POST(req(chargeSuccess, sign(chargeSuccess)))).status).toBe(200);
  });

  it("acknowledges a mismatch so Paystack stops retrying (not counted)", async () => {
    confirm.mockResolvedValue({ state: "failed" });
    expect((await POST(req(chargeSuccess, sign(chargeSuccess)))).status).toBe(200);
  });

  it("asks for a retry when Paystack verify does not yet agree", async () => {
    confirm.mockResolvedValue({ state: "pending" });
    expect((await POST(req(chargeSuccess, sign(chargeSuccess)))).status).toBe(503);
  });

  it("asks for a retry on infrastructure errors", async () => {
    confirm.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(req(chargeSuccess, sign(chargeSuccess)))).status).toBe(500);
  });
});
