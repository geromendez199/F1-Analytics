import { NextResponse } from "next/server";
import { fetchLiveTiming } from "@/lib/services";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const live = await fetchLiveTiming().catch(() => null);

  if (!live) {
    return NextResponse.json(
      {
        available: false,
        message:
          "Live timing deshabilitado. Configura FASTF1_SERVICE_URL o LIVE_API_URL con credenciales válidas.",
        updatedAt: new Date().toISOString(),
        entries: []
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(live, { headers: { "Cache-Control": "no-store" } });
}
