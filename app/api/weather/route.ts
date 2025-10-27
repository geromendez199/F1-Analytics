import { NextResponse } from "next/server";
import { getGrandPrixByRound, getSampleWeather } from "@/lib/data";

export const runtime = "edge";

async function fetchWeatherFromOpenWeather(round?: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!round) {
    return null;
  }

  const roundNumber = Number.parseInt(round, 10);
  if (Number.isNaN(roundNumber)) {
    return null;
  }

  const grandPrix = getGrandPrixByRound(roundNumber);
  const geo = grandPrix?.circuit.geo;
  if (!geo) {
    return null;
  }

  const sessions = grandPrix.sessions.filter((session) => session.type !== "FP2" && session.type !== "FP3");
  const forecastSessions = sessions.length ? sessions.slice(0, 3) : grandPrix.sessions.slice(0, 3);

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${geo.lat}&lon=${geo.lon}&appid=${apiKey}&units=metric&lang=es`,
    { next: { revalidate: 10 * 60 } }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const now = data.list[0];

  return {
    now: {
      temperature: Math.round(now.main.temp),
      description: now.weather[0]?.description ?? "",
      wind: Math.round(now.wind.speed),
      humidity: now.main.humidity
    },
    forecast: forecastSessions.map((session, index) => {
      const item = data.list[index * 8] ?? now;
      return {
        session: session.type,
        temperature: Math.round(item.main.temp),
        chanceOfRain: Math.round((item.pop ?? 0) * 100)
      };
    })
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const round = searchParams.get("gp") ?? undefined;

  const liveWeather = await fetchWeatherFromOpenWeather(round).catch(() => null);
  const payload = liveWeather ?? getSampleWeather();

  return NextResponse.json({ weather: payload, live: Boolean(liveWeather) });
}
