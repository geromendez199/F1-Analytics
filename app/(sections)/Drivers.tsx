import Image from "next/image";
import { getDrivers, getTeams } from "@/lib/data";

export default async function Drivers() {
  const [drivers, teams] = await Promise.all([getDrivers(), getTeams()]);
  const teamsMap = new Map(teams.map((team) => [team.id, team]));

  return (
    <section id="pilotos" aria-labelledby="drivers-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="drivers-title" className="text-3xl font-semibold">
            Pilotos
          </h2>
          <p className="text-sm text-slate-400">Tabla en vivo desde la API de standings (Ergast) con fallback local.</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Actualización automática cada 15 minutos</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {drivers.map((driver) => {
          const team = teamsMap.get(driver.teamId);
          const photo = driver.photo ?? team?.livery ?? "/drivers/placeholder.svg";
          return (
            <article
              key={driver.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
            >
              <header className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-800">
                  <Image
                    src={photo}
                    alt={`Foto de ${driver.name}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">#{driver.number}</p>
                  <h3 className="text-xl font-semibold text-white">{driver.name}</h3>
                  <p className="text-sm text-slate-400">{team?.name ?? "Equipo libre"}</p>
                </div>
              </header>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Puntos</span>
                <span className="text-lg font-semibold text-white">{driver.points}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
