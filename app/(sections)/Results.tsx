import { getResults, getDrivers, getTeams } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  fetchConstructorStandings,
  fetchDriverStandings,
  fetchLastRaceResult
} from "@/lib/services";

export default async function Results({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);

  const [lastRace, driverStandings, constructorStandings] = await Promise.all([
    fetchLastRaceResult().catch(() => null),
    fetchDriverStandings("current").catch(() => []),
    fetchConstructorStandings("current").catch(() => [])
  ]);

  if (!lastRace || !driverStandings.length || !constructorStandings.length) {
    const fallbackResults = getResults();
    const drivers = getDrivers();
    const teams = getTeams();
    const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));
    const teamMap = new Map(teams.map((team) => [team.id, team]));

    return (
      <section id="resultados" aria-labelledby="results-title" className="container mx-auto px-6">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="results-title" className="text-3xl font-semibold">{dictionary.results.title}</h2>
            <p className="text-sm text-slate-400">{dictionary.results.subtitle}</p>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-500">
            {dictionary.results.seasonTag} {fallbackResults.season.year}
          </span>
        </header>
        <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <header className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">{dictionary.results.lastRaceLabel}</p>
              <h3 className="text-2xl font-semibold text-white">{fallbackResults.lastRace.grandPrix}</h3>
              <p className="text-sm text-slate-400">
                {new Date(fallbackResults.lastRace.date).toLocaleDateString(locale)}
              </p>
            </header>
            <ol className="space-y-3 text-sm text-slate-200">
              {fallbackResults.lastRace.podium.map((entry) => (
                <li key={entry.position} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                      {entry.position}
                    </span>
                    <span>
                      {driverMap.get(entry.driverId)?.name ?? entry.driverId}
                      <span className="block text-xs text-slate-400">
                        {teamMap.get(entry.teamId)?.name ?? entry.teamId}
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {entry.position === 1
                      ? `${dictionary.results.winnerTimeLabel}: ${fallbackResults.lastRace.winner.time}`
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
                  {fallbackResults.season.driverStandings.map((standing) => (
                    <li key={standing.position} className="flex items-center justify-between">
                      <span>
                        {standing.position}. {driverMap.get(standing.driverId)?.name ?? standing.driverId}
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
                  {fallbackResults.season.constructorStandings.map((standing) => (
                    <li key={standing.position} className="flex items-center justify-between">
                      <span>
                        {standing.position}. {teamMap.get(standing.teamId)?.name ?? standing.teamId}
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
            {lastRace.podium.map((entry) => (
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
