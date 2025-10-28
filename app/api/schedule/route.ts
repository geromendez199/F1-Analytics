import { NextResponse } from "next/server";
import { getDefaultSeasonYear, getSchedule } from "@/lib/data";

export const runtime = "edge";
export const revalidate = 60 * 60; // 1 hora

export async function GET() {
  const season = getDefaultSeasonYear();
  const schedule = await getSchedule(season).catch(() => []);
  return NextResponse.json({ season, schedule });
}
