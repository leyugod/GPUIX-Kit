export type SelectionMode = "single" | "multiple" | "none";
export interface SelectableItem {
  id: string;
  disabled?: boolean;
}
export interface SelectionIntent {
  toggle?: boolean;
  range?: boolean;
}
/** 范围选择只作用于可见且可用的记录；增选保留其他分页中的选择。 */
export function selectItems(
  items: readonly SelectableItem[],
  selected: readonly string[],
  target: string,
  anchor: string | null,
  mode: SelectionMode,
  intent: SelectionIntent = {},
) {
  const enabled = items.filter((i) => !i.disabled).map((i) => i.id);
  if (mode === "none" || !enabled.includes(target)) return [...selected];
  if (mode === "single") return [target];
  if (intent.range) {
    const end = enabled.indexOf(target),
      start = anchor === null ? -1 : enabled.indexOf(anchor);
    const range = enabled.slice(
      Math.min(start < 0 ? end : start, end),
      Math.max(start < 0 ? end : start, end) + 1,
    );
    return intent.toggle ? [...new Set([...selected, ...range])] : range;
  }
  if (intent.toggle)
    return selected.includes(target)
      ? selected.filter((id) => id !== target)
      : [...selected, target];
  return [target];
}
export function togglePageSelection(
  items: readonly SelectableItem[],
  selected: readonly string[],
) {
  const ids = items.filter((i) => !i.disabled).map((i) => i.id);
  return ids.length && ids.every((id) => selected.includes(id))
    ? selected.filter((id) => !ids.includes(id))
    : [...new Set([...selected, ...ids])];
}
export interface TreeNode extends SelectableItem {
  label: string;
  children?: readonly TreeNode[];
  hasChildren?: boolean;
  loading?: boolean;
}
export interface FlatTreeNode {
  node: TreeNode;
  depth: number;
  parentId: string | null;
}
export function flattenTree(
  nodes: readonly TreeNode[],
  expanded: readonly string[],
): FlatTreeNode[] {
  const result: FlatTreeNode[] = [];
  const seen = new Set<string>();
  const open = new Set(expanded);
  const pending = nodes
    .map((node) => ({ node, depth: 0, parentId: null as string | null }))
    .reverse();
  while (pending.length) {
    const row = pending.pop()!;
    if (seen.has(row.node.id))
      throw new Error(`Duplicate or cyclic tree id: ${row.node.id}`);
    seen.add(row.node.id);
    result.push(row);
    if (open.has(row.node.id))
      for (const child of [...(row.node.children ?? [])].reverse())
        pending.push({
          node: child,
          depth: row.depth + 1,
          parentId: row.node.id,
        });
  }
  return result;
}
export interface SortDescriptor {
  columnId: string;
  direction: "asc" | "desc";
}
export function nextSort(
  current: SortDescriptor | null,
  columnId: string,
): SortDescriptor | null {
  return current?.columnId !== columnId
    ? { columnId, direction: "asc" }
    : current.direction === "asc"
      ? { columnId, direction: "desc" }
      : null;
}
export function sortRows<T>(
  rows: readonly T[],
  sort: SortDescriptor | null,
  read: (row: T, columnId: string) => string | number | null | undefined,
) {
  if (!sort) return [...rows];
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const x = read(a.row, sort.columnId),
        y = read(b.row, sort.columnId);
      if (x == null || y == null)
        return x == null && y == null ? a.index - b.index : x == null ? 1 : -1;
      const cmp =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      return (sort.direction === "asc" ? cmp : -cmp) || a.index - b.index;
    })
    .map((x) => x.row);
}
export function closeDocument<T extends { id: string; disabled?: boolean }>(
  tabs: readonly T[],
  active: string,
  closing: string,
) {
  if (!tabs.some((t) => t.id === closing))
    return { tabs: [...tabs], value: active };
  const remaining = tabs.filter((t) => t.id !== closing);
  const index = tabs.findIndex((t) => t.id === closing);
  const fallback =
    remaining.slice(Math.max(0, index)).find((t) => !t.disabled) ??
    [...remaining.slice(0, Math.max(0, index))]
      .reverse()
      .find((t) => !t.disabled);
  return {
    tabs: remaining,
    value: active === closing ? (fallback?.id ?? null) : active,
  };
}
