export interface SourceItemData {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}
export interface SourceGroupData {
  id: string;
  label: string;
  collapsible?: boolean;
  items: readonly SourceItemData[];
}
export type SourceEntry =
  | { key: string; kind: "group"; group: SourceGroupData }
  | { key: string; kind: "item"; group: SourceGroupData; item: SourceItemData };
/** 来源导航保持小而有界；大型业务集合应放在中间内容列。 */
export function sourceListError(
  groups: readonly SourceGroupData[],
): string | null {
  if (
    groups.length > 20 ||
    groups.reduce((n, g) => n + g.items.length, 0) > 100
  )
    return "Use at most 20 groups and 100 source items.";
  const ids = new Set<string>(),
    groupsSeen = new Set<string>();
  const valid = (s: string) =>
    typeof s === "string" && s.length > 0 && s.length <= 128;
  for (const g of groups) {
    if (
      !valid(g.id) ||
      groupsSeen.has(g.id) ||
      !g.label ||
      g.label.length > 200
    )
      return "Invalid or duplicate source group.";
    groupsSeen.add(g.id);
    for (const item of g.items) {
      if (
        !valid(item.id) ||
        ids.has(item.id) ||
        !item.label ||
        item.label.length > 300 ||
        (item.badge?.length ?? 0) > 24
      )
        return "Invalid or duplicate source item.";
      ids.add(item.id);
    }
  }
  return null;
}
export function sourceEntries(
  groups: readonly SourceGroupData[],
  collapsed: readonly string[],
): SourceEntry[] {
  if (sourceListError(groups)) return [];
  return groups.flatMap((g) => [
    { key: "g:" + g.id, kind: "group" as const, group: g },
    ...(g.collapsible !== false && collapsed.includes(g.id)
      ? []
      : g.items.map((item) => ({
          key: "i:" + item.id,
          kind: "item" as const,
          group: g,
          item,
        }))),
  ]);
}
export function sourceTargets(entries: readonly SourceEntry[]) {
  return entries.filter((e) => e.kind === "group" || !e.item.disabled);
}
export function sourceActive(
  entries: readonly SourceEntry[],
  active: string | null,
  selected: string | null,
  previousIndex = 0,
) {
  const available = sourceTargets(entries);
  return (
    available.find((e) => e.key === active) ??
    available.find((e) => e.kind === "item" && e.item.id === selected) ??
    available[Math.min(Math.max(0, previousIndex), available.length - 1)] ??
    null
  );
}
export function sourceMove(
  entries: readonly SourceEntry[],
  current: string | null,
  key: string,
) {
  const list = sourceTargets(entries);
  if (!list.length) return null;
  const index = list.findIndex((e) => e.key === current);
  if (key === "home") return list[0]!;
  if (key === "end") return list.at(-1)!;
  if (key === "down") return list[Math.min(list.length - 1, index + 1)]!;
  if (key === "up") return list[Math.max(0, index - 1)]!;
  return null;
}
export function toggleSourceGroup(
  collapsed: readonly string[],
  id: string,
  collapse?: boolean,
) {
  const next = collapse ?? !collapsed.includes(id);
  return next
    ? [...new Set([...collapsed, id])]
    : collapsed.filter((x) => x !== id);
}
/** 固定行高使滚动位置可计算，不读取未公开的宿主测量接口。 */
export function sourceScrollOffset(
  entries: readonly SourceEntry[],
  key: string,
  viewport: number,
  rowHeight = 32,
  offset = 0,
) {
  const index = entries.findIndex((e) => e.key === key);
  if (index < 0) return Math.max(0, offset);
  const top = entries
    .slice(0, index)
    .reduce((n, e) => n + (e.kind === "group" ? 32 : rowHeight), 0);
  const bottom = top + (entries[index]!.kind === "group" ? 32 : rowHeight);
  const height = Math.max(1, viewport);
  return Math.max(
    0,
    top < offset ? top : bottom > offset + height ? bottom - height : offset,
  );
}
