import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments";
import { isValidWebhookSignature } from "@/lib/paystack";
import { isValidReference } from "@/lib/validation";

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  // 1. Raw body first: the signature is computed over the exact bytes Paystack sent.
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  // 2. Reject anything not signed with our secret key.
  if (!isValidWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 3. Parse only after the signature is valid.
  let event: { event?: string; data?: { reference?: unknown } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (event.event !== "charge.success" || !isValidReference(reference)) {
    // Not an event we act on (or not one of our references): acknowledge so Paystack stops retrying.
    return NextResponse.json({ ok: true });
  }

  try {
    // 4. Independently verify with Paystack and mark successful at most once.
    const result = await confirmPayment(reference);
    if (result.state === "pending") {
      // Paystack says success in the webhook but verify doesn't agree yet: ask for a retry.
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    // successful (new or already processed), failed (mismatch) or not_found: acknowledge.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook:", err instanceof Error ? err.message : err);
    // Infrastructure error: non-2xx so Paystack retries later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
