import { getDictionary, type Locale } from "@/lib/i18n";

const COMPOUND_COLORS: Record<string, string> = {
  C0: "bg-zinc-500",
  C2: "bg-red-500",
  C4: "bg-yellow-400",
  INT: "bg-green-500",
  WET: "bg-blue-500"
};

export default function Tyres({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const compounds = dictionary.tyres.compounds;
  return (
    <section id="cubiertas" aria-labelledby="tyres-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="tyres-title" className="text-3xl font-semibold">{dictionary.tyres.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.tyres.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.tyres.updatedAt}</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {compounds.map((compound) => (
          <article
            key={compound.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{compound.name}</h3>
              <span
                className={`h-6 w-6 rounded-full ${COMPOUND_COLORS[compound.id] ?? "bg-slate-500"}`}
                aria-hidden
              />
            </div>
            <p className="text-sm text-slate-300">{compound.usage}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
