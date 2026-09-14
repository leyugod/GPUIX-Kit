import { validMonth } from "../calendar/model";
export const validYear = (year: number) =>
  Number.isInteger(year) && year >= 1 && year <= 9999;
export const monthValue = (year: number, month: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
export const yearPage = (year: number) => Math.floor((year - 1) / 12) * 12 + 1;
export function monthPickerError(year: number, min?: string, max?: string) {
  if (!validYear(year)) return "Year must be an integer from 1 to 9999.";
  if (
    (min !== undefined && !validMonth(min)) ||
    (max !== undefined && !validMonth(max)) ||
    (min && max && min > max)
  )
    return "Month bounds must be valid and ordered.";
  return null;
}
export function yearPickerError(year: number, min = 1, max = 9999) {
  return ![year, min, max].every(validYear) || min > max
    ? "Years must be integers from 1 to 9999 with ordered bounds."
    : null;
}
