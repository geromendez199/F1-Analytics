const compounds = [
  {
    id: "C0",
    name: "C0 - Ultrarígido",
    usage: "Circuitos abrasivos de alta energía",
    color: "bg-zinc-500"
  },
  {
    id: "C2",
    name: "C2 - Medio",
    usage: "Balance entre calentamiento y durabilidad",
    color: "bg-red-500"
  },
  {
    id: "C4",
    name: "C4 - Blando",
    usage: "Clasificación y stints cortos",
    color: "bg-yellow-400"
  },
  {
    id: "INT",
    name: "Intermedias",
    usage: "Lluvia ligera y pista húmeda",
    color: "bg-green-500"
  },
  {
    id: "WET",
    name: "Lluvia extrema",
    usage: "Zonas con aquaplaning, máxima evacuación",
    color: "bg-blue-500"
  }
];

export default function Tyres() {
  return (
    <section id="cubiertas" aria-labelledby="tyres-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="tyres-title" className="text-3xl font-semibold">Cubiertas</h2>
          <p className="text-sm text-slate-400">
            Selección base Pirelli (C0–C5, intermedias, lluvia).
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Fuente: Pirelli (ejemplo)</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {compounds.map((compound) => (
          <article
            key={compound.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{compound.name}</h3>
              <span className={`h-6 w-6 rounded-full ${compound.color}`} aria-hidden />
            </div>
            <p className="text-sm text-slate-300">{compound.usage}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
