import { useState, type ReactNode } from "react";
import { useTheme } from "../core/theme";
import { radius } from "../core/tokens";
import {
  Button,
  Row,
  Stack,
  Text,
  Separator,
  type ViewProps,
  type ChoiceProps,
} from "../base";
export function Card({ children, style, testId }: ViewProps) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={0}
      style={{
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: radius.lg,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </Stack>
  );
}
export function CardHeader({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
}) {
  const { colors: c } = useTheme();
  return (
    <Row style={{ padding: 18, justifyContent: "space-between" }}>
      <Stack gap={5} style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text size={14} weight={600}>
          {title}
        </Text>
        {description ? (
          <Text size={12} color={c.muted}>
            {description}
          </Text>
        ) : null}
      </Stack>
      {trailing}
    </Row>
  );
}
export const CardContent = ({ style, ...props }: ViewProps) => (
  <Stack {...props} style={{ padding: 18, ...style }} />
);
export function CardFooter({ children, style, testId }: ViewProps) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      style={{
        padding: 14,
        borderTopWidth: 1,
        borderColor: c.border,
        backgroundColor: c.subtle,
        ...style,
      }}
    >
      {children}
    </Row>
  );
}
export function Toolbar({ children, style, testId }: ViewProps) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: c.border,
        ...style,
      }}
    >
      {children}
    </Row>
  );
}
export function SegmentedControl({
  options,
  value,
  onValueChange,
  disabled,
  testId,
  style,
}: ChoiceProps) {
  const { colors: c } = useTheme();
  return (
    <Row
      testId={testId}
      gap={3}
      style={{
        padding: 3,
        borderRadius: radius.md,
        backgroundColor: c.subtle,
        borderWidth: 1,
        borderColor: c.border,
        ...style,
      }}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          testId={`${testId}-${option.value}`}
          onPress={() => onValueChange(option.value)}
          disabled={disabled || option.disabled}
          size="sm"
          variant={value === option.value ? "default" : "ghost"}
          style={{
            backgroundColor:
              value === option.value ? c.elevated : "transparent",
            borderColor: value === option.value ? c.border : "transparent",
          }}
        >
          {option.label}
        </Button>
      ))}
    </Row>
  );
}
export function Tabs({
  panels,
  ...props
}: ChoiceProps & { panels: Record<string, ReactNode> }) {
  return (
    <Stack>
      <SegmentedControl {...props} />
      <div testId={`${props.testId}-panel`} style={{ minWidth: 0 }}>
        {panels[props.value]}
      </div>
    </Stack>
  );
}
export function Accordion({
  title,
  children,
  testId,
  defaultOpen = false,
}: ViewProps & { title: string; testId: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card testId={testId}>
      <Button
        variant="ghost"
        testId={`${testId}-trigger`}
        fullWidth
        onPress={() => setOpen(!open)}
        style={{ justifyContent: "space-between", height: 42, borderRadius: 0 }}
        trailing={<Text size={12}>{open ? "−" : "+"}</Text>}
      >
        {title}
      </Button>
      {open ? (
        <>
          <Separator />
          <CardContent testId={`${testId}-content`}>{children}</CardContent>
        </>
      ) : null}
    </Card>
  );
}
export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
}
export function Sidebar({
  title,
  items,
  value,
  onValueChange,
  footer,
  testId = "sidebar",
}: {
  title: string;
  items: readonly NavigationItem[];
  value: string;
  onValueChange: (value: string) => void;
  footer?: ReactNode;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={7}
      style={{
        width: 220,
        height: "100%",
        backgroundColor: c.surface,
        borderRightWidth: 1,
        borderColor: c.border,
        padding: 16,
      }}
    >
      <Text size={16} weight={600} style={{ marginBottom: 24, marginTop: 8 }}>
        {title}
      </Text>
      {items.map((item) => (
        <Button
          key={item.id}
          testId={`${testId}-${item.id}`}
          disabled={item.disabled}
          onPress={() => onValueChange(item.id)}
          variant="ghost"
          leading={item.icon}
          trailing={
            item.badge ? (
              <Text size={11} color={c.muted}>
                {item.badge}
              </Text>
            ) : undefined
          }
          style={{
            justifyContent: "flex-start",
            backgroundColor: value === item.id ? c.elevated : "transparent",
            borderColor: value === item.id ? c.border : "transparent",
          }}
        >
          {item.label}
        </Button>
      ))}
      <div style={{ flexGrow: 1 }} />
      {footer}
    </Stack>
  );
}
/** 内容区由应用选择唯一的滚动容器；Shell 本身只约束窗口尺寸。 */
export function AppShell({
  sidebar,
  children,
  overlay,
  testId = "uikit-root",
}: {
  sidebar?: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <div
      testId={testId}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        backgroundColor: c.canvas,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {sidebar}
      <Stack gap={0} style={{ flexGrow: 1, flexShrink: 1, minHeight: 0 }}>
        {children}
      </Stack>
      {overlay}
    </div>
  );
}
