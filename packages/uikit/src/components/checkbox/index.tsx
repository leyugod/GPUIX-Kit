import { Checkbox } from "../../base/selection";
import { Stack, Text } from "../../base/primitives";
import { useTheme } from "../../core/theme";
import {
  checkboxState,
  checkboxOptionsError,
  toggleCheckboxScope,
  type CheckboxOption,
} from "./model";
export interface CheckboxGroupProps {
  options: readonly CheckboxOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  label?: string;
  selectAllLabel?: string;
  showSelectAll?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  emptyLabel?: string;
  testId: string;
}
export function CheckboxGroup({
  options,
  value,
  onValueChange,
  label,
  selectAllLabel = "Select all",
  showSelectAll = true,
  disabled = false,
  readOnly = false,
  emptyLabel = "No options",
  testId,
}: CheckboxGroupProps) {
  const { colors: c } = useTheme();
  const error = checkboxOptionsError(options);
  const blocked = disabled || readOnly || !!error;
  return (
    <Stack testId={testId} gap={6}>
      {label ? (
        <Text size={13} weight={600}>
          {label}
        </Text>
      ) : null}
      {error ? (
        <Text testId={`${testId}-error`} size={11} color={c.danger}>
          {error}
        </Text>
      ) : !options.length ? (
        <Text testId={`${testId}-empty`} size={12} color={c.muted}>
          {emptyLabel}
        </Text>
      ) : (
        <>
          {showSelectAll ? (
            <Checkbox
              testId={`${testId}-all`}
              label={selectAllLabel}
              checked={checkboxState(options, value)}
              disabled={disabled || options.every((o) => o.disabled)}
              readOnly={readOnly}
              onCheckedChange={(checked) => {
                if (!blocked)
                  onValueChange(toggleCheckboxScope(options, value, checked));
              }}
            />
          ) : null}
          <Stack gap={2} style={{ paddingLeft: showSelectAll ? 18 : 0 }}>
            {options.map((option) => (
              <Checkbox
                key={option.value}
                testId={`${testId}-${option.value}`}
                label={option.label}
                checked={value.includes(option.value)}
                disabled={disabled || option.disabled}
                readOnly={readOnly}
                onCheckedChange={(checked) => {
                  if (!blocked && !option.disabled)
                    onValueChange(
                      toggleCheckboxScope([option], value, checked),
                    );
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
export {
  Checkbox,
  type CheckboxProps,
  type CheckboxState,
} from "../../base/selection";
export type { CheckboxOption } from "./model";
