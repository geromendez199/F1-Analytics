import { getDictionary, type Locale } from "@/lib/i18n";

export default function About({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <section id="acerca" aria-labelledby="about-title" className="container mx-auto px-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 id="about-title" className="text-3xl font-semibold text-white">
          {dictionary.about.title}
        </h2>
        {dictionary.about.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-4 text-sm text-slate-300">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
