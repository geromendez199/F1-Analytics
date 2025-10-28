import { cache } from "react";
import { Temporal } from "@js-temporal/polyfill";
import apiConfig from "@/apis.config.json" assert { type: "json" };
import type { GrandPrix, Session, SessionType, Driver, Team, WeatherData } from "./types";

const CONFIG = apiConfig as Record<string, { baseUrl: string }>;
const DEFAULT_REVALIDATE = 60 * 15;
const USER_AGENT =
  process.env.F1_ANALYTICS_USER_AGENT ??
  "F1 Analytics (https://github.com/openai/f1-analytics; contact: ops@f1-analytics.local)";

interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

async function fetchWithRetry<T>(factory: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Fetch failed");
}

function resolveBaseUrl(key: keyof typeof CONFIG): string {
  const envOverride = process.env[`${key.toString().toUpperCase()}_BASE_URL`];
  return envOverride ?? CONFIG[key].baseUrl;
}

function buildUrl(base: string, path: string, searchParams?: Record<string, string | number | undefined>) {
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

async function fetchJson<T>(url: URL, init?: FetchOptions): Promise<T> {
  return fetchWithRetry(async () => {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {})
      },
      next: { revalidate: DEFAULT_REVALIDATE, ...(init?.next ?? {}) },
      ...init
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  });
}

const timezoneCache = new Map<string, string>();

async function resolveTimeZone(lat: string, lng: string): Promise<string> {
  const cacheKey = `${lat},${lng}`;
  if (timezoneCache.has(cacheKey)) {
    return timezoneCache.get(cacheKey)!;
  }

  const apiKey = process.env.TIMEZONEDB_API_KEY;
  if (!apiKey) {
    timezoneCache.set(cacheKey, "UTC");
    return "UTC";
  }

  try {
    const url = buildUrl(resolveBaseUrl("timeZoneDb"), "/v2.1/get-time-zone", {
      key: apiKey,
      format: "json",
      by: "position",
      lat,
      lng
    });
    const data = await fetchJson<{ status: string; zoneName?: string }>(url, {
      next: { revalidate: 60 * 60 }
    });
    if (data.status === "OK" && data.zoneName) {
      timezoneCache.set(cacheKey, data.zoneName);
      return data.zoneName;
    }
  } catch (error) {
    console.error("TimeZone resolution failed", error);
  }

  timezoneCache.set(cacheKey, "UTC");
  return "UTC";
}

function toSession(session: { date?: string; time?: string }, type: SessionType): Session | undefined {
  if (!session?.date || !session?.time) {
    return undefined;
  }
  const iso = `${session.date}T${session.time}`;
  return {
    type,
    start: iso,
    end: iso
  };
}

type ErgastRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
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
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
  SprintShootout?: { date: string; time: string };
};

async function mapRaceToGrandPrix(race: ErgastRace): Promise<GrandPrix> {
  const { Circuit: circuit } = race;
  const timeZone = await resolveTimeZone(circuit.Location.lat, circuit.Location.long);
  const sessions = [
    toSession(race.FirstPractice ?? { date: race.date, time: race.time }, "FP1"),
    toSession(race.SecondPractice ?? { date: race.date, time: race.time }, "FP2"),
    toSession(race.ThirdPractice ?? { date: race.date, time: race.time }, "FP3"),
    toSession(race.SprintShootout ?? race.Sprint ?? { date: race.date, time: race.time }, "SPRINT"),
    toSession(race.Qualifying ?? { date: race.date, time: race.time }, "QUALY"),
    toSession({ date: race.date, time: race.time }, "RACE")
  ].filter((session): session is Session => Boolean(session));

  return {
    round: Number.parseInt(race.round, 10),
    grandPrix: race.raceName,
    circuit: {
      id: circuit.circuitId,
      name: circuit.circuitName,
      location: `${circuit.Location.locality}, ${circuit.Location.country}`,
      tz: timeZone,
      geo: {
        lat: Number.parseFloat(circuit.Location.lat),
        lng: Number.parseFloat(circuit.Location.long)
      }
    },
    sessions
  };
}

export const fetchSeasonSchedule = cache(async (season: number) => {
  const url = buildUrl(resolveBaseUrl("jolpica"), `/${season}.json`, { limit: 200 });
  const data = await fetchJson<{
    MRData: { RaceTable?: { Races?: ErgastRace[] } };
  }>(url);
  const races = data.MRData?.RaceTable?.Races ?? [];
  const grandPrix = await Promise.all(races.map((race) => mapRaceToGrandPrix(race)));
  return grandPrix.sort((a, b) => a.round - b.round);
});

export async function getSchedule(season?: number) {
  const targetSeason = season ?? Temporal.Now.plainDateISO().year;
  return fetchSeasonSchedule(targetSeason);
}

export async function getGrandPrixByRound(round: number, season?: number) {
  const schedule = await getSchedule(season);
  return schedule.find((gp) => gp.round === round);
}

export async function getNextGrandPrix(reference?: Temporal.Instant, season?: number) {
  const schedule = await getSchedule(season);
  const instant = reference ?? Temporal.Now.instant();
  return schedule.find((grandPrix) => {
    const race = grandPrix.sessions.find((session) => session.type === "RACE") ?? grandPrix.sessions[0];
    if (!race) {
      return false;
    }
    try {
      const raceDateTime = Temporal.ZonedDateTime.from({
        timeZone: grandPrix.circuit.tz,
        plainDateTime: Temporal.PlainDateTime.from(race.start)
      });
      return Temporal.Instant.compare(raceDateTime.toInstant(), instant) > 0;
    } catch (error) {
      console.error("Invalid race session", error);
      return false;
    }
  });
}

export const fetchDriverStandings = cache(async (season: string | number = "current") => {
  const url = buildUrl(resolveBaseUrl("jolpica"), `/${season}/driverStandings.json`, { limit: 100 });
  const data = await fetchJson<{
    MRData: {
      StandingsTable?: {
        StandingsLists?: Array<{
          season: string;
          round: string;
          DriverStandings: Array<{
            position: string;
            points: string;
            Driver: {
              driverId: string;
              permanentNumber?: string;
              code?: string;
              givenName: string;
              familyName: string;
              nationality: string;
              url?: string;
            };
            Constructors: Array<{
              constructorId: string;
              name: string;
              url?: string;
            }>;
          }>;
        }>;
      };
    };
  }>(url, { next: { revalidate: 60 * 10 } });
  return data.MRData.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
});

export const fetchConstructorStandings = cache(async (season: string | number = "current") => {
  const url = buildUrl(resolveBaseUrl("jolpica"), `/${season}/constructorStandings.json`, { limit: 100 });
  const data = await fetchJson<{
    MRData: {
      StandingsTable?: {
        StandingsLists?: Array<{
          season: string;
          round: string;
          ConstructorStandings: Array<{
            position: string;
            points: string;
            Constructor: {
              constructorId: string;
              name: string;
              nationality: string;
              url?: string;
            };
          }>;
        }>;
      };
    };
  }>(url, { next: { revalidate: 60 * 10 } });
  return data.MRData.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
});

const wikipediaImageCache = new Map<string, Promise<string | null>>();

async function fetchWikipediaImage(pageUrl?: string | null): Promise<string | null> {
  if (!pageUrl) {
    return null;
  }
  try {
    const urlObject = new URL(pageUrl);
    const segments = urlObject.pathname.split("/").filter(Boolean);
    const rawTitle = segments[segments.length - 1] ?? "";
    const title = decodeURIComponent(rawTitle).split(":").pop() ?? "";
    if (!title) {
      return null;
    }
    if (!wikipediaImageCache.has(title)) {
      const url = buildUrl(resolveBaseUrl("wikipedia"), "/", {
        action: "query",
        prop: "pageimages",
        format: "json",
        piprop: "original|thumbnail",
        pithumbsize: 800,
        titles: title,
        origin: "*"
      });
      wikipediaImageCache.set(
        title,
        fetchWithRetry(async () => {
          const response = await fetch(url.toString(), {
            headers: { "User-Agent": USER_AGENT },
            next: { revalidate: 60 * 60 * 24 }
          });
          if (!response.ok) {
            throw new Error(`Wikipedia request failed ${response.status}`);
          }
          const data = (await response.json()) as {
            query?: {
              pages?: Record<string, { original?: { source: string }; thumbnail?: { source: string } }>;
            };
          };
          const pages = data.query?.pages ?? {};
          const first = Object.values(pages)[0];
          return first?.original?.source ?? first?.thumbnail?.source ?? null;
        })
      );
    }
    return wikipediaImageCache.get(title)!;
  } catch (error) {
    console.error("Wikipedia image fetch failed", error);
    return null;
  }
}

export const fetchDrivers = cache(async (season: string | number = "current") => {
  const standings = await fetchDriverStandings(season);
  const drivers: Driver[] = await Promise.all(
    standings.map(async (entry) => {
      const driver = entry.Driver;
      const constructor = entry.Constructors[0];
      const image =
        (await fetchWikipediaImage(driver.url)) ??
        "/liveries/placeholder-driver.svg";
      return {
        id: driver.driverId,
        code: driver.code ?? driver.permanentNumber ?? driver.familyName.slice(0, 3).toUpperCase(),
        name: `${driver.givenName} ${driver.familyName}`,
        number: Number.parseInt(driver.permanentNumber ?? entry.position, 10),
        country: driver.nationality,
        teamId: constructor?.constructorId ?? "unknown",
        points: Number.parseFloat(entry.points ?? "0"),
        photo: image
      } satisfies Driver;
    })
  );
  return drivers;
});

export const fetchTeams = cache(async (season: string | number = "current") => {
  const standings = await fetchConstructorStandings(season);
  const teams: Team[] = await Promise.all(
    standings.map(async (entry) => {
      const constructor = entry.Constructor;
      const image =
        (await fetchWikipediaImage(constructor.url)) ??
        "/liveries/placeholder-team.svg";
      return {
        id: constructor.constructorId,
        name: constructor.name,
        powerUnit: constructor.nationality,
        livery: image,
        drivers: [],
        points: Number.parseFloat(entry.points ?? "0")
      } satisfies Team;
    })
  );
  return teams;
});

export async function getTeamsWithDrivers(season: string | number = "current") {
  const [teams, drivers] = await Promise.all([fetchTeams(season), fetchDrivers(season)]);
  const byTeam = new Map(teams.map((team) => [team.id, team]));
  drivers.forEach((driver) => {
    const team = byTeam.get(driver.teamId);
    if (team) {
      team.drivers = [...new Set([...team.drivers, driver.id])];
    }
  });
  return Array.from(byTeam.values());
}

export async function getLastRaceResult(season: string | number = "current") {
  const url = buildUrl(resolveBaseUrl("jolpica"), `/${season}/last/results.json`, { limit: 60 });
  const data = await fetchJson<{
    MRData: {
      RaceTable?: {
        Races?: Array<{
          raceName: string;
          Circuit: { circuitName: string };
          date: string;
          time?: string;
          Results: Array<{
            position: string;
            points: string;
            Driver: { givenName: string; familyName: string };
            Constructor: { name: string };
            Time?: { time: string };
          }>;
        }>;
      };
    };
  }>(url, { next: { revalidate: 60 * 10 } });
  const race = data.MRData.RaceTable?.Races?.[0];
  if (!race) {
    return null;
  }
  return {
    season,
    raceName: race.raceName,
    date: race.time ? `${race.date}T${race.time}` : race.date,
    podium: race.Results.slice(0, 3).map((result) => ({
      position: Number.parseInt(result.position, 10),
      driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
      team: result.Constructor.name,
      time: result.Time?.time
    }))
  };
}

export async function getWeatherByCircuit(
  circuit: { geo: { lat: number; lng: number }; location: string },
  locale: string
): Promise<{ weather: WeatherData; live: boolean }> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return {
      live: false,
      weather: {
        now: {
          temperature: 22,
          description: "Configure OPENWEATHER_API_KEY for live data",
          wind: 9,
          humidity: 55
        },
        forecast: []
      }
    };
  }

  const url = buildUrl(resolveBaseUrl("openWeather"), "/weather", {
    lat: circuit.geo.lat,
    lon: circuit.geo.lng,
    appid: apiKey,
    units: "metric",
    lang: locale
  });
  const data = await fetchJson<{
    weather: Array<{ description: string }>;
    main: { temp: number; humidity: number };
    wind: { speed: number };
  }>(url, { next: { revalidate: 5 * 60 } });

  return {
    live: true,
    weather: {
      now: {
        temperature: Math.round(data.main.temp),
        description: data.weather?.[0]?.description ?? "--",
        wind: Math.round((data.wind?.speed ?? 0) * 3.6),
        humidity: Math.round(data.main.humidity)
      },
      forecast: []
    }
  };
}

export async function getNews(query = "Formula 1", language = "en", pageSize = 6) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return [] as Array<{
      title: string;
      url: string;
      source: string;
      publishedAt?: string;
      description?: string;
      imageUrl?: string;
    }>;
  }
  const url = buildUrl(resolveBaseUrl("newsApi"), "/everything", {
    q: query,
    language,
    sortBy: "publishedAt",
    pageSize
  });
  const data = await fetchJson<{
    status: string;
    articles?: Array<{
      title: string;
      url: string;
      source: { name: string };
      publishedAt?: string;
      description?: string;
      urlToImage?: string;
    }>;
  }>(url, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 5 * 60 }
  });
  if (data.status !== "ok" || !data.articles) {
    return [];
  }
  return data.articles.map((article) => ({
    title: article.title,
    url: article.url,
    source: article.source?.name ?? "NewsAPI",
    description: article.description,
    publishedAt: article.publishedAt,
    imageUrl: article.urlToImage
  }));
}

export async function getHighlights(query = "Formula 1 Highlights", maxResults = 6) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [] as Array<{
      id: string;
      title: string;
      url: string;
      channelTitle?: string;
      publishedAt?: string;
    }>;
  }
  const url = buildUrl(resolveBaseUrl("youTube"), "/search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults,
    key: apiKey,
    order: "date"
  });
  const data = await fetchJson<{
    items?: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        publishedAt: string;
        channelTitle: string;
      };
    }>;
  }>(url, { next: { revalidate: 10 * 60 } });
  return (
    data.items?.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    })) ?? []
  );
}

export async function getTrackStatus() {
  const apiKey = process.env.RAPIDAPI_F1LIVE_KEY;
  const baseUrl = process.env.RAPIDAPI_F1LIVE_URL ?? resolveBaseUrl("rapidF1Live");
  const host = process.env.RAPIDAPI_F1LIVE_HOST ?? new URL(baseUrl).hostname;
  if (!apiKey) {
    return null;
  }
  try {
    const url = buildUrl(baseUrl, "/events/live");
    const data = await fetchJson<{
      status: string;
      data?: {
        flag?: string;
        description?: string;
        updatedAt?: string;
      };
    }>(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host
      },
      next: { revalidate: 15 }
    });
    if (data.status !== "success" || !data.data) {
      return null;
    }
    return {
      flag: data.data.flag ?? "--",
      message: data.data.description ?? "",
      updatedAt: data.data.updatedAt ?? new Date().toISOString()
    };
  } catch (error) {
    console.error("Track status fetch failed", error);
    return null;
  }
}

export async function getLiveTiming(sessionKey?: string) {
  const activeSession = sessionKey ?? process.env.OPENF1_SESSION_KEY;
  if (!activeSession) {
    return {
      available: false,
      message: "Configura OPENF1_SESSION_KEY para habilitar live timing",
      updatedAt: new Date().toISOString(),
      entries: []
    };
  }
  const url = buildUrl(resolveBaseUrl("openF1"), "/position", {
    session_key: activeSession,
    driver_number: "",
    classification: "true"
  });
  try {
    const data = await fetchJson<Array<{
      driver_number: number;
      position: number;
      gap_to_leader: string;
      last_lap_time: string;
      team_name: string;
      driver_short_name: string;
      tyre_compound: string;
    }>>(url, { next: { revalidate: 15 } });
    const entries = data
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        position: item.position,
        driver: `${item.driver_short_name ?? item.driver_number} · ${item.team_name}`,
        gap: item.gap_to_leader ?? "--",
        tyre: item.tyre_compound ?? "--",
        lastLap: item.last_lap_time ?? "--"
      }));
    return {
      available: Boolean(entries.length),
      message: entries.length ? undefined : "Sin datos en vivo disponibles",
      updatedAt: new Date().toISOString(),
      entries
    };
  } catch (error) {
    console.error("OpenF1 live timing error", error);
    return {
      available: false,
      message: "No se pudo obtener live timing desde OpenF1",
      updatedAt: new Date().toISOString(),
      entries: []
    };
  }
}

export async function getTelemetry(sessionKey?: string, driverNumber?: string) {
  const session = sessionKey ?? process.env.OPENF1_SESSION_KEY;
  if (!session) {
    return {
      available: false,
      session: "",
      message: "Configura OPENF1_SESSION_KEY para habilitar telemetría",
      entries: [],
      updatedAt: new Date().toISOString()
    };
  }
  const url = buildUrl(resolveBaseUrl("openF1"), "/car_data", {
    session_key: session,
    driver_number: driverNumber ?? "",
    limit: 200
  });
  try {
    const data = await fetchJson<
      Array<{
        driver_number: number;
        session_key: number;
        drs: number;
        speed: number;
        throttle: number;
        brake: number;
        source: string;
        date: string;
      }>
    >(url, { next: { revalidate: 30 } });
    const grouped = new Map<
      number,
      {
        driver: number;
        samples: number;
        topSpeedKmh: number;
      }
    >();
    data.forEach((entry) => {
      const existing = grouped.get(entry.driver_number) ?? {
        driver: entry.driver_number,
        samples: 0,
        topSpeedKmh: 0
      };
      grouped.set(entry.driver_number, {
        driver: entry.driver_number,
        samples: existing.samples + 1,
        topSpeedKmh: Math.max(existing.topSpeedKmh, entry.speed ?? 0)
      });
    });
    const entries = Array.from(grouped.values()).map((value) => ({
      driver: `#${value.driver}`,
      fastestLap: undefined,
      topSpeedKmh: Math.round(value.topSpeedKmh),
      drsActivations: undefined,
      sectors: [] as Array<{ sector: number; time: string }>
    }));
    return {
      available: Boolean(entries.length),
      session: `Session ${session}`,
      message: entries.length ? undefined : "Sin muestras de telemetría",
      entries,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Telemetry fetch failed", error);
    return {
      available: false,
      session: `Session ${session}`,
      message: "No fue posible recuperar telemetría",
      entries: [],
      updatedAt: new Date().toISOString()
    };
  }
}

