import { NextResponse } from "next/server";
import { fetchCurrentSchedule, fetchTimezone } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 60 * 60; // 1 hora

export async function GET() {
  const schedule = await fetchCurrentSchedule().catch(() => []);

  const enriched = await Promise.all(
    schedule.map(async (round) => {
      const timezone = await fetchTimezone(round.latitude, round.longitude).catch(() => null);
      return {
        ...round,
        timezone: timezone?.zoneName ?? "UTC",
        timezoneAbbreviation: timezone?.abbreviation ?? null
      };
    })
  );

  return NextResponse.json({ schedule: enriched });
}
