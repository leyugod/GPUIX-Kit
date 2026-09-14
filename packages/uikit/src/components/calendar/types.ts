import type { DateRange } from "./model";
export interface CalendarOptions {
  month: string;
  onMonthChange: (month: string) => void;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  navigation?: "arrows" | "month-year";
  weekStartsOn?: 0 | 1;
  locale?: string;
  today?: string;
  autoFocus?: boolean;
  testId: string;
}
export interface CalendarProps extends CalendarOptions {
  value: string | null;
  onValueChange: (value: string) => void;
}
export interface RangeCalendarProps extends CalendarOptions {
  value: DateRange;
  onValueChange: (value: DateRange) => void;
  maxRangeDays?: number;
}
