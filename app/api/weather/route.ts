import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getSampleWeather, getSchedule } from "@/lib/data";
import type { GrandPrix, Session } from "@/lib/types";

export const runtime = "edge";

async function fetchWeatherFromOpenWeather(gp?: GrandPrix) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || !gp?.circuit.geo) {
    return null;
  }

  const { lat, lng } = gp.circuit.geo;
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    appid: apiKey,
    units: "metric",
    lang: "es"
  });

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`, {
      next: { revalidate: 5 * 60 }
    }),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`, {
      next: { revalidate: 5 * 60 }
    })
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    return null;
  }

  const [current, forecast] = await Promise.all([currentRes.json(), forecastRes.json()]);
  const forecastList = Array.isArray(forecast.list) ? forecast.list : [];
  const sessions = gp.sessions.filter((session) =>
    ["FP1", "FP2", "FP3", "SPRINT", "QUALY", "RACE"].includes(session.type)
  );

  const pickNearest = (session: Session) => {
    const target = DateTime.fromISO(session.start, { zone: gp.circuit.tz });
    let best: { item: any; diff: number } | null = null;
    for (const item of forecastList) {
      const when = DateTime.fromSeconds(item.dt, { zone: gp.circuit.tz });
      if (!when.isValid) continue;
      const diff = Math.abs(target.diff(when, "minutes").minutes ?? Number.POSITIVE_INFINITY);
      if (!best || diff < best.diff) {
        best = { item, diff };
      }
    }
    return best?.item ?? forecastList[0];
  };

  return {
    now: {
      temperature: Math.round(current.main?.temp ?? 0),
      description: current.weather?.[0]?.description ?? "",
      wind: Math.round(current.wind?.speed ?? 0),
      humidity: Math.round(current.main?.humidity ?? 0)
    },
    forecast: sessions.map((session) => {
      const item = pickNearest(session);
      return {
        session: session.type,
        temperature: Math.round(item?.main?.temp ?? current.main?.temp ?? 0),
        chanceOfRain: Math.round(((item?.pop ?? 0) as number) * 100)
      };
    })
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundParam = searchParams.get("gp");
  const schedule = await getSchedule();
  const roundNumber = roundParam ? Number.parseInt(roundParam, 10) : undefined;
  const gp = roundNumber ? schedule.find((item) => item.round === roundNumber) : schedule[0];

  const liveWeather = await fetchWeatherFromOpenWeather(gp).catch(() => null);
  const payload = liveWeather ?? getSampleWeather();

  return NextResponse.json({ weather: payload, live: Boolean(liveWeather), gp: gp?.grandPrix });
}
