import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance, type EventPayload } from "@gpuix/react";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Button, Row, Stack, Text } from "../../base";
import { isActivation } from "../../core/rules";
import {
  addDays,
  addMonths,
  calendarError,
  dateNumber,
  monthDays,
  selectableDate,
  weekday,
  type DateRange,
} from "./model";
import type { CalendarOptions } from "./types";
import { MonthPicker, YearPicker } from "../period-picker";
type GridProps = CalendarOptions & {
  selection: DateRange;
  focusRef?: { current: PublicInstance | null };
  activeDate?: string;
  onNavigateDate?: (date: string) => void;
  hideNavigation?: boolean;
  hideOutsideDays?: boolean;
  onChoose: (date: string) => void;
  selectionError?: string | null;
};
export function CalendarGrid({
  month,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  disabled = false,
  readOnly = false,
  navigation = "arrows",
  focusRef,
  activeDate,
  onNavigateDate,
  hideNavigation = false,
  hideOutsideDays = false,
  weekStartsOn = 1,
  locale = "en-US",
  today,
  autoFocus = false,
  testId,
  selection,
  onChoose,
  selectionError,
}: GridProps) {
  const { colors: c } = useTheme();
  const error = calendarError(month, min, max);
  const { renderer } = useGpuix();
  const localRef = useRef<PublicInstance>(null);
  const gridRef = focusRef ?? localRef;
  const [panel, setPanel] = useState<"days" | "months" | "years">("days");
  const [browseYear, setBrowseYear] = useState(Number(month.slice(0, 4)));
  const priorPanel = useRef(panel);
  useEffect(() => {
    if (panel === "days" && priorPanel.current !== "days" && gridRef.current)
      focusElement(renderer, gridRef.current.id);
    priorPanel.current = panel;
  }, [panel, renderer]);
  const focus = useFocusTarget(disabled || !!error, gridRef);
  useEffect(() => {
    if (autoFocus && !disabled && !error && gridRef.current)
      focusElement(renderer, gridRef.current.id);
  }, [autoFocus, disabled, error, renderer]);
  const [cursor, setCursor] = useState<string | null>(null);
  const days = error ? [] : monthDays(month, weekStartsOn);
  const initial =
    selection.start?.slice(0, 7) === month &&
    selectableDate(selection.start, min, max, isDateDisabled)
      ? selection.start
      : (days.find(
          (date) =>
            date !== null &&
            date.slice(0, 7) === month &&
            selectableDate(date, min, max, isDateDisabled),
        ) ?? `${month}-01`);
  const active =
    activeDate?.slice(0, 7) === month
      ? activeDate
      : cursor?.slice(0, 7) === month
        ? cursor
        : initial;
  let title = month,
    labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      calendar: "gregory",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    if (!error)
      title = formatter.format(new Date(dateNumber(`${month}-01`) * 86400000));
    const short = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    });
    labels = labels.map((_, i) =>
      short.format(new Date(Date.UTC(2023, 0, 1 + i))),
    );
  } catch {
    /* 不支持的 locale 使用稳定英文标签，不依赖系统偏好。 */
  }
  const available = (date: string) =>
    !disabled && !error && selectableDate(date, min, max, isDateDisabled);
  const navigate = (date: string | null) => {
    if (!date || disabled || error) return;
    setCursor(date);
    if (onNavigateDate) onNavigateDate(date);
    else if (date.slice(0, 7) !== month) onMonthChange(date.slice(0, 7));
  };
  const choose = (date: string) => {
    if (readOnly || !available(date)) return;
    navigate(date);
    onChoose(date);
  };
  const key = (event: EventPayload) => {
    focus.onKeyDown(event);
    if (disabled || error) return;
    const k = event.key;
    let next: string | null = null;
    if (k === "left" || k === "right")
      next = addDays(active, k === "left" ? -1 : 1);
    if (k === "up" || k === "down") next = addDays(active, k === "up" ? -7 : 7);
    if (k === "home" || k === "end") {
      const offset = (weekday(active) - weekStartsOn + 7) % 7;
      next = addDays(active, k === "home" ? -offset : 6 - offset);
    }
    if (k === "pageup" || k === "pagedown")
      next = addMonths(
        active,
        (k === "pageup" ? -1 : 1) * (event.modifiers?.shift ? 12 : 1),
      );
    if (next) navigate(next);
    if (isActivation(k) && !event.isHeld) choose(active);
  };
  const previous = error ? null : addMonths(`${month}-01`, -1),
    next = error ? null : addMonths(`${month}-01`, 1);
  return (
    <Stack
      testId={testId}
      gap={6}
      style={{ width: 280, opacity: disabled ? 0.5 : 1 }}
    >
      {panel === "days" ? (
        <Row style={{ justifyContent: "space-between" }}>
          {!hideNavigation ? (
            <Button
              testId={`${testId}-previous`}
              size="sm"
              variant="ghost"
              disabled={
                disabled ||
                !previous ||
                !!(min && previous.slice(0, 7) < min.slice(0, 7))
              }
              onPress={() => navigate(previous)}
            >
              ‹
            </Button>
          ) : null}
          {navigation === "month-year" && !hideNavigation ? (
            <Button
              testId={`${testId}-month-button`}
              size="sm"
              variant="ghost"
              disabled={disabled || Boolean(error)}
              onPress={() => {
                setBrowseYear(Number(month.slice(0, 4)));
                setPanel("months");
              }}
            >
              {title}
            </Button>
          ) : (
            <Text testId={`${testId}-month`} size={13} weight={600}>
              {title}
            </Text>
          )}
          {!hideNavigation ? (
            <Button
              testId={`${testId}-next`}
              size="sm"
              variant="ghost"
              disabled={
                disabled ||
                !next ||
                !!(max && next.slice(0, 7) > max.slice(0, 7))
              }
              onPress={() => navigate(next)}
            >
              ›
            </Button>
          ) : null}
        </Row>
      ) : null}
      {panel === "months" ? (
        <MonthPicker
          testId={`${testId}-months`}
          year={browseYear}
          onYearChange={setBrowseYear}
          value={month}
          min={min?.slice(0, 7)}
          max={max?.slice(0, 7)}
          locale={locale}
          disabled={disabled}
          autoFocus
          onEscape={() => setPanel("days")}
          onYearPress={() => setPanel("years")}
          onValueChange={(next) => {
            navigate(`${next}-01`);
            setPanel("days");
          }}
        />
      ) : panel === "years" ? (
        <YearPicker
          testId={`${testId}-years`}
          pageYear={browseYear}
          onPageYearChange={setBrowseYear}
          value={Number(month.slice(0, 4))}
          min={min ? Number(min.slice(0, 4)) : undefined}
          max={max ? Number(max.slice(0, 4)) : undefined}
          disabled={disabled}
          autoFocus
          onEscape={() => setPanel("months")}
          onValueChange={(year) => {
            setBrowseYear(year);
            setPanel("months");
          }}
        />
      ) : null}
      {panel !== "days" ? null : error ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {error}
        </Text>
      ) : (
        <>
          <Row gap={0}>
            {Array.from({ length: 7 }, (_, i) => (
              <Text
                key={i}
                size={10}
                color={c.muted}
                style={{ width: 40, textAlign: "center" }}
              >
                {labels[(i + weekStartsOn) % 7]}
              </Text>
            ))}
          </Row>
          <div
            ref={focus.ref}
            testId={`${testId}-grid`}
            tabIndex={disabled ? -1 : 0}
            onMouseDown={focus.onMouseDown}
            onKeyDown={key}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: focus.focused ? c.accent : "transparent",
              width: 282,
            }}
          >
            {Array.from({ length: 6 }, (_, row) => (
              <Row key={row} gap={0}>
                {days.slice(row * 7, row * 7 + 7).map((date, i) => {
                  if (!date || (hideOutsideDays && date.slice(0, 7) !== month))
                    return (
                      <div
                        key={`blank-${i}`}
                        style={{ width: 40, height: 30 }}
                      />
                    );
                  const allowed = available(date),
                    endpoint =
                      date === selection.start || date === selection.end,
                    inRange = !!(
                      selection.start &&
                      selection.end &&
                      date > selection.start &&
                      date < selection.end
                    );
                  return (
                    <div
                      key={date}
                      testId={`${testId}-day-${date}`}
                      onMouseDown={(event) => {
                        if (event.button === undefined || event.button === 0)
                          focus.onMouseDown();
                      }}
                      onClick={(event) => {
                        if (event.button === undefined || event.button === 0)
                          choose(date);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 30,
                        flexShrink: 0,
                        borderWidth: 1,
                        borderColor:
                          date === active
                            ? c.accent
                            : date === today
                              ? c.borderStrong
                              : "transparent",
                        borderRadius: 6,
                        backgroundColor: endpoint
                          ? c.primary
                          : inRange
                            ? c.accentSoft
                            : "transparent",
                        opacity: allowed ? 1 : 0.3,
                        cursor: allowed ? "pointer" : "default",
                        hover: allowed
                          ? {
                              backgroundColor: endpoint
                                ? c.primaryHover
                                : c.subtle,
                            }
                          : {},
                      }}
                    >
                      <Text
                        size={12}
                        weight={date === today ? 600 : 400}
                        color={
                          endpoint
                            ? c.onPrimary
                            : date.slice(0, 7) === month
                              ? c.text
                              : c.muted
                        }
                      >
                        {Number(date.slice(-2))}
                      </Text>
                    </div>
                  );
                })}
              </Row>
            ))}
          </div>
          <Text testId={`${testId}-active`} size={10} color={c.muted}>
            {active}
            {available(active) ? "" : " · unavailable"}
          </Text>
          {selectionError ? (
            <Text
              testId={`${testId}-selection-error`}
              size={10}
              color={c.danger}
            >
              {selectionError}
            </Text>
          ) : null}
        </>
      )}
    </Stack>
  );
}
