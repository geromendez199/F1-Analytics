const dictionaries = {
  es: {
    hero: {
      title: "F1 Análisis",
      subtitle: "Toda la temporada en un solo scroll",
      searchPlaceholder: "Buscar piloto, escudería o circuito"
    },
    sections: {
      hero: "#hero",
      live: "#live",
      calendar: "#calendario",
      drivers: "#pilotos",
      teams: "#escuderias",
      cars: "#autos",
      tyres: "#cubiertas",
      flags: "#banderas",
      weather: "#clima",
      results: "#resultados",
      about: "#acerca"
    }
  },
  en: {
    hero: {
      title: "F1 Analytics",
      subtitle: "Everything in one scroll",
      searchPlaceholder: "Search driver, team or circuit"
    },
    sections: {
      hero: "#hero",
      live: "#live",
      calendar: "#calendar",
      drivers: "#drivers",
      teams: "#teams",
      cars: "#cars",
      tyres: "#tyres",
      flags: "#flags",
      weather: "#weather",
      results: "#results",
      about: "#about"
    }
  }
};

export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: Locale = "es") {
  return dictionaries[locale];
}
