F1 Análisis — OnePage de datos en vivo de Fórmula 1

Objetivo: Una Single Page App (SPA) rápida y moderna que concentre toda la información en vivo de la F1: Pilotos, Escuderías, Clima, Horarios, Autos, Cubiertas, Banderas, Resultados y Tiempos (cuando la fuente lo permita), con soporte multidioma y PWA.

⸻

🚀 Stack elegido (2025)
	•	Lenguaje: TypeScript
	•	Framework web: Next.js 15 (App Router) — por rendimiento, SEO, streaming (RSC) y fácil despliegue en Vercel.
	•	Runtime: Edge para APIs de lectura pública + Node donde se requiera.
	•	UI: Tailwind CSS + Headless UI (accesibilidad).
	•	Estado / datos: TanStack Query (SWR en cliente) + RSC para datos cacheables.
	•	Tiempo / TZ: @js-temporal/polyfill para zonas horarias y conversión robusta (usuario por defecto: America/Argentina/Cordoba).
	•	Iconos: Heroicons + set de Banderas (SVG).
	•	PWA: workbox + manifest para “Agregar a inicio”.
	•	Analítica: Plausible (o alternativa sin cookies).
	•	Opcional (cache persistente): Supabase (KV/DB) o Vercel KV para rate limiting y memoización de respuestas.

¿Por qué TypeScript + Next.js? Entrega la mejor DX, SSR/SSG/ISR híbrido, edge functions para latencia mínima y una SPA “OnePage” con SEO real gracias a RSC. Perfecto para datos en vivo y contenido anclado por secciones.

⸻

🌐 Fuentes de datos (modular)

Este proyecto no está afiliado a F1/FIA. Todas las fuentes son terceros y pueden cambiar.

	•	Calendario y resultados históricos: API pública histórica (p.ej., Ergast—limitada a 2023) u otros proveedores equivalentes.
	•	Clima por circuito: OpenWeatherMap / Tomorrow.io (pronóstico y “ahora”).
	•	Estado en vivo (opcional): proveedor “live timing” no oficial (REST/WebSocket) si está disponible legalmente.
	•	Neumáticos y compuestos: endpoints/feeds públicos o scrapers de notas de Pirelli (siempre respetando términos).
	•	Metadatos (pilotos/escuderías/autos): dataset estático versionado en /data + enriquecimiento vía API si procede.

El README asume clima y calendario garantizados; “live timing” queda opcional y detrás de una bandera de features.

⸻

🧭 Estructura de la OnePage

Secciones ancladas (/#section), navegación sticky y scroll suave:
	1.	Hero — Búsqueda rápida, próxima carrera con hora local, clima y cuenta regresiva.
	2.	En Vivo (si disponible) — Tiempos, intervalos, gomas, banderas, incidentes (auto-refresco / WebSocket).
	3.	Calendario — Fechas de GP con conversión de zona horaria del usuario, sesiones (FP1–FP3, Sprint, Qualy, Race).
	4.	Pilotos — Fichas con foto, número, nacionalidad, puntos y comparativas intra-equipo.
	5.	Escuderías — Livery, pilotos, posiciones, puntos, evolución.
	6.	Autos — Especificaciones por temporada (peso, ERS, aero—si la fuente lo permite).
	7.	Cubiertas — C0–C5, uso por stint, selección Pirelli por GP.
	8.	Banderas — Significado (verde, amarilla, roja, SC, VSC, azul, blanca, etc.) con iconografía clara.
	9.	Clima — Pronóstico por sesión (temp/lluvia/viento), ahora en el circuito.
	10.	Resultados — Última carrera y topline de temporadas previas.
	11.	Acerca — Fuentes, licencia, disclaimer.

⸻

🏗️ Arquitectura
	•	Front (OnePage): RSC para “calendario/pilotos/escuderías” (cacheables) + TanStack Query para “en vivo” (refetch/WS).
	•	APIs internas (/app/api/*):
	•	/api/schedule — calendario normalizado.
	•	/api/weather?gp=<round> — pronóstico por circuito + “ahora”.
	•	/api/standings — pilotos/constructores.
	•	/api/live — proxy/WS a proveedor live (habilitable por env var).
	•	Cache: Cache-Control, revalidación ISR y KV opcional.
	•	TZ/Fechas: Temporal.ZonedDateTime con la TZ del usuario; fallback a America/Argentina/Cordoba.
	•	Accesibilidad: roles/labels, contraste AA+, navegación por teclado.
	•	Rendimiento: imágenes optimizadas, streaming, code-splitting, prioridad en fuentes críticas.

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
├─ data/                       # datasets estáticos (pilotos, teams, circuitos)
├─ lib/                        # fetchers, mapeos, helpers Temporal
├─ public/flags/               # SVG banderas
├─ public/liveries/            # livery por temporada
├─ styles/                     # Tailwind CSS
└─ next.config.mjs


⸻

🧩 Diseño de datos (interfaces clave)
	•	Driver: id, code, name, number, country, teamId, points, photo.
	•	Team: id, name, powerUnit?, livery, drivers[], points.
	•	Circuit: id, name, location, tz, geo, round.
	•	Session: type (FP1|FP2|FP3|SPRINT|QUALY|RACE), startZoned, endZoned.
	•	Weather: now, forecast[] (por sesión).
	•	Tyre: compound (C0..C5|INT|WET), stints[] (si hay datos).
	•	Live (opcional): lap, gap, interval, sectorTimes, flag, tyre, pitStatus.

⸻

🕒 Conversión horaria y cuenta regresiva
	•	Todas las sesiones del calendario se guardan en hora local del circuito y se convierten a la TZ del usuario con Temporal.
	•	Countdown se actualiza en tiempo real; si la sesión está en curso, cambia a “en vivo”.
	•	El usuario puede fijar TZ manualmente (persistimos en localStorage).

⸻

📲 PWA & offline
	•	Instalación en iOS/Android/desktop.
	•	Offline: último calendario, banderas, pilotos/teams y la última consulta de clima se guardan para lectura sin conexión.
	•	El bloque En Vivo se desactiva offline y se re-intenta al volver la conectividad.

⸻

🧪 Calidad
	•	Lighthouse ≥ 95 en Performance/SEO/Best Practices/Accessibility.
	•	Testing: Playwright (e2e anclas, navegación), Vitest (utils/timezones).
	•	CI/CD: Vercel + GitHub Actions (lint, typecheck, tests).

⸻

🛡️ Legal y ética
	•	No oficial: marcas y logos pertenecen a sus dueños.
	•	Respetar Términos de uso de cada API. Evitar scraping si lo prohíben.
	•	Implementar rate limiting y cache para reducir huella.

⸻

🧰 Desarrollo local

pnpm i
pnpm dev
# abrir http://localhost:3000

Build:

pnpm build && pnpm start


⸻

☁️ Despliegue
	•	Vercel (recomendado).
	•	Setear variables en el panel (clima/live).
	•	Activar Edge Runtime donde proceda.
	•	Configurar revalidación (ISR) en rutas cacheables.

⸻

🗺️ Roadmap
	•	Conectar proveedor live timing (cuando esté disponible legalmente).
	•	Telemetría básica por vuelta (si la fuente lo permite).
	•	Modo comparador (piloto vs piloto, stint vs stint).
	•	Exportar a .ics las sesiones del GP.
	•	Notificaciones push antes de cada sesión (PWA).

⸻

🧷 Accesos rápidos (secciones)
	•	/#hero · /#live · /#calendario · /#pilotos · /#escuderias · /#autos · /#cubiertas · /#banderas · /#clima · /#resultados · /#acerca

⸻

📄 Licencia

Código bajo MIT. Contenido y marcas de terceros permanecen bajo sus respectivas licencias.

⸻

🤝 Contribuir
	1.	Crear issue (feature/bug).
	2.	PR con descripción clara y capturas.
	3.	Ejecutar linters/tests.
	4.	Respetar accesibilidad y rendimiento.

⸻

Notas finales
	•	Este README describe la arquitectura y criterios para construir la OnePage F1 Análisis con foco en datos en vivo, rendimiento y confiabilidad.
	•	La integración de fuentes live depende de disponibilidad y términos legales. El proyecto está preparado para activarlas de forma segura y opcional.
