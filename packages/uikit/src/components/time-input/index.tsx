import { useEffect, useMemo, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Input, Row, Stack, Text } from "../../base";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Popover } from "../popover";
import {
  isSelectableTime,
  stepTime,
  timeConfigError,
  timeOptions,
  type TimeRules,
} from "./model";
export {
  isSelectableTime,
  stepTime,
  timeConfigError,
  timeMinutes,
  timeOptions,
  timeString,
  type TimeRules,
} from "./model";
interface TimeCommon extends TimeRules {
  testId: string;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  errorLabel?: string;
}
export interface TimeFieldProps extends TimeCommon {
  /** 原始草稿由应用持有；只有合法提交才触发 onValueCommit。 */
  value: string;
  onValueChange: (value: string) => void;
  onValueCommit?: (value: string) => void;
  placeholder?: string;
}
export function TimeField(props: TimeFieldProps) {
  const {
    value,
    onValueChange,
    onValueCommit,
    testId,
    label,
    disabled,
    readOnly,
    errorLabel = "Choose an available time in HH:mm.",
    placeholder = "HH:mm",
  } = props;
  const { colors: c } = useTheme();
  const configError = timeConfigError(props);
  const blocked = disabled || Boolean(configError);
  const valid = isSelectableTime(value, props);
  const previous = stepTime(value, -1, props),
    next = stepTime(value, 1, props);
  const [revision, setRevision] = useState(0);
  const tab = useRef<object | null>(null);
  const step = (direction: -1 | 1) => {
    if (blocked || readOnly) return;
    const result = direction === 1 ? next : previous;
    if (result !== null && result !== value) {
      onValueChange(result);
      onValueCommit?.(result);
    }
  };
  return (
    <Stack testId={`${testId}-field`} gap={5}>
      {label ? (
        <Text size={12} weight={500}>
          {label}
        </Text>
      ) : null}
      <Row>
        <Input
          testId={testId}
          value={value}
          resetKey={revision}
          disabled={blocked}
          readOnly={readOnly}
          placeholder={placeholder}
          invalid={Boolean(configError) || Boolean(value && !valid)}
          style={{ flexGrow: 1, flexShrink: 1, width: undefined }}
          onValueChange={(text) => {
            // 0.7.0 Tab 可能写入制表符；保留草稿并重建内部编辑器。
            if (tab.current) {
              tab.current = null;
              setRevision((n) => n + 1);
              return;
            }
            onValueChange(text);
          }}
          onSubmit={() => {
            if (!blocked && !readOnly && valid) onValueCommit?.(value);
          }}
          onKeyDown={(event) => {
            if (event.key === "tab") {
              const pending = {};
              tab.current = pending;
              void Promise.resolve().then(() => {
                if (tab.current === pending) tab.current = null;
              });
            }
            if (
              (event.key === "up" || event.key === "down") &&
              !event.modifiers?.cmd &&
              !event.modifiers?.ctrl &&
              !event.modifiers?.alt
            ) {
              step(event.key === "up" ? 1 : -1);
              return true;
            }
            return false;
          }}
        />
        <Button
          testId={`${testId}-decrement`}
          disabled={
            blocked || readOnly || previous === null || previous === value
          }
          onPress={() => step(-1)}
        >
          −
        </Button>
        <Button
          testId={`${testId}-increment`}
          disabled={blocked || readOnly || next === null || next === value}
          onPress={() => step(1)}
        >
          +
        </Button>
      </Row>
      {configError || (value && !valid) ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {configError ?? errorLabel}
        </Text>
      ) : null}
    </Stack>
  );
}
export interface TimeListProps extends TimeCommon {
  value: string | null;
  onValueChange: (value: string) => void;
  autoFocus?: boolean;
  emptyLabel?: string;
}
const pageSize = 8;
export function TimeList(props: TimeListProps) {
  const {
    value,
    onValueChange,
    testId,
    disabled,
    readOnly,
    label,
    autoFocus = false,
    emptyLabel = "No available times.",
  } = props;
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const node = useRef<PublicInstance>(null);
  const options = useMemo(
    () => timeOptions(props),
    [props.min, props.max, props.stepMinutes, props.isTimeDisabled],
  );
  const configError = timeConfigError(props);
  const initial = Math.max(0, options.indexOf(value ?? ""));
  const [active, setActive] = useState(initial);
  useEffect(
    () => setActive(Math.max(0, options.indexOf(value ?? ""))),
    [value, options],
  );
  const index = Math.min(active, Math.max(0, options.length - 1));
  const page = Math.floor(index / pageSize),
    pages = Math.ceil(options.length / pageSize);
  const focus = useFocusTarget(Boolean(disabled), node);
  useEffect(() => {
    if (autoFocus && !disabled && node.current)
      focusElement(renderer, node.current.id);
  }, [autoFocus, disabled, Boolean(options.length), renderer]);
  const choose = (time: string) => {
    if (!disabled && !readOnly && options.includes(time)) onValueChange(time);
  };
  const movePage = (direction: number) => {
    setActive(
      Math.max(0, Math.min(options.length - 1, (page + direction) * pageSize)),
    );
    if (node.current) focusElement(renderer, node.current.id);
  };
  return (
    <Stack testId={testId} gap={4}>
      {label ? (
        <Text size={12} weight={500}>
          {label}
        </Text>
      ) : null}
      {configError || !options.length ? (
        // 空列表仍可接收 Escape/Tab，使弹层不会把按键交给外层 Dialog。
        <div
          ref={focus.ref}
          tabIndex={disabled ? -1 : 0}
          testId={`${testId}-empty-focus`}
          onMouseDown={focus.onMouseDown}
          onKeyDown={focus.onKeyDown}
        >
          <Text
            testId={`${testId}-empty`}
            size={12}
            color={configError ? c.danger : c.muted}
          >
            {configError ?? emptyLabel}
          </Text>
        </div>
      ) : (
        <>
          <div
            ref={focus.ref}
            testId={`${testId}-list`}
            tabIndex={disabled ? -1 : 0}
            onMouseDown={focus.onMouseDown}
            onKeyDown={(event) => {
              if (disabled) return;
              const targets: Record<string, number> = {
                up: index - 1,
                down: index + 1,
                home: 0,
                end: options.length - 1,
                pageup: index - pageSize,
                pagedown: index + pageSize,
              };
              if (targets[event.key ?? ""] !== undefined) {
                setActive(
                  Math.max(
                    0,
                    Math.min(options.length - 1, targets[event.key ?? ""]!),
                  ),
                );
                return;
              }
              if (event.key === "enter" || event.key === "space") {
                if (!event.isHeld) choose(options[index]!);
                return;
              }
              focus.onKeyDown(event);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              borderWidth: 1,
              borderColor: focus.focused ? c.accent : c.border,
              borderRadius: 6,
              padding: 2,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {options
              .slice(page * pageSize, (page + 1) * pageSize)
              .map((time, offset) => {
                const highlighted = page * pageSize + offset === index;
                return (
                  <div
                    key={time}
                    testId={`${testId}-option-${time}`}
                    onMouseDown={(event) => {
                      if (
                        (event.button === undefined || event.button === 0) &&
                        !disabled
                      ) {
                        setActive(page * pageSize + offset);
                        focus.onMouseDown();
                      }
                    }}
                    onClick={(event) => {
                      if (event.button === undefined || event.button === 0)
                        choose(time);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: 27,
                      flexShrink: 0,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: 4,
                      backgroundColor: highlighted ? c.primary : "transparent",
                    }}
                  >
                    <Text size={12} color={highlighted ? c.onPrimary : c.text}>
                      {time}
                    </Text>
                    <Text size={12} color={highlighted ? c.onPrimary : c.text}>
                      {time === value ? "✓" : ""}
                    </Text>
                  </div>
                );
              })}
          </div>
          <Row style={{ justifyContent: "space-between" }}>
            <Button
              size="sm"
              variant="ghost"
              testId={`${testId}-previous`}
              disabled={disabled || page === 0}
              onPress={() => movePage(-1)}
            >
              ‹
            </Button>
            <Text
              testId={`${testId}-page`}
              size={11}
            >{`${page + 1} / ${pages}`}</Text>
            <Button
              size="sm"
              variant="ghost"
              testId={`${testId}-next`}
              disabled={disabled || page + 1 === pages}
              onPress={() => movePage(1)}
            >
              ›
            </Button>
          </Row>
        </>
      )}
    </Stack>
  );
}
export interface TimePickerProps extends TimeCommon {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
  clearLabel?: string;
  emptyLabel?: string;
}
export function TimePicker(props: TimePickerProps) {
  const {
    value,
    onValueChange,
    testId,
    label,
    disabled,
    readOnly,
    placeholder = "Choose time",
    clearable = true,
    clearLabel = "Clear",
    errorLabel = "Choose an available time in HH:mm.",
  } = props;
  const { colors: c } = useTheme();
  const [open, setOpen] = useState(false);
  const trigger = useRef<PublicInstance>(null);
  const configError = timeConfigError(props);
  const blocked = disabled || readOnly || Boolean(configError);
  useEffect(() => {
    if (blocked) setOpen(false);
  }, [blocked]);
  return (
    <Stack gap={5} testId={testId}>
      {label ? (
        <Text size={12} weight={500}>
          {label}
        </Text>
      ) : null}
      <Row>
        <Popover
          testId={`${testId}-popup`}
          open={open && !blocked}
          onOpenChange={setOpen}
          width={240}
          autoFocus={false}
          restoreFocusRef={trigger}
          anchor={
            <Button
              testId={`${testId}-trigger`}
              ref={trigger}
              disabled={disabled || Boolean(configError)}
              onPress={() => {
                if (!blocked) setOpen((v) => !v);
              }}
            >
              {value ?? placeholder}
            </Button>
          }
        >
          <TimeList
            {...props}
            label={undefined}
            testId={`${testId}-times`}
            autoFocus
            onValueChange={(time) => {
              if (!blocked) {
                onValueChange(time);
                setOpen(false);
              }
            }}
          />
        </Popover>
        {clearable && value !== null ? (
          <Button
            testId={`${testId}-clear`}
            variant="ghost"
            disabled={blocked}
            onPress={() => onValueChange(null)}
          >
            {clearLabel}
          </Button>
        ) : null}
      </Row>
      {configError || (value !== null && !isSelectableTime(value, props)) ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {configError ?? errorLabel}
        </Text>
      ) : null}
    </Stack>
  );
}
