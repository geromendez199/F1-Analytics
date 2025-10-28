import { Suspense } from "react";
import { getNextGrandPrix, getSampleWeather } from "@/lib/data";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import type { WeatherData } from "@/lib/types";

async function resolveTargetRound(base: string): Promise<number | undefined> {
  try {
    const response = await fetch(new URL("/api/circuits", base), { next: { revalidate: 5 * 60 } });
    if (!response.ok) {
      throw new Error("invalid response");
    }

    const data = await response.json();
    const schedule = Array.isArray(data.schedule) ? data.schedule : [];
    const now = Date.now();
    const upcoming = schedule
      .map((event: any) => {
        const primarySession = Array.isArray(event.sessions)
          ? (event.sessions.find((session: any) => session.type === "RACE") ?? event.sessions[0])
          : undefined;
        const startMs = primarySession?.start ? Date.parse(`${primarySession.start}Z`) : Number.POSITIVE_INFINITY;
        return { round: event.round, startMs };
      })
      .filter((item: any) => Number.isFinite(item.startMs) && item.startMs > now)
      .sort((a: any, b: any) => a.startMs - b.startMs)[0];

    if (upcoming?.round) {
      return Number.parseInt(String(upcoming.round), 10);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Schedule API fallback", error);
  }

  const fallback = getNextGrandPrix();
  return fallback?.round;
}

async function getWeather(locale: Locale): Promise<{ weather: WeatherData; live: boolean }> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const url = new URL("/api/weather", base);
  const targetRound = await resolveTargetRound(base);
  if (targetRound) {
    url.searchParams.set("gp", String(targetRound));
  }
  url.searchParams.set("lang", locale);

  try {
    const response = await fetch(url, {
      next: { revalidate: 5 * 60 }
    });

    if (!response.ok) {
      throw new Error("Respuesta inválida");
    }

    return response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Weather fallback", error);
    return { weather: getSampleWeather(), live: false };
  }
}

async function WeatherContent({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const { weather, live } = await getWeather(locale);

  if (!weather.forecast.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        {dictionary.weather.unavailable}
      </div>
    );
  }

  const description = live ? weather.now.description : dictionary.weather.sampleDescription;
  const sessionLabel = (session: WeatherData["forecast"][number]["session"]) =>
    dictionary.common.sessionTypes[session] ?? session;

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
      <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.weather.nowLabel}</p>
          <h3 className="text-4xl font-semibold text-white">{weather.now.temperature}°C</h3>
          <p className="text-sm text-slate-300">{description}</p>
        </header>
        <dl className="grid grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate-500">{dictionary.weather.wind}</dt>
            <dd className="text-lg font-semibold text-white">
              {weather.now.wind} {dictionary.weather.windUnit}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate-500">{dictionary.weather.humidity}</dt>
            <dd className="text-lg font-semibold text-white">
              {weather.now.humidity}
              {dictionary.weather.humidityUnit}
            </dd>
          </div>
        </dl>
      </article>
      <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.weather.forecastLabel}</p>
          <p className="text-sm text-slate-300">
            {live ? dictionary.weather.liveSource : dictionary.weather.fallbackSource}
          </p>
        </header>
        <ul className="space-y-3 text-sm text-slate-200">
          {weather.forecast.map((item) => (
            <li key={item.session} className="flex items-center justify-between">
              <span className="font-medium">{sessionLabel(item.session)}</span>
              <span className="text-slate-300">
                {item.temperature}°C · {item.chanceOfRain}% {dictionary.weather.rainChanceLabel}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default function Weather({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <section id="clima" aria-labelledby="weather-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="weather-title" className="text-3xl font-semibold">{dictionary.weather.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.weather.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.weather.source}</span>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-400">{dictionary.weather.loading}</p>}>
        {/* @ts-expect-error Async Server Component */}
        <WeatherContent locale={locale} dictionary={dictionary} />
      </Suspense>
    </section>
  );
}
