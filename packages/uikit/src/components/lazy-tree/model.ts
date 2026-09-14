import type { SelectableItem } from "../../interaction/selection";
export interface LazyTreeNode extends SelectableItem {
  id: string;
  label: string;
  children?: readonly LazyTreeNode[];
  hasChildren?: boolean;
  loadState?: "unloaded" | "loading" | "ready" | "error";
  errorLabel?: string;
  revision?: string | number;
}
export interface LazyTreeRow {
  node: LazyTreeNode;
  depth: number;
  parentId: string | null;
}
export function treeLoadState(node: LazyTreeNode) {
  return (
    node.loadState ??
    (node.children !== undefined || !node.hasChildren ? "ready" : "unloaded")
  );
}
export function treeRequestKey(node: LazyTreeNode) {
  return JSON.stringify([node.id, node.revision ?? 0]);
}
/** 包括折叠分支在内校验整个当前快照，拒绝循环、重复身份和过深数据。 */
export function lazyTreeError(nodes: readonly LazyTreeNode[]) {
  const seen = new Set<string>(),
    pending = nodes.map((node) => ({ node, depth: 0 }));
  let count = 0;
  while (pending.length) {
    const { node, depth } = pending.pop()!;
    if (++count > 200 || depth > 8)
      return "Use at most 200 nodes and 9 tree levels.";
    if (
      typeof node.id !== "string" ||
      !node.id ||
      node.id.length > 128 ||
      seen.has(node.id) ||
      !node.label ||
      node.label.length > 300
    )
      return "Invalid or duplicate tree node.";
    if (
      node.loadState &&
      !["unloaded", "loading", "ready", "error"].includes(node.loadState)
    )
      return "Invalid tree loading state.";
    seen.add(node.id);
    for (const child of node.children ?? [])
      pending.push({ node: child, depth: depth + 1 });
  }
  return null;
}
export function lazyTreeRows(
  nodes: readonly LazyTreeNode[],
  expanded: readonly string[],
  all = false,
): LazyTreeRow[] {
  if (lazyTreeError(nodes)) return [];
  const result: LazyTreeRow[] = [],
    pending = nodes
      .map((node) => ({ node, depth: 0, parentId: null as string | null }))
      .reverse(),
    open = new Set(expanded);
  while (pending.length) {
    const row = pending.pop()!;
    result.push(row);
    if (all || open.has(row.node.id))
      for (const child of [...(row.node.children ?? [])].reverse())
        pending.push({
          node: child,
          depth: row.depth + 1,
          parentId: row.node.id,
        });
  }
  return result;
}
export function lazyBranch(node: LazyTreeNode) {
  return !!(
    node.hasChildren ||
    node.children?.length ||
    treeLoadState(node) !== "ready"
  );
}
