import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getNews } from "@/lib/api";

export default async function News({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const articles = await getNews("Formula 1", locale === "es" ? "es" : "en", 6).catch(() => []);

  return (
    <section id="noticias" aria-labelledby="news-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="news-title" className="text-3xl font-semibold">{dictionary.news.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.news.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.news.provider}</span>
      </header>
      {!articles.length ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          {dictionary.news.empty}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.url}
              className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg"
            >
              {article.imageUrl ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
                  <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <span className="text-xs uppercase tracking-widest text-slate-500">{article.source}</span>
                <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                {article.description ? (
                  <p className="text-sm text-slate-300">{article.description}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleString(locale)
                      : dictionary.news.unknownDate}
                  </span>
                  <Link
                    href={article.url}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    {dictionary.news.readMore}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
