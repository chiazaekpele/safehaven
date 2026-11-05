// Campaign constants shared by server and client code. No secrets here.

export const CAMPAIGN_EDITION = 3;

/** Default meal cost (₦1,200). The live value comes from campaign_settings. */
export const DEFAULT_MEAL_COST_KOBO = 120_000;

/**
 * Minimum donation in whole naira.
 * TEMPORARY DEFAULT — confirm the real minimum before launch and change it here.
 */
export const MIN_DONATION_NAIRA = 100;

/** Upper bound to catch typos (e.g. an extra zero). Change here if needed. */
export const MAX_DONATION_NAIRA = 5_000_000;

export const SUGGESTED_AMOUNTS_NAIRA = [1_200, 2_400, 5_000, 10_000] as const;

export const PROVISIONS = [
  "Custard",
  "Cornflakes",
  "Milk",
  "Sugar",
  "Milo",
  "Bread",
] as const;

export const CONTACT_NAME = "Daniella";
export const CONTACT_PHONE_DISPLAY = "+234 705 389 8056";
const CONTACT_PHONE_WA = "2347053898056";

export const THANK_YOU_MESSAGE =
  "Thank you for helping us get someone food this exam season. We can't fix all the problems in the world but we can give one person a meal. God bless you.";

/**
 * Public site address, used for the Paystack callback, WhatsApp share link and metadata.
 * 1. NEXT_PUBLIC_SITE_URL (set this in Vercel; required for a custom domain)
 * 2. Vercel's automatic production domain, so a missing variable never sends donors to localhost
 * 3. localhost for development
 * Env vars are referenced literally so Next.js can inline them at build time.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const url =
    configured || (vercelProd ? `https://${vercelProd}` : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

export function whatsappContactUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT_PHONE_WA}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function whatsappShareUrl(): string {
  const text = `Students carry so much during exams. Safe Haven Foundation's 3rd Edition Food Drive is giving them a meal when they need it most — ₦1,200 feeds one student. Join me: ${siteUrl()}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
