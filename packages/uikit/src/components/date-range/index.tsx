import { useEffect, useRef, useState, type RefObject } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import { Dialog } from "../../overlays";
import { CalendarGrid } from "../calendar/grid";
import type {
  CalendarProps,
  RangeCalendarProps,
  CalendarOptions,
} from "../calendar/types";
import {
  addMonths,
  calendarError,
  chooseRange,
  rangeError,
  selectableDate,
  type DateRange,
} from "../calendar/model";
import { MonthPicker, YearPicker } from "../period-picker";
import {
  completeRangeError,
  dualMonthForDate,
  dualMonthStart,
  presetConfigError,
  type DateRangePreset,
} from "./model";
export { createDateRangePresets, type DateRangePreset } from "./model";
export interface DualCalendarProps extends CalendarProps {
  layout?: "horizontal" | "vertical";
}
export interface DualRangeCalendarProps extends RangeCalendarProps {
  layout?: "horizontal" | "vertical";
}
type DualProps = CalendarOptions & {
  layout?: "horizontal" | "vertical";
  selection: DateRange;
  onChoose: (date: string) => void;
  selectionError?: string | null;
};
function DualGrid({
  selection,
  onChoose,
  selectionError,
  layout = "horizontal",
  ...props
}: DualProps) {
  const {
    month,
    onMonthChange,
    disabled,
    testId,
    min,
    max,
    locale,
    navigation = "month-year",
  } = props;
  const { colors: c } = useTheme(),
    { renderer } = useGpuix();
  const base = dualMonthStart(month);
  const error = calendarError(month, min, max);
  const second = base ? addMonths(`${base}-01`, 1)!.slice(0, 7) : "";
  const left = useRef<PublicInstance>(null),
    right = useRef<PublicInstance>(null);
  const [active, setActive] = useState<string | undefined>();
  const [panel, setPanel] = useState<"days" | "months" | "years">("days"),
    [year, setYear] = useState(Number(month.slice(0, 4)));
  const priorPanel = useRef(panel);
  useEffect(() => {
    if (panel === "days" && priorPanel.current !== "days" && left.current)
      focusElement(renderer, left.current.id);
    priorPanel.current = panel;
  }, [panel, renderer]);
  const navigate = (date: string) => {
    if (disabled || error || !base) return;
    const next = dualMonthForDate(base, date)!;
    setActive(date);
    if (next !== base) onMonthChange(next);
    const node = date.slice(0, 7) === next ? left.current : right.current;
    if (node) focusElement(renderer, node.id);
  };
  const previous = base ? addMonths(`${base}-01`, -1)?.slice(0, 7) : null;
  const next =
    base && base < "9999-11" ? addMonths(`${base}-01`, 1)?.slice(0, 7) : null;
  return (
    <Stack testId={testId} gap={10}>
      {error ? (
        <Text testId={`${testId}-error`} color={c.danger} size={11}>
          {error}
        </Text>
      ) : (
        <>
          <Row
            style={{
              display: panel === "days" ? "flex" : "none",
              justifyContent: "space-between",
              width: layout === "horizontal" && panel === "days" ? 576 : 280,
            }}
          >
            <Button
              testId={`${testId}-previous`}
              size="sm"
              variant="ghost"
              disabled={
                disabled ||
                panel !== "days" ||
                !previous ||
                Boolean(min && second <= min.slice(0, 7))
              }
              onPress={() => {
                if (previous) onMonthChange(previous);
              }}
            >
              ‹
            </Button>
            {navigation === "month-year" ? (
              <Button
                testId={`${testId}-month-button`}
                size="sm"
                variant="ghost"
                disabled={disabled || panel !== "days"}
                onPress={() => {
                  setYear(Number(base!.slice(0, 4)));
                  setPanel(panel === "days" ? "months" : "days");
                }}
              >{`${base} / ${second}`}</Button>
            ) : (
              <Text size={13}>{`${base} / ${second}`}</Text>
            )}
            <Button
              testId={`${testId}-next`}
              size="sm"
              variant="ghost"
              disabled={
                disabled ||
                panel !== "days" ||
                !next ||
                Boolean(max && base! >= max.slice(0, 7))
              }
              onPress={() => {
                if (next) onMonthChange(next);
              }}
            >
              ›
            </Button>
          </Row>
          {panel === "months" ? (
            <MonthPicker
              testId={`${testId}-months`}
              year={year}
              onYearChange={setYear}
              value={base}
              min={min?.slice(0, 7)}
              max={max?.slice(0, 7)}
              locale={locale}
              autoFocus
              disabled={disabled}
              onEscape={() => setPanel("days")}
              onYearPress={() => setPanel("years")}
              onValueChange={(month) => {
                onMonthChange(dualMonthStart(month)!);
                setActive(undefined);
                setPanel("days");
              }}
            />
          ) : panel === "years" ? (
            <YearPicker
              testId={`${testId}-years`}
              pageYear={year}
              onPageYearChange={setYear}
              value={Number(base!.slice(0, 4))}
              min={min ? Number(min.slice(0, 4)) : undefined}
              max={max ? Number(max.slice(0, 4)) : undefined}
              autoFocus
              disabled={disabled}
              onEscape={() => setPanel("months")}
              onValueChange={(year) => {
                setYear(year);
                setPanel("months");
              }}
            />
          ) : null}
          {/* 日期网格保持挂载，隐藏时退出焦点范围；返回后保留组件顺序。 */}
          <div
            style={{
              display: panel === "days" ? "flex" : "none",
              flexDirection: layout === "horizontal" ? "row" : "column",
              gap: 16,
            }}
          >
            <CalendarGrid
              {...props}
              disabled={disabled || panel !== "days"}
              month={base!}
              testId={`${testId}-left`}
              focusRef={left}
              activeDate={active}
              onNavigateDate={navigate}
              hideNavigation
              hideOutsideDays
              selection={selection}
              onChoose={onChoose}
            />
            <CalendarGrid
              {...props}
              disabled={disabled || panel !== "days"}
              month={second}
              testId={`${testId}-right`}
              focusRef={right}
              activeDate={active}
              onNavigateDate={navigate}
              autoFocus={false}
              hideNavigation
              hideOutsideDays
              selection={selection}
              onChoose={onChoose}
            />
          </div>
          {selectionError ? (
            <Text
              testId={`${testId}-selection-error`}
              color={c.danger}
              size={11}
            >
              {selectionError}
            </Text>
          ) : null}
        </>
      )}
    </Stack>
  );
}
export function DualCalendar({
  value,
  onValueChange,
  ...props
}: DualCalendarProps) {
  const invalid =
    value !== null &&
    !selectableDate(value, props.min, props.max, props.isDateDisabled);
  return (
    <DualGrid
      {...props}
      selection={{ start: invalid ? null : value, end: null }}
      selectionError={invalid ? "The selected date is unavailable." : null}
      onChoose={onValueChange}
    />
  );
}
export function DualRangeCalendar({
  value,
  onValueChange,
  maxRangeDays = 366,
  ...props
}: DualRangeCalendarProps) {
  const [attempt, setAttempt] = useState<string | null>(null);
  useEffect(
    () => setAttempt(null),
    [
      value.start,
      value.end,
      props.min,
      props.max,
      props.isDateDisabled,
      maxRangeDays,
    ],
  );
  const error = rangeError(
    value,
    props.min,
    props.max,
    props.isDateDisabled,
    maxRangeDays,
  );
  return (
    <DualGrid
      {...props}
      selection={value}
      selectionError={attempt ?? error}
      onChoose={(date) => {
        const next = chooseRange(
          error ? { start: null, end: null } : value,
          date,
        );
        const invalid = rangeError(
          next,
          props.min,
          props.max,
          props.isDateDisabled,
          maxRangeDays,
        );
        setAttempt(invalid);
        if (!invalid) onValueChange(next);
      }}
    />
  );
}
export interface DateRangePresetsProps {
  presets: readonly DateRangePreset[];
  value: DateRange;
  onValueChange: (value: DateRange) => void;
  min?: string;
  max?: string;
  maxRangeDays?: number;
  isDateDisabled?: (date: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  testId: string;
}
export function DateRangePresets(props: DateRangePresetsProps) {
  const { presets, value, onValueChange, disabled, readOnly, testId } = props;
  const { colors: c } = useTheme();
  const error = presetConfigError(presets);
  return error ? (
    <Text testId={`${testId}-error`} color={c.danger} size={11}>
      {error}
    </Text>
  ) : (
    <Row testId={testId} gap={6} style={{ flexWrap: "wrap" }}>
      {presets.map((preset) => (
        <Button
          key={preset.id}
          testId={`${testId}-${preset.id}`}
          size="sm"
          variant={
            value.start === preset.value.start && value.end === preset.value.end
              ? "primary"
              : "secondary"
          }
          disabled={
            disabled ||
            readOnly ||
            preset.disabled ||
            Boolean(
              completeRangeError(
                preset.value,
                props.min,
                props.max,
                props.isDateDisabled,
                props.maxRangeDays,
              ),
            )
          }
          onPress={() => onValueChange({ ...preset.value })}
        >
          {preset.label}
        </Button>
      ))}
    </Row>
  );
}
export interface DateRangePanelProps
  extends Omit<DualRangeCalendarProps, "onValueChange"> {
  onApply: (value: DateRange) => void;
  onCancel: () => void;
  presets?: readonly DateRangePreset[];
  applyLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
}
/** 面板内只编辑草稿；Apply 才交给应用，Cancel 不回写。 */
export function DateRangePanel({
  value,
  onApply,
  onCancel,
  presets = [],
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
  ...props
}: DateRangePanelProps) {
  const [draft, setDraft] = useState<DateRange>({ ...value });
  const { renderer } = useGpuix();
  const cancelRef = useRef<PublicInstance>(null);
  useEffect(() => setDraft({ ...value }), [value.start, value.end]);
  const error = completeRangeError(
    draft,
    props.min,
    props.max,
    props.isDateDisabled,
    props.maxRangeDays,
  );
  return (
    <Stack
      testId={props.testId}
      gap={12}
      style={{ width: props.layout === "vertical" ? 282 : 580 }}
    >
      <DateRangePresets
        {...props}
        testId={`${props.testId}-presets`}
        presets={presets}
        value={draft}
        onValueChange={(next) => {
          setDraft(next);
          props.onMonthChange(dualMonthStart(next.start!.slice(0, 7))!);
        }}
      />
      <DualRangeCalendar
        {...props}
        testId={`${props.testId}-calendar`}
        value={draft}
        onValueChange={setDraft}
      />
      <Text
        testId={`${props.testId}-draft`}
        size={12}
      >{`${draft.start ?? "…"} – ${draft.end ?? "…"}`}</Text>
      <Row style={{ justifyContent: "flex-end" }}>
        <Button
          testId={`${props.testId}-clear`}
          variant="ghost"
          size="sm"
          disabled={
            props.disabled || props.readOnly || (!draft.start && !draft.end)
          }
          onPress={() => {
            setDraft({ start: null, end: null });
            // 清除后自身变为禁用，将焦点移到仍可操作的取消按钮。
            if (cancelRef.current) focusElement(renderer, cancelRef.current.id);
          }}
        >
          {clearLabel}
        </Button>
        <Button
          testId={`${props.testId}-cancel`}
          ref={cancelRef}
          size="sm"
          disabled={props.disabled}
          onPress={() => {
            setDraft({ ...value });
            onCancel();
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          testId={`${props.testId}-apply`}
          size="sm"
          variant="primary"
          disabled={
            props.disabled ||
            props.readOnly ||
            Boolean(error) ||
            Boolean(calendarError(props.month, props.min, props.max))
          }
          onPress={() => {
            if (!error) onApply({ ...draft });
          }}
        >
          {applyLabel}
        </Button>
      </Row>
    </Stack>
  );
}
export interface DateRangeDialogProps
  extends Omit<DateRangePanelProps, "onApply" | "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: DateRange) => void;
  title?: string;
  restoreFocusRef?: RefObject<PublicInstance | null>;
}
export function DateRangeDialog({
  open,
  onOpenChange,
  onValueChange,
  title = "Choose date range",
  restoreFocusRef,
  ...props
}: DateRangeDialogProps) {
  return (
    <Dialog
      testId={props.testId}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      width={props.layout === "vertical" ? 350 : 640}
      restoreFocusRef={restoreFocusRef}
    >
      <DateRangePanel
        {...props}
        testId={`${props.testId}-panel`}
        onApply={(value) => {
          onValueChange(value);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
