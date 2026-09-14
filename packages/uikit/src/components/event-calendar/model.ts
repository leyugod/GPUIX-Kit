import { catalogError } from "../catalog-model";
import { isISODate } from "../value-input/rules";
import { addDays, monthDays, weekday } from "../calendar/model";
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  disabled?: boolean;
}
export type EventCalendarView = "month" | "week" | "day";
export function eventCalendarError(events: readonly CalendarEvent[]) {
  if (catalogError(events, 200)) return "Use at most 200 unique events";
  const time = (value: string) => /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  return events.some(
    (e) =>
      !e.title.trim() ||
      e.title.length > 200 ||
      !isISODate(e.date) ||
      (e.endDate && (!isISODate(e.endDate) || e.endDate < e.date)) ||
      (e.startTime && !time(e.startTime)) ||
      (e.endTime &&
        (!time(e.endTime) ||
          !e.startTime ||
          ((e.endDate ?? e.date) === e.date && e.endTime < e.startTime))),
  )
    ? "Invalid event date or time"
    : null;
}
export function eventsOnDate(events: readonly CalendarEvent[], date: string) {
  return events
    .filter((e) => e.date <= date && (e.endDate ?? e.date) >= date)
    .sort(
      (a, b) =>
        (a.startTime ?? "").localeCompare(b.startTime ?? "") ||
        a.id.localeCompare(b.id),
    );
}
export function eventCalendarDays(date: string, view: EventCalendarView) {
  if (!isISODate(date)) return [];
  return view === "month"
    ? monthDays(date.slice(0, 7))
    : view === "day"
      ? [date]
      : Array.from({ length: 7 }, (_, i) =>
          addDays(date, i - ((weekday(date) + 6) % 7)),
        );
}
