import { useEffect, useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
import { Button, Row } from "../../base";
import { Popover } from "../popover";
import {
  chooseRange,
  rangeError,
  selectableDate,
  type DateRange,
} from "./model";
import { CalendarGrid } from "./grid";
import type { CalendarProps, RangeCalendarProps } from "./types";
export type {
  CalendarOptions,
  CalendarProps,
  RangeCalendarProps,
} from "./types";
export function Calendar({ value, onValueChange, ...props }: CalendarProps) {
  const invalid =
    value !== null &&
    !selectableDate(value, props.min, props.max, props.isDateDisabled);
  return (
    <CalendarGrid
      {...props}
      selection={{ start: invalid ? null : value, end: null }}
      selectionError={invalid ? "The selected date is unavailable." : null}
      onChoose={onValueChange}
    />
  );
}
export function RangeCalendar({
  value,
  onValueChange,
  maxRangeDays = 366,
  ...props
}: RangeCalendarProps) {
  const [attemptError, setAttemptError] = useState<string | null>(null);
  useEffect(
    () => setAttemptError(null),
    [value.start, value.end, props.min, props.max, maxRangeDays],
  );
  const currentError = rangeError(
    value,
    props.min,
    props.max,
    props.isDateDisabled,
    maxRangeDays,
  );
  return (
    <CalendarGrid
      {...props}
      selection={value}
      selectionError={attemptError ?? currentError}
      onChoose={(date) => {
        const next = chooseRange(
          currentError ? { start: null, end: null } : value,
          date,
        );
        const error = rangeError(
          next,
          props.min,
          props.max,
          props.isDateDisabled,
          maxRangeDays,
        );
        setAttemptError(error);
        if (!error) onValueChange(next);
      }}
    />
  );
}
export interface DatePickerProps extends Omit<CalendarProps, "onValueChange"> {
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  clearLabel?: string;
}
export interface DateRangePickerProps
  extends Omit<RangeCalendarProps, "onValueChange"> {
  onValueChange: (value: DateRange) => void;
  placeholder?: string;
  clearLabel?: string;
}
export function DatePicker({
  value,
  onValueChange,
  placeholder = "Choose date",
  clearLabel = "Clear",
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<PublicInstance>(null);
  useEffect(() => {
    if (props.disabled) setOpen(false);
  }, [props.disabled]);
  return (
    <Row testId={`${props.testId}-field`}>
      <Popover
        testId={`${props.testId}-popover`}
        width={300}
        autoFocus={false}
        open={open && !props.disabled}
        onOpenChange={setOpen}
        restoreFocusRef={trigger}
        anchor={
          <Button
            testId={`${props.testId}-trigger`}
            ref={trigger}
            disabled={props.disabled}
            onPress={() => setOpen((v) => !v)}
          >
            {value ?? placeholder}
          </Button>
        }
      >
        <Calendar
          {...props}
          autoFocus
          testId={`${props.testId}-calendar`}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </Popover>
      <Button
        testId={`${props.testId}-clear`}
        size="sm"
        variant="ghost"
        disabled={props.disabled || props.readOnly || value === null}
        onPress={() => onValueChange(null)}
      >
        {clearLabel}
      </Button>
    </Row>
  );
}
export function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Choose date range",
  clearLabel = "Clear",
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<PublicInstance>(null);
  useEffect(() => {
    if (props.disabled) setOpen(false);
  }, [props.disabled]);
  return (
    <Row testId={`${props.testId}-field`}>
      <Popover
        testId={`${props.testId}-popover`}
        width={300}
        autoFocus={false}
        open={open && !props.disabled}
        onOpenChange={setOpen}
        restoreFocusRef={trigger}
        anchor={
          <Button
            testId={`${props.testId}-trigger`}
            ref={trigger}
            disabled={props.disabled}
            onPress={() => setOpen((v) => !v)}
          >
            {value.start ? `${value.start} – ${value.end ?? "…"}` : placeholder}
          </Button>
        }
      >
        <RangeCalendar
          {...props}
          autoFocus
          testId={`${props.testId}-calendar`}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            if (next.end) setOpen(false);
          }}
        />
      </Popover>
      <Button
        testId={`${props.testId}-clear`}
        size="sm"
        variant="ghost"
        disabled={props.disabled || props.readOnly || value.start === null}
        onPress={() => onValueChange({ start: null, end: null })}
      >
        {clearLabel}
      </Button>
    </Row>
  );
}
export type { DateRange } from "./model";
