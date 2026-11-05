// Server-only database access. Never import this from a "use client" file.
// DATABASE_URL has no NEXT_PUBLIC_ prefix, so Next.js never sends it to the browser.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/** Lazily created so builds don't need DATABASE_URL. */
export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured");
    client = neon(url);
  }
  return client;
}

/** Postgres BIGINT/NUMERIC arrive as strings; convert safely to a JS integer. */
export function toSafeInt(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isSafeInteger(n)) throw new Error("Integer out of safe range");
  return n;
}
