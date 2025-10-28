import { Suspense } from "react";
import { getDefaultSeasonYear, getNextGrandPrix, getWeatherForGrandPrix } from "@/lib/data";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import type { WeatherData } from "@/lib/types";

async function WeatherContent({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const season = getDefaultSeasonYear();
  const grandPrix = await getNextGrandPrix(undefined, season);

  if (!grandPrix) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        {dictionary.weather.unavailable}
      </div>
    );
  }

  const { weather, live } = await getWeatherForGrandPrix(grandPrix, locale);
  const baseForecast = weather.forecast.length
    ? weather.forecast
    : grandPrix.sessions
        .filter((session) => ["QUALY", "SPRINT", "RACE"].includes(session.type))
        .map((session) => ({
          session: session.type,
          temperature: weather.now.temperature,
          chanceOfRain: live ? 0 : 15
        }));

  if (!baseForecast.length) {
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
          {baseForecast.map((item) => (
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
