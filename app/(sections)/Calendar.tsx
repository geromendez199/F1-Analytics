import { getSchedule } from "@/lib/data";
import { formatDateTime, toUserZonedDateTime } from "@/lib/time";

export default function Calendar() {
  const schedule = getSchedule();
  return (
    <section id="calendario" aria-labelledby="calendar-title" className="container mx-auto px-6">
      <div className="mb-8 flex items-center justify-between">
        <h2 id="calendar-title" className="text-3xl font-semibold">Calendario</h2>
        <p className="text-sm text-slate-400">Horarios convertidos a tu zona</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {schedule.map((gp) => (
          <article
            key={gp.round}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <header className="mb-4 flex items-baseline justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Ronda {gp.round}</p>
                <h3 className="text-xl font-semibold text-white">{gp.grandPrix}</h3>
                <p className="text-sm text-slate-400">{gp.circuit.location}</p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {gp.circuit.tz}
              </span>
            </header>
            <dl className="space-y-2 text-sm">
              {gp.sessions.map((session) => {
                const start = toUserZonedDateTime(session.start, gp.circuit.tz);
                return (
                  <div key={session.type} className="flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-2">
                    <dt className="font-medium text-slate-200">{session.type}</dt>
                    <dd className="text-slate-300">{formatDateTime(start)}</dd>
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
