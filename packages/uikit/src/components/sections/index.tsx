import { type ReactNode } from "react";
import { Button, Row, Stack, Text, Separator } from "../../base";
import { useTheme } from "../../core/theme";
import { catalogError } from "../catalog-model";
export interface HeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  leading?: ReactNode;
  testId: string;
}
export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  leading,
  testId,
}: HeadingProps) {
  const { colors: c } = useTheme();
  return (
    <Stack testId={testId} gap={8}>
      {eyebrow ? (
        <Text color={c.accent} size={12}>
          {eyebrow}
        </Text>
      ) : null}
      <Row>
        {leading}
        <Text
          size={20}
          weight={600}
          lines={2}
          style={{ flexGrow: 1, flexShrink: 1 }}
        >
          {title}
        </Text>
        {actions}
      </Row>
      {description ? (
        <Text color={c.muted} size={13}>
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
export function PageHeader(
  props: HeadingProps & { breadcrumbs?: ReactNode; tabs?: ReactNode },
) {
  return (
    <Stack testId={props.testId + "-page"} gap={14}>
      {props.breadcrumbs}
      <SectionHeader {...props} />
      {props.tabs}
      <Separator />
    </Stack>
  );
}
export function SectionFooter({
  children,
  actions,
  testId,
}: {
  children?: ReactNode;
  actions?: ReactNode;
  testId: string;
}) {
  return (
    <Stack testId={testId}>
      <Separator />
      <Row>
        <div style={{ flexGrow: 1 }}>{children}</div>
        {actions}
      </Row>
    </Stack>
  );
}
export function ContentDivider({
  label,
  orientation = "horizontal",
  testId,
}: {
  label?: string;
  orientation?: "horizontal" | "vertical";
  testId: string;
}) {
  const { colors: c } = useTheme();
  return orientation === "vertical" ? (
    <div
      testId={testId}
      style={{ width: 1, height: 40, backgroundColor: c.border }}
    />
  ) : (
    <Row testId={testId}>
      <div style={{ height: 1, flexGrow: 1, backgroundColor: c.border }} />
      {label ? (
        <Text color={c.muted} size={12}>
          {label}
        </Text>
      ) : null}
      <div style={{ height: 1, flexGrow: 1, backgroundColor: c.border }} />
    </Row>
  );
}
export interface HeaderNavigationItem {
  id: string;
  label: string;
  disabled?: boolean;
}
export function HeaderNavigation({
  brand,
  items,
  value,
  onValueChange,
  actions,
  testId,
}: {
  brand?: ReactNode;
  items: readonly HeaderNavigationItem[];
  value: string;
  onValueChange: (id: string) => void;
  actions?: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  if (catalogError(items, 12))
    return <Text color={c.danger}>Invalid navigation</Text>;
  return (
    <Stack testId={testId}>
      <Row>
        {brand}
        <div style={{ flexGrow: 1 }} />
        {actions}
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        {items.map((i) => (
          <Button
            key={i.id}
            testId={testId + "-" + i.id}
            disabled={i.disabled}
            variant={value === i.id ? "secondary" : "ghost"}
            onPress={() => onValueChange(i.id)}
          >
            {i.label}
          </Button>
        ))}
      </Row>
      <Separator />
    </Stack>
  );
}
export function InlineCTA({
  title,
  description,
  actions,
  leading,
  testId,
}: HeadingProps) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      style={{
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.subtle,
      }}
    >
      <SectionHeader
        title={title}
        description={description}
        leading={leading}
        testId={testId + "-heading"}
      />
      {actions}
    </Stack>
  );
}
export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: "pending" | "current" | "complete" | "error";
  disabled?: boolean;
}
export function ProgressSteps({
  steps,
  onStepChange,
  orientation = "vertical",
  disabled,
  testId,
}: {
  steps: readonly ProgressStep[];
  onStepChange?: (id: string) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme();
  if (catalogError(steps, 12))
    return (
      <Text testId={testId + "-error"} color={c.danger}>
        Invalid steps
      </Text>
    );
  return (
    <div
      testId={testId}
      style={{
        display: "flex",
        flexDirection: orientation === "horizontal" ? "row" : "column",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {steps.map((s, i) => (
        <Stack key={s.id} gap={4}>
          <Button
            testId={testId + "-" + s.id}
            disabled={disabled || s.disabled || !onStepChange}
            variant={
              s.status === "current"
                ? "primary"
                : s.status === "error"
                  ? "destructive"
                  : "ghost"
            }
            onPress={() => onStepChange?.(s.id)}
          >
            {s.status === "complete"
              ? "✓"
              : s.status === "error"
                ? "!"
                : String(i + 1)}{" "}
            {s.label}
          </Button>
          {s.description ? (
            <Text color={c.muted} size={12}>
              {s.description}
            </Text>
          ) : null}
        </Stack>
      ))}
    </div>
  );
}

export type SectionHeaderProps = Parameters<typeof SectionHeader>[0];

export type PageHeaderProps = Parameters<typeof PageHeader>[0];

export type SectionFooterProps = Parameters<typeof SectionFooter>[0];

export type ContentDividerProps = Parameters<typeof ContentDivider>[0];

export type HeaderNavigationProps = Parameters<typeof HeaderNavigation>[0];

export type InlineCTAProps = Parameters<typeof InlineCTA>[0];

export type ProgressStepsProps = Parameters<typeof ProgressSteps>[0];
