import { NextResponse } from "next/server";
import { fetchHighlights } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "Formula 1 Highlights";
  const maxResults = Number.parseInt(searchParams.get("limit") ?? "6", 10) || 6;

  const videos = await fetchHighlights(query, maxResults).catch(() => []);
  return NextResponse.json({ videos });
}
