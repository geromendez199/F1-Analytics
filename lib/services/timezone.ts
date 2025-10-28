export interface TimezoneInfo {
  zoneName: string;
  abbreviation?: string;
  gmtOffset?: number;
}

const TIMEZONE_ENDPOINT = "https://api.timezonedb.com/v2.1/get-time-zone";

export async function fetchTimezone(lat: number, lng: number): Promise<TimezoneInfo | null> {
  const apiKey = process.env.TIMEZONEDB_API_KEY;
  if (!apiKey || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const url = new URL(TIMEZONE_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("by", "position");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));

  const response = await fetch(url.toString(), { next: { revalidate: 24 * 60 * 60 } });
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.status !== "OK") {
    return null;
  }

  return {
    zoneName: data.zoneName ?? data.abbreviation ?? "UTC",
    abbreviation: data.abbreviation ?? undefined,
    gmtOffset: typeof data.gmtOffset === "number" ? data.gmtOffset : undefined
  };
}
