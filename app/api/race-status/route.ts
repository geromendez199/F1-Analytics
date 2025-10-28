import { NextResponse } from "next/server";
import { fetchTrackStatus } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 30;

export async function GET() {
  const status = await fetchTrackStatus().catch(() => null);
  return NextResponse.json({ status });
}
