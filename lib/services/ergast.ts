const ERGAST_BASE_URL = process.env.ERGAST_API_URL?.replace(/\/$/, "") ?? "https://ergast.com/api/f1";

type NextRequestInit = RequestInit & { next?: { revalidate?: number } };

interface ErgastDriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    code?: string;
    permanentNumber?: string;
    nationality?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

interface ErgastConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality?: string;
  };
}

interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  FirstPractice?: { date: string; time?: string };
  SecondPractice?: { date: string; time?: string };
  ThirdPractice?: { date: string; time?: string };
  SprintShootout?: { date: string; time?: string };
  Sprint?: { date: string; time?: string };
  Qualifying?: { date: string; time?: string };
  SprintQualifying?: { date: string; time?: string };
  Results?: Array<{
    position: string;
    status: string;
    Driver: {
      givenName: string;
      familyName: string;
      driverId: string;
      code?: string;
    };
    Constructor: {
      constructorId: string;
      name: string;
    };
    Time?: {
      time: string;
    };
  }>;
}

interface ErgastResponse<T> {
  MRData: {
    StandingsTable?: {
      StandingsLists?: Array<T>;
    };
    RaceTable?: {
      Races?: ErgastRace[];
    };
  };
}

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driverId: string;
  driverName: string;
  driverCode?: string;
  constructorId?: string;
  constructorName?: string;
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: string;
  constructorName: string;
}

export interface RaceResultSummary {
  season: number;
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  podium: Array<{
    position: number;
    driver: string;
    driverId: string;
    team: string;
    teamId: string;
    time?: string;
  }>;
}

export interface ScheduleSession {
  type: "FP1" | "FP2" | "FP3" | "QUALY" | "SPRINT" | "RACE";
  start: string;
  end: string;
}

export interface ScheduleEntry {
  round: number;
  grandPrix: string;
  circuitId: string;
  circuitName: string;
  location: string;
  latitude: number;
  longitude: number;
  sessions: ScheduleSession[];
}

const SESSION_DURATION: Record<ScheduleSession["type"], number> = {
  FP1: 60,
  FP2: 60,
  FP3: 60,
  QUALY: 60,
  SPRINT: 30,
  RACE: 120
};

async function ergastFetch(path: string, init?: NextRequestInit) {
  const url = `${ERGAST_BASE_URL}${path}`;
  const { next, ...rest } = init ?? {};
  const response = await fetch(url, {
    ...rest,
    next,
    headers: {
      Accept: "application/json",
      ...(rest.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Ergast request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchDriverStandings(season: string | number = "current"): Promise<DriverStanding[]> {
  const data: ErgastResponse<{ DriverStandings?: ErgastDriverStanding[] }> = await ergastFetch(
    `/${season}/driverStandings.json`,
    { next: { revalidate: 15 * 60 } }
  );

  const standings = data.MRData.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  return standings.map((entry) => ({
    position: Number.parseInt(entry.position, 10),
    points: Number.parseFloat(entry.points),
    wins: Number.parseInt(entry.wins, 10),
    driverId: entry.Driver.driverId,
    driverName: `${entry.Driver.givenName} ${entry.Driver.familyName}`.trim(),
    driverCode: entry.Driver.code,
    constructorId: entry.Constructors?.[0]?.constructorId,
    constructorName: entry.Constructors?.[0]?.name
  }));
}

export async function fetchConstructorStandings(
  season: string | number = "current"
): Promise<ConstructorStanding[]> {
  const data: ErgastResponse<{ ConstructorStandings?: ErgastConstructorStanding[] }> = await ergastFetch(
    `/${season}/constructorStandings.json`,
    { next: { revalidate: 15 * 60 } }
  );

  const standings = data.MRData.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return standings.map((entry) => ({
    position: Number.parseInt(entry.position, 10),
    points: Number.parseFloat(entry.points),
    wins: Number.parseInt(entry.wins, 10),
    constructorId: entry.Constructor.constructorId,
    constructorName: entry.Constructor.name
  }));
}

function buildSession(date: string, time: string | undefined, type: ScheduleSession["type"]): ScheduleSession | null {
  if (!date) {
    return null;
  }
  const start = time ? `${date}T${time.replace("Z", "")}` : `${date}T00:00:00`;
  const durationMinutes = SESSION_DURATION[type] ?? 60;
  const endDate = new Date(`${start}Z`);
  const end = new Date(endDate.getTime() + durationMinutes * 60 * 1000);
  return {
    type,
    start,
    end: end.toISOString().replace("Z", "")
  };
}

export async function fetchCurrentSchedule(): Promise<ScheduleEntry[]> {
  const data: ErgastResponse<ErgastRace> = await ergastFetch("/current.json", {
    next: { revalidate: 60 * 60 }
  });

  const races = data.MRData.RaceTable?.Races ?? [];

  return races.map((race) => {
    const sessions: ScheduleSession[] = [];
    const pushSession = (maybe: ScheduleSession | null) => {
      if (maybe) {
        sessions.push(maybe);
      }
    };

    pushSession(buildSession(race.FirstPractice?.date ?? "", race.FirstPractice?.time, "FP1"));
    pushSession(buildSession(race.SecondPractice?.date ?? "", race.SecondPractice?.time, "FP2"));
    pushSession(buildSession(race.ThirdPractice?.date ?? "", race.ThirdPractice?.time, "FP3"));
    pushSession(buildSession(race.SprintQualifying?.date ?? "", race.SprintQualifying?.time, "QUALY"));
    pushSession(buildSession(race.Qualifying?.date ?? "", race.Qualifying?.time, "QUALY"));
    pushSession(buildSession(race.SprintShootout?.date ?? "", race.SprintShootout?.time, "SPRINT"));
    pushSession(buildSession(race.Sprint?.date ?? "", race.Sprint?.time, "SPRINT"));
    pushSession(buildSession(race.date, race.time, "RACE"));

    const latitude = Number.parseFloat(race.Circuit.Location.lat);
    const longitude = Number.parseFloat(race.Circuit.Location.long);

    return {
      round: Number.parseInt(race.round, 10),
      grandPrix: race.raceName,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      latitude: Number.isFinite(latitude) ? latitude : 0,
      longitude: Number.isFinite(longitude) ? longitude : 0,
      sessions: sessions.filter(Boolean)
    };
  });
}

export async function fetchRaceByRound(round: number): Promise<ErgastRace | null> {
  const data: ErgastResponse<ErgastRace> = await ergastFetch(`/current/${round}.json`, {
    next: { revalidate: 60 * 30 }
  });
  return data.MRData.RaceTable?.Races?.[0] ?? null;
}

export async function fetchLastRaceResult(): Promise<RaceResultSummary | null> {
  const data: ErgastResponse<ErgastRace> = await ergastFetch("/current/last/results.json", {
    next: { revalidate: 15 * 60 }
  });

  const race = data.MRData.RaceTable?.Races?.[0];
  if (!race) {
    return null;
  }

  const podium = (race.Results ?? [])
    .filter((result) => Number.parseInt(result.position, 10) <= 3)
    .map((result) => ({
      position: Number.parseInt(result.position, 10),
      driver: `${result.Driver.givenName} ${result.Driver.familyName}`.trim(),
      driverId: result.Driver.driverId,
      team: result.Constructor.name,
      teamId: result.Constructor.constructorId,
      time: result.Time?.time
    }))
    .sort((a, b) => a.position - b.position);

  const latitude = Number.parseFloat(race.Circuit.Location.lat);
  const longitude = Number.parseFloat(race.Circuit.Location.long);

  return {
    season: Number.parseInt(race.season, 10),
    round: Number.parseInt(race.round, 10),
    raceName: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    date: race.date,
    podium
  };
}
