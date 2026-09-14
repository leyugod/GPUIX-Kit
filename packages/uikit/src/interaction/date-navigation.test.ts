import { expect, it } from "vitest";
import {
  monthPickerError,
  yearPickerError,
  yearPage,
} from "../components/period-picker/model";
import {
  createDateRangePresets,
  completeRangeError,
  dualMonthForDate,
  dualMonthStart,
  presetConfigError,
} from "../components/date-range/model";
it("validates month and year domains and last partial year page", () => {
  expect(monthPickerError(0)).not.toBeNull();
  expect(monthPickerError(2024, "2024-12", "2024-01")).not.toBeNull();
  expect(monthPickerError(2024, "")).not.toBeNull();
  expect(yearPickerError(2024, 1900, 2100)).toBeNull();
  expect(yearPickerError(1.5)).not.toBeNull();
  expect(yearPage(1)).toBe(1);
  expect(yearPage(9999)).toBe(9997);
});
it("keeps dual-month windows bounded and preserves an already visible date", () => {
  expect(dualMonthStart("9999-12")).toBe("9999-11");
  expect(dualMonthStart("bad")).toBeNull();
  expect(dualMonthForDate("2024-02", "2024-03-01")).toBe("2024-02");
  expect(dualMonthForDate("2024-02", "2024-04-01")).toBe("2024-03");
  expect(dualMonthForDate("2024-02", "2024-01-31")).toBe("2024-01");
  expect(dualMonthForDate("9999-11", "9999-12-31")).toBe("9999-11");
  expect(dualMonthForDate("0001-01", "0001-01-01")).toBe("0001-01");
});
it("generates deterministic inclusive presets across leap years and week starts", () => {
  const p = createDateRangePresets("2024-03-01");
  expect(p.find((p) => p.id === "last-month")?.value).toEqual({
    start: "2024-02-01",
    end: "2024-02-29",
  });
  expect(p.find((p) => p.id === "last-7-days")?.value).toEqual({
    start: "2024-02-24",
    end: "2024-03-01",
  });
  expect(p.find((p) => p.id === "this-week")?.value).toEqual({
    start: "2024-02-26",
    end: "2024-03-03",
  });
  expect(
    createDateRangePresets("2024-03-01", 0).find((p) => p.id === "this-week")
      ?.value.start,
  ).toBe("2024-02-25");
});
it("omits out-of-domain presets and rejects invalid references", () => {
  expect(createDateRangePresets("bad")).toEqual([]);
  expect(
    createDateRangePresets("0001-01-01").some((p) => p.id === "last-month"),
  ).toBe(false);
  expect(
    createDateRangePresets("9999-12-31").find((p) => p.id === "this-month")
      ?.value.end,
  ).toBe("9999-12-31");
});
it("validates complete ranges including disabled interior dates and duration", () => {
  expect(
    completeRangeError({ start: "2024-02-01", end: "2024-02-02" }, ""),
  ).not.toBeNull();
  expect(completeRangeError({ start: "2024-02-28", end: null })).not.toBeNull();
  expect(
    completeRangeError(
      { start: "2024-02-28", end: "2024-03-01" },
      undefined,
      undefined,
      (d) => d === "2024-02-29",
    ),
  ).not.toBeNull();
  expect(
    completeRangeError(
      { start: "2024-02-28", end: "2024-03-01" },
      undefined,
      undefined,
      undefined,
      2,
    ),
  ).not.toBeNull();
  expect(
    completeRangeError(
      { start: "2024-02-28", end: "2024-03-01" },
      undefined,
      undefined,
      undefined,
      3,
    ),
  ).toBeNull();
});
it("bounds preset sets and prevents duplicate identities", () => {
  const p = {
    id: "a",
    label: "A",
    value: { start: "2024-01-01", end: "2024-01-02" },
  };
  expect(presetConfigError([p, p])).not.toBeNull();
  expect(presetConfigError([{ ...p, id: "" }])).not.toBeNull();
  expect(
    presetConfigError(
      Array.from({ length: 25 }, (_, i) => ({ ...p, id: String(i) })),
    ),
  ).not.toBeNull();
  expect(presetConfigError([p])).toBeNull();
});
