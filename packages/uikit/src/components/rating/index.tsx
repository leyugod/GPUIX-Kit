import { Button, Row, Text, Stack, Input } from "../../base";
import { useTheme } from "../../core/theme";
import { bounded, ratingValue, verificationValue } from "../catalog-model";
export function RatingStars({
  value,
  onValueChange,
  max = 5,
  readOnly = false,
  disabled = false,
  testId,
}: {
  value: number;
  onValueChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    count = Math.floor(bounded(max, 1, 10)),
    current = ratingValue(value, count);
  return (
    <Row testId={testId} gap={3}>
      {Array.from({ length: count }, (_, i) => (
        <Button
          key={i}
          testId={testId + "-" + (i + 1)}
          variant="ghost"
          disabled={disabled || readOnly || !onValueChange}
          onPress={() => onValueChange?.(i + 1)}
          onKeyDown={(e) => {
            const next =
              e.key === "right" || e.key === "up"
                ? current + 1
                : e.key === "left" || e.key === "down"
                  ? current - 1
                  : e.key === "home"
                    ? 0
                    : e.key === "end"
                      ? count
                      : null;
            if (next === null) return false;
            onValueChange?.(ratingValue(next, count));
            return true;
          }}
          leading={
            <Text color={i < current ? c.warning : c.muted} size={22}>
              {i < current ? "★" : "☆"}
            </Text>
          }
        />
      ))}
    </Row>
  );
}
export function RatingBadge({
  value,
  count,
  testId,
}: {
  value: number;
  count?: number;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Row testId={testId}>
      <Text color={c.warning}>★</Text>
      <Text>
        {bounded(value, 0, 5).toFixed(1)}
        {count !== undefined ? " (" + Math.max(0, Math.floor(count)) + ")" : ""}
      </Text>
    </Row>
  );
}
export function VerificationCodeInput({
  value,
  onValueChange,
  onComplete,
  length = 6,
  disabled,
  readOnly,
  error,
  testId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId: string;
}) {
  const { colors: c } = useTheme(),
    validLength = Number.isInteger(length) && length >= 4 && length <= 8;
  if (!validLength)
    return (
      <Text color={c.danger} testId={testId + "-error"}>
        Code length must be 4–8
      </Text>
    );
  return (
    <Stack testId={testId} gap={8}>
      <Input
        testId={testId + "-input"}
        value={value}
        placeholder={"0".repeat(length)}
        disabled={disabled}
        readOnly={readOnly}
        invalid={!!error}
        onValueChange={(text) => {
          const next = verificationValue(text, length);
          onValueChange(next);
          if (next.length === length && next !== value) onComplete?.(next);
        }}
        onSubmit={() => {
          if (
            !readOnly &&
            value.length === length &&
            verificationValue(value, length) === value
          )
            onComplete?.(value);
        }}
      />
      <Row>
        {Array.from({ length }, (_, i) => (
          <Text
            testId={testId + "-digit-" + i}
            key={i}
            style={{
              width: 28,
              textAlign: "center",
              padding: 5,
              borderRadius: 6,
              backgroundColor: c.subtle,
            }}
          >
            {value[i] ?? "–"}
          </Text>
        ))}
      </Row>
      {error ? (
        <Text testId={testId + "-error"} color={c.danger} size={12}>
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}

export type RatingStarsProps = Parameters<typeof RatingStars>[0];

export type RatingBadgeProps = Parameters<typeof RatingBadge>[0];

export type VerificationCodeInputProps = Parameters<
  typeof VerificationCodeInput
>[0];
