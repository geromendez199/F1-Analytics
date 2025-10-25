"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "live", label: "En vivo" },
  { id: "calendario", label: "Calendario" },
  { id: "pilotos", label: "Pilotos" },
  { id: "escuderias", label: "Escuderías" },
  { id: "autos", label: "Autos" },
  { id: "cubiertas", label: "Cubiertas" },
  { id: "banderas", label: "Banderas" },
  { id: "clima", label: "Clima" },
  { id: "resultados", label: "Resultados" },
  { id: "acerca", label: "Acerca" }
];

export default function AnchorNav() {
  const pathname = usePathname();
  const [active, setActive] = useState<string>("hero");

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

    const sections = SECTIONS.map((section) => document.getElementById(section.id));
    sections.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Secciones principales"
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur"
    >
      <div className="container mx-auto flex items-center gap-3 overflow-x-auto px-6 py-3 text-sm text-slate-300">
        <span className="font-semibold text-white">F1 Análisis</span>
        {SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={`${pathname}#${section.id}`}
            className={`rounded-full px-3 py-1 transition ${
              active === section.id
                ? "bg-ferrari text-white"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
