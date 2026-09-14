import { isValidElement, type ReactNode, type Ref } from "react";
import type { PublicInstance, StyleDesc } from "@gpuix/react";
import { useTheme } from "../core/theme";
import { typography } from "../core/tokens";
export interface ViewProps {
  children?: ReactNode;
  style?: StyleDesc;
  testId?: string;
}
function plainText(value: ReactNode): string {
  if (value == null || typeof value === "boolean") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) return value.map(plainText).join("");
  if (isValidElement<{ children?: ReactNode }>(value))
    return plainText(value.props.children);
  return "";
}
export interface TextProps extends ViewProps {
  size?: number | keyof typeof typography;
  color?: string;
  weight?: number;
  lines?: number;
}
/** 唯一的普通文本宿主：显式指定颜色，避免原生默认白字泄漏到浅色主题。 */
export function Text({
  children,
  size = "body",
  color,
  weight = 400,
  lines,
  style,
  testId,
}: TextProps) {
  const { colors } = useTheme();
  return (
    <text
      testId={testId}
      style={{
        fontFamily: ".AppleSystemUIFont",
        fontSize: typeof size === "number" ? size : typography[size],
        fontWeight: weight,
        color: color ?? colors.text,
        lineClamp: lines,
        ...style,
      }}
    >
      {plainText(children)}
    </text>
  );
}
export function Stack({
  children,
  gap = 12,
  style,
  testId,
}: ViewProps & { gap?: number }) {
  return (
    <div
      testId={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        minWidth: 0,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function Row({
  children,
  gap = 8,
  style,
  testId,
}: ViewProps & { gap?: number }) {
  return (
    <div
      testId={testId}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap,
        minWidth: 0,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function Separator({ style, testId }: Omit<ViewProps, "children">) {
  const { colors } = useTheme();
  return (
    <div
      testId={testId}
      style={{
        height: 1,
        backgroundColor: colors.border,
        flexShrink: 0,
        width: "100%",
        ...style,
      }}
    />
  );
}
export type ControlRef = Ref<PublicInstance>;
