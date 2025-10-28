import type { SessionType } from "./types";

type SessionTypeDictionary = Record<SessionType, string>;

export const dictionaries = {
  es: {
    hero: {
      badge: "Fórmula 1 · Temporada 2024",
      title: "F1 Análisis",
      subtitle: "Toda la temporada en un solo scroll",
      searchLabel: "Búsqueda rápida",
      searchPlaceholder: "Buscar piloto, escudería o circuito",
      searchEmpty: "No encontramos coincidencias. Intenta con otro nombre",
      typeLabels: {
        driver: "Piloto",
        team: "Escudería",
        circuit: "Circuito"
      },
      nextRaceLabel: "Próxima carrera",
      timezoneLabel: "Hora local",
      calendarCta: "Ver calendario",
      emptyCalendar: "Completa el dataset de calendario para iniciar el conteo regresivo.",
      countdown: {
        live: "En vivo"
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
      news: "Noticias",
      media: "Multimedia",
      telemetry: "Telemetría",
      about: "Acerca"
    },
    live: {
      title: "En vivo",
      description: "Datos de live timing (placeholder hasta conectar proveedor oficial).",
      refreshIdle: "Refrescar",
      refreshLoading: "Actualizando…",
      loading: "Cargando datos en vivo…",
      error: "No se pudo cargar el live timing",
      updatedAt: "Última actualización",
      table: {
        position: "Pos",
        driver: "Piloto",
        gap: "Gap",
        tyre: "Goma",
        lastLap: "Última vuelta"
      }
    },
    calendar: {
      title: "Calendario",
      subtitle: "Horarios convertidos a tu zona",
      roundLabel: "Ronda",
      timezoneTag: "Zona"
    },
    drivers: {
      title: "Pilotos",
      subtitle: "Ranking actualizado con datos estáticos de ejemplo.",
      updatedAt: "Última actualización · julio 2024",
      points: "Puntos",
      noTeam: "Equipo libre",
      photoAlt: "Foto de {name}"
    },
    teams: {
      title: "Escuderías",
      subtitle: "Puntos, pilotos y motorización por equipo.",
      updatedAt: "Datos mockeados",
      points: "Puntos",
      drivers: "Pilotos",
      liveryAlt: "Librea de {team}"
    },
    cars: {
      title: "Autos",
      subtitle: "Ficha resumida de especificaciones destacadas por temporada.",
      updatedAt: "Fuente: datos públicos 2024",
      seasonLabel: "Temporada",
      specLabels: {
        weight: "Peso",
        powerUnit: "Unidad de potencia",
        aero: "Aero",
        ers: "ERS"
      },
      items: [
        {
          team: "Red Bull RB20",
          season: 2024,
          weight: "798 kg",
          powerUnit: "Honda RBPT",
          aero: "Paquete de baja carga optimizado para rectas",
          ers: "Mejoras de recuperación en frenada media"
        },
        {
          team: "McLaren MCL38",
          season: 2024,
          weight: "799 kg",
          powerUnit: "Mercedes",
          aero: "Piso rediseñado para generar más carga en curvas rápidas",
          ers: "Entrega más progresiva en modo quali"
        },
        {
          team: "Ferrari SF-24",
          season: 2024,
          weight: "800 kg",
          powerUnit: "Ferrari",
          aero: "Alerón trasero modular para pistas mixtas",
          ers: "Mapa híbrido optimizado para tracción"
        }
      ]
    },
    tyres: {
      title: "Cubiertas",
      subtitle: "Selección base Pirelli (C0–C5, intermedias, lluvia).",
      updatedAt: "Fuente: Pirelli (ejemplo)",
      compounds: [
        { id: "C0", name: "C0 - Ultrarígido", usage: "Circuitos abrasivos de alta energía" },
        { id: "C2", name: "C2 - Medio", usage: "Balance entre calentamiento y durabilidad" },
        { id: "C4", name: "C4 - Blando", usage: "Clasificación y stints cortos" },
        { id: "INT", name: "Intermedias", usage: "Lluvia ligera y pista húmeda" },
        { id: "WET", name: "Lluvia extrema", usage: "Zonas con aquaplaning, máxima evacuación" }
      ]
    },
    flags: {
      title: "Banderas",
      subtitle: "Interpretación rápida de las señales oficiales de la FIA.",
      updatedAt: "Actualizado 2024",
      liveTitle: "Estado de pista en tiempo real",
      liveUnavailable: "Sin datos",
      liveHint: "Configura la Fórmula 1 Live API (RapidAPI) para habilitar banderas en vivo.",
      liveUpdated: "Actualizado",
      items: [
        { id: "green", name: "Verde", description: "Pista libre. Se reanuda la velocidad de carrera.", color: "bg-green-500" },
        { id: "yellow", name: "Amarilla", description: "Precaución. No adelantar en el sector.", color: "bg-yellow-400" },
        { id: "red", name: "Roja", description: "Sesión detenida. Todos los autos deben regresar al pitlane.", color: "bg-red-500" },
        { id: "sc", name: "Safety Car", description: "Safety car en pista. Ritmo controlado y sin adelantamientos.", color: "bg-amber-500" },
        { id: "vsc", name: "VSC", description: "Virtual safety car. Delta de tiempo obligatorio para todos.", color: "bg-emerald-400" },
        { id: "blue", name: "Azul", description: "Auto más lento debe dejar pasar a uno más rápido.", color: "bg-blue-500" }
      ]
    },
    weather: {
      title: "Clima",
      subtitle: "Pronóstico por sesión y condiciones actuales en el circuito.",
      source: "Fuente: OpenWeather (fallback local)",
      loading: "Cargando pronóstico…",
      unavailable: "No fue posible obtener información meteorológica en este momento.",
      nowLabel: "Ahora",
      forecastLabel: "Pronóstico",
      liveSource: "Datos en vivo desde OpenWeather",
      fallbackSource: "Datos de muestra offline",
      wind: "Viento",
      humidity: "Humedad",
      windUnit: "km/h",
      humidityUnit: "%",
      rainChanceLabel: "lluvia",
      sampleDescription: "nubes dispersas"
    },
    results: {
      title: "Resultados",
      subtitle: "Última carrera y standings generales de la temporada.",
      seasonTag: "Temporada",
      lastRaceLabel: "Última carrera",
      seasonSummaryTitle: "Top temporada",
      driversLabel: "Pilotos",
      constructorsLabel: "Constructores",
      winnerTimeLabel: "Tiempo ganador",
      unavailable: "Conecta Ergast/Jolpica para mostrar resultados en vivo."
    },
    news: {
      title: "Noticias recientes",
      subtitle: "Sigue la actualidad de la parrilla con fuentes globales.",
      provider: "Fuente: NewsAPI",
      empty: "Conecta la clave de NewsAPI para mostrar titulares en vivo.",
      readMore: "Ver nota",
      unknownDate: "Fecha no disponible"
    },
    highlights: {
      title: "Highlights y clips",
      subtitle: "Últimos videos oficiales y resúmenes de la F1.",
      provider: "Fuente: YouTube Data API",
      empty: "Agrega YOUTUBE_API_KEY para reproducir los últimos highlights.",
      watch: "Ver en YouTube",
      unknownChannel: "Canal oficial",
      unknownDate: "Fecha no disponible"
    },
    telemetry: {
      title: "Telemetría avanzada",
      subtitle: "Comparativa de vueltas rápidas, velocidades y DRS desde OpenF1.",
      placeholderSession: "Sesión no disponible",
      empty: "Conecta OPENF1_SESSION_KEY para exponer datos de telemetría.",
      driver: "Piloto",
      fastestLap: "Vuelta rápida",
      topSpeed: "Velocidad máxima",
      drs: "Activaciones DRS",
      sectors: "Sectores",
      sectorLabel: "Sector",
      updated: "Actualizado"
    },
    about: {
      title: "Acerca del proyecto",
      paragraphs: [
        "F1 Análisis es una Single Page App diseñada para consolidar información clave de Fórmula 1 en tiempo real con foco en rendimiento, accesibilidad y disponibilidad offline. Las integraciones de datos provienen de proveedores públicos como OpenWeather y endpoints históricos (Ergast u otros) y pueden activarse o reemplazarse según disponibilidad y términos legales.",
        "El proyecto es open source (MIT) y se despliega preferentemente en Vercel utilizando Next.js 15, Tailwind CSS y TanStack Query. Las secciones se diseñan como anclas para facilitar la navegación rápida desde cualquier dispositivo y soportan modo PWA para recibir notificaciones antes de cada sesión."
      ]
    },
    common: {
      sessionTypes: {
        FP1: "FP1",
        FP2: "FP2",
        FP3: "FP3",
        SPRINT: "Sprint",
        QUALY: "Clasificación",
        RACE: "Carrera"
      } as SessionTypeDictionary,
      pointsAbbreviation: "pts"
    }
  },
  en: {
    hero: {
      badge: "Formula 1 · 2024 season",
      title: "F1 Analytics",
      subtitle: "Everything in one scroll",
      searchLabel: "Quick search",
      searchPlaceholder: "Search driver, team or circuit",
      searchEmpty: "No matches found. Try another name",
      typeLabels: {
        driver: "Driver",
        team: "Team",
        circuit: "Circuit"
      },
      nextRaceLabel: "Next race",
      timezoneLabel: "Local time",
      calendarCta: "View schedule",
      emptyCalendar: "Load the schedule dataset to start the countdown.",
      countdown: {
        live: "Live now"
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
      news: "News",
      media: "Highlights",
      telemetry: "Telemetry",
      about: "About"
    },
    live: {
      title: "Live",
      description: "Live timing feed (placeholder until an official provider is connected).",
      refreshIdle: "Refresh",
      refreshLoading: "Refreshing…",
      loading: "Loading live timing…",
      error: "Live timing could not be loaded",
      updatedAt: "Last updated",
      table: {
        position: "Pos",
        driver: "Driver",
        gap: "Gap",
        tyre: "Tyre",
        lastLap: "Last lap"
      }
    },
    calendar: {
      title: "Schedule",
      subtitle: "Session times converted to your timezone",
      roundLabel: "Round",
      timezoneTag: "Zone"
    },
    drivers: {
      title: "Drivers",
      subtitle: "Static sample ranking for the current season.",
      updatedAt: "Last updated · July 2024",
      points: "Points",
      noTeam: "Free agent",
      photoAlt: "{name} portrait"
    },
    teams: {
      title: "Teams",
      subtitle: "Points, drivers and power units per team.",
      updatedAt: "Sample dataset",
      points: "Points",
      drivers: "Drivers",
      liveryAlt: "{team} livery"
    },
    cars: {
      title: "Cars",
      subtitle: "Snapshot of headline specifications for the season.",
      updatedAt: "Source: public 2024 data",
      seasonLabel: "Season",
      specLabels: {
        weight: "Weight",
        powerUnit: "Power unit",
        aero: "Aero",
        ers: "ERS"
      },
      items: [
        {
          team: "Red Bull RB20",
          season: 2024,
          weight: "798 kg",
          powerUnit: "Honda RBPT",
          aero: "Low-drag package tuned for straights",
          ers: "Improved harvesting under medium braking"
        },
        {
          team: "McLaren MCL38",
          season: 2024,
          weight: "799 kg",
          powerUnit: "Mercedes",
          aero: "Reworked floor to gain load in fast corners",
          ers: "Smoother delivery in qualifying mode"
        },
        {
          team: "Ferrari SF-24",
          season: 2024,
          weight: "800 kg",
          powerUnit: "Ferrari",
          aero: "Modular rear wing for mixed circuits",
          ers: "Hybrid map optimised for traction"
        }
      ]
    },
    tyres: {
      title: "Tyres",
      subtitle: "Base Pirelli selection (C0–C5, intermediates, full wet).",
      updatedAt: "Source: Pirelli (sample)",
      compounds: [
        { id: "C0", name: "C0 - Ultra hard", usage: "High-energy abrasive tracks" },
        { id: "C2", name: "C2 - Medium", usage: "Balance between warm-up and durability" },
        { id: "C4", name: "C4 - Soft", usage: "Qualifying and short stints" },
        { id: "INT", name: "Intermediate", usage: "Light rain and damp conditions" },
        { id: "WET", name: "Full wet", usage: "Standing water, maximum evacuation" }
      ]
    },
    flags: {
      title: "Flags",
      subtitle: "Quick reference for official FIA signals.",
      updatedAt: "Updated 2024",
      liveTitle: "Track status",
      liveUnavailable: "Unavailable",
      liveHint: "Configure the Formula 1 Live API (RapidAPI) to surface live flags.",
      liveUpdated: "Updated",
      items: [
        { id: "green", name: "Green", description: "Track clear. Racing speed resumes.", color: "bg-green-500" },
        { id: "yellow", name: "Yellow", description: "Caution. No overtaking in the sector.", color: "bg-yellow-400" },
        { id: "red", name: "Red", description: "Session stopped. Cars must return to the pit lane.", color: "bg-red-500" },
        { id: "sc", name: "Safety Car", description: "Safety car on track. Controlled pace, no overtakes.", color: "bg-amber-500" },
        { id: "vsc", name: "VSC", description: "Virtual safety car. Mandatory delta for everyone.", color: "bg-emerald-400" },
        { id: "blue", name: "Blue", description: "Slower car must let a faster car through.", color: "bg-blue-500" }
      ]
    },
    weather: {
      title: "Weather",
      subtitle: "Per-session forecast and current circuit conditions.",
      source: "Source: OpenWeather (local fallback)",
      loading: "Loading forecast…",
      unavailable: "Weather data is unavailable right now.",
      nowLabel: "Now",
      forecastLabel: "Forecast",
      liveSource: "Live data from OpenWeather",
      fallbackSource: "Offline sample data",
      wind: "Wind",
      humidity: "Humidity",
      windUnit: "km/h",
      humidityUnit: "%",
      rainChanceLabel: "rain",
      sampleDescription: "scattered clouds"
    },
    results: {
      title: "Results",
      subtitle: "Latest race and full season standings.",
      seasonTag: "Season",
      lastRaceLabel: "Latest race",
      seasonSummaryTitle: "Season leaders",
      driversLabel: "Drivers",
      constructorsLabel: "Constructors",
      winnerTimeLabel: "Winning time",
      unavailable: "Connect Ergast/Jolpica to surface live standings."
    },
    news: {
      title: "Latest news",
      subtitle: "Stay up to date with the paddock conversation.",
      provider: "Source: NewsAPI",
      empty: "Provide a NewsAPI key to surface live headlines.",
      readMore: "Read article",
      unknownDate: "Unknown date"
    },
    highlights: {
      title: "Video highlights",
      subtitle: "Official clips and recaps from the F1 ecosystem.",
      provider: "Source: YouTube Data API",
      empty: "Add YOUTUBE_API_KEY to fetch the latest highlights.",
      watch: "Watch on YouTube",
      unknownChannel: "Official channel",
      unknownDate: "Unknown date"
    },
    telemetry: {
      title: "Telemetry insights",
      subtitle: "Compare laps, speeds and DRS usage powered by OpenF1.",
      placeholderSession: "Session unavailable",
      empty: "Configure OPENF1_SESSION_KEY to expose telemetry data.",
      driver: "Driver",
      fastestLap: "Fastest lap",
      topSpeed: "Top speed",
      drs: "DRS activations",
      sectors: "Sectors",
      sectorLabel: "Sector",
      updated: "Updated"
    },
    about: {
      title: "About the project",
      paragraphs: [
        "F1 Analytics is a single-page experience built to aggregate real-time Formula 1 information with a focus on performance, accessibility and offline availability. Integrations rely on public providers such as OpenWeather and historical endpoints (Ergast or similar) and can be enabled or swapped depending on availability and legal terms.",
        "The project is open source (MIT) and is best deployed on Vercel using Next.js 15, Tailwind CSS and TanStack Query. Sections are designed as anchors for quick navigation on any device and support PWA mode to receive reminders ahead of each session."
      ]
    },
    common: {
      sessionTypes: {
        FP1: "FP1",
        FP2: "FP2",
        FP3: "FP3",
        SPRINT: "Sprint",
        QUALY: "Qualifying",
        RACE: "Race"
      } as SessionTypeDictionary,
      pointsAbbreviation: "pts"
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
