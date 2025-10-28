import { Temporal } from "@js-temporal/polyfill";

function getUserTimeZone() {
  try {
    return Temporal.Now.timeZoneId();
  } catch (error) {
    return "UTC";
  }
}

export function toUserZonedDateTime(
  isoString: string,
  circuitTimeZone: string,
  userTimeZone?: string
) {
  try {
    const zoned = Temporal.ZonedDateTime.from({
      timeZone: circuitTimeZone,
      plainDateTime: Temporal.PlainDateTime.from(isoString)
    });
    return zoned.withTimeZone(userTimeZone ?? getUserTimeZone());
  } catch (error) {
    const fallback = Temporal.ZonedDateTime.from({
      timeZone: "UTC",
      plainDateTime: Temporal.PlainDateTime.from(isoString)
    });
    return fallback.withTimeZone(userTimeZone ?? getUserTimeZone());
  }
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
