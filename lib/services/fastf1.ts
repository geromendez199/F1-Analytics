export interface LiveTimingEntry {
  position: number;
  driver: string;
  gap: string;
  tyre: string;
  lastLap: string;
}

export interface LiveTimingResponse {
  available: boolean;
  updatedAt: string;
  entries: LiveTimingEntry[];
  message?: string;
}

const FALLBACK: LiveTimingResponse = {
  available: false,
  updatedAt: new Date(0).toISOString(),
  entries: [],
  message: "FastF1 service not configured"
};

export async function fetchLiveTiming(): Promise<LiveTimingResponse> {
  const base = process.env.FASTF1_SERVICE_URL ?? process.env.LIVE_API_URL;
  if (!base) {
    return FALLBACK;
  }

  const token = process.env.LIVE_API_TOKEN;
  const url = base.endsWith("/live") || base.endsWith("/live/") ? base : `${base.replace(/\/$/, "")}/live`;

  const response = await fetch(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    return FALLBACK;
  }

  const payload = await response.json();
  return {
    available: Boolean(payload.available ?? payload.entries?.length),
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString(),
    entries: Array.isArray(payload.entries)
      ? payload.entries.map((entry: any, index: number) => ({
          position: Number.isFinite(Number(entry.position)) ? Number(entry.position) : index + 1,
          driver: entry.driver ?? "-",
          gap: entry.gap ?? "-",
          tyre: entry.tyre ?? entry.compound ?? "-",
          lastLap: entry.lastLap ?? entry.last ?? "-"
        }))
      : [],
    message: typeof payload.message === "string" ? payload.message : undefined
  };
}

export interface TelemetryDatum {
  driver: string;
  fastestLap?: string;
  topSpeedKmh?: number;
  drsActivations?: number;
  sectors?: Array<{
    sector: number;
    time: string;
  }>;
}

export interface TelemetryResponse {
  available: boolean;
  updatedAt: string;
  session?: string;
  entries: TelemetryDatum[];
  message?: string;
}

const TELEMETRY_FALLBACK: TelemetryResponse = {
  available: false,
  updatedAt: new Date(0).toISOString(),
  entries: [],
  message: "FastF1 telemetry endpoint not configured"
};

export async function fetchTelemetry(): Promise<TelemetryResponse> {
  const base = process.env.FASTF1_SERVICE_URL;
  if (!base) {
    return TELEMETRY_FALLBACK;
  }

  const url = `${base.replace(/\/$/, "")}/telemetry`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return TELEMETRY_FALLBACK;
  }

  const payload = await response.json();
  return {
    available: Boolean(payload.available ?? payload.entries?.length),
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString(),
    session: typeof payload.session === "string" ? payload.session : undefined,
    entries: Array.isArray(payload.entries)
      ? payload.entries.map((entry: any) => ({
          driver: entry.driver ?? entry.Driver ?? "-",
          fastestLap: entry.fastestLap ?? entry.fastest ?? undefined,
          topSpeedKmh: typeof entry.topSpeedKmh === "number" ? entry.topSpeedKmh : undefined,
          drsActivations: typeof entry.drsActivations === "number" ? entry.drsActivations : undefined,
          sectors: Array.isArray(entry.sectors)
            ? entry.sectors.map((sector: any, index: number) => ({
                sector: Number.isFinite(Number(sector.sector)) ? Number(sector.sector) : index + 1,
                time: sector.time ?? "-"
              }))
            : undefined
        }))
      : [],
    message: typeof payload.message === "string" ? payload.message : undefined
  };
}
