import { NextResponse } from "next/server";
import { getMealCostKobo } from "@/lib/donations";
import { mealsFromKobo } from "@/lib/money";
import { confirmPayment } from "@/lib/payments";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidReference } from "@/lib/validation";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const limit = rateLimit(`verify:${clientIp(request.headers)}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ state: "pending" }, { status: 429, headers: noStore });
  }

  const reference = new URL(request.url).searchParams.get("reference");
  if (!isValidReference(reference)) {
    return NextResponse.json({ state: "not_found" }, { status: 400, headers: noStore });
  }

  try {
    const result = await confirmPayment(reference);
    if (result.state === "not_found") {
      return NextResponse.json({ state: "not_found" }, { status: 404, headers: noStore });
    }
    if (result.state === "successful" && result.amountKobo) {
      const meals = mealsFromKobo(result.amountKobo, await getMealCostKobo());
      // Minimal public result: no email, no internal ids.
      return NextResponse.json(
        { state: "successful", amountKobo: result.amountKobo, meals },
        { headers: noStore },
      );
    }
    return NextResponse.json({ state: result.state }, { headers: noStore });
  } catch (err) {
    console.error("verify:", err instanceof Error ? err.message : err);
    // Temporary problem: tell the page to keep checking.
    return NextResponse.json({ state: "pending" }, { headers: noStore });
  }
}
