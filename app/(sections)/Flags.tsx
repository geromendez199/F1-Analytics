import { getDictionary, type Locale } from "@/lib/i18n";

export default function Flags({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const flags = dictionary.flags.items;
  return (
    <section id="banderas" aria-labelledby="flags-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="flags-title" className="text-3xl font-semibold">{dictionary.flags.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.flags.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.flags.updatedAt}</span>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {flags.map((flag) => (
          <article
            key={flag.id}
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
