import { getSchedule } from "@/lib/data";
import { getDictionary, type Locale } from "@/lib/i18n";
import { formatDateTime, toUserZonedDateTime } from "@/lib/time";

export default function Calendar({ locale }: { locale: Locale }) {
  const schedule = getSchedule();
  const dictionary = getDictionary(locale);
  return (
    <section id="calendario" aria-labelledby="calendar-title" className="container mx-auto px-6">
      <div className="mb-8 flex items-center justify-between">
        <h2 id="calendar-title" className="text-3xl font-semibold">{dictionary.calendar.title}</h2>
        <p className="text-sm text-slate-400">{dictionary.calendar.subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {schedule.map((gp) => (
          <article
            key={gp.round}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <header className="mb-4 flex items-baseline justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {dictionary.calendar.roundLabel} {gp.round}
                </p>
                <h3 className="text-xl font-semibold text-white">{gp.grandPrix}</h3>
                <p className="text-sm text-slate-400">{gp.circuit.location}</p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {dictionary.calendar.timezoneTag}: {gp.circuit.tz}
              </span>
            </header>
            <dl className="space-y-2 text-sm">
              {gp.sessions.map((session) => {
                const start = toUserZonedDateTime(session.start, gp.circuit.tz);
                return (
                  <div key={session.type} className="flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2">
                    <dt className="font-medium text-slate-200">
                      {dictionary.common.sessionTypes[session.type] ?? session.type}
                    </dt>
                    <dd className="text-slate-300">{formatDateTime(start, locale)}</dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
