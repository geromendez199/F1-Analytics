import { NextResponse } from "next/server";
import { getDrivers, getTeams } from "@/lib/data";
import { fetchConstructorStandings, fetchDriverStandings } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET() {
  try {
    const [driverStandings, constructorStandings] = await Promise.all([
      fetchDriverStandings("current"),
      fetchConstructorStandings("current")
    ]);

    if (driverStandings.length && constructorStandings.length) {
      return NextResponse.json({
        drivers: driverStandings.map((standing) => ({
          id: standing.driverId,
          name: standing.driverName,
          points: standing.points,
          teamId: standing.constructorId
        })),
        teams: constructorStandings.map((standing) => ({
          id: standing.constructorId,
          name: standing.constructorName,
          points: standing.points
        }))
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Ergast standings fallback", error);
  }

  const drivers = getDrivers()
    .map((driver) => ({
      id: driver.id,
      name: driver.name,
      points: driver.points,
      teamId: driver.teamId
    }))
    .sort((a, b) => b.points - a.points);

  const teams = getTeams()
    .map((team) => ({
      id: team.id,
      name: team.name,
      points: team.points
    }))
    .sort((a, b) => b.points - a.points);

  return NextResponse.json({ drivers, teams });
}
