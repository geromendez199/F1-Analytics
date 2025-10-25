import { NextResponse } from "next/server";
import { getSchedule } from "@/lib/data";

export const runtime = "edge";
export const revalidate = 60 * 60; // 1 hora

export async function GET() {
  const schedule = getSchedule();
  return NextResponse.json({ schedule });
}
