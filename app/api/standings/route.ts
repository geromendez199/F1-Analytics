import { NextResponse } from "next/server";
import { getDrivers, getTeams } from "@/lib/data";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET() {
  const [driversRaw, teamsRaw] = await Promise.all([getDrivers(), getTeams()]);
  const drivers = driversRaw.map((driver) => ({
    id: driver.id,
    name: driver.name,
    points: driver.points,
    teamId: driver.teamId
  })).sort((a, b) => b.points - a.points);

  const teams = teamsRaw.map((team) => ({
    id: team.id,
    name: team.name,
    points: team.points
  })).sort((a, b) => b.points - a.points);

  return NextResponse.json({ drivers, teams });
}
