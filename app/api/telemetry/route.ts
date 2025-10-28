import { NextResponse } from "next/server";
import { fetchTelemetry } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 30;

export async function GET() {
  const telemetry = await fetchTelemetry().catch(() => null);
  return NextResponse.json({ telemetry });
}
