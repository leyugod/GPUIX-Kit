import {
  addDays,
  addMonths,
  calendarError,
  rangeError,
  validMonth,
  weekday,
  type DateRange,
} from "../calendar/model";
import { isISODate } from "../value-input/rules";
export interface DateRangePreset {
  id: string;
  label: string;
  value: DateRange;
  disabled?: boolean;
}
/** 双月窗口必须留下第二个月；9999-12 对应的最晚起始月为 9999-11。 */
export function dualMonthStart(month: string): string | null {
  return validMonth(month) ? (month > "9999-11" ? "9999-11" : month) : null;
}
export function dualMonthForDate(month: string, date: string): string | null {
  if (!dualMonthStart(month) || !isISODate(date)) return null;
  const base = dualMonthStart(month)!,
    second = addMonths(`${base}-01`, 1)!.slice(0, 7),
    target = date.slice(0, 7);
  return target < base
    ? dualMonthStart(target)
    : target > second
      ? dualMonthStart(addMonths(`${target}-01`, -1)!.slice(0, 7))
      : base;
}
export function presetConfigError(presets: readonly DateRangePreset[]) {
  if (presets.length > 24) return "Use at most 24 date range presets.";
  if (
    presets.some((p) => !p.id.trim() || !p.label.trim()) ||
    new Set(presets.map((p) => p.id)).size !== presets.length
  )
    return "Preset IDs must be unique and labels non-empty.";
  return null;
}
/** 显式参考日生成快捷范围，绝不读取系统时间；跨越年份域的预设省略。 */
export function createDateRangePresets(
  referenceDate: string,
  weekStartsOn: 0 | 1 = 1,
): DateRangePreset[] {
  if (!isISODate(referenceDate) || (weekStartsOn !== 0 && weekStartsOn !== 1))
    return [];
  const month = referenceDate.slice(0, 7),
    first = `${month}-01`,
    next = addMonths(first, 1),
    previous = addMonths(first, -1);
  const week = addDays(
    referenceDate,
    -((weekday(referenceDate) - weekStartsOn + 7) % 7),
  );
  const entries = [
    ["today", "Today", referenceDate, referenceDate],
    ["last-7-days", "Last 7 days", addDays(referenceDate, -6), referenceDate],
    [
      "last-30-days",
      "Last 30 days",
      addDays(referenceDate, -29),
      referenceDate,
    ],
    ["this-week", "This week", week, week ? addDays(week, 6) : null],
    [
      "this-month",
      "This month",
      first,
      next ? addDays(next, -1) : "9999-12-31",
    ],
    ["last-month", "Last month", previous, addDays(first, -1)],
  ];
  return entries
    .filter((entry) => entry.every(Boolean))
    .map(([id, label, start, end]) => ({
      id: id!,
      label: label!,
      value: { start: start!, end: end! },
    }));
}
export function completeRangeError(
  value: DateRange,
  min?: string,
  max?: string,
  isDateDisabled?: (date: string) => boolean,
  maxRangeDays = 366,
): string | null {
  return (
    calendarError("2000-01", min, max) ??
    (!value.start || !value.end
      ? "Choose both start and end dates."
      : rangeError(value, min, max, isDateDisabled, maxRangeDays))
  );
}
