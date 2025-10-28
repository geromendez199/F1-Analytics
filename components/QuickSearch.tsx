"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export type QuickSearchItemType = "driver" | "team" | "circuit";

export interface QuickSearchItem {
  id: string;
  type: QuickSearchItemType;
  label: string;
  href: string;
  description?: string;
}

interface QuickSearchProps {
  placeholder: string;
  items: QuickSearchItem[];
  typeLabels: Record<QuickSearchItemType, string>;
  emptyState: string;
}

export default function QuickSearch({ placeholder, items, typeLabels, emptyState }: QuickSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) {
      return [] as QuickSearchItem[];
    }
    return items.filter((item) => {
      const haystack = `${item.label} ${item.description ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [items, query]);

  return (
    <div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
        <MagnifyingGlassIcon aria-hidden className="h-5 w-5 text-slate-500" />
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-10 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {query.trim().length >= 2 && (
        <ul className="mt-3 space-y-2">
          {results.length === 0 ? (
            <li className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
              {emptyState}
            </li>
          ) : (
            results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-transparent bg-slate-900/60 px-4 py-3 text-left text-sm transition hover:border-ferrari hover:text-white"
                >
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    {item.description ? (
                      <p className="text-xs text-slate-400">{item.description}</p>
                    ) : null}
                  </div>
                  <span className="text-xs uppercase tracking-widest text-slate-500">{typeLabels[item.type]}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
