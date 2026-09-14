import type { ReactNode } from "react";
import { Stack, Row, Text } from "../../base";
import { useTheme } from "../../core/theme";
export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  description,
  children,
  testId,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "positive" | "negative" | "neutral";
  description?: string;
  children?: ReactNode;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={10}
      style={{
        padding: 16,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        minWidth: 0,
      }}
    >
      <Text size={12} color={c.muted}>
        {label}
      </Text>
      <Row style={{ justifyContent: "space-between" }}>
        <Text size={28} weight={600}>
          {value}
        </Text>
        {change ? (
          <Text
            size={12}
            color={
              trend === "positive"
                ? c.success
                : trend === "negative"
                  ? c.danger
                  : c.muted
            }
          >
            {change}
          </Text>
        ) : null}
      </Row>
      {description ? (
        <Text size={11} color={c.muted}>
          {description}
        </Text>
      ) : null}
      {children}
    </Stack>
  );
}
