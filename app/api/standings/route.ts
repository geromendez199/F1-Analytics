import { NextResponse } from "next/server";
import { getDefaultSeasonYear } from "@/lib/data";
import { fetchConstructorStandings, fetchDriverStandings } from "@/lib/api";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET() {
  const season = getDefaultSeasonYear();
  try {
    const [driverStandings, constructorStandings] = await Promise.all([
      fetchDriverStandings(season),
      fetchConstructorStandings(season)
    ]);

    const drivers = driverStandings.map((standing) => ({
      id: standing.Driver.driverId,
      name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
      points: Number.parseFloat(standing.points ?? "0"),
      teamId: standing.Constructors[0]?.constructorId ?? "unknown"
    }));

    const teams = constructorStandings.map((standing) => ({
      id: standing.Constructor.constructorId,
      name: standing.Constructor.name,
      points: Number.parseFloat(standing.points ?? "0")
    }));

    return NextResponse.json({ season, drivers, teams });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Standings API error", error);
    return NextResponse.json({ season, drivers: [], teams: [] }, { status: 503 });
  }
}
