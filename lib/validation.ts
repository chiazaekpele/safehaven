import { randomBytes } from "node:crypto";
import { parseNairaToKobo } from "./money";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Our references: "SH3-" + 32 hex chars (128 bits of randomness). */
const REFERENCE_RE = /^SH3-[a-f0-9]{32}$/;

export function newReference(): string {
  return `SH3-${randomBytes(16).toString("hex")}`;
}

export function isValidReference(value: unknown): value is string {
  return typeof value === "string" && REFERENCE_RE.test(value);
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export type InitializeInput = { email: string; amountKobo: number };

/**
 * Validate the donate form body. Only `email` and `amountNaira` are read;
 * anything else (status, kobo overrides, keys…) is ignored.
 */
export function parseInitializeBody(
  body: unknown,
): { ok: true; value: InitializeInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }
  const { email, amountNaira } = body as Record<string, unknown>;

  const amount = parseNairaToKobo(amountNaira);
  if (!amount.ok) return { ok: false, error: amount.error };

  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return { ok: false, error: "Enter a valid email address." };

  return { ok: true, value: { email: cleanEmail, amountKobo: amount.kobo } };
}
