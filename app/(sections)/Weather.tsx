import { Suspense } from "react";
import { DateTime } from "luxon";
import { getSampleWeather, getSchedule } from "@/lib/data";
import type { WeatherData } from "@/lib/types";

async function fetchWeather(round?: number): Promise<{ weather: WeatherData; live: boolean }> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const url = new URL("/api/weather", base);
  if (round) {
    url.searchParams.set("gp", String(round));
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 5 * 60 }
    });

    if (!response.ok) {
      throw new Error("Respuesta inválida");
    }

    return response.json();
  } catch (error) {
    console.error("Weather fallback", error);
    return { weather: getSampleWeather(), live: false };
  }
}

async function WeatherContent() {
  const schedule = await getSchedule();
  const now = DateTime.now().setZone("utc");
  const target =
    schedule.find((gp) => {
      const race = gp.sessions.find((session) => session.type === "RACE") ?? gp.sessions[0];
      if (!race) return false;
      return DateTime.fromISO(race.start).setZone("utc") > now;
    }) ?? schedule[0];

  const { weather, live } = await fetchWeather(target?.round);

  if (!weather.forecast.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
        No fue posible obtener información meteorológica en este momento.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
      <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {target ? `Circuito · ${target.grandPrix}` : "Ahora"}
          </p>
          <h3 className="text-4xl font-semibold text-white">{weather.now.temperature}°C</h3>
          <p className="text-sm text-slate-300">{weather.now.description}</p>
        </header>
        <dl className="grid grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate-500">Viento</dt>
            <dd className="text-lg font-semibold text-white">{weather.now.wind} km/h</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-slate-500">Humedad</dt>
            <dd className="text-lg font-semibold text-white">{weather.now.humidity}%</dd>
          </div>
        </dl>
      </article>
      <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Pronóstico</p>
          <p className="text-sm text-slate-300">
            {live ? "Datos en vivo desde OpenWeather" : "Datos de muestra offline"}
          </p>
        </header>
        <ul className="space-y-3 text-sm text-slate-200">
          {weather.forecast.map((item) => (
            <li key={item.session} className="flex items-center justify-between">
              <span className="font-medium">{item.session}</span>
              <span className="text-slate-300">{item.temperature}°C · {item.chanceOfRain}% lluvia</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default function Weather() {
  return (
    <section id="clima" aria-labelledby="weather-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="weather-title" className="text-3xl font-semibold">Clima</h2>
          <p className="text-sm text-slate-400">
            Pronóstico por sesión y condiciones actuales en el circuito.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Fuente: OpenWeather (fallback local)</span>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-400">Cargando pronóstico…</p>}>
        {/* @ts-expect-error Async Server Component */}
        <WeatherContent />
      </Suspense>
    </section>
  );
}
