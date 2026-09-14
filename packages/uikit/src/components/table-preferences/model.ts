export type TableDensity = "compact" | "regular" | "comfortable";
export interface TableColumnOption {
  id: string;
  label: string;
  hideable?: boolean;
  reorderable?: boolean;
  sortable?: boolean;
}
export interface TableSortRule {
  columnId: string;
  direction: "asc" | "desc";
}
export interface TablePreferences {
  order: readonly string[];
  hiddenIds: readonly string[];
  sorts: readonly TableSortRule[];
  density: TableDensity;
}
export function columnOptionsError(
  columns: readonly TableColumnOption[],
): string | null {
  if (!columns.length || columns.length > 24) return "Use 1–24 columns.";
  const seen = new Set<string>();
  for (const c of columns) {
    if (
      !c.id?.trim() ||
      c.id.length > 128 ||
      seen.has(c.id) ||
      !c.label?.trim() ||
      c.label.length > 100
    )
      return "Invalid or duplicate column.";
    seen.add(c.id);
  }
  return null;
}
export function defaultTablePreferences(
  columns: readonly TableColumnOption[],
): TablePreferences {
  return {
    order: columns.map((c) => c.id),
    hiddenIds: [],
    sorts: [],
    density: "regular",
  };
}
export function cloneTablePreferences(
  value: TablePreferences,
): TablePreferences {
  return {
    order: [...value.order],
    hiddenIds: [...value.hiddenIds],
    sorts: value.sorts.map((s) => ({ ...s })),
    density: value.density,
  };
}
export function tablePreferencesError(
  columns: readonly TableColumnOption[],
  value: TablePreferences,
): string | null {
  const error = columnOptionsError(columns);
  if (error) return error;
  const ids = new Set(columns.map((c) => c.id));
  if (
    value.order.length !== columns.length ||
    new Set(value.order).size !== ids.size ||
    value.order.some((id) => !ids.has(id))
  )
    return "Column order must contain every column exactly once.";
  if (
    columns.some((c, i) => c.reorderable === false && value.order[i] !== c.id)
  )
    return "Locked columns must keep their original positions.";
  if (
    new Set(value.hiddenIds).size !== value.hiddenIds.length ||
    value.hiddenIds.some(
      (id) =>
        !ids.has(id) || columns.find((c) => c.id === id)?.hideable === false,
    ) ||
    value.hiddenIds.length >= columns.length
  )
    return "Keep required columns and at least one visible column.";
  if (
    value.sorts.length > 3 ||
    new Set(value.sorts.map((s) => s.columnId)).size !== value.sorts.length ||
    value.sorts.some(
      (s) =>
        !columns.find((c) => c.id === s.columnId)?.sortable ||
        !["asc", "desc"].includes(s.direction),
    )
  )
    return "Use up to three unique sortable columns.";
  if (!["compact", "regular", "comfortable"].includes(value.density))
    return "Invalid table density.";
  return null;
}
export function toggleColumn(
  columns: readonly TableColumnOption[],
  value: TablePreferences,
  id: string,
): TablePreferences {
  const next = {
    ...cloneTablePreferences(value),
    hiddenIds: value.hiddenIds.includes(id)
      ? value.hiddenIds.filter((x) => x !== id)
      : [...value.hiddenIds, id],
  };
  return tablePreferencesError(columns, next)
    ? cloneTablePreferences(value)
    : next;
}
export function moveColumn(
  columns: readonly TableColumnOption[],
  value: TablePreferences,
  id: string,
  direction: -1 | 1,
): TablePreferences {
  const next = cloneTablePreferences(value),
    order = [...next.order],
    from = order.indexOf(id),
    to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return next;
  [order[from], order[to]] = [order[to]!, order[from]!];
  next.order = order;
  return tablePreferencesError(columns, next)
    ? cloneTablePreferences(value)
    : next;
}
export function rowHeightForDensity(density: TableDensity) {
  return density === "compact" ? 34 : density === "comfortable" ? 54 : 42;
}
/** 可选迁移明确由应用调用；组件不会默默改写受控偏好。 */
export function reconcileTablePreferences(
  columns: readonly TableColumnOption[],
  value: TablePreferences,
): TablePreferences {
  if (columnOptionsError(columns)) return defaultTablePreferences(columns);
  const ids = new Set(columns.map((c) => c.id)),
    fixed = new Map(
      columns
        .map((c, i) => [i, c])
        .filter(([, c]) => (c as TableColumnOption).reorderable === false) as [
        number,
        TableColumnOption,
      ][],
    );
  const movable = [...new Set([...value.order, ...ids])].filter(
    (id) =>
      ids.has(id) && columns.find((c) => c.id === id)?.reorderable !== false,
  );
  const order = columns.map((_, i) => fixed.get(i)?.id ?? movable.shift()!);
  let hiddenIds = [...new Set(value.hiddenIds)].filter(
    (id) => ids.has(id) && columns.find((c) => c.id === id)?.hideable !== false,
  );
  if (hiddenIds.length === columns.length)
    hiddenIds = hiddenIds.filter((id) => id !== order[0]);
  const used = new Set<string>();
  const sorts = value.sorts
    .filter((s) => {
      if (
        used.has(s.columnId) ||
        !columns.find((c) => c.id === s.columnId)?.sortable ||
        !["asc", "desc"].includes(s.direction)
      )
        return false;
      used.add(s.columnId);
      return true;
    })
    .slice(0, 3);
  return {
    order,
    hiddenIds,
    sorts: sorts.map((s) => ({ ...s })),
    density: ["compact", "regular", "comfortable"].includes(value.density)
      ? value.density
      : "regular",
  };
}
/** 应用在分页前显式排序；不读取业务服务，空值始终排在最后。 */
export function sortByRules<T>(
  rows: readonly T[],
  sorts: readonly TableSortRule[],
  getValue: (row: T, columnId: string) => string | number | null | undefined,
): T[] {
  const missing = (v: unknown) =>
    v === null ||
    v === undefined ||
    (typeof v === "number" && !Number.isFinite(v));
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const rule of sorts) {
        const left = getValue(a.row, rule.columnId),
          right = getValue(b.row, rule.columnId);
        if (missing(left) || missing(right)) {
          if (missing(left) !== missing(right)) return missing(left) ? 1 : -1;
          continue;
        }
        const result =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left) < String(right)
              ? -1
              : String(left) > String(right)
                ? 1
                : 0;
        if (result) return rule.direction === "asc" ? result : -result;
      }
      return a.index - b.index;
    })
    .map((x) => x.row);
}
