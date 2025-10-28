import { getDictionary, type Locale } from "@/lib/i18n";

export default function Cars({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const specs = dictionary.cars.items;
  return (
    <section id="autos" aria-labelledby="cars-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="cars-title" className="text-3xl font-semibold">{dictionary.cars.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.cars.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.cars.updatedAt}</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {specs.map((car) => (
          <article
            key={car.team}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <header>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                {dictionary.cars.seasonLabel} {car.season}
              </p>
              <h3 className="text-xl font-semibold text-white">{car.team}</h3>
            </header>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <dt>{dictionary.cars.specLabels.weight}</dt>
                <dd>{car.weight}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>{dictionary.cars.specLabels.powerUnit}</dt>
                <dd>{car.powerUnit}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-slate-500">{dictionary.cars.specLabels.aero}</dt>
                <dd className="mt-1 text-slate-300">{car.aero}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-slate-500">{dictionary.cars.specLabels.ers}</dt>
                <dd className="mt-1 text-slate-300">{car.ers}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
