export type CheckboxState = boolean | "indeterminate";
export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}
/** 全选仅作用于当前可操作范围；跨页值和锁定值由应用保留。 */
export function checkboxState(
  options: readonly CheckboxOption[],
  value: readonly string[],
): CheckboxState {
  const ids = new Set(options.filter((o) => !o.disabled).map((o) => o.value)),
    selected = new Set(value);
  const count = [...ids].filter((id) => selected.has(id)).length;
  return count === 0 ? false : count === ids.size ? true : "indeterminate";
}
export function toggleCheckboxScope(
  options: readonly CheckboxOption[],
  value: readonly string[],
  checked: boolean,
) {
  const next = new Set(value);
  for (const item of options)
    if (!item.disabled) {
      if (checked) next.add(item.value);
      else next.delete(item.value);
    }
  return [...next];
}
export function checkboxOptionsError(options: readonly CheckboxOption[]) {
  return options.length > 200 ||
    new Set(options.map((o) => o.value)).size !== options.length ||
    options.some((o) => !o.value)
    ? "Use at most 200 options with unique, non-empty values."
    : null;
}
