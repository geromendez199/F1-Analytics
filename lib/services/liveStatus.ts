export interface TrackStatus {
  flag: string;
  message: string;
  updatedAt: string;
}

const FALLBACK_STATUS: TrackStatus = {
  flag: "N/A",
  message: "Estado de pista no disponible",
  updatedAt: new Date(0).toISOString()
};

export async function fetchTrackStatus(): Promise<TrackStatus> {
  const base = process.env.F1_LIVE_API_URL ?? "https://api-formula-1.p.rapidapi.com";
  const endpoint = process.env.F1_LIVE_API_ENDPOINT ?? "/events/live";
  const apiKey = process.env.F1_LIVE_API_KEY;
  const apiHost = process.env.F1_LIVE_API_HOST ?? "api-formula-1.p.rapidapi.com";

  if (!apiKey) {
    return FALLBACK_STATUS;
  }

  const url = `${base.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return FALLBACK_STATUS;
  }

  const payload = await response.json();
  const event = Array.isArray(payload.response) ? payload.response[0] : payload.response ?? payload;
  const flag = event?.status?.flag ?? event?.status ?? "N/A";
  const message = event?.status?.message ?? event?.statusText ?? event?.message ?? FALLBACK_STATUS.message;
  const updatedAt = event?.status?.timestamp ?? event?.update ?? new Date().toISOString();

  return {
    flag,
    message,
    updatedAt
  };
}
