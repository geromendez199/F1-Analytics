import Image from "next/image";
import { getDrivers, getTeams } from "@/lib/data";

export default function Teams() {
  const teams = getTeams();
  const drivers = getDrivers();
  const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));

  return (
    <section id="escuderias" aria-labelledby="teams-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="teams-title" className="text-3xl font-semibold">Escuderías</h2>
          <p className="text-sm text-slate-400">
            Puntos, pilotos y motorización por equipo.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Datos mockeados</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {teams.map((team) => (
          <article
            key={team.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-800">
              <Image
                src={team.livery}
                alt={`Livery de ${team.name}`}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <header>
              <h3 className="text-xl font-semibold text-white">{team.name}</h3>
              <p className="text-sm text-slate-400">{team.powerUnit}</p>
            </header>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <dt>Puntos</dt>
                <dd className="font-semibold text-white">{team.points}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-slate-500">Pilotos</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {team.drivers.map((driverId) => {
                    const driver = driverMap.get(driverId);
                    return (
                      <span
                        key={driverId}
                        className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200"
                      >
                        {driver?.name ?? driverId}
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
