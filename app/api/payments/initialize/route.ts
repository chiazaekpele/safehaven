import { NextResponse } from "next/server";
import { CAMPAIGN_EDITION, siteUrl } from "@/lib/config";
import { createPendingDonation, markFailed } from "@/lib/donations";
import { initializeTransaction } from "@/lib/paystack";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { newReference, parseInitializeBody } from "@/lib/validation";

const MAX_BODY_BYTES = 2_048;

function error(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: Request) {
  const limit = rateLimit(`init:${clientIp(request.headers)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return error("Too many attempts. Please wait a few minutes and try again.", 429, {
      "Retry-After": String(limit.retryAfterSec),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return error("Invalid request.", 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return error("Invalid request.", 400);
  }

  const parsed = parseInitializeBody(body);
  if (!parsed.ok) return error(parsed.error, 400);
  const { email, amountKobo } = parsed.value;

  const reference = newReference();

  try {
    await createPendingDonation({ reference, amountKobo, email });
  } catch (err) {
    console.error("initialize: could not create pending donation", err instanceof Error ? err.message : err);
    return error("We couldn't start the payment. Please try again.", 503);
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email,
      amountKobo,
      reference,
      callbackUrl: `${siteUrl()}/donate/success`,
      campaignEdition: CAMPAIGN_EDITION,
    });
    return NextResponse.json({ authorizationUrl, reference });
  } catch (err) {
    console.error("initialize: Paystack error", err instanceof Error ? err.message : err);
    await markFailed(reference).catch(() => {});
    return error("We couldn't reach the payment provider. Please try again.", 502);
  }
}
