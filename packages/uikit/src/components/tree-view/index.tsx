import { useState } from "react";
import { ListView } from "../list-view";
import { Button, Row, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { flattenTree, type TreeNode } from "../../interaction/selection";
export interface TreeViewProps {
  nodes: readonly TreeNode[];
  expandedIds: readonly string[];
  onExpandedChange: (ids: string[]) => void;
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  onActivate?: (node: TreeNode) => void;
  onRequestChildren?: (id: string) => void;
  selectionMode?: "single" | "multiple";
  height?: number;
  testId: string;
  loading?: boolean;
}
export function TreeView({
  nodes,
  expandedIds,
  onExpandedChange,
  selectedIds,
  onSelectionChange,
  onActivate,
  onRequestChildren,
  selectionMode = "single",
  height = 300,
  testId,
  loading,
}: TreeViewProps) {
  const { colors: c } = useTheme();
  const [active, setActive] = useState<string | null>(null);
  const rows = flattenTree(nodes, expandedIds);
  const items = rows.map((row) => ({
    ...row.node,
    depth: row.depth,
    parentId: row.parentId,
  }));
  const branch = (node: TreeNode) =>
    !!(node.hasChildren || node.children?.length);
  const expand = (node: TreeNode, open: boolean) => {
    if (node.disabled) return;
    onExpandedChange(
      open
        ? [...new Set([...expandedIds, node.id])]
        : expandedIds.filter((id) => id !== node.id),
    );
    if (open && !node.children && !node.loading) onRequestChildren?.(node.id);
  };
  return (
    <ListView
      testId={testId}
      items={items}
      height={height}
      loading={loading}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      selectionMode={selectionMode}
      activeId={active}
      onActiveChange={setActive}
      onActivate={onActivate}
      onItemKeyDown={(event, item) => {
        if (event.key === "right" && branch(item)) {
          if (!expandedIds.includes(item.id)) expand(item, true);
          else {
            const child = items.find(
              (i) => i.parentId === item.id && !i.disabled,
            );
            if (child) {
              setActive(child.id);
              onSelectionChange([child.id]);
            }
          }
          return true;
        }
        if (event.key === "left") {
          if (branch(item) && expandedIds.includes(item.id))
            expand(item, false);
          else if (item.parentId) {
            setActive(item.parentId);
            onSelectionChange([item.parentId]);
          }
          return true;
        }
        return false;
      }}
      renderItem={(item) => (
        <Row
          gap={4}
          style={{ paddingLeft: item.depth * 16, flexGrow: 1, minWidth: 0 }}
        >
          {branch(item) ? (
            <Button
              testId={`${testId}-toggle-${item.id}`}
              size="sm"
              variant="ghost"
              disabled={item.disabled || item.loading}
              style={{ width: 24, paddingLeft: 0, paddingRight: 0 }}
              onPress={() => expand(item, !expandedIds.includes(item.id))}
            >
              {item.loading ? "…" : expandedIds.includes(item.id) ? "⌄" : "›"}
            </Button>
          ) : (
            <div style={{ width: 24, flexShrink: 0 }} />
          )}
          <Text size={13} color={item.disabled ? c.muted : c.text} lines={1}>
            {item.label}
          </Text>
        </Row>
      )}
    />
  );
}
export type { TreeNode } from "../../interaction/selection";
