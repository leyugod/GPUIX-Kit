import { describe, expect, it } from "vitest";
import {
  isSelectableTime,
  stepTime,
  timeConfigError,
  timeMinutes,
  timeOptions,
  timeString,
} from "../components/time-input/model";
describe("local minute rules", () => {
  it("strictly parses and round-trips all minutes without dates", () => {
    for (let minute = 0; minute < 1440; minute++)
      expect(timeMinutes(timeString(minute)!)).toBe(minute);
    for (const value of [
      "24:00",
      "9:00",
      "00:60",
      " 09:00",
      "09:00:00",
      "",
      "٠٩:٠٠",
    ])
      expect(timeMinutes(value)).toBeNull();
    for (const minute of [-1, 1440, 1.5, NaN, Infinity])
      expect(timeString(minute)).toBeNull();
  });
  it("rejects invalid configuration and overnight bounds", () => {
    for (const rules of [
      { min: "x" },
      { max: "24:00" },
      { min: "23:00", max: "01:00" },
      { stepMinutes: 0 },
      { stepMinutes: 1.5 },
      { stepMinutes: Infinity },
      { stepMinutes: 1441 },
    ]) {
      expect(timeConfigError(rules)).not.toBeNull();
      expect(timeOptions(rules)).toEqual([]);
      expect(stepTime("12:00", 1, rules)).toBeNull();
      expect(isSelectableTime("12:00", rules)).toBe(false);
    }
  });
  it("aligns steps from min and excludes a non-aligned maximum", () => {
    const rules = { min: "09:07", max: "10:00", stepMinutes: 15 };
    expect(timeOptions(rules)).toEqual(["09:07", "09:22", "09:37", "09:52"]);
    expect(isSelectableTime("09:30", rules)).toBe(false);
    expect(isSelectableTime("09:37", rules)).toBe(true);
    expect(stepTime("09:30", 1, rules)).toBe("09:37");
    expect(stepTime("09:30", -1, rules)).toBe("09:22");
  });
  it("skips disabled slots and handles an entirely unavailable day", () => {
    const rules = {
      min: "11:30",
      max: "13:30",
      stepMinutes: 30,
      isTimeDisabled: (v: string) => v >= "12:00" && v < "13:00",
    };
    expect(timeOptions(rules)).toEqual(["11:30", "13:00", "13:30"]);
    expect(stepTime("11:30", 1, rules)).toBe("13:00");
    expect(stepTime("13:00", -1, rules)).toBe("11:30");
    expect(isSelectableTime("12:00", rules)).toBe(false);
    expect(stepTime("12:00", 1, { isTimeDisabled: () => true })).toBeNull();
  });
  it("clamps at midnight and restores malformed drafts without wrapping", () => {
    expect(timeOptions()).toHaveLength(1440);
    expect(stepTime("23:59", 1)).toBe("23:59");
    expect(stepTime("00:00", -1)).toBe("00:00");
    expect(stepTime("bad", 1)).toBe("00:00");
    expect(stepTime("bad", -1)).toBe("23:59");
    expect(
      timeOptions({ min: "08:05", max: "08:05", stepMinutes: 1440 }),
    ).toEqual(["08:05"]);
  });
});
