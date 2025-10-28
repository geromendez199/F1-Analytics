import { NextResponse } from "next/server";
import { resolveLocale } from "@/lib/i18n";
import {
  getDefaultSeasonYear,
  getGrandPrixByRound,
  getNextGrandPrix,
  getWeatherForGrandPrix
} from "@/lib/data";
import type { WeatherData } from "@/lib/types";

export const runtime = "edge";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roundParam = searchParams.get("gp");
  const locale = resolveLocale(searchParams.get("lang"));
  const season = getDefaultSeasonYear();
  let grandPrix = null;
  if (roundParam) {
    const roundNumber = Number.parseInt(roundParam, 10);
    if (!Number.isNaN(roundNumber)) {
      grandPrix = await getGrandPrixByRound(roundNumber, season);
    }
  }
  if (!grandPrix) {
    grandPrix = await getNextGrandPrix(undefined, season);
  }

  if (!grandPrix) {
    return NextResponse.json(
      {
        season,
        weather: {
          now: { temperature: 0, description: "No schedule", wind: 0, humidity: 0 },
          forecast: [] as WeatherData["forecast"]
        },
        live: false
      },
      { status: 404 }
    );
  }

  const payload = await getWeatherForGrandPrix(grandPrix, locale).catch(() => ({
    live: false,
    weather: {
      now: {
        temperature: 22,
        description: "Weather provider unavailable",
        wind: 10,
        humidity: 60
      },
      forecast: []
    }
  }));

  return NextResponse.json({
    season,
    round: grandPrix.round,
    circuit: grandPrix.circuit,
    ...payload
  });
}
