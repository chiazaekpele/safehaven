import { describe, expect, it } from "vitest";
import { isValidReference, newReference, parseInitializeBody } from "../lib/validation";

describe("parseInitializeBody", () => {
  it("accepts a valid email and amount", () => {
    expect(parseInitializeBody({ email: " a@b.co ", amountNaira: 1200 })).toEqual({
      ok: true,
      value: { email: "a@b.co", amountKobo: 120_000 },
    });
  });

  it("ignores client-supplied status and kobo overrides", () => {
    const r = parseInitializeBody({
      email: "a@b.co",
      amountNaira: 5000,
      status: "successful",
      amountKobo: 1,
      amount_kobo: 1,
    });
    expect(r).toEqual({ ok: true, value: { email: "a@b.co", amountKobo: 500_000 } });
  });

  it.each([
    ["bad email", { email: "nope", amountNaira: 1200 }],
    ["missing email", { amountNaira: 1200 }],
    ["missing amount", { email: "a@b.co" }],
    ["not an object", "hello"],
    ["null", null],
  ])("rejects %s", (_label, body) => {
    expect(parseInitializeBody(body).ok).toBe(false);
  });
});

describe("references", () => {
  it("are well-formed and unique", () => {
    const refs = new Set(Array.from({ length: 1000 }, newReference));
    expect(refs.size).toBe(1000);
    for (const r of refs) expect(isValidReference(r)).toBe(true);
  });

  it.each(["", "abc", "SH3-xyz", "SH3-" + "a".repeat(31), "SH3-" + "A".repeat(32), "../SH3-x", 42, null])(
    "rejects %p",
    (r) => {
      expect(isValidReference(r)).toBe(false);
    },
  );
});
