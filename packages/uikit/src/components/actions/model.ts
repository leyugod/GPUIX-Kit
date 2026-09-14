import type { Command } from "../../interaction/commands";

/** 动作集合由应用提供；隐藏项不占位，异步工作由 loading 状态锁定。 */
export interface UIKitAction extends Command {
  hidden?: boolean;
  loading?: boolean;
}
export interface PathItem {
  id: string;
  label: string;
  disabled?: boolean;
}
export interface WorkspaceItem extends PathItem {
  description?: string;
}
export function collectionError(
  items: readonly PathItem[],
  limit = 100,
): string | null {
  if (items.length > limit) return `At most ${limit} items are supported`;
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || !item.label.trim())
      return "Items require a non-empty id and label";
    if (ids.has(item.id)) return "Item ids must be unique";
    ids.add(item.id);
  }
  return null;
}
export function visibleActions(items: readonly UIKitAction[]) {
  return items.filter((item) => !item.hidden);
}
export function actionEnabled(item: UIKitAction) {
  return !item.disabled && !item.loading && !item.hidden;
}
/** 数量由布局所有者传入，不依赖未公开的原生测量 API。 */
export function partitionActions(
  items: readonly UIKitAction[],
  visibleCount: number,
) {
  const visible = visibleActions(items);
  const count = Number.isFinite(visibleCount)
    ? Math.max(0, Math.min(12, Math.floor(visibleCount)))
    : 0;
  return { visible: visible.slice(0, count), overflow: visible.slice(count) };
}
export function partitionPath(items: readonly PathItem[], maxVisible: number) {
  const count = Number.isFinite(maxVisible)
    ? Math.max(2, Math.min(12, Math.floor(maxVisible)))
    : 2;
  if (items.length <= count)
    return {
      leading: items.slice(0, -1),
      hidden: [] as PathItem[],
      trailing: items.slice(-1),
    };
  return {
    leading: items.slice(0, 1),
    hidden: items.slice(1, -(count - 1)),
    trailing: items.slice(-(count - 1)),
  };
}
export function nextActionId(
  items: readonly UIKitAction[],
  current: string,
  key: string,
): string | undefined {
  const enabled = items.filter(actionEnabled);
  if (!enabled.length) return undefined;
  if (key === "home") return enabled[0]!.id;
  if (key === "end") return enabled.at(-1)!.id;
  const offset = key === "left" || key === "up" ? -1 : 1;
  const index = enabled.findIndex((item) => item.id === current);
  return enabled[(index + offset + enabled.length) % enabled.length]!.id;
}
