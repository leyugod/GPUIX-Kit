import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Button, Row, Stack, Text } from "../../base";
import { validMonth } from "../calendar/model";
import {
  monthPickerError,
  yearPickerError,
  monthValue,
  yearPage,
  validYear,
} from "./model";
interface Common {
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /** 内联导航层可先消费 Escape，再交给外层弹层。 */
  onEscape?: () => void;
}
export interface MonthPickerProps extends Common {
  year: number;
  onYearChange: (year: number) => void;
  value: string | null;
  onValueChange: (month: string) => void;
  min?: string;
  max?: string;
  locale?: string;
  isMonthDisabled?: (month: string) => boolean;
  onYearPress?: () => void;
}
export interface YearPickerProps extends Common {
  pageYear: number;
  onPageYearChange: (year: number) => void;
  value: number | null;
  onValueChange: (year: number) => void;
  min?: number;
  max?: number;
  isYearDisabled?: (year: number) => boolean;
}
interface Cell {
  id: string;
  label: string;
  unavailable: boolean;
}
function PeriodGrid({
  cells,
  selected,
  title,
  previous,
  next,
  onPrevious,
  onNext,
  onTitle,
  onChoose,
  error,
  ...props
}: Common & {
  cells: Cell[];
  selected: string | null;
  title: string;
  previous: boolean;
  next: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTitle?: () => void;
  onChoose: (id: string) => void;
  error: string | null;
}) {
  const { testId, disabled, readOnly, autoFocus, onEscape } = props;
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const node = useRef<PublicInstance>(null);
  const focus = useFocusTarget(Boolean(disabled), node);
  const [cursor, setCursor] = useState(0);
  const ids = cells.map((cell) => cell.id).join("|");
  useEffect(
    () =>
      setCursor((old) => {
        const selectedIndex = cells.findIndex((cell) => cell.id === selected);
        return selectedIndex < 0
          ? Math.min(old, Math.max(0, cells.length - 1))
          : selectedIndex;
      }),
    [selected, ids],
  );
  const active = Math.min(cursor, Math.max(0, cells.length - 1));
  useEffect(() => {
    if (autoFocus && !disabled && node.current)
      focusElement(renderer, node.current.id);
  }, [autoFocus, disabled, renderer]);
  const choose = (cell: Cell) => {
    if (!disabled && !readOnly && !error && !cell.unavailable)
      onChoose(cell.id);
  };
  const escape = () => {
    if (!disabled) onEscape?.();
  };
  const headerKey = (event: { key?: string }) => {
    if (event.key === "escape" && onEscape) {
      escape();
      return true;
    }
    return false;
  };
  return (
    <Stack
      testId={testId}
      gap={6}
      style={{ width: 280, opacity: disabled ? 0.5 : 1 }}
    >
      <Row style={{ justifyContent: "space-between" }}>
        <Button
          testId={`${testId}-previous`}
          size="sm"
          variant="ghost"
          disabled={disabled || !previous || Boolean(error)}
          onKeyDown={headerKey}
          onPress={onPrevious}
        >
          ‹
        </Button>
        {onTitle ? (
          <Button
            testId={`${testId}-title`}
            size="sm"
            variant="ghost"
            disabled={disabled || Boolean(error)}
            onKeyDown={headerKey}
            onPress={onTitle}
          >
            {title}
          </Button>
        ) : (
          <Text testId={`${testId}-title`} size={13} weight={600}>
            {title}
          </Text>
        )}
        <Button
          testId={`${testId}-next`}
          size="sm"
          variant="ghost"
          disabled={disabled || !next || Boolean(error)}
          onKeyDown={headerKey}
          onPress={onNext}
        >
          ›
        </Button>
      </Row>
      <div
        ref={focus.ref}
        testId={`${testId}-grid`}
        tabIndex={disabled ? -1 : 0}
        onMouseDown={focus.onMouseDown}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "escape" && onEscape) {
            onEscape();
            return;
          }
          focus.onKeyDown(event);
          if (error) return;
          const targets: Record<string, number> = {
            left: active - 1,
            right: active + 1,
            up: active - 3,
            down: active + 3,
            home: Math.floor(active / 3) * 3,
            end: Math.floor(active / 3) * 3 + 2,
          };
          if (targets[event.key ?? ""] !== undefined)
            setCursor(
              Math.max(
                0,
                Math.min(cells.length - 1, targets[event.key ?? ""]!),
              ),
            );
          if (event.key === "pageup" && previous) onPrevious();
          if (event.key === "pagedown" && next) onNext();
          if (
            (event.key === "enter" || event.key === "space") &&
            !event.isHeld &&
            cells[active]
          )
            choose(cells[active]!);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: 3,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: focus.focused ? c.accent : c.border,
        }}
      >
        {error ? (
          <Text testId={`${testId}-error`} size={11} color={c.danger}>
            {error}
          </Text>
        ) : (
          Array.from({ length: 4 }, (_, row) => (
            <Row key={row} gap={4}>
              {cells.slice(row * 3, row * 3 + 3).map((cell, column) => (
                <div
                  key={cell.id}
                  testId={`${testId}-item-${cell.id}`}
                  onMouseDown={() => focus.onMouseDown()}
                  onClick={(event) => {
                    if (event.button === undefined || event.button === 0) {
                      setCursor(row * 3 + column);
                      choose(cell);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 88,
                    height: 38,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor:
                      active === row * 3 + column ? c.accent : "transparent",
                    backgroundColor:
                      cell.id === selected ? c.primary : c.subtle,
                    opacity: cell.unavailable ? 0.3 : 1,
                  }}
                >
                  <Text
                    size={12}
                    lines={1}
                    color={cell.id === selected ? c.onPrimary : c.text}
                  >
                    {cell.label}
                  </Text>
                </div>
              ))}
            </Row>
          ))
        )}
      </div>
      {!error && cells[active] ? (
        <Text testId={`${testId}-active`} size={10} color={c.muted}>
          {cells[active]!.id}
        </Text>
      ) : null}
    </Stack>
  );
}
export function MonthPicker({
  year,
  onYearChange,
  value,
  onValueChange,
  min,
  max,
  locale = "en-US",
  isMonthDisabled,
  onYearPress,
  ...props
}: MonthPickerProps) {
  const error = monthPickerError(year, min, max);
  const cells = error
    ? []
    : Array.from({ length: 12 }, (_, i) => {
        const id = monthValue(year, i + 1);
        let label = String(i + 1);
        try {
          label = new Intl.DateTimeFormat(locale, {
            month: "short",
            calendar: "gregory",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(2024, i, 1)));
        } catch {
          /* 无效语言回退到月序号。 */
        }
        return {
          id,
          label,
          unavailable: Boolean(
            (min && id < min) || (max && id > max) || isMonthDisabled?.(id),
          ),
        };
      });
  return (
    <PeriodGrid
      {...props}
      cells={cells}
      selected={value && validMonth(value) ? value : null}
      error={error}
      title={String(year)}
      onTitle={onYearPress}
      previous={year > Math.max(1, Number(min?.slice(0, 4) ?? 1))}
      next={year < Math.min(9999, Number(max?.slice(0, 4) ?? 9999))}
      onPrevious={() => onYearChange(year - 1)}
      onNext={() => onYearChange(year + 1)}
      onChoose={onValueChange}
    />
  );
}
export function YearPicker({
  pageYear,
  onPageYearChange,
  value,
  onValueChange,
  min = 1,
  max = 9999,
  isYearDisabled,
  ...props
}: YearPickerProps) {
  const error = yearPickerError(pageYear, min, max),
    start = error ? 1 : yearPage(pageYear);
  const cells = error
    ? []
    : Array.from({ length: Math.min(12, 10000 - start) }, (_, i) => {
        const year = start + i;
        return {
          id: String(year),
          label: String(year),
          unavailable:
            year < min || year > max || Boolean(isYearDisabled?.(year)),
        };
      });
  return (
    <PeriodGrid
      {...props}
      cells={cells}
      selected={value !== null && validYear(value) ? String(value) : null}
      title={`${start} – ${Math.min(9999, start + 11)}`}
      previous={start > min}
      next={start + 12 <= max}
      onPrevious={() => onPageYearChange(Math.max(1, start - 12))}
      onNext={() => onPageYearChange(Math.min(9999, start + 12))}
      error={error}
      onChoose={(id) => onValueChange(Number(id))}
    />
  );
}
