# F1 Analytics — Landing de datos en vivo

Aplicación web construida con Next.js 15 y TypeScript para concentrar estadísticas y feeds en vivo de la Fórmula 1. El objetivo es ofrecer una "one page" con navegación por anclas que cubra la temporada 2025 (y posteriores) con actualizaciones en tiempo real, soporte multidioma, PWA e integraciones con proveedores oficiales.

---

## 🚀 Stack principal

- **Framework:** Next.js 15 (App Router, React Server Components, ISR, Edge Runtime).
- **Lenguaje:** TypeScript con estricta verificación de tipos.
- **UI:** Tailwind CSS + Headless UI + Heroicons.
- **Estado de datos:** RSC para datos cacheables + TanStack Query (SWR) en secciones en vivo.
- **Fechas / TZ:** [`@js-temporal/polyfill`](https://github.com/js-temporal/temporal-polyfill) para cálculos robustos de zona horaria.
- **PWA:** Workbox + manifiesto con iconografía (incluye banderas de países).
- **Analytics:** Plausible (desactivable).

---

## 🌐 Fuentes de datos

Las credenciales y URL base se gestionan en [`apis.config.json`](./apis.config.json). Los secretos se inyectan vía variables de entorno y nunca se exponen en el cliente.

| Dominio | Uso | Notas |
| --- | --- | --- |
| [Jolpica Ergast](https://api.jolpi.ca/ergast/f1/) / [Ergast](http://ergast.com/api/f1) | Calendario, standings, pilotos, constructores. | Compatibles entre sí; Jolpica ofrece mejor límite de peticiones. |
| [OpenF1](https://api.openf1.org/v1) | Posiciones en vivo y telemetría histórica. | Se requiere `OPENF1_SESSION_KEY` para datos live. |
| [SportMonks F1](https://f1.sportmonks.com/api/) | Opcional para enriquecer con metadatos extra. | Token configurable. |
| [OpenWeatherMap](https://api.openweathermap.org/data/2.5/weather) | Clima en el circuito de la próxima carrera. | Necesita `OPENWEATHER_API_KEY`. |
| [Formula 1 Live API (RapidAPI)](https://rapidapi.com/) | Estado de pista y banderas. | Clave `RAPIDAPI_F1LIVE_KEY`. |
| [NewsAPI](https://newsapi.org/) | Titulares recientes. | Idioma configurable. |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | Clips oficiales y highlights. | Búsqueda por palabra clave. |
| [Wikipedia Commons API](https://www.mediawiki.org/wiki/API:Page_images) | Imágenes de pilotos y escuderías. | Se usa como fallback libre. |
| [TimeZoneDB](https://timezonedb.com/api) | Conversión de coordenadas → zona horaria. | Optimiza la conversión a horario local. |

---

## 🧭 Secciones de la landing

1. **Hero** – Buscador unificado y próxima carrera con cuenta regresiva y conversión horaria al usuario.
2. **En vivo** – Tabla de posiciones, intervalos y gomas (refresco automático vía TanStack Query).
3. **Calendario** – Temporada 2025 completa con todas las sesiones (FP, Sprint, Qualy, Race) convertidas al huso horario del usuario.
4. **Pilotos** – Fichas con foto (Wikipedia Commons), puntos y equipo actual.
5. **Escuderías** – Liveries, pilotos asignados y puntos.
6. **Autos** – Especificaciones destacadas (texto informativo).
7. **Cubiertas** – Selección base C0–C5 + compuestos de lluvia.
8. **Banderas** – Glosario accesible con estado de pista live si está disponible RapidAPI.
9. **Clima** – Pronóstico actual para el circuito de la próxima carrera.
10. **Resultados** – Última carrera + standings de pilotos y constructores.
11. **Noticias** – Titulares recientes filtrados por idioma.
12. **Highlights** – Videos oficiales desde YouTube.
13. **Telemetría** – Extracto de telemetría OpenF1 (top speed, activaciones DRS, etc.).
14. **About** – Licencias, fuentes y disclaimer.

---

## 🏗️ Arquitectura de datos

- [`lib/api.ts`](./lib/api.ts) centraliza los fetchers a proveedores externos usando `fetch` en el Edge Runtime. Implementa:
  - Reintentos con backoff.
  - Normalización de respuestas (drivers, constructores, calendario, clima, noticias, highlights, live timing y telemetría).
  - Caching vía `fetch` con `revalidate` y `React.cache` para evitar llamadas duplicadas.
- [`lib/data.ts`](./lib/data.ts) expone helpers de más alto nivel (schedule por temporada, próxima carrera, asociaciones equipo ↔ piloto, clima por circuito) y define el año por defecto (>= 2025).
- [`lib/time.ts`](./lib/time.ts) usa Temporal para convertir horarios de circuito a la zona horaria del usuario detectada dinámicamente.
- Componentes RSC (Hero, Calendar, Drivers, Teams, Results, Weather, etc.) consumen directamente las funciones asíncronas y renderizan con streaming.
- El componente **Live** (client) utiliza TanStack Query (`react-query`) para refrescar `/api/live` cada 15 s.

### Rutas API internas

| Ruta | Descripción |
| --- | --- |
| `/api/schedule` | Devuelve la temporada normalizada (24 carreras, sesiones y TZ). |
| `/api/standings` | Standings de pilotos y constructores. |
| `/api/weather` | Clima en el circuito objetivo (próxima carrera o `gp=?`). |
| `/api/live` | Proxy a OpenF1 para live timing con fallback informativo. |

Todas las rutas usan `Edge Runtime`, responden JSON y reutilizan los fetchers de `lib/api.ts`.

---

## 🔧 Configuración (.env.local)

```ini
# Proveedores core
OPENWEATHER_API_KEY=your_openweather_key
NEWS_API_KEY=your_newsapi_key
YOUTUBE_API_KEY=your_youtube_api_key
TIMEZONEDB_API_KEY=your_timezonedb_key

# OpenF1 (datos live / telemetría)
OPENF1_SESSION_KEY=9159

# RapidAPI Formula 1 Live
RAPIDAPI_F1LIVE_KEY=your_rapidapi_key
RAPIDAPI_F1LIVE_URL=https://formula-1-live-motorsport-data.p.rapidapi.com
RAPIDAPI_F1LIVE_HOST=formula-1-live-motorsport-data.p.rapidapi.com

# Opcionales
SPORTMONKS_API_TOKEN=
F1_ANALYTICS_USER_AGENT="F1 Analytics (contact: ops@example.com)"
NEXT_PUBLIC_BASE_URL=https://f1-analytics.example.com
```

> **Tip:** Para trabajar con otra temporada, ajusta `getDefaultSeasonYear()` en `lib/data.ts` o pasa el año explícitamente a los helpers.

---

## ▶️ Scripts

```bash
pnpm install          # instala dependencias
pnpm dev              # modo desarrollo (http://localhost:3000)
pnpm lint             # ESLint
pnpm test             # Vitest (utilidades)
pnpm test:e2e         # Playwright (navegación por anclas)
```

En entornos sin conexión a internet, los scripts que requieren descargar dependencias externas pueden fallar; ejecuta `pnpm install --offline` si ya tenías cache.

---

## 📦 Estructura relevante

```
app/
  page.tsx                 # composición de secciones
  api/
    live/route.ts          # live timing proxy
    schedule/route.ts      # calendario normalizado
    standings/route.ts     # standings
    weather/route.ts       # clima por circuito
  (sections)/              # componentes por sección
components/
  LocaleProvider.tsx       # contexto de idioma
  QuickSearch.tsx          # buscador client-side
lib/
  api.ts                   # integraciones externas
  data.ts                  # helpers agregados
  time.ts                  # Temporal helpers
public/
  liveries/                # placeholders y assets
  flags/                   # banderas SVG
apis.config.json           # URLs base de APIs externas
```

---

## 🌍 PWA & rendimiento

- Manifesto con iconos e idiomas, precache con Workbox (`/sw.js`).
- Cache de rutas API mediante `fetch` con `revalidate` para lograr un modo offline básico.
- Streaming RSC, pocas dependencias en cliente y `React.lazy` donde aplica.

---

## 🚀 Despliegue / testing manual

1. `pnpm install`
2. Configura `.env.local` con las claves necesarias (al menos `OPENWEATHER_API_KEY` para clima y `NEWS_API_KEY` / `YOUTUBE_API_KEY` si quieres contenido en vivo).
3. `pnpm dev` para entorno local.
4. Para build productivo: `pnpm build && pnpm start` (se sirve en el puerto 3000 por defecto).
5. Registra la PWA accediendo a la página y aceptando el prompt de instalación.

---

## ⚖️ Licencia

MIT. No es un proyecto oficial de Formula 1 / FIA. Respeta los Términos de uso de cada API (límite de peticiones, atribución y uso no comercial).
