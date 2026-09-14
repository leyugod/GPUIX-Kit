import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import {
  validateForm,
  type FormValues,
  type FormErrors,
  type FormRules,
} from "./rules";
export interface UseFormOptions<T extends FormValues> {
  values: T;
  onValuesChange: (values: T) => void;
  rules: FormRules<T>;
  onSubmit: (values: Readonly<T>) => void | Promise<void>;
  submitErrorLabel?: string;
}
/** values 由应用拥有；此控制器只管理校验、焦点和提交生命周期。 */
export function useForm<T extends FormValues>({
  values,
  onValuesChange,
  rules,
  onSubmit,
  submitErrorLabel = "Unable to save. Please try again.",
}: UseFormOptions<T>) {
  const { renderer } = useGpuix();
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pending = useRef(false),
    mounted = useRef(true);
  const refs = useRef(new Map<keyof T, PublicInstance>());
  const attempted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const focusField = (name: keyof T) => {
    const node = refs.current.get(name);
    if (node) focusElement(renderer, node.id);
  };
  const submit = async () => {
    if (pending.current) return false;
    attempted.current = true;
    const next = validateForm(values, rules);
    setErrors(next);
    setSubmitError(null);
    const invalid = (Object.keys(rules) as (keyof T)[]).find(
      (key) => next[key],
    );
    if (invalid !== undefined) {
      focusField(invalid);
      return false;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      await onSubmit({ ...values });
      return true;
    } catch {
      if (mounted.current) setSubmitError(submitErrorLabel);
      return false;
    } finally {
      pending.current = false;
      if (mounted.current) setSubmitting(false);
    }
  };
  const field = (name: keyof T) => ({
    value: values[name] ?? "",
    disabled: submitting,
    invalid: !!errors[name],
    ref: (node: PublicInstance | null) => {
      if (node) refs.current.set(name, node);
      else refs.current.delete(name);
    },
    onValueChange: (value: string) => {
      if (pending.current) return;
      const next = { ...values, [name]: value };
      onValuesChange(next);
      if (attempted.current) setErrors(validateForm(next, rules));
      setSubmitError(null);
    },
    onSubmit: () => {
      void submit();
    },
  });
  return {
    field,
    errors,
    submitting,
    submitError,
    submit,
    focusField,
    resetValidation: () => {
      setErrors({});
      setSubmitError(null);
      attempted.current = false;
    },
  };
}
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      gap={12}
      style={{ paddingBottom: 18, borderBottomWidth: 1, borderColor: c.border }}
    >
      <Text size={15} weight={600}>
        {title}
      </Text>
      {description ? (
        <Text size={12} color={c.muted}>
          {description}
        </Text>
      ) : null}
      {children}
    </Stack>
  );
}
export function FormErrorSummary({
  errors,
  labels = {},
  onFocus,
  testId,
}: {
  errors: Record<string, string | undefined>;
  labels?: Record<string, string>;
  onFocus: (name: string) => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  const entries = Object.entries(errors).filter(
    (entry): entry is [string, string] => !!entry[1],
  );
  if (!entries.length) return null;
  return (
    <Stack
      testId={testId}
      gap={4}
      style={{ padding: 10, backgroundColor: c.dangerSoft, borderRadius: 8 }}
    >
      <Text color={c.danger} size={12} weight={600}>
        Review these fields
      </Text>
      {entries.map(([name, message]) => (
        <Button
          key={name}
          testId={`${testId}-${name}`}
          size="sm"
          variant="ghost"
          style={{ justifyContent: "flex-start" }}
          onPress={() => onFocus(name)}
        >{`${labels[name] ?? name}: ${message}`}</Button>
      ))}
    </Stack>
  );
}
export function FormActions({
  onSubmit,
  onCancel,
  submitting = false,
  disabled = false,
  testId,
  submitLabel = "Save",
}: {
  onSubmit: () => void;
  onCancel?: () => void;
  submitting?: boolean;
  disabled?: boolean;
  testId: string;
  submitLabel?: string;
}) {
  return (
    <Row style={{ justifyContent: "flex-end" }}>
      {onCancel ? (
        <Button
          testId={`${testId}-cancel`}
          disabled={submitting}
          onPress={onCancel}
        >
          Cancel
        </Button>
      ) : null}
      <Button
        testId={`${testId}-submit`}
        variant="primary"
        disabled={disabled}
        loading={submitting}
        loadingText="Saving…"
        onPress={onSubmit}
      >
        {submitLabel}
      </Button>
    </Row>
  );
}
export * from "./rules";
