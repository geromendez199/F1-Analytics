export type SessionType = "FP1" | "FP2" | "FP3" | "SPRINT" | "QUALY" | "RACE";

export interface Driver {
  id: string;
  code: string;
  name: string;
  number: number;
  country: string;
  teamId: string;
  points: number;
  photo?: string;
}

export interface Team {
  id: string;
  name: string;
  powerUnit?: string;
  livery: string;
  drivers: string[];
  points: number;
}

export interface Circuit {
  id: string;
  name: string;
  location: string;
  tz: string;
  geo: {
    lat: number;
    lng: number;
  };
}

export interface Session {
  type: SessionType;
  start: string;
  end: string;
}

export interface GrandPrix {
  round: number;
  grandPrix: string;
  circuit: Circuit;
  sessions: Session[];
}

export interface WeatherNow {
  temperature: number;
  description: string;
  wind: number;
  humidity: number;
}

export interface WeatherForecastItem {
  session: SessionType;
  temperature: number;
  chanceOfRain: number;
}

export interface WeatherData {
  now: WeatherNow;
  forecast: WeatherForecastItem[];
}

export interface ResultData {
  lastRace: {
    grandPrix: string;
    date: string;
    winner: {
      driverId: string;
      time: string;
    };
    podium: Array<{
      position: number;
      driverId: string;
      teamId: string;
    }>;
  };
  season: {
    year: number;
    driverStandings: Array<{
      position: number;
      driverId: string;
      points: number;
    }>;
    constructorStandings: Array<{
      position: number;
      teamId: string;
      points: number;
    }>;
  };
}
