F1 Análisis — OnePage de datos en vivo de Fórmula 1

Objetivo: Una Single Page App (SPA) rápida y moderna que concentre toda la información en vivo de la F1: Pilotos, Escuderías, Cl
ima, Horarios, Autos, Cubiertas, Banderas, Resultados y Tiempos (cuando la fuente lo permita), con soporte multidioma y PWA.

⸻

🚀 Stack elegido (2025)
        •       Lenguaje: TypeScript
        •       Framework web: Next.js 15 (App Router) — por rendimiento, SEO, streaming (RSC) y fácil despliegue en Vercel.
        •       Runtime: Edge para APIs de lectura pública + Node donde se requiera.
        •       UI: Tailwind CSS con componentes accesibles a medida.
        •       Estado / datos: SWR para datos en vivo + RSC para contenidos cacheables.
        •       Tiempo / TZ: Luxon para zonas horarias y conversión robusta (usuario por defecto: America/Argentina/Cordoba).
        •       Iconos: set SVG propio + banderas (SVG).
        •       PWA: workbox + manifest para “Agregar a inicio”.
        •       Analítica: Plausible (o alternativa sin cookies).
        •       Opcional (cache persistente): Supabase (KV/DB) o Vercel KV para rate limiting y memoización de respuestas.

¿Por qué TypeScript + Next.js? Entrega la mejor DX, SSR/SSG/ISR híbrido, edge functions para latencia mínima y una SPA “OnePage”
 con SEO real gracias a RSC. Perfecto para datos en vivo y contenido anclado por secciones.

⸻

🌐 Fuentes de datos (modular)

Este proyecto no está afiliado a F1/FIA. Todas las fuentes son terceros y pueden cambiar.

        •       Calendario y resultados: API Ergast F1 (temporada actual) con fallback local versionado en `/data`.
        •       Clima por circuito: OpenWeatherMap (tiempo real + pronóstico) con sample offline si no hay API key.
        •       Estado en vivo: OpenF1 (última sesión activa/completada) o proveedor propio vía `LIVE_API_URL`/`LIVE_API_TOKEN`.
        •       Neumáticos y compuestos: endpoints públicos/documentación Pirelli (aún mockeado en la UI).
        •       Metadatos (pilotos/escuderías/autos): dataset estático enriquecido automáticamente con standings Ergast.

El live timing se activa automáticamente con OpenF1; si la API no está disponible se usa un sample local.

⸻

🧭 Estructura de la OnePage

Secciones ancladas (/#section), navegación sticky y scroll suave:
        1.      Hero — Búsqueda rápida, próxima carrera con hora local, clima y cuenta regresiva.
        2.      En Vivo (si disponible) — Tiempos, intervalos, gomas, banderas, incidentes (auto-refresco / WebSocket).
        3.      Calendario — Fechas de GP con conversión de zona horaria del usuario, sesiones (FP1–FP3, Sprint, Qualy, Race).
        4.      Pilotos — Fichas con foto, número, nacionalidad, puntos y comparativas intra-equipo.
        5.      Escuderías — Livery, pilotos, posiciones, puntos, evolución.
        6.      Autos — Especificaciones por temporada (peso, ERS, aero—si la fuente lo permite).
        7.      Cubiertas — C0–C5, uso por stint, selección Pirelli por GP.
        8.      Banderas — Significado (verde, amarilla, roja, SC, VSC, azul, blanca, etc.) con iconografía clara.
        9.      Clima — Pronóstico por sesión (temp/lluvia/viento), ahora en el circuito.
        10.     Resultados — Última carrera y topline de temporadas previas.
        11.     Acerca — Fuentes, licencia, disclaimer.

⸻

🏗️ Arquitectura
        •       Front (OnePage): RSC para “calendario/pilotos/escuderías” (cacheables) + SWR para “en vivo” (polling/
refetch).
        •       APIs internas (/app/api/*):
        •       /api/schedule — calendario normalizado.
        •       /api/weather?gp=<round> — pronóstico por circuito + “ahora”.
        •       /api/standings — pilotos/constructores.
        •       /api/live — proxy/WS a proveedor live (opcional).
        •       Cache: Cache-Control, revalidación ISR y KV opcional.
        •       TZ/Fechas: Luxon convierte los horarios a la zona del usuario; fallback a America/Argentina/Cordoba.
        •       Accesibilidad: roles/labels, contraste AA+, navegación por teclado.
        •       Rendimiento: imágenes optimizadas, streaming, code-splitting, prioridad en fuentes críticas.

⸻

🔧 Variables de entorno

Crear .env.local:

# Clima
OPENWEATHER_API_KEY=xxxx

# Proveedor live timing (opcional; no oficial)
LIVE_API_URL=
LIVE_API_TOKEN=

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
│  │  ├─ weather/route.ts      # clima por GP
│  │  ├─ standings/route.ts    # pilotos/constructores
│  │  └─ live/route.ts         # proxy live (opcional)
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
│     └─ Results.tsx
├─ components/
│  └─ AnchorNav.tsx            # navegación sticky con anclas
├─ data/                       # datasets estáticos (pilotos, teams, circuitos)
├─ lib/                        # fetchers, mapeos, helpers de tiempo
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
Luxon.
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

npm install
npm run dev
# abrir http://localhost:3000

Build:

npm run build && npm run start

Notas de implementación actual
------------------------------
- Todas las secciones se nutren de datos en vivo: calendario/resultados desde Ergast, clima desde OpenWeather y live timing via OpenF1.
- Las rutas /api utilizan runtime edge, cachean 15 minutos y caen a datasets locales cuando la red falla.
- La navegación sticky con anclas permite saltar a cada bloque, cumpliendo con el flujo “OnePage”.
- La sección En Vivo usa SWR con revalidación manual y muestra sample local si no hay proveedor accesible.
- Luxon convierte horarios a la zona del usuario (fallback Córdoba) para countdown y calendario.

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
        •       /#hero · /#live · /#calendario · /#pilotos · /#escuderias · /#autos · /#cubiertas · /#banderas · /#clima · /#res
ultados · /#acerca

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
