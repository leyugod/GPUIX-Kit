import type { ReactNode } from "react";
import { useTheme } from "../core/theme";
import { toneColors, type Tone } from "../core/tokens";
import { Button, Row, Stack, Text } from "../base";
export function Alert({
  title,
  description,
  tone = "accent",
  action,
  testId,
}: {
  title: string;
  description?: string;
  tone?: Tone;
  action?: ReactNode;
  testId?: string;
}) {
  const { colors } = useTheme();
  const c = toneColors(colors, tone);
  return (
    <Row
      testId={testId}
      gap={12}
      style={{
        padding: 14,
        borderRadius: 8,
        backgroundColor: c.background,
        alignItems: "flex-start",
      }}
    >
      <Text color={c.text} size={15}>
        {tone === "success" ? "✓" : tone === "danger" ? "!" : "i"}
      </Text>
      <Stack gap={5} style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text color={c.text} size={13} weight={600}>
          {title}
        </Text>
        {description ? (
          <Text color={c.text} size={12}>
            {description}
          </Text>
        ) : null}
      </Stack>
      {action}
    </Row>
  );
}
export function EmptyState({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  testId?: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={12}
      style={{ padding: 28, alignItems: "center" }}
    >
      <Text size={28} color={c.faint}>
        ◇
      </Text>
      <Text size={16} weight={600}>
        {title}
      </Text>
      <Text size={13} color={c.muted} style={{ textAlign: "center" }}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
/** 通知的时限与队列由应用管理；组件不隐式创建定时器或执行业务操作。 */
export function Toast({
  title,
  description,
  onDismiss,
  dismissLabel = "Dismiss",
  testId,
  tone = "success",
}: {
  title: string;
  description?: string;
  onDismiss: () => void;
  dismissLabel?: string;
  testId: string;
  tone?: Tone;
}) {
  return (
    <Alert
      title={title}
      description={description}
      tone={tone}
      testId={testId}
      action={
        <Button
          size="sm"
          variant="ghost"
          testId={`${testId}-dismiss`}
          onPress={onDismiss}
        >
          {dismissLabel}
        </Button>
      }
    />
  );
}
