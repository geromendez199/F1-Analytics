"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SignalIcon } from "@heroicons/react/24/solid";
import { useLocale } from "@/components/LocaleProvider";
import { getDictionary } from "@/lib/i18n";

interface LiveEntry {
  position: number;
  driver: string;
  gap: string;
  tyre: string;
  lastLap: string;
}

interface LiveResponse {
  available: boolean;
  message?: string;
  updatedAt: string;
  entries: LiveEntry[];
}

async function fetchLive(errorMessage: string): Promise<LiveResponse> {
  const response = await fetch("/api/live", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json();
}

export default function Live() {
  const locale = useLocale();
  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["live-timing", locale],
    queryFn: () => fetchLive(dictionary.live.error),
    refetchInterval: 15_000
  });

  return (
    <section id="live" aria-labelledby="live-title" className="container mx-auto px-6">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="live-title" className="flex items-center gap-2 text-3xl font-semibold">
            <SignalIcon className="h-6 w-6 text-emerald-400" aria-hidden /> {dictionary.live.title}
          </h2>
          <p className="text-sm text-slate-400">{dictionary.live.description}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? dictionary.live.refreshLoading : dictionary.live.refreshIdle}
        </button>
      </header>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        {isLoading && <p className="text-sm text-slate-400">{dictionary.live.loading}</p>}
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {(error as Error).message}
          </p>
        )}
        {data && !data.available && (
          <div className="space-y-2 text-sm text-slate-300">
            <p>{data.message}</p>
            <p className="text-xs text-slate-500">
              {dictionary.live.updatedAt}: {new Date(data.updatedAt).toLocaleTimeString(locale)}
            </p>
          </div>
        )}
        {data && data.available && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
                  <th className="py-2">{dictionary.live.table.position}</th>
                  <th>{dictionary.live.table.driver}</th>
                  <th>{dictionary.live.table.gap}</th>
                  <th>{dictionary.live.table.tyre}</th>
                  <th>{dictionary.live.table.lastLap}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {data.entries.map((entry) => (
                  <tr key={entry.position}>
                    <td className="py-2 font-semibold">{entry.position}</td>
                    <td>{entry.driver}</td>
                    <td>{entry.gap}</td>
                    <td>{entry.tyre}</td>
                    <td>{entry.lastLap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
