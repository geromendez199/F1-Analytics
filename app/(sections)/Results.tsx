import { getDictionary, type Locale } from "@/lib/i18n";
import {
  fetchConstructorStandings,
  fetchDriverStandings,
  getLastRaceResult
} from "@/lib/api";
import { getDefaultSeasonYear } from "@/lib/data";

type DriverStandingEntry = Awaited<ReturnType<typeof fetchDriverStandings>>[number];
type ConstructorStandingEntry = Awaited<ReturnType<typeof fetchConstructorStandings>>[number];
type LastRaceResult = NonNullable<Awaited<ReturnType<typeof getLastRaceResult>>>;
type PodiumEntry = LastRaceResult["podium"][number];

export default async function Results({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const season = getDefaultSeasonYear();

  const [lastRace, driverStandingsRaw, constructorStandingsRaw] = await Promise.all([
    getLastRaceResult(season).catch(() => null),
    fetchDriverStandings(season).catch(() => []),
    fetchConstructorStandings(season).catch(() => [])
  ]);

  if (!lastRace || !driverStandingsRaw.length || !constructorStandingsRaw.length) {
    return (
      <section id="resultados" aria-labelledby="results-title" className="container mx-auto px-6">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="results-title" className="text-3xl font-semibold">{dictionary.results.title}</h2>
            <p className="text-sm text-slate-400">{dictionary.results.subtitle}</p>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-500">
            {dictionary.results.seasonTag} {season}
          </span>
        </header>
        <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          {dictionary.results.unavailable}
        </p>
      </section>
    );
  }

  const driverStandings = driverStandingsRaw.map((standing: DriverStandingEntry) => ({
    position: Number.parseInt(standing.position, 10),
    driverName: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
    points: Number.parseFloat(standing.points ?? "0")
  }));

  const constructorStandings = constructorStandingsRaw.map((standing: ConstructorStandingEntry) => ({
    position: Number.parseInt(standing.position, 10),
    constructorName: standing.Constructor.name,
    points: Number.parseFloat(standing.points ?? "0")
  }));

  return (
    <section id="resultados" aria-labelledby="results-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="results-title" className="text-3xl font-semibold">{dictionary.results.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.results.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">
          {dictionary.results.seasonTag} {lastRace.season}
        </span>
      </header>
      <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <header className="mb-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.results.lastRaceLabel}</p>
            <h3 className="text-2xl font-semibold text-white">{lastRace.raceName}</h3>
            <p className="text-sm text-slate-400">{new Date(lastRace.date).toLocaleDateString(locale)}</p>
          </header>
          <ol className="space-y-3 text-sm text-slate-200">
            {lastRace.podium.map((entry: PodiumEntry) => (
              <li key={entry.position} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                    {entry.position}
                  </span>
                  <span>
                    {entry.driver}
                    <span className="block text-xs text-slate-400">{entry.team}</span>
                  </span>
                </span>
                <span className="text-xs text-slate-400">
                  {entry.position === 1 && entry.time
                    ? `${dictionary.results.winnerTimeLabel}: ${entry.time}`
                    : null}
                </span>
              </li>
            ))}
          </ol>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white">{dictionary.results.seasonSummaryTitle}</h3>
          <div className="mt-4 grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.results.driversLabel}</p>
              <ol className="mt-2 space-y-2 text-sm text-slate-200">
                {driverStandings.map((standing) => (
                  <li key={standing.position} className="flex items-center justify-between">
                    <span>
                      {standing.position}. {standing.driverName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {standing.points} {dictionary.common.pointsAbbreviation}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.results.constructorsLabel}</p>
              <ol className="mt-2 space-y-2 text-sm text-slate-200">
                {constructorStandings.map((standing) => (
                  <li key={standing.position} className="flex items-center justify-between">
                    <span>
                      {standing.position}. {standing.constructorName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {standing.points} {dictionary.common.pointsAbbreviation}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
