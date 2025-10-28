import { NextResponse } from "next/server";
import { fetchTimezone } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 24 * 60 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ timezone: null }, { status: 400 });
  }

  const timezone = await fetchTimezone(lat, lng).catch(() => null);
  return NextResponse.json({ timezone });
}
