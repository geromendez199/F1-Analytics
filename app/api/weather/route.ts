import { NextResponse } from "next/server";
import { Temporal } from "@js-temporal/polyfill";
import { getGrandPrixByRound, getSampleWeather } from "@/lib/data";
import { resolveLocale } from "@/lib/i18n";

export const runtime = "edge";

async function fetchWeatherFromOpenWeather(round: string | undefined, locale: string) {
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
    `https://api.openweathermap.org/data/2.5/forecast?lat=${geo.lat}&lon=${geo.lng}&appid=${apiKey}&units=metric&lang=${locale}`,
    { next: { revalidate: 10 * 60 } }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const entries = Array.isArray(data.list) ? data.list : [];
  if (!entries.length) {
    return null;
  }

  const firstEntry = entries[0];
  const nowWind = typeof firstEntry.wind?.speed === "number" ? Math.round(firstEntry.wind.speed * 3.6) : 0;
  const nowHumidity = typeof firstEntry.main?.humidity === "number" ? firstEntry.main.humidity : 0;
  const nowTemp = typeof firstEntry.main?.temp === "number" ? Math.round(firstEntry.main.temp) : 0;
  const nowDescription = firstEntry.weather?.[0]?.description ?? "";

  const forecast = forecastSessions.map((session) => {
    const sessionStart = Temporal.ZonedDateTime.from({
      timeZone: grandPrix.circuit.tz,
      plainDateTime: Temporal.PlainDateTime.from(session.start)
    }).toInstant();

    let closest = firstEntry;
    let minDiff = Number.POSITIVE_INFINITY;

    for (const entry of entries) {
      if (typeof entry?.dt !== "number") {
        continue;
      }
      try {
        const entryInstant = Temporal.Instant.fromEpochSeconds(entry.dt);
        const diff = Math.abs(Number(entryInstant.epochMilliseconds - sessionStart.epochMilliseconds));
        if (diff < minDiff) {
          minDiff = diff;
          closest = entry;
        }
      } catch {
        continue;
      }
    }

    const chosenTemp = typeof closest.main?.temp === "number" ? Math.round(closest.main.temp) : nowTemp;
    const chosenPop = typeof closest.pop === "number" ? closest.pop : 0;

    return {
      session: session.type,
      temperature: chosenTemp,
      chanceOfRain: Math.round(chosenPop * 100)
    };
  });

  return {
    now: {
      temperature: nowTemp,
      description: nowDescription,
      wind: nowWind,
      humidity: nowHumidity
    },
    forecast
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const round = searchParams.get("gp") ?? undefined;
  const locale = resolveLocale(searchParams.get("lang"));

  const liveWeather = await fetchWeatherFromOpenWeather(round, locale).catch(() => null);
  const payload = liveWeather ?? getSampleWeather();

  return NextResponse.json({ weather: payload, live: Boolean(liveWeather) });
}
