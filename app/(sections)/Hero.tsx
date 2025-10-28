import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import QuickSearch, { QuickSearchItem } from "@/components/QuickSearch";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  getDefaultSeasonYear,
  getDrivers,
  getNextGrandPrix,
  getSchedule,
  getTeamsAndDrivers
} from "@/lib/data";
import { countdown, formatDateTime, toUserZonedDateTime } from "@/lib/time";
import type { Driver, GrandPrix, Team } from "@/lib/types";

function getNextSession(next: GrandPrix | undefined, liveLabel: string, locale: Locale) {
  if (!next) {
    return null;
  }
  const race = next.sessions.find((session) => session.type === "RACE") ?? next.sessions[0];
  const start = toUserZonedDateTime(race.start, next.circuit.tz);
  return {
    grandPrix: next.grandPrix,
    circuit: next.circuit.name,
    location: next.circuit.location,
    countdown: countdown(start, liveLabel),
    startFormatted: formatDateTime(start, locale)
  };
}

function buildSearchItems(drivers: Driver[], teams: Team[], schedule: GrandPrix[]): QuickSearchItem[] {
  const teamsMap = new Map(teams.map((team) => [team.id, team]));
  const driverItems = drivers.map((driver) => {
    const team = teamsMap.get(driver.teamId);
    return {
      id: driver.id,
      type: "driver" as const,
      label: driver.name,
      href: "#pilotos",
      description: team ? `#${driver.number} · ${team.name}` : `#${driver.number}`
    };
  });

  const teamItems = teams.map((team) => ({
    id: team.id,
    type: "team" as const,
    label: team.name,
    href: "#escuderias",
    description: team.powerUnit ? `PU: ${team.powerUnit}` : undefined
  }));

  const circuits = new Map<string, QuickSearchItem>();
  for (const grandPrix of schedule) {
    const { circuit } = grandPrix;
    if (circuits.has(circuit.id)) {
      continue;
    }
    circuits.set(circuit.id, {
      id: circuit.id,
      type: "circuit",
      label: circuit.name,
      href: "#calendario",
      description: `${grandPrix.grandPrix} · ${circuit.location}`
    });
  }

  return [...driverItems, ...teamItems, ...circuits.values()];
}

export default async function Hero({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const season = getDefaultSeasonYear();
  const [drivers, teams, schedule, nextGrandPrix] = await Promise.all([
    getDrivers(),
    getTeamsAndDrivers(),
    getSchedule(season),
    getNextGrandPrix(undefined, season)
  ]);
  const searchItems = buildSearchItems(drivers, teams, schedule);
  const nextSession = getNextSession(nextGrandPrix, dictionary.hero.countdown.live, locale);

  return (
    <section id="hero" className="container mx-auto mt-16 flex flex-col gap-10 px-6">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-ferrari/80">
          {dictionary.hero.badge}
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
          <p className="text-sm text-slate-400">{dictionary.hero.emptyCalendar}</p>
        )}
      </header>
      <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          {nextSession ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {dictionary.hero.nextRaceLabel}
                  </p>
                  <p className="text-2xl font-semibold text-white">{nextSession.countdown}</p>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p>{nextSession.startFormatted}</p>
                  <p>{dictionary.hero.timezoneLabel}</p>
                </div>
              </div>
              <Link
                href="#calendario"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ferrari transition hover:text-ferrari/80"
              >
                {dictionary.hero.calendarCta}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-400">{dictionary.hero.emptyCalendar}</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <label htmlFor="hero-search" className="text-xs uppercase tracking-widest text-slate-400">
            {dictionary.hero.searchLabel}
          </label>
          <QuickSearch
            placeholder={dictionary.hero.searchPlaceholder}
            items={searchItems}
            typeLabels={dictionary.hero.typeLabels}
            emptyState={dictionary.hero.searchEmpty}
          />
        </div>
      </div>
    </section>
  );
}
