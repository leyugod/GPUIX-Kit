import { type ReactNode } from "react";
import type { EventPayload, StyleDesc } from "@gpuix/react";
import { useNativeTheme, useTheme } from "../core/theme";
import { controlSizes, radius, type ControlSize } from "../core/tokens";
import { Stack, Text, type ControlRef } from "./primitives";
import { useFocusTarget } from "../core/focus";
export interface InputProps {
  value: string;
  onValueChange: (value: string) => void;
  testId: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: ControlSize;
  style?: StyleDesc;
  onSubmit?: () => void;
  onKeyDown?: (event: EventPayload) => boolean | void;
  ref?: ControlRef;
  /** 显式重建原生编辑器；同时重置宿主撤销与光标历史。 */
  resetKey?: string | number;
}
function useInput(props: InputProps, multiline = false) {
  const { colors: c } = useTheme();
  const theme = useNativeTheme();
  const {
    value,
    onValueChange,
    testId,
    placeholder,
    disabled,
    readOnly,
    invalid,
    size = "md",
    style,
    onSubmit,
    onKeyDown,
    ref,
  } = props;
  const focus = useFocusTarget(disabled, ref);
  return {
    ref: focus.ref,
    value,
    testId,
    placeholder,
    readOnly: disabled || readOnly,
    tabIndex: disabled ? -1 : 0,
    theme,
    onMouseDown: focus.onMouseDown,
    onKeyDown: (e: EventPayload) => {
      if (disabled) return;
      if (onKeyDown?.(e) === true) return;
      focus.onKeyDown(e);
    },
    onChange: (event: EventPayload) => {
      if (!disabled && !readOnly) onValueChange(event.value ?? "");
    },
    onSubmit: () => {
      if (!disabled) onSubmit?.();
    },
    style: {
      // 0.7.0 编辑器保留自身行高，额外控件高度必须由父级垂直居中。
      display: "flex",
      alignItems: multiline ? "flex-start" : "center",
      height: controlSizes[size].height,
      width: "100%",
      minWidth: 0,
      flexShrink: 0,
      paddingLeft: 12,
      paddingRight: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: invalid ? c.danger : focus.focused ? c.accent : c.border,
      backgroundColor: c.subtle,
      color: c.text,
      fontSize: controlSizes[size].font,
      opacity: disabled ? 0.45 : 1,
      ...style,
    } satisfies StyleDesc,
  };
}
export function Input(props: InputProps) {
  return <input key={props.resetKey} {...useInput(props)} />;
}
export function Textarea({
  minRows = 3,
  maxRows = 6,
  ...props
}: InputProps & { minRows?: number; maxRows?: number }) {
  const input = useInput(props, true);
  return (
    <textarea
      key={props.resetKey}
      {...input}
      minRows={minRows}
      maxRows={Math.max(minRows, maxRows)}
      style={{
        ...input.style,
        height: undefined,
        padding: 12,
        lineHeight: 21,
        ...props.style,
      }}
    />
  );
}
export function SearchField(props: InputProps) {
  return <Input placeholder="Search…" {...props} />;
}
export function Field({
  label,
  hint,
  error,
  required,
  children,
  testId,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack testId={testId} gap={7}>
      <Text size="small" weight={500}>
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
      {error || hint ? (
        <Text
          testId={testId ? `${testId}-message` : undefined}
          size="small"
          color={error ? c.danger : c.muted}
        >
          {error ?? hint}
        </Text>
      ) : null}
    </Stack>
  );
}
