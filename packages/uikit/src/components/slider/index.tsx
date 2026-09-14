import { OverlayCapture } from "../../core/layers";
import { useContext, useEffect, useRef, useState } from "react";
import {
  useWindowSize,
  useGpuix,
  type PublicInstance,
  type EventPayload,
} from "@gpuix/react";
import {
  FocusScopeContext,
  focusElement,
  useFocusTarget,
} from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Row, Stack, Text } from "../../base";
import {
  sliderError,
  snapSlider,
  moveSlider,
  sliderStops,
  sliderMarksError,
  sliderHitRegions,
  nearestSliderThumb,
  type SliderMark,
} from "./model";
export type { SliderMark } from "./model";
export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  length?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  readOnly?: boolean;
  /** 可选的离散轨道点击，最多 201 个停靠值。 */
  trackPress?: boolean;
  marks?: readonly SliderMark[];
  label?: string;
  /** 组合面板可在通道旁显示值，避免重复标签。 */
  showValue?: boolean;
  formatValue?: (value: number) => string;
  testId: string;
}
export interface RangeSliderProps
  extends Omit<SliderProps, "value" | "onValueChange" | "onValueCommit"> {
  value: readonly [number, number];
  onValueChange: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;
}
type InternalProps = Omit<
  SliderProps,
  "value" | "onValueChange" | "onValueCommit"
> & {
  values: readonly number[];
  change: (values: number[]) => void;
  commit?: (values: number[]) => void;
};
function SliderControl({
  values,
  change,
  commit,
  min = 0,
  max = 100,
  step = 1,
  length = 280,
  orientation = "horizontal",
  disabled = false,
  readOnly = false,
  trackPress = false,
  marks = [],
  label,
  showValue = true,
  formatValue = String,
  testId,
}: InternalProps) {
  const { colors: c } = useTheme();
  const window = useWindowSize();
  const { renderer } = useGpuix();
  const scope = useContext(FocusScopeContext);
  const thumbs = useRef(new Map<number, PublicInstance>());
  const preferred = useRef(0);
  const bounds = { min, max, step };
  const error =
    sliderError(bounds, values) ??
    sliderMarksError(marks, bounds) ??
    (trackPress && !sliderStops(bounds)
      ? "Track clicks support at most 201 stops; increase step or disable trackPress."
      : null) ??
    (!Number.isFinite(length) || length < 80 || length > 2048
      ? "Slider length must be between 80 and 2048."
      : null);
  const safeLength = error ? 280 : length;
  const span = safeLength - 20;
  const vertical = orientation === "vertical";
  const normalized = error
    ? values.map(() => 0)
    : values.map((v) => snapSlider(v, bounds));
  const blocked = disabled || !!error || min === max;
  const [drag, setDrag] = useState<number | null>(null);
  const origin = useRef<{ position: number; values: number[] } | null>(null);
  const restoreThumb = () => {
    const node = thumbs.current.get(preferred.current);
    if (node && !blocked) focusElement(renderer, node.id);
    return node;
  };
  useEffect(() => {
    if (origin.current) restoreThumb();
    origin.current = null;
    setDrag(null);
  }, [blocked, readOnly, min, max, step, length, orientation, trackPress]);
  const update = (index: number, value: number, base = normalized) => {
    const next = [...base];
    next[index] = Math.min(
      index === 0 && next.length === 2 ? next[1]! : max,
      Math.max(index === 1 ? next[0]! : min, snapSlider(value, bounds)),
    );
    return next;
  };
  const position = (event: EventPayload) =>
    vertical ? (event.y ?? 0) : (event.x ?? 0);
  const move = (event: EventPayload) => {
    if (blocked || readOnly || drag === null || !origin.current) return null;
    const delta =
      (position(event) - origin.current.position) * (vertical ? -1 : 1);
    const next = update(
      drag,
      origin.current.values[drag]! + (delta / span) * (max - min),
      origin.current.values,
    );
    change(next);
    return next;
  };
  const cancel = () => {
    if (origin.current && !blocked) change(origin.current.values);
    origin.current = null;
    setDrag(null);
    restoreThumb();
  };
  const fraction = (v: number) => (max === min ? 0 : (v - min) / (max - min));
  const low = normalized.length === 2 ? fraction(normalized[0]!) : 0,
    high = fraction(normalized.at(-1)!);
  const hasLabels = marks.some((mark) => mark.label);
  const sortedMarks = [...marks].sort((a, b) => a.value - b.value);
  const selectTrack = (value: number) => {
    if (blocked || readOnly || drag !== null) return;
    const index = nearestSliderThumb(normalized, value, preferred.current);
    preferred.current = index;
    const node = thumbs.current.get(index);
    if (node) focusElement(renderer, node.id);
    const next = update(index, value);
    if (next[index] !== normalized[index]) {
      change(next);
      commit?.(next);
    }
  };
  return (
    <Stack testId={testId} gap={8}>
      {label ? (
        <Text size={12} weight={500}>
          {label}
        </Text>
      ) : null}
      {error ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {error}
        </Text>
      ) : (
        <>
          <div
            testId={`${testId}-track`}
            style={{
              position: "relative",
              width: vertical ? (hasLabels ? 120 : 32) : safeLength,
              height: vertical ? safeLength : hasLabels ? 54 : 32,
              flexShrink: 0,
              opacity: disabled ? 0.45 : 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: vertical ? 14 : 10,
                top: vertical ? 10 : 14,
                width: vertical ? 4 : span,
                height: vertical ? span : 4,
                borderRadius: 2,
                backgroundColor: c.borderStrong,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: vertical ? 14 : 10 + low * span,
                top: vertical ? 10 + (1 - high) * span : 14,
                width: vertical ? 4 : (high - low) * span,
                height: vertical ? (high - low) * span : 4,
                borderRadius: 2,
                backgroundColor: c.accent,
              }}
            />
            {sortedMarks.map((mark, index) => {
              const point = 10 + fraction(mark.value) * span;
              const before = index
                ? 10 + fraction(sortedMarks[index - 1]!.value) * span
                : 0;
              const after =
                index + 1 < sortedMarks.length
                  ? 10 + fraction(sortedMarks[index + 1]!.value) * span
                  : safeLength;
              const left = index ? (point + before) / 2 : 0;
              const right =
                index + 1 < sortedMarks.length
                  ? (point + after) / 2
                  : safeLength;
              const labelWidth = Math.min(
                80,
                mark.value === min || mark.value === max
                  ? right - left
                  : 2 * Math.min(point - left, right - point),
              );
              const labelLeft =
                mark.value === min
                  ? 0
                  : mark.value === max
                    ? safeLength - labelWidth
                    : point - labelWidth / 2;
              const showLabel =
                mark.label &&
                (vertical ? right - left >= 14 : labelWidth >= 10);
              return (
                <div
                  key={mark.value}
                  testId={`${testId}-mark-${mark.value}`}
                  style={{
                    position: "absolute",
                    left: vertical ? 27 : point,
                    top: vertical ? safeLength - point : 27,
                    width: vertical ? 5 : 1,
                    height: vertical ? 1 : 5,
                    backgroundColor: c.muted,
                    pointerEvents: "none",
                  }}
                >
                  {showLabel ? (
                    <div
                      style={{
                        position: "absolute",
                        left: vertical ? 10 : labelLeft - point,
                        top: vertical ? -7 : 9,
                        width: vertical ? 80 : labelWidth,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent:
                          vertical || mark.value === min
                            ? "flex-start"
                            : mark.value === max
                              ? "flex-end"
                              : "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Text
                        testId={`${testId}-mark-label-${mark.value}`}
                        size={10}
                        color={c.muted}
                        lines={1}
                        style={{ minWidth: 0, flexShrink: 1 }}
                      >
                        {mark.label}
                      </Text>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {trackPress
              ? sliderHitRegions(bounds, safeLength).map((region, index) => (
                  <div
                    key={index}
                    testId={`${testId}-stop-${index}`}
                    onClick={(event) => {
                      if (event.button === undefined || event.button === 0)
                        selectTrack(region.value);
                    }}
                    style={{
                      position: "absolute",
                      left: vertical ? 0 : region.start,
                      top: vertical
                        ? safeLength - region.start - region.length
                        : 0,
                      width: vertical ? 32 : region.length,
                      height: vertical ? region.length : 32,
                      backgroundColor: "transparent",
                      cursor: blocked || readOnly ? "default" : "pointer",
                    }}
                  />
                ))
              : null}
            {normalized.map((value, index) => (
              <Thumb
                key={index}
                testId={`${testId}-thumb-${index}`}
                controlRef={(node) => {
                  if (node) thumbs.current.set(index, node);
                  else thumbs.current.delete(index);
                }}
                readOnly={readOnly}
                disabled={blocked}
                vertical={vertical}
                coordinate={
                  10 + (vertical ? 1 - fraction(value) : fraction(value)) * span
                }
                dragging={drag === index}
                onStart={(event) => {
                  preferred.current = index;
                  origin.current = {
                    position: position(event),
                    values: [...normalized],
                  };
                  setDrag(index);
                }}
                onKey={(event) => {
                  preferred.current = index;
                  if (readOnly) return false;
                  if (event.key === "escape" && drag !== null) {
                    cancel();
                    return true;
                  }
                  if (drag !== null && event.key === "tab") {
                    cancel();
                    return false;
                  }
                  if (drag !== null) return true;
                  const next = moveSlider(
                    value,
                    event.key ?? "",
                    bounds,
                    !!event.modifiers?.shift,
                  );
                  if (next === null) return false;
                  const updated = update(index, next);
                  change(updated);
                  commit?.(updated);
                  return true;
                }}
              />
            ))}
          </div>
          {showValue ? (
            <Row>
              <Text testId={`${testId}-value`} size={11} color={c.muted}>
                {normalized.map(formatValue).join(" – ")}
              </Text>
            </Row>
          ) : null}
        </>
      )}
      {drag !== null && !blocked && !readOnly ? (
        <OverlayCapture
          position={{ x: 0, y: 0 }}
          deferred
          occlude
          style={{ backgroundColor: "transparent" }}
        >
          <DragCapture
            testId={`${testId}-drag`}
            onMouseMove={move}
            onCancel={cancel}
            onTab={(backward) => {
              cancel();
              const node = thumbs.current.get(preferred.current);
              if (node && scope) scope.move(node.id, backward);
              else if (backward) renderer?.focusPrevious?.();
              else renderer?.focusNext?.();
            }}
            onMouseUp={(event) => {
              const next = move(event);
              origin.current = null;
              setDrag(null);
              if (next) commit?.(next);
              restoreThumb();
            }}
            onMouseDownOutside={cancel}
            style={{
              width: window.width,
              height: window.height,
              pointerEvents: "auto",
              cursor: vertical ? "row-resize" : "col-resize",
            }}
          />
        </OverlayCapture>
      ) : null}
    </Stack>
  );
}
/** 顶层捕获层临时持有焦点，避免嵌套 Popover 遮挡拇指的 Escape/Tab。 */
function DragCapture({
  testId,
  onCancel,
  onTab,
  ...props
}: {
  testId: string;
  onCancel: () => void;
  onTab: (backward: boolean) => void;
  onMouseMove: (event: EventPayload) => unknown;
  onMouseUp: (event: EventPayload) => void;
  onMouseDownOutside: () => void;
  style: import("@gpuix/react").StyleDesc;
}) {
  const { renderer } = useGpuix();
  const node = useRef<PublicInstance>(null);
  useEffect(() => {
    if (node.current) focusElement(renderer, node.current.id);
  }, [renderer, props.onMouseMove]);
  return (
    <div
      {...props}
      ref={node}
      testId={testId}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "escape") onCancel();
        else if (event.key === "tab") onTab(!!event.modifiers?.shift);
      }}
    />
  );
}
function Thumb({
  testId,
  disabled,
  readOnly,
  controlRef,
  vertical,
  coordinate,
  dragging,
  onStart,
  onKey,
}: {
  testId: string;
  disabled: boolean;
  readOnly: boolean;
  controlRef: (node: PublicInstance | null) => void;
  vertical: boolean;
  coordinate: number;
  dragging: boolean;
  onStart: (event: EventPayload) => void;
  onKey: (event: EventPayload) => boolean;
}) {
  const { colors: c } = useTheme();
  const focus = useFocusTarget(disabled, controlRef);
  return (
    <div
      testId={testId}
      ref={focus.ref}
      tabIndex={disabled ? -1 : 0}
      onMouseDown={(event) => {
        if (disabled || (event.button !== undefined && event.button !== 0))
          return;
        focus.onMouseDown();
        if (!readOnly) onStart(event);
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        focus.onMouseDown();
        if (onKey(event)) return;
        focus.onKeyDown(event);
      }}
      style={{
        position: "absolute",
        left: vertical ? 6 : coordinate - 10,
        top: vertical ? coordinate - 10 : 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: focus.focused || dragging ? c.accent : c.borderStrong,
        backgroundColor: c.elevated,
        cursor:
          disabled || readOnly
            ? "default"
            : vertical
              ? "row-resize"
              : "col-resize",
        boxShadow: {
          offsetX: 0,
          offsetY: 1,
          blurRadius: 3,
          spreadRadius: 0,
          color: c.shadow,
        },
      }}
    />
  );
}
/** 固定长度轨道；拖动拇指用窗口坐标差，不假定存在 DOM 测量或局部坐标。 */
export function Slider({
  value,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  return (
    <SliderControl
      {...props}
      values={[value]}
      change={(v) => onValueChange(v[0]!)}
      commit={onValueCommit ? (v) => onValueCommit(v[0]!) : undefined}
    />
  );
}
export function RangeSlider({
  value,
  onValueChange,
  onValueCommit,
  ...props
}: RangeSliderProps) {
  return (
    <SliderControl
      {...props}
      values={value}
      change={(v) => onValueChange([v[0]!, v[1]!])}
      commit={onValueCommit ? (v) => onValueCommit([v[0]!, v[1]!]) : undefined}
    />
  );
}
