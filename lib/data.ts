import { Temporal } from "@js-temporal/polyfill";
import {
  fetchDrivers,
  fetchTeams,
  fetchSeasonSchedule,
  getGrandPrixByRound as apiGetGrandPrixByRound,
  getNextGrandPrix as apiGetNextGrandPrix,
  getSchedule as apiGetSchedule,
  getTeamsWithDrivers,
  getWeatherByCircuit
} from "./api";
import type { Driver, GrandPrix, Team, WeatherData } from "./types";

export function getDefaultSeasonYear(): number {
  const current = Temporal.Now.plainDateISO().year;
  return Math.max(current, 2025);
}

export async function getDrivers(season: string | number = "current"): Promise<Driver[]> {
  return fetchDrivers(season);
}

export async function getTeams(season: string | number = "current"): Promise<Team[]> {
  return fetchTeams(season);
}

export async function getTeamsAndDrivers(season: string | number = "current"): Promise<Team[]> {
  return getTeamsWithDrivers(season);
}

export async function getSchedule(season?: number): Promise<GrandPrix[]> {
  return apiGetSchedule(season ?? getDefaultSeasonYear());
}

export async function getGrandPrixByRound(round: number, season?: number): Promise<GrandPrix | undefined> {
  return apiGetGrandPrixByRound(round, season ?? getDefaultSeasonYear());
}

export async function getNextGrandPrix(reference?: Temporal.Instant, season?: number): Promise<GrandPrix | undefined> {
  return apiGetNextGrandPrix(reference, season ?? getDefaultSeasonYear());
}

export async function getWeatherForGrandPrix(
  grandPrix: GrandPrix,
  locale: string
): Promise<{ weather: WeatherData; live: boolean }> {
  return getWeatherByCircuit(grandPrix.circuit, locale);
}

export async function getSeasonSchedule(season?: number) {
  return fetchSeasonSchedule(season ?? getDefaultSeasonYear());
}
