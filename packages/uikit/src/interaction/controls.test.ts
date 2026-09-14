import { describe, it, expect } from "vitest";
import {
  sliderError,
  snapSlider,
  moveSlider,
} from "../components/slider/model";
import {
  dateNumber,
  dateString,
  addDays,
  addMonths,
  monthDays,
  calendarError,
  rangeError,
  chooseRange,
} from "../components/calendar/model";
describe("precise controls", () => {
  it("snaps decimal values relative to the lower bound", () => {
    const b = { min: 0.1, max: 1, step: 0.05 };
    expect(snapSlider(0.351, b)).toBe(0.35);
    expect(moveSlider(0.35, "right", b)).toBe(0.4);
    expect(snapSlider(20, b)).toBe(1);
  });
  it("reaches a non-grid maximum and reverses by one grid point", () => {
    const b = { min: 0, max: 10, step: 3 };
    expect(moveSlider(9, "right", b)).toBe(10);
    expect(moveSlider(10, "left", b)).toBe(9);
    expect(moveSlider(4, "home", b)).toBe(0);
    expect(moveSlider(4, "end", b)).toBe(10);
  });
  it("rejects bad slider input and handles large keyboard increments", () => {
    expect(sliderError({ min: 0, max: 10, step: 0 }, [1])).toBeTruthy();
    expect(sliderError({ min: 0, max: 10, step: 1 }, [8, 2])).toBeTruthy();
    expect(sliderError({ min: 0, max: 10, step: 1 }, [NaN])).toBeTruthy();
    expect(moveSlider(5, "pageup", { min: 0, max: 100, step: 2 })).toBe(26);
  });
  it("uses calendar days across leap centuries and early years", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("1900-02-28", 1)).toBe("1900-03-01");
    expect(addDays("2000-02-28", 1)).toBe("2000-02-29");
    expect(dateString(dateNumber("0001-01-01"))).toBe("0001-01-01");
    expect(addDays("0001-01-01", -1)).toBeNull();
    expect(addDays("9999-12-31", 1)).toBeNull();
  });
  it("preserves day where possible and clamps short destination months", () => {
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addMonths("9999-12-01", 1)).toBeNull();
  });
  it("builds complete weeks with configurable week start", () => {
    expect(monthDays("2024-02")).toHaveLength(42);
    expect(monthDays("2024-02")[0]).toBe("2024-01-29");
    expect(monthDays("2024-02", 0)[0]).toBe("2024-01-28");
    expect(monthDays("0001-01", 0)[0]).toBeNull();
    expect(calendarError("2024-13")).toBeTruthy();
    expect(calendarError("2024-02", "2024-03-01", "2024-02-01")).toBeTruthy();
  });
  it("orders reversed range clicks and starts a new range after completion", () => {
    expect(
      chooseRange({ start: "2024-02-12", end: null }, "2024-02-10"),
    ).toEqual({ start: "2024-02-10", end: "2024-02-12" });
    expect(
      chooseRange({ start: "2024-02-10", end: "2024-02-12" }, "2024-02-18"),
    ).toEqual({ start: "2024-02-18", end: null });
  });
  it("checks every day of a bounded range including disabled interiors", () => {
    const r = { start: "2024-02-10", end: "2024-02-15" };
    expect(
      rangeError(r, undefined, undefined, (d) => d === "2024-02-13"),
    ).toMatch(/unavailable/);
    expect(rangeError(r, undefined, undefined, undefined, 5)).toMatch(
      /at most/,
    );
    expect(rangeError(r, undefined, undefined, undefined, 6)).toBeNull();
    expect(rangeError({ start: null, end: "2024-02-15" })).toBeTruthy();
    expect(
      rangeError(
        { start: null, end: null },
        undefined,
        undefined,
        undefined,
        Infinity,
      ),
    ).toBeTruthy();
  });
});
