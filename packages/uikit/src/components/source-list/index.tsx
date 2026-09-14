import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance, type EventPayload } from "@gpuix/react";
import { Text } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import { isActivation } from "../../core/rules";
import {
  SourceListRow,
  SourceListSectionHeader,
  type SourceListRowProps,
} from "./row";
import {
  sourceListError,
  sourceEntries,
  sourceTargets,
  sourceActive,
  sourceMove,
  sourceScrollOffset,
  toggleSourceGroup,
  type SourceGroupData,
  type SourceItemData,
  type SourceEntry,
} from "./model";
export { SourceListRow, SourceListSectionHeader } from "./row";
export type { SourceListRowProps, SourceListSectionHeaderProps } from "./row";
export interface SourceListItem extends SourceItemData {
  icon?: ReactNode;
  action?: SourceListRowProps["action"];
}
export interface SourceListGroup extends SourceGroupData {
  items: readonly SourceListItem[];
}
export interface SourceListSidebarProps {
  groups: readonly SourceListGroup[];
  value: string | null;
  onValueChange: (id: string) => void;
  collapsed: readonly string[];
  onCollapsedChange: (ids: string[]) => void;
  height: number;
  testId: string;
  header?: ReactNode;
  search?: ReactNode;
  footer?: ReactNode;
  headerHeight?: number;
  searchHeight?: number;
  footerHeight?: number;
  density?: "compact" | "comfortable";
  windowActive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selectionFollowsFocus?: boolean;
  emptyLabel?: string;
  loadingLabel?: string;
}
export function SourceListSidebar({
  groups,
  value,
  onValueChange,
  collapsed,
  onCollapsedChange,
  height,
  testId,
  header,
  search,
  footer,
  headerHeight = 56,
  searchHeight = 44,
  footerHeight = 52,
  density = "compact",
  windowActive = true,
  disabled = false,
  loading = false,
  selectionFollowsFocus = true,
  emptyLabel = "No sources",
  loadingLabel = "Loading sources…",
}: SourceListSidebarProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix();
  const host = useRef<PublicInstance>(null),
    scroll = useRef<PublicInstance>(null),
    actions = useRef(new Map<string, PublicInstance>());
  const blocked = disabled || loading,
    focus = useFocusTarget(blocked, host);
  const [active, setActive] = useState<string | null>(null);
  const nestedKey = useRef(false);
  const previousIndex = useRef(0),
    offset = useRef(0);
  const error = sourceListError(groups),
    entries = error || loading ? [] : sourceEntries(groups, collapsed);
  const current = sourceActive(entries, active, value, previousIndex.current);
  const rowHeight = density === "compact" ? 32 : 38;
  const finite = (n: number, fallback: number) =>
    Number.isFinite(n) ? Math.max(0, n) : fallback;
  const h = Math.max(120, finite(height, 600)),
    hh = header ? finite(headerHeight, 56) : 0,
    sh = search ? finite(searchHeight, 44) : 0,
    fh = footer ? finite(footerHeight, 52) : 0;
  const bodyHeight = Math.max(1, h - hh - sh - fh - 16);
  const signature = entries
    .map((e) => e.key + (e.kind === "item" && e.item.disabled ? "!" : ""))
    .join("|");
  useEffect(() => {
    if (!current) {
      offset.current = 0;
      return;
    }
    previousIndex.current = sourceTargets(entries).findIndex(
      (e) => e.key === current.key,
    );
    offset.current = sourceScrollOffset(
      entries,
      current.key,
      bodyHeight,
      rowHeight,
      offset.current,
    );
    if (scroll.current)
      renderer?.scrollTo?.(scroll.current.id, 0, -offset.current);
  }, [renderer, current?.key, signature, bodyHeight, rowHeight]);
  const rootFocus = () => {
    if (!blocked && host.current) focusElement(renderer, host.current.id);
  };
  const activate = (entry: SourceEntry, select = false) => {
    setActive(entry.key);
    rootFocus();
    if (select && entry.kind === "item" && !entry.item.disabled)
      onValueChange(entry.item.id);
  };
  const toggle = (entry: SourceEntry, collapse?: boolean) => {
    if (entry.group.collapsible === false) return;
    setActive("g:" + entry.group.id);
    rootFocus();
    onCollapsedChange(toggleSourceGroup(collapsed, entry.group.id, collapse));
  };
  const keyboard = (e: EventPayload) => {
    if (blocked || nestedKey.current) return;
    const target = sourceMove(entries, current?.key ?? null, e.key ?? "");
    if (target) {
      activate(target, selectionFollowsFocus);
      return;
    }
    if (current) {
      if (e.key === "left") {
        if (current.kind === "item")
          activate({
            key: "g:" + current.group.id,
            kind: "group",
            group: current.group,
          });
        else toggle(current, true);
        return;
      }
      if (e.key === "right") {
        if (current.kind === "group") {
          if (
            collapsed.includes(current.group.id) &&
            current.group.collapsible !== false
          )
            toggle(current, false);
          else {
            const first = entries.find(
              (x) =>
                x.kind === "item" &&
                x.group.id === current.group.id &&
                !x.item.disabled,
            );
            if (first) activate(first, selectionFollowsFocus);
          }
        } else {
          const action = actions.current.get(current.item.id);
          if (action) focusElement(renderer, action.id);
        }
        return;
      }
      if (!e.isHeld && isActivation(e.key)) {
        if (current.kind === "group") toggle(current);
        else activate(current, true);
        return;
      }
    }
    focus.onKeyDown(e);
  };
  const slot = (node: ReactNode, slotHeight: number, name: string) =>
    node ? (
      <div
        testId={testId + "-" + name}
        style={{
          height: slotHeight,
          flexShrink: 0,
          padding: 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {node}
      </div>
    ) : null;
  return (
    <div
      testId={testId}
      style={{
        height: h,
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: c.surface,
        overflow: "hidden",
      }}
    >
      {slot(header, hh, "header")}
      {slot(search, sh, "search")}
      <div
        ref={focus.ref}
        testId={testId + "-list"}
        tabIndex={blocked ? -1 : 0}
        onKeyDown={keyboard}
        style={{
          height: bodyHeight + 16,
          minHeight: 0,
          flexShrink: 0,
          padding: 8,
          position: "relative",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          ref={scroll}
          testId={testId + "-scroll"}
          style={{
            height: bodyHeight,
            minHeight: 0,
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {error || loading || entries.length === 0 ? (
            <Text
              testId={testId + "-status"}
              size={12}
              color={error ? c.danger : c.muted}
              lines={3}
            >
              {error ?? (loading ? loadingLabel : emptyLabel)}
            </Text>
          ) : (
            entries.map((entry) => {
              if (entry.kind === "group")
                return (
                  <SourceListSectionHeader
                    key={entry.key}
                    testId={testId + "-group-" + entry.group.id}
                    label={entry.group.label}
                    collapsed={collapsed.includes(entry.group.id)}
                    collapsible={entry.group.collapsible !== false && !blocked}
                    active={focus.focused && current?.key === entry.key}
                    tabStop={false}
                    onPointerFocus={() => activate(entry)}
                    onCollapsedChange={(v) => toggle(entry, v)}
                  />
                );
              const item = entry.item as SourceListItem;
              return (
                <SourceListRow
                  key={entry.key}
                  testId={testId + "-item-" + item.id}
                  label={item.label}
                  badge={item.badge}
                  icon={item.icon}
                  disabled={blocked || item.disabled}
                  selected={value === item.id}
                  active={focus.focused && current?.key === entry.key}
                  windowActive={windowActive}
                  density={density}
                  tabStop={false}
                  onPointerFocus={() => activate(entry)}
                  onPress={() => activate(entry, true)}
                  action={item.action}
                  actionRef={(node) => {
                    if (node && !item.disabled && !item.action?.disabled)
                      actions.current.set(item.id, node);
                    else actions.current.delete(item.id);
                  }}
                  onNavigate={(e) => {
                    // 原生宿主向祖先重派按键；子动作已处理的事件不能再触发列表导航。
                    nestedKey.current = true;
                    void Promise.resolve().then(() => {
                      nestedKey.current = false;
                    });
                    if (e.key === "left" || e.key === "escape") {
                      rootFocus();
                      return true;
                    }
                    if (e.key === "tab") {
                      rootFocus();
                      focus.onKeyDown({
                        ...e,
                        elementId: host.current?.id ?? e.elementId,
                      });
                      return true;
                    }
                    return false;
                  }}
                />
              );
            })
          )}
        </div>
      </div>
      {slot(footer, fh, "footer")}
    </div>
  );
}
