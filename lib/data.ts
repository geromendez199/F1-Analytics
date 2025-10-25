import drivers from "../data/drivers.json" assert { type: "json" };
import teams from "../data/teams.json" assert { type: "json" };
import schedule from "../data/schedule.json" assert { type: "json" };
import results from "../data/results.json" assert { type: "json" };
import weatherSample from "../data/weather-sample.json" assert { type: "json" };
import type { Driver, GrandPrix, ResultData, Team, WeatherData } from "./types";

export function getDrivers(): Driver[] {
  return drivers as Driver[];
}

export function getTeams(): Team[] {
  return teams as Team[];
}

export function getSchedule(): GrandPrix[] {
  return schedule as GrandPrix[];
}

export function getResults(): ResultData {
  return results as ResultData;
}

export function getSampleWeather(): WeatherData {
  return weatherSample as WeatherData;
}
