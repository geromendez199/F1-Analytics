import { NextResponse } from "next/server";
import { getLiveSample } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const OPENF1_BASE = "https://api.openf1.org/v1";

const PLACEHOLDER = {
  available: false,
  message:
    "Live timing deshabilitado. Configura LIVE_API_URL y LIVE_API_TOKEN o habilita el proveedor OpenF1.",
  updatedAt: new Date().toISOString(),
  entries: [] as Array<{
    position: number;
    driver: string;
    gap: string;
    tyre: string;
    lastLap: string;
  }>
};

async function fetchCustomProvider(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Proveedor externo respondió ${response.status}`);
  }

  return response.json();
}

async function fetchOpenF1Live() {
  const params = new URLSearchParams({ session: "Race", status: "Active", order: "desc", limit: "1" });
  let sessionResponse = await fetch(`${OPENF1_BASE}/sessions?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 5 }
  });

  let sessions = sessionResponse.ok ? await sessionResponse.json() : [];

  if (!Array.isArray(sessions) || sessions.length === 0) {
    const fallbackParams = new URLSearchParams({ session: "Race", status: "Completed", order: "desc", limit: "1" });
    sessionResponse = await fetch(`${OPENF1_BASE}/sessions?${fallbackParams.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }
    });
    sessions = sessionResponse.ok ? await sessionResponse.json() : [];
  }

  const session = Array.isArray(sessions) ? sessions[0] : undefined;
  if (!session?.session_key) {
    return null;
  }

  const positionsResponse = await fetch(
    `${OPENF1_BASE}/position?session_key=${session.session_key}&order=asc&limit=20`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 5 }
    }
  );

  if (!positionsResponse.ok) {
    return null;
  }

  const positions = await positionsResponse.json();
  if (!Array.isArray(positions) || !positions.length) {
    return null;
  }

  const entries = positions
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .slice(0, 20)
    .map((item: any) => ({
      position: Number.parseInt(item.position, 10) || 0,
      driver: item.driver ?? item.driver_number ?? "N/D",
      gap: item.gap_to_leader ?? item.interval ?? "-",
      tyre: item.tyre_compound ?? item.tyre ?? "",
      lastLap: item.last_lap_time ?? item.best_lap_time ?? ""
    }));

  return {
    available: true,
    message: `Datos OpenF1 · ${session.year} ${session.event_name}`,
    updatedAt: new Date().toISOString(),
    entries
  };
}

export async function GET() {
  const url = process.env.LIVE_API_URL;
  const token = process.env.LIVE_API_TOKEN;

  try {
    if (url && token) {
      const liveData = await fetchCustomProvider(url, token);
      return NextResponse.json({ available: true, ...liveData }, { headers: { "Cache-Control": "no-store" } });
    }

    const openF1Data = await fetchOpenF1Live();
    if (openF1Data) {
      return NextResponse.json(openF1Data, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (error) {
    console.error("Live timing error", error);
  }

  const sample = getLiveSample();
  return NextResponse.json(sample ?? PLACEHOLDER, { headers: { "Cache-Control": "no-store" } });
}
