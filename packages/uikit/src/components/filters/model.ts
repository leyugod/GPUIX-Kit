import { isISODate } from "../value-input/rules";
export type FilterKind = "text" | "number" | "date" | "enum" | "boolean";
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "gt"
  | "lt"
  | "before"
  | "after"
  | "isEmpty"
  | "isNotEmpty";
export interface FilterField {
  id: string;
  label: string;
  kind: FilterKind;
  disabled?: boolean;
  options?: readonly { value: string; label: string; disabled?: boolean }[];
}
export interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: string;
}
export interface FilterExpression {
  match: "all" | "any";
  conditions: readonly FilterCondition[];
}
export interface SavedFilterView {
  id: string;
  label: string;
  filter: FilterExpression;
  disabled?: boolean;
  readOnly?: boolean;
  revision?: string | number;
}
export const operatorLabels: Record<FilterOperator, string> = {
  equals: "is",
  notEquals: "is not",
  contains: "contains",
  gt: "greater than",
  lt: "less than",
  before: "before",
  after: "after",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
};
export function filterOperators(kind: FilterKind): FilterOperator[] {
  const base: FilterOperator[] = ["equals", "notEquals"];
  if (kind === "text") base.push("contains");
  if (kind === "number") base.push("gt", "lt");
  if (kind === "date") base.push("before", "after");
  return [...base, "isEmpty", "isNotEmpty"];
}
export function valuelessOperator(op: FilterOperator) {
  return op === "isEmpty" || op === "isNotEmpty";
}
const identity = (id: string) =>
  typeof id === "string" && id.length > 0 && id.length <= 128;
export function filterFieldsError(
  fields: readonly FilterField[],
): string | null {
  if (fields.length > 24) return "Use at most 24 filter fields.";
  const seen = new Set<string>();
  for (const field of fields) {
    if (
      !identity(field.id) ||
      seen.has(field.id) ||
      typeof field.label !== "string" ||
      !field.label.trim() ||
      field.label.length > 100 ||
      !["text", "number", "date", "enum", "boolean"].includes(field.kind)
    )
      return "Invalid or duplicate filter field.";
    seen.add(field.id);
    if (field.kind === "enum") {
      const options = field.options ?? [],
        values = new Set<string>();
      if (!options.length || options.length > 50)
        return "Use 1–50 enum options.";
      for (const option of options) {
        if (
          !identity(option.value) ||
          values.has(option.value) ||
          !option.label?.trim() ||
          option.label.length > 100
        )
          return "Invalid or duplicate enum option.";
        values.add(option.value);
      }
    }
  }
  return null;
}
/** 草稿允许暂时无值；结构错误单独阻止编辑，避免把未知字段悄悄转换成其他条件。 */
export function filterShapeError(
  fields: readonly FilterField[],
  value: FilterExpression,
): string | null {
  const catalog = filterFieldsError(fields);
  if (catalog) return catalog;
  if (!["all", "any"].includes(value.match) || value.conditions.length > 12)
    return "Use all/any with at most 12 conditions.";
  const seen = new Set<string>();
  for (const condition of value.conditions) {
    const field = fields.find((f) => f.id === condition.fieldId);
    if (
      !identity(condition.id) ||
      seen.has(condition.id) ||
      !field ||
      !filterOperators(field.kind).includes(condition.operator) ||
      typeof condition.value !== "string"
    )
      return "Invalid condition identity, field, operator or value type.";
    seen.add(condition.id);
  }
  return null;
}
export function conditionValueError(
  field: FilterField,
  condition: FilterCondition,
): string | null {
  if (valuelessOperator(condition.operator))
    return condition.value === ""
      ? null
      : "This operator does not accept a value.";
  if (field.disabled) return "This field is unavailable.";
  const value = condition.value;
  if (value.length > 500) return "Use at most 500 characters.";
  if (!value.trim()) return "Enter a value.";
  if (
    field.kind === "number" &&
    (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) ||
      !Number.isFinite(Number(value)))
  )
    return "Enter a finite decimal number.";
  if (field.kind === "date" && !isISODate(value))
    return "Use a valid YYYY-MM-DD date.";
  if (field.kind === "boolean" && !["true", "false"].includes(value))
    return "Choose true or false.";
  if (
    field.kind === "enum" &&
    !field.options?.some((o) => o.value === value && !o.disabled)
  )
    return "Choose an available option.";
  return null;
}
export function filterExpressionError(
  fields: readonly FilterField[],
  value: FilterExpression,
): string | null {
  const shape = filterShapeError(fields, value);
  if (shape) return shape;
  for (const condition of value.conditions) {
    const field = fields.find((f) => f.id === condition.fieldId)!;
    if (field.disabled) return "This field is unavailable.";
    const error = conditionValueError(field, condition);
    if (error) return error;
  }
  return null;
}
export function cloneFilter(value: FilterExpression): FilterExpression {
  return {
    match: value.match,
    conditions: value.conditions.map((c) => ({ ...c })),
  };
}
export function filterFingerprint(value: FilterExpression) {
  return JSON.stringify([
    value.match,
    value.conditions.map((c) => [c.id, c.fieldId, c.operator, c.value]),
  ]);
}
export function defaultCondition(
  id: string,
  field: FilterField,
): FilterCondition {
  return {
    id,
    fieldId: field.id,
    operator: "equals",
    value:
      field.kind === "boolean"
        ? "true"
        : field.kind === "enum"
          ? (field.options?.find((o) => !o.disabled)?.value ?? "")
          : "",
  };
}
export function nextConditionId(value: FilterExpression) {
  let i = 1;
  const ids = new Set(value.conditions.map((c) => c.id));
  while (ids.has("condition-" + i)) i++;
  return "condition-" + i;
}
export function conditionLabel(
  fields: readonly FilterField[],
  condition: FilterCondition,
) {
  const field = fields.find((f) => f.id === condition.fieldId);
  const value =
    field?.kind === "enum"
      ? (field.options?.find((o) => o.value === condition.value)?.label ??
        condition.value)
      : condition.value;
  return (
    (field?.label ?? "Unknown field") +
    " " +
    (operatorLabels[condition.operator] ?? "unknown operator") +
    (valuelessOperator(condition.operator) ? "" : " " + value)
  );
}
export function savedViewsError(
  fields: readonly FilterField[],
  views: readonly SavedFilterView[],
): string | null {
  if (views.length > 50) return "Use at most 50 saved views.";
  const ids = new Set<string>(),
    labels = new Set<string>();
  for (const view of views) {
    const label = normalizeViewName(view.label);
    if (
      !identity(view.id) ||
      ids.has(view.id) ||
      !label ||
      label.length > 80 ||
      labels.has(label.toLowerCase())
    )
      return "Invalid or duplicate saved view.";
    ids.add(view.id);
    labels.add(label.toLowerCase());
    if (filterShapeError(fields, view.filter))
      return "A saved view has an invalid filter structure.";
  }
  return filterFieldsError(fields);
}
export function normalizeViewName(value: string) {
  return value.normalize("NFC").trim();
}
export function viewNameError(
  value: string,
  views: readonly SavedFilterView[],
  exceptId?: string,
): string | null {
  const name = normalizeViewName(value);
  if (!name || name.length > 80) return "Use a view name of 1–80 characters.";
  if (
    views.some(
      (v) =>
        v.id !== exceptId &&
        normalizeViewName(v.label).toLowerCase() === name.toLowerCase(),
    )
  )
    return "A view with this name already exists.";
  return null;
}
