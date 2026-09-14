export type FormValues = Record<string, string>;
export type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>;
export type FieldRule<T extends FormValues> = (
  value: string,
  values: Readonly<T>,
) => string | undefined;
export type FormRules<T extends FormValues> = Partial<
  Record<keyof T, FieldRule<T>>
>;
export function validateForm<T extends FormValues>(
  values: T,
  rules: FormRules<T>,
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const message = rules[key]?.(values[key] ?? "", values);
    if (message) errors[key] = message;
  }
  return errors;
}
export const required =
  (message = "This field is required") =>
  (value: string) =>
    value.trim() ? undefined : message;
export const minLength =
  (length: number, message = `Use at least ${length} characters`) =>
  (value: string) =>
    value.length >= length ? undefined : message;
export function composeRules<T extends FormValues>(
  ...rules: FieldRule<T>[]
): FieldRule<T> {
  return (value, values) => {
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return undefined;
  };
}
