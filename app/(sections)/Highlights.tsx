import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getHighlights } from "@/lib/api";

export default async function Highlights({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const videos = await getHighlights("Formula 1 Highlights", 6).catch(() => []);

  return (
    <section id="multimedia" aria-labelledby="highlights-title" className="container mx-auto px-6">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="highlights-title" className="text-3xl font-semibold">{dictionary.highlights.title}</h2>
          <p className="text-sm text-slate-400">{dictionary.highlights.subtitle}</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-500">{dictionary.highlights.provider}</span>
      </header>
      {!videos.length ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          {dictionary.highlights.empty}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {videos.map((video) => (
            <article
              key={video.id}
              className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
                <PlayIcon className="h-5 w-5 text-red-500" aria-hidden />
                <span>{video.channelTitle ?? dictionary.highlights.unknownChannel}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{video.title}</h3>
              <p className="text-xs text-slate-400">
                {video.publishedAt
                  ? new Date(video.publishedAt).toLocaleDateString(locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : dictionary.highlights.unknownDate}
              </p>
              <Link
                href={video.url}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                {dictionary.highlights.watch}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
