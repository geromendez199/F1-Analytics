import { NextResponse } from "next/server";
import { fetchCommonsImages } from "@/lib/services";

export const runtime = "edge";
export const revalidate = 24 * 60 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const titles = searchParams.getAll("title");

  if (!titles.length) {
    return NextResponse.json({ images: [] });
  }

  const images = await fetchCommonsImages(titles).catch(() => []);
  return NextResponse.json({ images });
}
