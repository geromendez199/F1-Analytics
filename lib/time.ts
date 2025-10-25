import { DateTime } from "luxon";

const DEFAULT_TZ = "America/Argentina/Cordoba";

export function toUserZonedDateTime(isoString: string, circuitTimeZone: string, userTimeZone?: string) {
  const hasOffset = /[+-]\d{2}:\d{2}|Z$/u.test(isoString);
  const base = hasOffset
    ? DateTime.fromISO(isoString)
    : DateTime.fromISO(isoString, { zone: circuitTimeZone });
  const valid = base.isValid
    ? base
    : DateTime.fromISO(isoString, { zone: circuitTimeZone });
  return valid.setZone(userTimeZone ?? DEFAULT_TZ);
}

export function formatDateTime(date: DateTime) {
  return date.setLocale("es").toLocaleString({
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function countdown(target: DateTime) {
  const now = DateTime.now().setZone(target.zone);
  if (now >= target) {
    return "En vivo";
  }
  const diff = target.diff(now, ["days", "hours", "minutes"]).toObject();
  const days = Math.max(Math.floor(diff.days ?? 0), 0);
  const hours = Math.max(Math.floor(diff.hours ?? 0), 0);
  const minutes = Math.max(Math.floor(diff.minutes ?? 0), 0);
  return `${days}d ${hours}h ${minutes}m`;
}
