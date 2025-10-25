const carSpecs = [
  {
    team: "Red Bull RB20",
    season: 2024,
    weight: "798 kg",
    powerUnit: "Honda RBPT",
    aero: "Paquete de baja carga optimizado para rectas",
    ers: "Mejoras de recuperación en frenada media"
  },
  {
    team: "McLaren MCL38",
    season: 2024,
    weight: "799 kg",
    powerUnit: "Mercedes",
    aero: "Piso rediseñado para generar más carga en curvas rápidas",
    ers: "Entrega más progresiva en modo quali"
  },
  {
    team: "Ferrari SF-24",
    season: 2024,
    weight: "800 kg",
    powerUnit: "Ferrari",
    aero: "Alerón trasero modular para pistas mixtas",
    ers: "Mapa híbrido optimizado para tracción"
  }
];

export default function Cars() {
  return (
    <section id="autos" aria-labelledby="cars-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="cars-title" className="text-3xl font-semibold">Autos</h2>
          <p className="text-sm text-slate-400">Ficha resumida de especificaciones destacadas por temporada.</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Fuente: datos públicos 2024</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {carSpecs.map((car) => (
          <article
            key={car.team}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <header>
              <p className="text-xs uppercase tracking-widest text-slate-400">Temporada {car.season}</p>
              <h3 className="text-xl font-semibold text-white">{car.team}</h3>
            </header>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <dt>Peso</dt>
                <dd>{car.weight}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Unidad de potencia</dt>
                <dd>{car.powerUnit}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-slate-500">Aero</dt>
                <dd className="mt-1 text-slate-300">{car.aero}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-slate-500">ERS</dt>
                <dd className="mt-1 text-slate-300">{car.ers}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
