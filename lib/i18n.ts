export const dictionaries = {
  es: {
    hero: {
      title: "F1 Análisis",
      subtitle: "Toda la temporada en un solo scroll",
      searchLabel: "Búsqueda rápida",
      searchPlaceholder: "Buscar piloto, escudería o circuito",
      searchEmpty: "No encontramos coincidencias. Intenta con otro nombre",
      typeLabels: {
        driver: "Piloto",
        team: "Escudería",
        circuit: "Circuito"
      }
    },
    nav: {
      hero: "Inicio",
      live: "En vivo",
      calendar: "Calendario",
      drivers: "Pilotos",
      teams: "Escuderías",
      cars: "Autos",
      tyres: "Cubiertas",
      flags: "Banderas",
      weather: "Clima",
      results: "Resultados",
      about: "Acerca"
    }
  },
  en: {
    hero: {
      title: "F1 Analytics",
      subtitle: "Everything in one scroll",
      searchLabel: "Quick search",
      searchPlaceholder: "Search driver, team or circuit",
      searchEmpty: "No matches found. Try another name",
      typeLabels: {
        driver: "Driver",
        team: "Team",
        circuit: "Circuit"
      }
    },
    nav: {
      hero: "Home",
      live: "Live",
      calendar: "Schedule",
      drivers: "Drivers",
      teams: "Teams",
      cars: "Cars",
      tyres: "Tyres",
      flags: "Flags",
      weather: "Weather",
      results: "Results",
      about: "About"
    }
  }
} as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale = "es"): Dictionary {
  return dictionaries[locale];
}

export function resolveLocale(input?: string | null): Locale {
  if (!input) {
    return "es";
  }

  return (Object.keys(dictionaries) as Locale[]).includes(input as Locale) ? (input as Locale) : "es";
}

export const SUPPORTED_LOCALES = Object.keys(dictionaries) as Locale[];
