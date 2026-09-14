import { type ReactNode } from "react";
import type { EventPayload, StyleDesc } from "@gpuix/react";
import { useTheme } from "../core/theme";
import { controlSizes, radius, type ControlSize } from "../core/tokens";
import { isActivation } from "../core/rules";
import { Text, type ControlRef } from "./primitives";
import { useFocusTarget } from "../core/focus";
export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
export interface ButtonProps {
  children?: ReactNode;
  onPress: () => void;
  testId: string;
  variant?: ButtonVariant;
  size?: ControlSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  fullWidth?: boolean;
  /** 组合控件可显式限制标签行数，避免长名称撑破固定宽度。 */
  labelLines?: number;
  style?: StyleDesc;
  ref?: ControlRef;
  onKeyDown?: (event: EventPayload) => boolean | void;
}
export function Button({
  children,
  onPress,
  testId,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  loadingText = "…",
  leading,
  trailing,
  fullWidth,
  labelLines,
  style,
  ref,
  onKeyDown,
}: ButtonProps) {
  const { colors: c } = useTheme();
  const blocked = disabled || loading;
  const focus = useFocusTarget(blocked, ref);
  const s = controlSizes[size];
  const fill =
    variant === "primary"
      ? c.primary
      : variant === "destructive"
        ? c.dangerSoft
        : variant === "ghost" || variant === "outline"
          ? "transparent"
          : variant === "secondary"
            ? c.subtle
            : c.elevated;
  const ink =
    variant === "primary"
      ? c.onPrimary
      : variant === "destructive"
        ? c.danger
        : c.text;
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={blocked ? -1 : 0}
      onMouseDown={focus.onMouseDown}
      onClick={(event) => {
        if (!blocked && (event.button === undefined || event.button === 0))
          onPress();
      }}
      onKeyDown={(event) => {
        if (blocked) return;
        if (onKeyDown?.(event) === true) return;
        focus.onKeyDown(event);
        if (!blocked && !event.isHeld && isActivation(event.key)) onPress();
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
        height: s.height,
        paddingLeft: s.padding,
        paddingRight: s.padding,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor:
          focus.focused && !blocked
            ? c.accent
            : variant === "ghost" || variant === "primary"
              ? "transparent"
              : c.border,
        backgroundColor: fill,
        opacity: blocked ? 0.45 : 1,
        cursor: blocked ? "default" : "pointer",
        userSelect: "none",
        width: fullWidth ? "100%" : undefined,
        hover: blocked
          ? {}
          : {
              backgroundColor:
                variant === "primary" ? c.primaryHover : c.subtle,
            },
        active: blocked ? {} : { opacity: 0.8 },
        ...style,
      }}
    >
      {leading}
      {loading || children != null ? (
        <Text
          size={s.font}
          color={ink}
          weight={500}
          lines={labelLines}
          style={labelLines ? { minWidth: 0, flexShrink: 1 } : undefined}
        >
          {loading ? loadingText : children}
        </Text>
      ) : null}
      {trailing}
    </div>
  );
}
