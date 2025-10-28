import { Temporal } from "@js-temporal/polyfill";
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

export function getGrandPrixByRound(round: number): GrandPrix | undefined {
  return getSchedule().find((gp) => gp.round === round);
}

export function getNextGrandPrix(reference?: Temporal.Instant): GrandPrix | undefined {
  const instant = reference ?? Temporal.Now.instant();
  return getSchedule().find((grandPrix) => {
    const race = grandPrix.sessions.find((session) => session.type === "RACE") ?? grandPrix.sessions[0];
    if (!race) {
      return false;
    }
    const raceZoned = Temporal.ZonedDateTime.from({
      timeZone: grandPrix.circuit.tz,
      plainDateTime: Temporal.PlainDateTime.from(race.start)
    });
    return Temporal.Instant.compare(raceZoned.toInstant(), instant) > 0;
  });
}

export function getResults(): ResultData {
  return results as ResultData;
}

export function getSampleWeather(): WeatherData {
  return weatherSample as WeatherData;
}
