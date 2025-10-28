F1 Análisis — OnePage de datos en vivo de Fórmula 1

Objetivo: Una Single Page App (SPA) rápida y moderna que concentre toda la información en vivo de la F1: Pilotos, Escuderías, Cl
ima, Horarios, Autos, Cubiertas, Banderas, Resultados y Tiempos (cuando la fuente lo permita), con soporte multidioma y PWA.

⸻

🚀 Stack elegido (2025)
        •       Lenguaje: TypeScript
        •       Framework web: Next.js 15 (App Router) — por rendimiento, SEO, streaming (RSC) y fácil despliegue en Vercel.
        •       Runtime: Edge para APIs de lectura pública + Node donde se requiera.
        •       UI: Tailwind CSS + Headless UI (accesibilidad).
        •       Estado / datos: TanStack Query (SWR en cliente) + RSC para datos cacheables.
        •       Tiempo / TZ: @js-temporal/polyfill para zonas horarias y conversión robusta (usuario por defecto: America/Argent
ina/Cordoba).
        •       Iconos: Heroicons + set de Banderas (SVG).
        •       PWA: workbox + manifest para “Agregar a inicio”.
        •       Analítica: Plausible (o alternativa sin cookies).
        •       Opcional (cache persistente): Supabase (KV/DB) o Vercel KV para rate limiting y memoización de respuestas.

¿Por qué TypeScript + Next.js? Entrega la mejor DX, SSR/SSG/ISR híbrido, edge functions para latencia mínima y una SPA “OnePage”
 con SEO real gracias a RSC. Perfecto para datos en vivo y contenido anclado por secciones.

⸻

🌐 Fuentes de datos (modular)

Este proyecto no está afiliado a F1/FIA. Todas las fuentes son terceros y pueden cambiar.

        •       Resultados oficiales, standings, pilotos y constructores: Ergast Developer API (`/f1/current/*`).
        •       Live timing y telemetría: servicio FastF1 (Python) expuesto vía `FASTF1_SERVICE_URL`.
        •       Clima en tiempo real: OpenWeatherMap (`/data/2.5/forecast` + `/weather`).
        •       Estado de pista/banderas: Formula 1 Live API en RapidAPI (`/events/live`).
        •       Noticias: NewsAPI (`/v2/everything?q=Formula%201`).
        •       Imágenes de pilotos/equipos: Wikipedia Commons API (`pageimages`).
        •       Conversión horaria: TimeZoneDB (`/v2.1/get-time-zone`).
        •       Video highlights: YouTube Data API v3 (`/search`).
        •       Metadatos adicionales: dataset estático versionado en /data para fallback offline.

El README asume clima y calendario garantizados; “live timing” queda opcional y detrás de una bandera de features.

⸻

🧭 Estructura de la OnePage

Secciones ancladas (/#section), navegación sticky y scroll suave:
        1.      Hero — Búsqueda rápida, próxima carrera con hora local, clima y cuenta regresiva.
        2.      En Vivo — Tiempos, intervalos, gomas, banderas, incidentes (auto-refresco / WebSocket).
        3.      Calendario — Fechas de GP con conversión de zona horaria del usuario, sesiones (FP1–FP3, Sprint, Qualy, Race).
        4.      Pilotos — Fichas con foto, número, nacionalidad, puntos y comparativas intra-equipo.
        5.      Escuderías — Livery, pilotos, posiciones, puntos, evolución.
        6.      Autos — Especificaciones por temporada (peso, ERS, aero—si la fuente lo permite).
        7.      Cubiertas — C0–C5, uso por stint, selección Pirelli por GP.
        8.      Banderas — Significado (verde, amarilla, roja, SC, VSC, azul, blanca, etc.) con iconografía clara.
        9.      Clima — Pronóstico por sesión (temp/lluvia/viento), ahora en el circuito.
        10.     Resultados — Última carrera y standings generados en vivo desde Ergast.
        11.     Noticias — Titulares recientes consumidos desde NewsAPI.
        12.     Multimedia — Highlights oficiales vía YouTube Data API.
        13.     Telemetría — Comparativas FastF1 (laps, DRS, velocidad).
        14.     Acerca — Fuentes, licencia, disclaimer.

⸻

🏗️ Arquitectura
        •       Front (OnePage): RSC para “calendario/pilotos/escuderías” (cacheables) + TanStack Query para “en vivo” (refetch/
WS).
        •       APIs internas (/app/api/*):
        •       /api/schedule — calendario normalizado (fallback estático).
        •       /api/circuits — detalle de circuitos + timezone desde Ergast/TimeZoneDB.
        •       /api/weather?gp=<round> — pronóstico por circuito + “ahora”.
        •       /api/standings — pilotos/constructores desde Ergast.
        •       /api/live — proxy FastF1/Live API.
        •       /api/race-status — banderas en vivo vía RapidAPI.
        •       /api/telemetry — métricas FastF1 normalizadas.
        •       /api/news — titulares NewsAPI.
        •       /api/videos — highlights YouTube Data API.
        •       /api/images — imágenes Wikipedia Commons.
        •       /api/timezone — helper de TZ para otros servicios.
        •       Cache: Cache-Control, revalidación ISR y KV opcional.
        •       TZ/Fechas: Temporal.ZonedDateTime con la TZ del usuario; fallback a America/Argentina/Cordoba.
        •       Accesibilidad: roles/labels, contraste AA+, navegación por teclado.
        •       Rendimiento: imágenes optimizadas, streaming, code-splitting, prioridad en fuentes críticas.

⸻

🔧 Variables de entorno

Crear .env.local:

# Clima
OPENWEATHER_API_KEY=xxxx

# Ergast (opcional)
ERGAST_API_URL=https://ergast.com/api/f1

# Live timing y telemetría
FASTF1_SERVICE_URL= # URL del backend FastF1 (REST)
LIVE_API_URL=       # compatibilidad con proxy existente
LIVE_API_TOKEN=

# Estado de pista (RapidAPI)
F1_LIVE_API_URL=https://api-formula-1.p.rapidapi.com
F1_LIVE_API_ENDPOINT=/events/live
F1_LIVE_API_KEY=
F1_LIVE_API_HOST=api-formula-1.p.rapidapi.com

# Noticias y multimedia
NEWS_API_KEY=
YOUTUBE_API_KEY=

# Timezone helper
TIMEZONEDB_API_KEY=

# Cache opcional
SUPABASE_URL=
SUPABASE_ANON_KEY=

Si no hay proveedor live, la sección En Vivo se oculta o muestra un placeholder.

Para SSR en producción puedes definir NEXT_PUBLIC_BASE_URL con la URL pública del despliegue (p.ej. https://f1-analisis.vercel
.app) para que las llamadas internas a /api funcionen correctamente durante el renderizado en servidor.

⸻

📁 Estructura de carpetas (resumen)

f1-analisis/
├─ app/
│  ├─ page.tsx                 # OnePage (secciones ancladas)
│  ├─ api/
│  │  ├─ schedule/route.ts     # calendario normalizado
│  │  ├─ circuits/route.ts     # circuitos + timezone dinámico
│  │  ├─ weather/route.ts      # clima por GP
│  │  ├─ standings/route.ts    # pilotos/constructores (Ergast)
│  │  ├─ live/route.ts         # proxy FastF1/Live API
│  │  ├─ race-status/route.ts  # banderas en vivo (RapidAPI)
│  │  ├─ telemetry/route.ts    # telemetría FastF1
│  │  ├─ news/route.ts         # titulares NewsAPI
│  │  ├─ videos/route.ts       # highlights YouTube
│  │  ├─ images/route.ts       # imágenes Wikipedia
│  │  └─ timezone/route.ts     # helper TZ (TimeZoneDB)
│  └─ (sections)/
│     ├─ Hero.tsx
│     ├─ Live.tsx
│     ├─ Calendar.tsx
│     ├─ Drivers.tsx
│     ├─ Teams.tsx
│     ├─ Cars.tsx
│     ├─ Tyres.tsx
│     ├─ Flags.tsx
│     ├─ Weather.tsx
│     ├─ Results.tsx
│     ├─ News.tsx
│     ├─ Highlights.tsx
│     └─ Telemetry.tsx
├─ components/
│  └─ AnchorNav.tsx            # navegación sticky con anclas
├─ data/                       # datasets estáticos (pilotos, teams, circuitos)
├─ lib/                        # fetchers, mapeos, helpers Temporal
├─ public/flags/               # SVG banderas
├─ public/liveries/            # livery por temporada y avatares mock
├─ styles/                     # Tailwind CSS (globales)
└─ next.config.mjs


⸻

🧩 Diseño de datos (interfaces clave)
        •       Driver: id, code, name, number, country, teamId, points, photo.
        •       Team: id, name, powerUnit?, livery, drivers[], points.
        •       Circuit: id, name, location, tz, geo, round.
        •       Session: type (FP1|FP2|FP3|SPRINT|QUALY|RACE), startZoned, endZoned.
        •       Weather: now, forecast[] (por sesión).
        •       Tyre: compound (C0..C5|INT|WET), stints[] (si hay datos).
        •       Live (opcional): lap, gap, interval, sectorTimes, flag, tyre, pitStatus.

⸻

🕒 Conversión horaria y cuenta regresiva
        •       Todas las sesiones del calendario se guardan en hora local del circuito y se convierten a la TZ del usuario con
Temporal.
        •       Countdown se actualiza en tiempo real; si la sesión está en curso, cambia a “en vivo”.
        •       El usuario puede fijar TZ manualmente (persistimos en localStorage).

⸻

📲 PWA & offline
        •       Instalación en iOS/Android/desktop.
        •       Offline: último calendario, banderas, pilotos/teams y la última consulta de clima se guardan para lectura sin co
nexión.
        •       El bloque En Vivo se desactiva offline y se re-intenta al volver la conectividad.

⸻

🧪 Calidad
        •       Lighthouse ≥ 95 en Performance/SEO/Best Practices/Accessibility.
        •       Testing: Playwright (e2e anclas, navegación), Vitest (utils/timezones).
        •       CI/CD: Vercel + GitHub Actions (lint, typecheck, tests).

⸻

🛡️ Legal y ética
        •       No oficial: marcas y logos pertenecen a sus dueños.
        •       Respetar Términos de uso de cada API. Evitar scraping si lo prohíben.
        •       Implementar rate limiting y cache para reducir huella.

⸻

🧰 Desarrollo local

pnpm i
pnpm dev
# abrir http://localhost:3000

Build:

pnpm build && pnpm start

Notas de implementación actual
------------------------------
- La SPA ya incluye todas las secciones definidas con datos mock y componentes accesibles.
- Las rutas /api utilizan runtime edge y consultan Ergast, OpenWeather, RapidAPI, NewsAPI, YouTube y TimeZoneDB con fallback estático.
- La navegación sticky con anclas permite saltar a cada bloque, cumpliendo con el flujo “OnePage”.
- La sección En Vivo se alimenta de /api/live (FastF1) y /api/race-status para banderas, mostrando fallback descriptivo si faltan credenciales.
- Resultados y standings provienen de Ergast en tiempo real con fallback local.
- Los helpers de Temporal convierten horarios a la zona del usuario (fallback Córdoba) para countdown y calendario.

⸻

☁️ Despliegue
        •       Vercel (recomendado).
        •       Setear variables en el panel (clima/live).
        •       Activar Edge Runtime donde proceda.
        •       Configurar revalidación (ISR) en rutas cacheables.

⸻

🗺️ Roadmap
        •       Conectar proveedor live timing (cuando esté disponible legalmente).
        •       Telemetría básica por vuelta (si la fuente lo permite).
        •       Modo comparador (piloto vs piloto, stint vs stint).
        •       Exportar a .ics las sesiones del GP.
        •       Notificaciones push antes de cada sesión (PWA).

⸻

🧷 Accesos rápidos (secciones)
        •       /#hero · /#live · /#calendario · /#pilotos · /#escuderias · /#autos · /#cubiertas · /#banderas · /#clima · /#resultados · /#noticias · /#multimedia · /#telemetria · /#acerca

# F1-Analytics: Integración de APIs de Fórmula 1  
Repositorio del proyecto **F1-Analytics** (dashboard, análisis y visualización) con los principales puntos de entrada de datos (APIs) para la categoría Formula One World Championship.

## Objetivo  
Este proyecto consume múltiples fuentes de datos de F1 (histórico + live timing) para alimentar pipelines, bases de datos (ej. Supabase), visualizaciones en Vercel, prototipos de hardware (dron, IoT) y análisis automáticos.  
El archivo que sigue detalla cada API soportada, su cobertura, requisitos y notas de integración.

---

## Lista de APIs disponibles  
| # | API | Cobertura / Qué ofrece | URL / Sitio | Notas clave |
|---|-----|------------------------|-------------|------------|
| 1 | **Ergast API** | Datos históricos de F1 (resultados, pilotos, circuitos) desde 1950.  [oai_citation:0‡Documentador de Postman](https://documenter.getpostman.com/view/11586746/SztEa7bL?utm_source=chatgpt.com) | `http://ergast.com/api/f1/` | Gratuita, sin autenticación (o mínimo) para uso no comercial. Buen “backbone” histórico. |
| 2 | **Jolpica-F1 (Ergast compatible)** | Sustituto moderno de Ergast, datos históricos.  [oai_citation:1‡reddit.com](https://www.reddit.com/r/F1DataAnalysis/comments/16w84uz/openf1_an_api_for_realtime_f1_data/?utm_source=chatgpt.com) | `https://api.jolpi.ca/ergast/f1/` (ver GitHub) | Ideal para asegurar continuidad si Ergast cambia. |
| 3 | **FastF1 API / OpenF1** | Datos históricos + telemetría + sesiones + live ~aunque live pago.  [oai_citation:2‡OpenF1](https://openf1.org/?utm_source=chatgpt.com) | `https://api.openf1.org/v1/` | Libre para histórico, live requiere cuenta. Buen para prototipo / drone analytics. |
| 4 | **Sportradar AG – Formula 1 API** | Cobertura profesional: calendarios, live, laps, perfiles de pilotos‐equipos.  [oai_citation:3‡Getting Started](https://developer.sportradar.com/racing/reference/f1-overview?utm_source=chatgpt.com) | Developer portal: *developer.sportradar.com* | Pago, autenticación obligatoria. Ideal para versión “productiva”. |
| 5 | **Sportmonks – Formula 1 API** | Datos completos: vueltas, equipos, pilotos, real-time/live scores.  [oai_citation:4‡Sportmonks](https://www.sportmonks.com/formula-one-api/?utm_source=chatgpt.com) | *sportmonks.com/formula-one-api/* | Precio moderado; buena opción intermedia entre hobby/profesional. |
| 6 | **API-Sports – Formula 1** | API general de deportes que soporta F1: resultados, pilotos, temporadas.  [oai_citation:5‡api-sports](https://api-sports.io/documentation/formula-1/v1?utm_source=chatgpt.com) | *api-sports.io/documentation/formula-1/v1* | Puede servir para integrar datos menos “live”. |
| 7 | **Zyla Labs – Formula One Data API** | API de mercado (API marketplace) con datos históricos y live de F1: temporadas, pilotos, equipos, sesiones.  [oai_citation:6‡Zyla API Hub](https://zylalabs.com/api-marketplace/sports%2B%26%2Bgaming/formula%2Bone%2Bdata%2Bapi/1598?utm_source=chatgpt.com) | *zylalabs.com/api-marketplace/sports+&+gaming/formula+one+data+api/1598* | Precio según plan, buen respaldo “general”. |
| 8 | **RapidAPI – API Formula 1** | Catálogo de API en RapidAPI con endpoints de F1: carreras, pilotos, rankings.  [oai_citation:7‡rapidapi.com](https://rapidapi.com/api-sports/api/api-formula-1?utm_source=chatgpt.com) | *rapidapi.com/api-sports/api/api-formula-1* | Fácil de probar, buen para prototipos rápidos. |
| 9 | **F1LivePulse – Formula 1 Live Data API** | Datos ultra-live: posiciones, pit stops, radio del equipo, clima, etc.  [oai_citation:8‡Formula Live Pulse](https://www.f1livepulse.com/en/formula-1-api/?utm_source=chatgpt.com) | *f1livepulse.com/en/formula-1-api/* | Alto nivel, posiblemente para uso comercial/media. Ver latencia y licencia. |
| 10 | **F1 Schedule API (Apiary)** | Enfoque específico en calendario, fechas y sesiones de F1.  [oai_citation:9‡f1scheduleapi.docs.apiary.io](https://f1scheduleapi.docs.apiary.io/?utm_source=chatgpt.com) | *f1scheduleapi.docs.apiary.io* | Buena para integración del calendario en tu dashboard (ej: drone/evento + horario). |

---

## Cómo integrar estas APIs en F1-Analytics  
### Paso a paso  
1. Crear archivo de configuración `apis.config.json` donde definas cada API: nombre, baseURL, key/token (o null si libre), tipo (histo/live).  
2. En tu pipeline de ingestión (ej: Supabase + Next.js backend):  
   - Módulo para “historical ingest”: usar Ergast/Jolpica/OpenF1 para cargar temporadas pasadas, pilotos, equipos, resultados.  
   - Módulo para “live ingest”: en días de GP usar Sportmonks/Sportradar/F1LivePulse para latencia mínima, actualizar tablas de vueltas, posiciones, pit stops en tiempo real.  
3. Definir un esquema de base de datos (ej: PostgreSQL en Supabase): tablas como `seasons`, `events`, `drivers`, `teams`, `sessions`, `laps`, `live_positions`, `pit_stops`.  
4. Configurar en Vercel (o tu hosting) variables de entorno: `API_KEY_SPORTMONKS`, `API_KEY_SPORTRADAR`, etc.  
5. Escribir utilitarios en TypeScript/Next.js para consumir las APIs, mapear datos al esquema, manejar paginación, límites de llamada.  
6. Automatizar con GitHub Actions: cada semana/hora ejecutar “historical update”, durante fin de semana de carrera activar “live ingest job”.  
7. Documentar en README este flujo + qué API usar para qué escenario.

---

## Consideraciones y advertencias  
- Revisa **licencias de uso**: algunas APIs permiten sólo uso personal/no comercial. Si tu dashboard será público o incluido en un servicio (por ejemplo drone/evento + visualización), asegúrate de la licencia.  
- Latencia en “live timing”: aunque diga “live”, puede haber retraso de segundos o minutos. Estimar para tu visualización en evento.  
- Cuotas de llamadas (“rate limits”): planifica ingestión incremental, caching, evitar cuota excedida en día de carrera.  
- Formatos de datos diferentes: algunas APIs devuelven JSON, otras permiten CSV; algunos campos pueden variar (números de piloto, equipos, claves de sesión). Normalizar.  
- Estabilidad: APIs gratuitas pueden cambiar o desaparecer (ej: Ergast está “viejo”). Tener plan de respaldo (ej: Jolpica).  
- Datos de telemetría/pit stops pueden tener restricciones de derechos de autor; verificar uso con fines comerciales.

---

## Ejemplo de configuración (snippet)  
```json
{
  "apis": [
    {
      "name": "Ergast",
      "baseUrl": "http://ergast.com/api/f1",
      "auth": null,
      "type": "historical"
    },
    {
      "name": "Sportmonks",
      "baseUrl": "https://api.sportmonks.com/v3/formula-one",
      "auth": { "apiKey": "${API_KEY_SPORTMONKS}" },
      "type": "live_and_historical"
    },
    {
      "name": "OpenF1",
      "baseUrl": "https://api.openf1.org/v1",
      "auth": null,
      "type": "historical_plus_optional_live"
    }
    // … demás APIs …
  ]
}
⸻

📄 Licencia

Código bajo MIT. Contenido y marcas de terceros permanecen bajo sus respectivas licencias.

⸻

🤝 Contribuir
        1.      Crear issue (feature/bug).
        2.      PR con descripción clara y capturas.
        3.      Ejecutar linters/tests.
        4.      Respetar accesibilidad y rendimiento.

⸻

Notas finales
        •       Este README describe la arquitectura y criterios para construir la OnePage F1 Análisis con foco en datos en vivo
, rendimiento y confiabilidad.
        •       La integración de fuentes live depende de disponibilidad y términos legales. El proyecto está preparado para act
ivarlas de forma segura y opcional.
root@edb448dbb67c:/workspace/F1-Analytics#
