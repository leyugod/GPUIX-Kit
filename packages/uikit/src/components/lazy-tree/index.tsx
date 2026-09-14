import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance, type EventPayload } from "@gpuix/react";
import { Button, Text, Row } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import { selectItems } from "../../interaction/selection";
import { ResourceState } from "../resource-state";
import { useRequestActions } from "../resource-state/requests";
import {
  lazyTreeError,
  lazyTreeRows,
  lazyBranch,
  treeLoadState,
  treeRequestKey,
  type LazyTreeNode,
} from "./model";
export type { LazyTreeNode } from "./model";
export interface LazyTreeViewProps {
  nodes: readonly LazyTreeNode[];
  expandedIds: readonly string[];
  onExpandedChange: (ids: string[]) => void;
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  onRequestChildren?: (id: string) => void | Promise<void>;
  onActivate?: (node: LazyTreeNode) => void;
  height?: number;
  selectionMode?: "single" | "multiple";
  disabled?: boolean;
  resourceKey?: string;
  revision?: string | number;
  emptyLabel?: string;
  testId: string;
}
export function LazyTreeView({
  nodes,
  expandedIds,
  onExpandedChange,
  selectedIds,
  onSelectionChange,
  onRequestChildren,
  onActivate,
  height = 360,
  selectionMode = "single",
  disabled = false,
  resourceKey,
  revision = 0,
  emptyLabel = "No items",
  testId,
}: LazyTreeViewProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(disabled, host),
    nested = useRef(false),
    anchor = useRef<string | null>(null);
  const [active, setActive] = useState<string | null>(null),
    error = lazyTreeError(nodes),
    rows = lazyTreeRows(nodes, expandedIds),
    all = lazyTreeRows(nodes, [], true),
    requests = useRequestActions(
      JSON.stringify([resourceKey ?? testId, revision]),
      all.map((r) => treeRequestKey(r.node)),
    );
  const enabled = rows.filter((r) => !r.node.disabled),
    current =
      enabled.find((r) => r.node.id === active) ??
      enabled.find((r) => selectedIds.includes(r.node.id)) ??
      enabled[0];
  const h = Number.isFinite(height) ? Math.max(120, height) : 360,
    index = rows.findIndex((r) => r.node.id === current?.node.id);
  useEffect(() => {
    if (host.current)
      renderer?.scrollTo?.(
        host.current.id,
        0,
        -Math.max(0, index * 44 + 44 - (h - 2)),
      );
  }, [renderer, index, current?.node.id, h]);
  const rootFocus = () => {
    if (!disabled && host.current) focusElement(renderer, host.current.id);
  };
  const select = (node: LazyTreeNode, e?: EventPayload) => {
    if (disabled || node.disabled) return;
    rootFocus();
    setActive(node.id);
    onSelectionChange(
      selectItems(
        rows.map((r) => r.node),
        selectedIds,
        node.id,
        anchor.current ?? current?.node.id ?? null,
        selectionMode,
        {
          range: !!e?.modifiers?.shift,
          toggle: !!(e?.modifiers?.cmd || e?.modifiers?.ctrl),
        },
      ),
    );
    if (!e?.modifiers?.shift) anchor.current = node.id;
  };
  const request = (node: LazyTreeNode) => {
    if (
      disabled ||
      node.disabled ||
      !onRequestChildren ||
      treeLoadState(node) === "loading" ||
      requests.pending(treeRequestKey(node))
    )
      return;
    rootFocus();
    setActive(node.id);
    void requests.run(treeRequestKey(node), () => onRequestChildren(node.id));
  };
  const expand = (node: LazyTreeNode, open: boolean) => {
    if (disabled || node.disabled || !lazyBranch(node)) return;
    rootFocus();
    setActive(node.id);
    onExpandedChange(
      open
        ? [...new Set([...expandedIds, node.id])]
        : expandedIds.filter((id) => id !== node.id),
    );
    if (open && ["unloaded", "error"].includes(treeLoadState(node)))
      request(node);
  };
  if (error)
    return (
      <ResourceState
        testId={testId + "-invalid"}
        state="error"
        title="Invalid tree"
        description={error}
        height={h}
      />
    );
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled || nested.current) return;
        focus.onKeyDown(e);
        if (!current) return;
        const node = current.node;
        if (e.key === "right") {
          if (lazyBranch(node)) {
            if (!expandedIds.includes(node.id)) expand(node, true);
            else if (
              ["unloaded", "error"].includes(treeLoadState(node)) ||
              requests.failed(treeRequestKey(node))
            )
              request(node);
            else {
              const child = enabled.find((r) => r.parentId === node.id);
              if (child) select(child.node);
            }
          }
          return;
        }
        if (e.key === "left") {
          if (lazyBranch(node) && expandedIds.includes(node.id))
            expand(node, false);
          else {
            const parent = enabled.find((r) => r.node.id === current.parentId);
            if (parent) select(parent.node);
          }
          return;
        }
        if (!e.isHeld && e.key === "enter") {
          onActivate?.(node);
          return;
        }
        if (!e.isHeld && e.key === "space") {
          select(node, {
            ...e,
            modifiers: {
              shift: false,
              alt: false,
              cmd: false,
              ...e.modifiers,
              ctrl: true,
            },
          });
          return;
        }
        const pos = enabled.findIndex((r) => r.node.id === node.id),
          target =
            e.key === "home"
              ? enabled[0]
              : e.key === "end"
                ? enabled.at(-1)
                : e.key === "down"
                  ? enabled[Math.min(enabled.length - 1, pos + 1)]
                  : e.key === "up"
                    ? enabled[Math.max(0, pos - 1)]
                    : undefined;
        if (target) select(target.node, e);
      }}
      style={{
        height: h,
        minHeight: 0,
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column",
        borderWidth: 1,
        borderColor: focus.focused ? c.accent : c.border,
        borderRadius: 8,
        backgroundColor: c.surface,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {!rows.length ? (
        <Text
          testId={testId + "-empty"}
          size={12}
          color={c.muted}
          style={{ padding: 14 }}
        >
          {emptyLabel}
        </Text>
      ) : (
        rows.map(({ node, depth }) => {
          const state = treeLoadState(node),
            pending =
              state === "loading" || requests.pending(treeRequestKey(node)),
            failed = state === "error" || requests.failed(treeRequestKey(node)),
            isBranch = lazyBranch(node),
            open = expandedIds.includes(node.id);
          return (
            <Row
              key={node.id}
              testId={testId + "-row-" + node.id}
              gap={4}
              style={{
                height: 44,
                paddingLeft: Math.min(depth * 16, 128) + 4,
                paddingRight: 6,
                borderBottomWidth: 1,
                borderColor: c.border,
                backgroundColor: selectedIds.includes(node.id)
                  ? c.accentSoft
                  : focus.focused && current?.node.id === node.id
                    ? c.subtle
                    : "transparent",
                opacity: node.disabled ? 0.45 : 1,
              }}
            >
              <div
                testId={testId + "-toggle-" + node.id}
                onMouseDown={rootFocus}
                onClick={(e) => {
                  if (e.button === undefined || e.button === 0)
                    expand(node, !open);
                }}
                style={{
                  width: 24,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: isBranch ? "pointer" : "default",
                }}
              >
                <Text size={14} color={c.muted}>
                  {isBranch ? (open ? "⌄" : "›") : "·"}
                </Text>
              </div>
              <div
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  minWidth: 0,
                  height: 44,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                  position: "relative",
                }}
              >
                <Text size={12} lines={1}>
                  {node.label}
                </Text>
                {failed ? (
                  <Text size={10} color={c.danger} lines={1}>
                    {node.errorLabel ?? "Unable to load children"}
                  </Text>
                ) : pending ? (
                  <Text size={10} color={c.muted}>
                    Loading children…
                  </Text>
                ) : null}
                <div
                  testId={testId + "-item-" + node.id}
                  onMouseDown={rootFocus}
                  onClick={(e) => {
                    if (e.button !== undefined && e.button !== 0) return;
                    select(node, e);
                    if (!node.disabled && !disabled && e.clickCount === 2)
                      onActivate?.(node);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                />
              </div>
              {isBranch &&
              open &&
              onRequestChildren &&
              (pending || failed || state === "unloaded") ? (
                <Button
                  testId={testId + "-retry-" + node.id}
                  size="sm"
                  disabled={disabled || node.disabled || pending}
                  onKeyDown={() => {
                    nested.current = true;
                    void Promise.resolve().then(() => {
                      nested.current = false;
                    });
                    return false;
                  }}
                  onPress={() => request(node)}
                >
                  {pending ? "Loading…" : failed ? "Retry" : "Load"}
                </Button>
              ) : null}
            </Row>
          );
        })
      )}
    </div>
  );
}
