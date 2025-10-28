import { describe, expect, it } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { countdown, formatDateTime, toUserZonedDateTime } from "@/lib/time";

describe("time helpers", () => {
  it("converts circuit dates to the user timezone", () => {
    const result = toUserZonedDateTime("2024-03-02T18:00:00", "Asia/Bahrain", "Europe/Madrid");
    expect(result.timeZoneId).toBe("Europe/Madrid");
  });

  it("formats zoned date times with the default locale options", () => {
    const zoned = Temporal.ZonedDateTime.from({
      timeZone: "Europe/Paris",
      year: 2024,
      month: 7,
      day: 5,
      hour: 14,
      minute: 30
    });
    const expected = zoned.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    expect(formatDateTime(zoned)).toBe(expected);
    const expectedEs = zoned.toLocaleString("es", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    expect(formatDateTime(zoned, "es")).toBe(expectedEs);
  });

  it("computes countdowns with a custom live label", () => {
    const target = Temporal.ZonedDateTime.from({
      timeZone: "UTC",
      year: 2024,
      month: 9,
      day: 1,
      hour: 15,
      minute: 0
    });
    const now = target.subtract({ hours: 5, minutes: 15 });
    expect(countdown(target, "Live", now)).toBe("0d 5h 15m");
    expect(countdown(target, "Live", target)).toBe("Live");
  });
});
