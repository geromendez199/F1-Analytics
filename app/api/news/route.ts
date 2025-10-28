import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/services";
import { resolveLocale } from "@/lib/i18n";

export const runtime = "edge";
export const revalidate = 15 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = resolveLocale(searchParams.get("lang"));
  const query = searchParams.get("q") ?? "Formula 1";

  const articles = await fetchNews(query, locale === "es" ? "es" : "en").catch(() => []);
  return NextResponse.json({ articles });
}
