import { isISODate } from "../value-input/rules";
export interface DateRange {
  start: string | null;
  end: string | null;
}
const DAY = 86400000;
/** UTC 仅用于公历整数运算；公开值始终是日期字符串，不转换用户时区。 */
export function dateNumber(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const value = new Date(0);
  value.setUTCFullYear(y!, m! - 1, d!);
  value.setUTCHours(0, 0, 0, 0);
  return value.getTime() / DAY;
}
export function dateString(day: number) {
  const d = new Date(day * DAY),
    y = d.getUTCFullYear();
  return y < 1 || y > 9999
    ? null
    : `${String(y).padStart(4, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
export const validMonth = (month: string) =>
  /^\d{4}-\d{2}$/.test(month) && isISODate(`${month}-01`);
export function addDays(date: string, days: number) {
  return dateString(dateNumber(date) + days);
}
export function addMonths(date: string, delta: number) {
  const [y, m, d] = date.split("-").map(Number);
  const index = (y! - 1) * 12 + m! - 1 + delta;
  if (index < 0 || index >= 9999 * 12) return null;
  const month = `${String(Math.floor(index / 12) + 1).padStart(4, "0")}-${String((index % 12) + 1).padStart(2, "0")}`;
  for (let day = d!; day >= 1; day--) {
    const value = `${month}-${String(day).padStart(2, "0")}`;
    if (isISODate(value)) return value;
  }
  return null;
}
export function weekday(date: string) {
  return new Date(dateNumber(date) * DAY).getUTCDay();
}
export function monthDays(month: string, weekStartsOn: 0 | 1 = 1) {
  if (!validMonth(month)) return [];
  const first = `${month}-01`,
    offset = (weekday(first) - weekStartsOn + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
}
export function calendarError(month: string, min?: string, max?: string) {
  if (!validMonth(month)) return "Use a month in YYYY-MM format (0001–9999).";
  if (
    (min !== undefined && !isISODate(min)) ||
    (max !== undefined && !isISODate(max)) ||
    (min && max && min > max)
  )
    return "Date bounds must be valid and ordered.";
  return null;
}
export function selectableDate(
  date: string,
  min?: string,
  max?: string,
  isDateDisabled?: (date: string) => boolean,
) {
  return (
    isISODate(date) &&
    (!min || date >= min) &&
    (!max || date <= max) &&
    !isDateDisabled?.(date)
  );
}
export function rangeError(
  value: DateRange,
  min?: string,
  max?: string,
  isDateDisabled?: (date: string) => boolean,
  maxRangeDays = 366,
) {
  if (
    !Number.isInteger(maxRangeDays) ||
    maxRangeDays < 1 ||
    maxRangeDays > 3660
  )
    return "maxRangeDays must be between 1 and 3660.";
  if (value.end && !value.start) return "Choose a start date first.";
  if (value.start && !selectableDate(value.start, min, max, isDateDisabled))
    return "The start date is unavailable.";
  if (value.end) {
    if (!isISODate(value.end) || value.end < value.start!)
      return "Range dates must be valid and ordered.";
    const count = dateNumber(value.end) - dateNumber(value.start!) + 1;
    if (count > maxRangeDays) return `Choose at most ${maxRangeDays} days.`;
    for (let n = 0; n < count; n++) {
      if (!selectableDate(addDays(value.start!, n)!, min, max, isDateDisabled))
        return "The range includes an unavailable date.";
    }
  }
  return null;
}
export function chooseRange(value: DateRange, date: string): DateRange {
  if (!value.start || value.end) return { start: date, end: null };
  return date < value.start
    ? { start: date, end: value.start }
    : { start: value.start, end: date };
}
