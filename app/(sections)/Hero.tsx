import Link from "next/link";
import { DateTime } from "luxon";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@/components/icons";
import { getDictionary } from "@/lib/i18n";
import { getSchedule } from "@/lib/data";
import { countdown, formatDateTime, toUserZonedDateTime } from "@/lib/time";

async function getNextSession() {
  const schedule = await getSchedule();
  const now = DateTime.now();
  const next = schedule.find((gp) => {
    const race = gp.sessions.find((session) => session.type === "RACE") ?? gp.sessions[0];
    if (!race) {
      return false;
    }
    const start = DateTime.fromISO(race.start);
    return start.setZone("utc") > now.setZone("utc");
  }) ?? schedule[0];

  if (!next) {
    return null;
  }

  const race = next.sessions.find((session) => session.type === "RACE") ?? next.sessions[0];
  const start = toUserZonedDateTime(race.start, next.circuit.tz);
  return {
    grandPrix: next.grandPrix,
    circuit: next.circuit.name,
    location: next.circuit.location,
    countdown: countdown(start),
    startFormatted: formatDateTime(start),
    seasonYear: start.year
  };
}

export default async function Hero() {
  const dictionary = getDictionary("es");
  const nextSession = await getNextSession();
  const seasonYear = nextSession?.seasonYear ?? new Date().getFullYear();

  return (
    <section id="hero" className="container mx-auto mt-16 flex flex-col gap-10 px-6">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ferrari/80">
          Fórmula 1 · Temporada {seasonYear}
        </p>
        <h1 className="text-4xl font-bold md:text-6xl">{dictionary.hero.title}</h1>
        <p className="max-w-3xl text-lg text-slate-300 md:text-xl">{dictionary.hero.subtitle}</p>
        {nextSession ? (
          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {nextSession.grandPrix}
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {nextSession.circuit}
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {nextSession.location}
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aún no hay carreras cargadas para esta temporada.</p>
        )}
      </header>
      <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          {nextSession ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Próxima carrera</p>
                  <p className="text-2xl font-semibold text-white">{nextSession.countdown}</p>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p>{nextSession.startFormatted}</p>
                  <p>Hora local</p>
                </div>
              </div>
              <Link
                href="#calendario"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ferrari transition hover:text-ferrari/80"
              >
                Ver calendario
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-400">Completa el dataset de calendario para iniciar el conteo regresivo.</p>
          )}
        </div>
        <form className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <label htmlFor="hero-search" className="text-xs uppercase tracking-widest text-slate-400">
            Búsqueda rápida
          </label>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-500" />
            <input
              id="hero-search"
              type="search"
              placeholder={dictionary.hero.searchPlaceholder}
              className="h-10 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Próximamente: búsqueda unificada de pilotos, equipos y circuitos.
          </p>
        </form>
      </div>
    </section>
  );
}
