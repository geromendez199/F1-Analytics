import { NextResponse } from "next/server";
import { getSchedule } from "@/lib/data";
import { fetchCurrentSchedule, fetchTimezone } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 60 * 60; // 1 hora

export async function GET() {
  try {
    const remoteSchedule = await fetchCurrentSchedule();
    if (remoteSchedule.length) {
      const enriched = await Promise.all(
        remoteSchedule.map(async (round) => {
          const tz = await fetchTimezone(round.latitude, round.longitude).catch(() => null);
          return {
            ...round,
            timezone: tz?.zoneName ?? "UTC"
          };
        })
      );
      return NextResponse.json({ schedule: enriched });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Ergast schedule fallback", error);
  }

  const schedule = getSchedule();
  return NextResponse.json({ schedule });
}
