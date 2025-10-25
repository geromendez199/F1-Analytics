"use client";

import useSWR from "swr";
import { SignalIcon } from "@/components/icons";

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

export default function Live() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<LiveResponse>("/api/live", {
    refreshInterval: 15_000
  });
  const isRefreshing = isValidating && Boolean(data?.available);
  const updatedAtLabel = data?.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(data.updatedAt))
    : null;

  return (
    <section id="live" aria-labelledby="live-title" className="container mx-auto px-6">
      <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="live-title" className="flex items-center gap-2 text-3xl font-semibold">
            <SignalIcon className="h-6 w-6 text-emerald-400" aria-hidden /> En Vivo
          </h2>
          <p className="text-sm text-slate-400">
            Datos de live timing (placeholder hasta conectar proveedor oficial).
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
          onClick={() => void mutate(undefined, { revalidate: true })}
          disabled={isValidating}
        >
          {isValidating ? "Actualizando…" : "Refrescar"}
        </button>
      </header>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        {isLoading && <p className="text-sm text-slate-400">Cargando datos en vivo…</p>}
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {(error as Error).message}
          </p>
        )}
        {data && !data.available && (
          <div className="space-y-2 text-sm text-slate-300">
            <p>{data.message}</p>
            <p className="text-xs text-slate-500">
              Última actualización: {updatedAtLabel ?? "–"}
            </p>
          </div>
        )}
        {data && data.available && (
          <div className="space-y-4" aria-live="polite" aria-busy={isRefreshing}>
            {data.message && (
              <p className="text-xs uppercase tracking-widest text-slate-400">{data.message}</p>
            )}
            <p className="text-xs text-slate-500" id="live-updated-at">
              Última actualización: {updatedAtLabel ?? "–"}
            </p>
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-800 text-sm"
                aria-describedby="live-updated-at"
              >
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
                    <th scope="col" className="py-2">
                      Pos
                    </th>
                    <th scope="col">Piloto</th>
                    <th scope="col">Intervalo</th>
                    <th scope="col">Neumático</th>
                    <th scope="col">Última vuelta</th>
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
          </div>
        )}
      </div>
    </section>
  );
}
