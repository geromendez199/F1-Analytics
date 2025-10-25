import { cache } from "react";
import { DateTime } from "luxon";
import type { Driver, GrandPrix, ResultData, Session, SessionType, Team, WeatherData } from "./types";
import driverMetaJson from "../data/drivers.json" assert { type: "json" };
import teamMetaJson from "../data/teams.json" assert { type: "json" };
import scheduleFallbackJson from "../data/schedule.json" assert { type: "json" };
import resultsFallbackJson from "../data/results.json" assert { type: "json" };
import weatherSampleJson from "../data/weather-sample.json" assert { type: "json" };
import liveSampleJson from "../data/live-sample.json" assert { type: "json" };

const ERGAST_BASE = "https://ergast.com/api/f1";
const FETCH_HEADERS = {
  "User-Agent": "F1-Analytics/1.0 (+https://f1-analytics.example)",
  Accept: "application/json"
};

interface DriverMeta {
  id: string;
  apiId?: string;
  code: string;
  name: string;
  number: number;
  country: string;
  teamId: string;
  photo?: string;
}

interface TeamMeta {
  id: string;
  apiId?: string;
  name: string;
  powerUnit?: string;
  livery?: string;
  drivers: string[];
  points?: number;
}

const driverMeta = driverMetaJson as DriverMeta[];
const teamMeta = teamMetaJson as TeamMeta[];
const fallbackSchedule = scheduleFallbackJson as GrandPrix[];
const fallbackResults = resultsFallbackJson as ResultData;
const weatherSample = weatherSampleJson as WeatherData;

const driverMetaByApiId = new Map(
  driverMeta.map((driver) => [driver.apiId ?? driver.id.replace(/-/g, "_"), driver])
);
const driverMetaById = new Map(driverMeta.map((driver) => [driver.id, driver]));
const teamMetaByApiId = new Map(teamMeta.map((team) => [team.apiId ?? team.id.replace(/-/g, "_"), team]));
const teamMetaById = new Map(teamMeta.map((team) => [team.id, team]));
const fallbackScheduleByRound = new Map(fallbackSchedule.map((gp) => [gp.round, gp]));
const fallbackDriverPoints = new Map(
  fallbackResults.season.driverStandings.map((standing) => [standing.driverId, standing.points])
);
const fallbackTeamPoints = new Map(
  fallbackResults.season.constructorStandings.map((standing) => [standing.teamId, standing.points])
);

function mapConstructorId(constructorId?: string) {
  if (!constructorId) return "independent";
  return teamMetaByApiId.get(constructorId)?.id ?? constructorId.replace(/_/g, "-");
}

function mapDriverId(driverId: string) {
  return driverMetaByApiId.get(driverId)?.id ?? driverId.replace(/_/g, "-");
}

function ensureCircuitMeta(round: number, race: any) {
  const fallback = fallbackScheduleByRound.get(round);
  if (fallback) {
    return fallback.circuit;
  }
  const { Circuit } = race;
  return {
    id: Circuit.circuitId.replace(/_/g, "-"),
    name: Circuit.circuitName,
    location: `${Circuit.Location.locality}, ${Circuit.Location.country}`,
    tz: "UTC",
    geo: {
      lat: Number(Circuit.Location.lat),
      lng: Number(Circuit.Location.long)
    }
  } satisfies GrandPrix["circuit"];
}

function normalizeSession(
  type: SessionType,
  timezone: string,
  fallbackSession?: Session,
  remoteSession?: { date?: string; time?: string }
): Session | null {
  let start: string | undefined;
  if (remoteSession?.date) {
    const dt = DateTime.fromISO(`${remoteSession.date}T${remoteSession.time ?? "00:00:00Z"}`, {
      zone: "utc"
    });
    if (dt.isValid) {
      start = dt.setZone(timezone).toISO({ suppressMilliseconds: true });
    }
  }
  if (!start && fallbackSession?.start) {
    start = fallbackSession.start;
  }
  if (!start) {
    return null;
  }
  const end =
    fallbackSession?.end ??
    DateTime.fromISO(start, { zone: timezone })
      .plus(type === "RACE" ? { hours: 2 } : { hours: 1 })
      .toISO({ suppressMilliseconds: true });
  return { type, start, end };
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    next: { revalidate: 60 * 15 }
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const getSchedule = cache(async (): Promise<GrandPrix[]> => {
  try {
    const data = await fetchJson<any>(`${ERGAST_BASE}/current.json`);
    const races: any[] = data?.MRData?.RaceTable?.Races ?? [];
    if (!races.length) {
      throw new Error("No races returned");
    }

    return races.map((race) => {
      const round = Number.parseInt(race.round, 10);
      const fallback = fallbackScheduleByRound.get(round);
      const circuitMeta = ensureCircuitMeta(round, race);
      const timezone = circuitMeta.tz;
      const sessions: Session[] = [];
      const fallbackSessionsByType = new Map((fallback?.sessions ?? []).map((session) => [session.type, session]));

      const pushSession = (type: SessionType, remote?: { date?: string; time?: string }) => {
        const normalized = normalizeSession(type, timezone, fallbackSessionsByType.get(type), remote);
        if (normalized) {
          sessions.push(normalized);
        }
      };

      pushSession("FP1", race.FirstPractice);
      if (race.SecondPractice) pushSession("FP2", race.SecondPractice);
      if (race.ThirdPractice) pushSession("FP3", race.ThirdPractice);
      if (race.Sprint) pushSession("SPRINT", race.Sprint);
      pushSession("QUALY", race.Qualifying);
      pushSession("RACE", { date: race.date, time: race.time });

      return {
        round,
        grandPrix: race.raceName,
        circuit: {
          ...circuitMeta,
          geo: circuitMeta.geo ?? {
            lat: Number(race.Circuit.Location.lat),
            lng: Number(race.Circuit.Location.long)
          }
        },
        sessions: sessions.length
          ? sessions.sort((a, b) => (a.start > b.start ? 1 : -1))
          : fallback?.sessions ?? []
      } satisfies GrandPrix;
    });
  } catch (error) {
    console.error("Schedule fallback", error);
    return fallbackSchedule;
  }
});

export const getTeams = cache(async (): Promise<Team[]> => {
  try {
    const data = await fetchJson<any>(`${ERGAST_BASE}/current/constructorStandings.json`);
    const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
    if (!standings.length) {
      throw new Error("Empty constructor standings");
    }

    return standings.map((standing: any) => {
      const constructorId: string = standing.Constructor.constructorId;
      const meta = teamMetaByApiId.get(constructorId) ?? teamMetaById.get(constructorId);
      const id = meta?.id ?? constructorId.replace(/_/g, "-");
      return {
        id,
        name: meta?.name ?? standing.Constructor.name,
        powerUnit: meta?.powerUnit,
        livery: meta?.livery ?? "/liveries/default.svg",
        drivers: meta?.drivers ?? [],
        points: Number.parseInt(standing.points, 10) ?? 0
      } satisfies Team;
    });
  } catch (error) {
    console.error("Teams fallback", error);
    return teamMeta.map((team) => ({
      id: team.id,
      name: team.name,
      powerUnit: team.powerUnit,
      livery: team.livery ?? "/liveries/default.svg",
      drivers: team.drivers,
      points: fallbackTeamPoints.get(team.id) ?? team.points ?? 0
    }));
  }
});

export const getDrivers = cache(async (): Promise<Driver[]> => {
  try {
    const data = await fetchJson<any>(`${ERGAST_BASE}/current/driverStandings.json`);
    const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    if (!standings.length) {
      throw new Error("Empty driver standings");
    }

    const drivers = standings.map((standing: any) => {
      const apiId: string = standing.Driver.driverId;
      const meta = driverMetaByApiId.get(apiId) ?? driverMetaById.get(apiId);
      const constructorId: string | undefined = standing.Constructors?.[0]?.constructorId;
      const teamId = meta?.teamId ?? mapConstructorId(constructorId);
      const number = meta?.number ?? Number.parseInt(standing.Driver.permanentNumber ?? standing.position, 10);

      return {
        id: meta?.id ?? mapDriverId(apiId),
        code: meta?.code ?? standing.Driver.code ?? apiId.slice(0, 3).toUpperCase(),
        name: meta?.name ?? `${standing.Driver.givenName} ${standing.Driver.familyName}`,
        number: Number.isFinite(number) ? number : 0,
        country: meta?.country ?? standing.Driver.nationality,
        teamId,
        points: Number.parseInt(standing.points, 10) ?? 0,
        photo: meta?.photo
      } satisfies Driver;
    });

    const existing = new Set(drivers.map((driver) => driver.id));
    for (const meta of driverMeta) {
      if (!existing.has(meta.id)) {
        drivers.push({
          id: meta.id,
          code: meta.code,
          name: meta.name,
          number: meta.number,
          country: meta.country,
          teamId: meta.teamId,
          points: fallbackDriverPoints.get(meta.id) ?? 0,
          photo: meta.photo
        });
      }
    }

    return drivers.sort((a, b) => b.points - a.points);
  } catch (error) {
    console.error("Drivers fallback", error);
    return driverMeta
      .map((meta) => ({
        id: meta.id,
        code: meta.code,
        name: meta.name,
        number: meta.number,
        country: meta.country,
        teamId: meta.teamId,
        points: fallbackDriverPoints.get(meta.id) ?? 0,
        photo: meta.photo
      }))
      .sort((a, b) => b.points - a.points);
  }
});

export const getResults = cache(async (): Promise<ResultData> => {
  try {
    const data = await fetchJson<any>(`${ERGAST_BASE}/current/last/results.json`);
    const race = data?.MRData?.RaceTable?.Races?.[0];
    if (!race) {
      throw new Error("No last race available");
    }

    const podium = (race.Results ?? []).slice(0, 3).map((result: any) => ({
      position: Number.parseInt(result.position, 10) ?? 0,
      driverId: mapDriverId(result.Driver.driverId),
      teamId: mapConstructorId(result.Constructor.constructorId)
    }));

    const drivers = await getDrivers();
    const teams = await getTeams();

    return {
      lastRace: {
        grandPrix: race.raceName,
        date: race.date,
        winner: {
          driverId: mapDriverId(race.Results?.[0]?.Driver?.driverId ?? podium[0]?.driverId ?? ""),
          time: race.Results?.[0]?.Time?.time ?? ""
        },
        podium
      },
      season: {
        year: Number.parseInt(race.season, 10) ?? fallbackResults.season.year,
        driverStandings: drivers.slice(0, 10).map((driver, index) => ({
          position: index + 1,
          driverId: driver.id,
          points: driver.points
        })),
        constructorStandings: teams.slice(0, 10).map((team, index) => ({
          position: index + 1,
          teamId: team.id,
          points: team.points
        }))
      }
    } satisfies ResultData;
  } catch (error) {
    console.error("Results fallback", error);
    return fallbackResults;
  }
});

export function getSampleWeather(): WeatherData {
  return weatherSample;
}

export function getLiveSample() {
  return liveSampleJson as {
    available: boolean;
    message?: string;
    updatedAt: string;
    entries: Array<{ position: number; driver: string; gap: string; tyre: string; lastLap: string }>;
  };
}
