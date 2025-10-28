import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchTelemetry } from "@/lib/services";

export default async function Telemetry({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const telemetry = await fetchTelemetry().catch(() => null);

  return (
    <section id="telemetria" aria-labelledby="telemetry-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="telemetry-title" className="text-3xl font-semibold">{dictionary.telemetry.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.telemetry.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">
          {telemetry?.session ?? dictionary.telemetry.placeholderSession}
        </span>
      </header>
      {!telemetry || !telemetry.available || !telemetry.entries.length ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          {telemetry?.message ?? dictionary.telemetry.empty}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {telemetry.entries.map((entry) => (
            <article
              key={entry.driver}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
            >
              <header>
                <p className="text-xs uppercase tracking-widest text-slate-500">{dictionary.telemetry.driver}</p>
                <h3 className="text-xl font-semibold text-white">{entry.driver}</h3>
              </header>
              <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-slate-500">
                    {dictionary.telemetry.fastestLap}
                  </dt>
                  <dd className="font-semibold text-white">{entry.fastestLap ?? "--"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-slate-500">
                    {dictionary.telemetry.topSpeed}
                  </dt>
                  <dd className="font-semibold text-white">
                    {entry.topSpeedKmh ? `${entry.topSpeedKmh} km/h` : "--"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-slate-500">
                    {dictionary.telemetry.drs}
                  </dt>
                  <dd className="font-semibold text-white">{entry.drsActivations ?? "--"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-slate-500">
                    {dictionary.telemetry.sectors}
                  </dt>
                  <dd className="font-semibold text-white">
                    {entry.sectors
                      ?.map((sector) => `${dictionary.telemetry.sectorLabel} ${sector.sector}: ${sector.time}`)
                      .join(" · ") ?? "--"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-slate-500">
        {dictionary.telemetry.updated}: {telemetry ? new Date(telemetry.updatedAt).toLocaleTimeString(locale) : "--"}
      </p>
    </section>
  );
}
