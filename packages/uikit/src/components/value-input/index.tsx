import { useEffect, useState } from "react";
import { Button, Input, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { dateWithinBounds, stepNumber } from "./rules";
export interface NumberFieldProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  testId: string;
}
export function NumberField({
  value,
  onValueChange,
  min = -1e12,
  max = 1e12,
  step = 1,
  disabled,
  testId,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const invalid = draft.trim() === "" || !Number.isFinite(Number(draft));
  const change = (delta: number) => {
    if (!disabled) {
      const next = stepNumber(value, delta, step, min, max);
      setDraft(String(next));
      onValueChange(next);
    }
  };
  return (
    <Row testId={`${testId}-field`}>
      <Button
        testId={`${testId}-decrement`}
        disabled={disabled || value <= min}
        onPress={() => change(-1)}
      >
        −
      </Button>
      <Input
        testId={testId}
        disabled={disabled}
        value={draft}
        invalid={invalid}
        onSubmit={() => {
          const next = invalid
            ? value
            : Math.min(max, Math.max(min, Number(draft)));
          setDraft(String(next));
          if (!disabled) onValueChange(next);
        }}
        style={{ flexGrow: 1, flexShrink: 1, width: undefined }}
        onValueChange={(text) => {
          setDraft(text);
          if (text.trim() && Number.isFinite(Number(text)))
            onValueChange(Math.min(max, Math.max(min, Number(text))));
        }}
        onKeyDown={(event) => {
          if (event.key === "up" || event.key === "down") {
            change(event.key === "up" ? 1 : -1);
            return true;
          }
          return false;
        }}
      />
      <Button
        testId={`${testId}-increment`}
        disabled={disabled || value >= max}
        onPress={() => change(1)}
      >
        +
      </Button>
    </Row>
  );
}
/** 日期只传日历日期字符串，避免隐式 UTC 转换。无效草稿仍交给应用保存。 */
export function DateField({
  value,
  onValueChange,
  min,
  max,
  disabled,
  testId,
  errorLabel = "Use YYYY-MM-DD within the allowed range",
}: {
  value: string;
  onValueChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  testId: string;
  errorLabel?: string;
}) {
  const { colors: c } = useTheme();
  const invalid = value !== "" && !dateWithinBounds(value, min, max);
  return (
    <Stack gap={5}>
      <Input
        testId={testId}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        placeholder="YYYY-MM-DD"
        invalid={invalid}
      />
      {invalid ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {errorLabel}
        </Text>
      ) : null}
    </Stack>
  );
}
export { dateWithinBounds, isISODate, stepNumber } from "./rules";
