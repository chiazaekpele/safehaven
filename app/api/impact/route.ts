import { NextResponse } from "next/server";
import { getPublicImpact } from "@/lib/impact";

// Aggregates only. Cached briefly at the edge so polling never hammers the database.
export async function GET() {
  try {
    const impact = await getPublicImpact();
    return NextResponse.json(impact, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("impact:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
