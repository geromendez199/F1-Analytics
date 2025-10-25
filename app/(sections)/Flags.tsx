const flags = [
  {
    name: "Verde",
    description: "Pista libre. Se reanuda la velocidad de carrera.",
    color: "bg-green-500"
  },
  {
    name: "Amarilla",
    description: "Precaución. No adelantar en el sector.",
    color: "bg-yellow-400"
  },
  {
    name: "Roja",
    description: "Sesión detenida. Todos los autos deben regresar al pitlane.",
    color: "bg-red-500"
  },
  {
    name: "Safety Car",
    description: "Safety car en pista. Ritmo controlado y sin adelantamientos.",
    color: "bg-amber-500"
  },
  {
    name: "VSC",
    description: "Virtual safety car. Delta de tiempo obligatorio para todos.",
    color: "bg-emerald-400"
  },
  {
    name: "Azul",
    description: "Auto más lento debe dejar pasar a uno más rápido.",
    color: "bg-blue-500"
  }
];

export default function Flags() {
  return (
    <section id="banderas" aria-labelledby="flags-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="flags-title" className="text-3xl font-semibold">Banderas</h2>
          <p className="text-sm text-slate-400">
            Interpretación rápida de las señales oficiales de la FIA.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Actualizado 2024</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {flags.map((flag) => (
          <article
            key={flag.name}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className={`h-8 w-8 rounded ${flag.color}`} aria-hidden />
              <h3 className="text-lg font-semibold text-white">{flag.name}</h3>
            </div>
            <p className="text-sm text-slate-300">{flag.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
