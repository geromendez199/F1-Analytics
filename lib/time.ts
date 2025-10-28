import { Temporal } from "@js-temporal/polyfill";

const DEFAULT_TZ = "America/Argentina/Cordoba";

export function toUserZonedDateTime(
  isoString: string,
  circuitTimeZone: string,
  userTimeZone?: string
) {
  const zoned = Temporal.ZonedDateTime.from({
    timeZone: circuitTimeZone,
    plainDateTime: Temporal.PlainDateTime.from(isoString)
  });

  return zoned.withTimeZone(userTimeZone ?? DEFAULT_TZ);
}

export function formatDateTime(zdt: Temporal.ZonedDateTime, locale?: string) {
  return zdt.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function countdown(
  target: Temporal.ZonedDateTime,
  liveLabel = "En vivo",
  now: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO(target.timeZone)
) {
  if (Temporal.ZonedDateTime.compare(now, target) >= 0) {
    return liveLabel;
  }
  const diff = target.since(now, { largestUnit: "day" });
  const days = Math.max(diff.days, 0);
  const hours = Math.max(diff.hours, 0);
  const minutes = Math.max(diff.minutes, 0);
  return `${days}d ${hours}h ${minutes}m`;
}
