"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDictionary, resolveLocale, SUPPORTED_LOCALES, type Locale, type Dictionary } from "@/lib/i18n";

const SECTION_ORDER = [
  "hero",
  "live",
  "calendario",
  "pilotos",
  "escuderias",
  "autos",
  "cubiertas",
  "banderas",
  "clima",
  "resultados",
  "noticias",
  "multimedia",
  "telemetria",
  "acerca"
] as const;

const SECTION_KEYS: Record<(typeof SECTION_ORDER)[number], keyof Dictionary["nav"]> = {
  hero: "hero",
  live: "live",
  calendario: "calendar",
  pilotos: "drivers",
  escuderias: "teams",
  autos: "cars",
  cubiertas: "tyres",
  banderas: "flags",
  clima: "weather",
  resultados: "results",
  noticias: "news",
  multimedia: "media",
  telemetria: "telemetry",
  acerca: "about"
};

export default function AnchorNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState<string>("hero");
  const locale = resolveLocale(searchParams.get("lang"));
  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const searchString = searchParams.toString();
  const basePath = searchString ? `${pathname}?${searchString}` : pathname;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    const sections = SECTION_ORDER.map((section) => document.getElementById(section));
    sections.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleLocaleChange = useCallback(
    (nextLocale: Locale) => {
      const params = new URLSearchParams(searchParams);
      if (nextLocale === "es") {
        params.delete("lang");
      } else {
        params.set("lang", nextLocale);
      }
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(`${target}${hash}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <nav
      aria-label="Secciones principales"
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur"
    >
      <div className="container mx-auto flex items-center gap-3 overflow-x-auto px-6 py-3 text-sm text-slate-300">
        <span className="font-semibold text-white">{dictionary.hero.title}</span>
        {SECTION_ORDER.map((section) => (
          <Link
            key={section}
            href={`${basePath}#${section}`}
            className={`rounded-full px-3 py-1 transition ${
              active === section
                ? "bg-ferrari text-white"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {dictionary.nav[SECTION_KEYS[section]]}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs uppercase">
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleLocaleChange(option)}
              className={`rounded-full px-3 py-1 transition ${
                locale === option
                  ? "bg-slate-800 text-white"
                  : "border border-transparent text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
