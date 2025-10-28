import { NextResponse } from "next/server";
import { getDefaultSeasonYear, getDrivers, getTeams } from "@/lib/data";
import type { Driver, Team } from "@/lib/types";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET() {
  const season = getDefaultSeasonYear();
  try {
    const [driversRaw, teamsRaw] = await Promise.all([getDrivers(season), getTeams(season)]);

    interface DriverStanding {
      id: string;
      name: string;
      points: number;
      teamId: string;
    }

    interface TeamStanding {
      id: string;
      name: string;
      points: number;
    }

    const drivers = driversRaw
      .map((driver: Driver): DriverStanding => ({
        id: driver.id,
        name: driver.name,
        points: driver.points,
        teamId: driver.teamId
      }))
      .sort((a: DriverStanding, b: DriverStanding) => b.points - a.points);

    const teams = teamsRaw
      .map((team: Team): TeamStanding => ({
        id: team.id,
        name: team.name,
        points: team.points
      }))
      .sort((a: TeamStanding, b: TeamStanding) => b.points - a.points);

    return NextResponse.json({ season, drivers, teams });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Standings API error", error);
    return NextResponse.json({ season, drivers: [], teams: [] }, { status: 503 });
  }
}
