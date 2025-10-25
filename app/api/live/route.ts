import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PLACEHOLDER = {
  available: false,
  message:
    "Live timing deshabilitado. Configura LIVE_API_URL y LIVE_API_TOKEN para habilitar la transmisión oficial.",
  updatedAt: new Date().toISOString(),
  entries: [] as Array<{
    position: number;
    driver: string;
    gap: string;
    tyre: string;
    lastLap: string;
  }>
};

export async function GET() {
  const url = process.env.LIVE_API_URL;
  const token = process.env.LIVE_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json(PLACEHOLDER, { headers: { "Cache-Control": "no-store" } });
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return NextResponse.json(PLACEHOLDER, { headers: { "Cache-Control": "no-store" } });
  }

  const liveData = await response.json();
  return NextResponse.json({ available: true, ...liveData }, { headers: { "Cache-Control": "no-store" } });
}
