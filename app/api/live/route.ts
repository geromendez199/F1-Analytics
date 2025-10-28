import { NextResponse } from "next/server";
import { getLiveTiming } from "@/lib/api";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const live = await getLiveTiming().catch(() => null);

  if (!live) {
    return NextResponse.json(
      {
        available: false,
        message:
          "Live timing deshabilitado. Configura OPENF1_SESSION_KEY (y RAPIDAPI_F1LIVE_KEY si corresponde) para habilitar la fuente.",
        updatedAt: new Date().toISOString(),
        entries: []
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(live, { headers: { "Cache-Control": "no-store" } });
}
