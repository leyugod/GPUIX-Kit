import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type EventPayload, type PublicInstance } from "@gpuix/react";
import { useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { Text } from "../../base";
import {
  selectItems,
  type SelectionMode,
  type SelectableItem,
} from "../../interaction/selection";
export interface ListViewProps<T extends SelectableItem> {
  items: readonly T[];
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  renderItem: (
    item: T,
    state: { selected: boolean; active: boolean },
  ) => ReactNode;
  selectionMode?: SelectionMode;
  onActivate?: (item: T) => void;
  height?: number;
  rowHeight?: number;
  loading?: boolean;
  emptyLabel?: string;
  testId: string;
  activeId?: string | null;
  onActiveChange?: (id: string) => void;
  onItemKeyDown?: (event: EventPayload, item: T) => boolean | void;
}
/** items 是调用方已分页的数据；固定行高用于原生滚动和方向键定位。 */
export function ListView<T extends SelectableItem>({
  items,
  selectedIds,
  onSelectionChange,
  renderItem,
  selectionMode = "single",
  onActivate,
  height = 260,
  rowHeight = 36,
  loading = false,
  emptyLabel = "No items",
  testId,
  activeId,
  onActiveChange,
  onItemKeyDown,
}: ListViewProps<T>) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const host = useRef<PublicInstance>(null);
  const focus = useFocusTarget(loading, host);
  const [localActive, setActive] = useState<string | null>(null);
  const anchor = useRef<string | null>(null);
  const enabled = items.filter((i) => !i.disabled);
  const current =
    enabled.find((i) => i.id === (activeId ?? localActive)) ??
    enabled.find((i) => selectedIds.includes(i.id)) ??
    enabled[0];
  const index = items.findIndex((i) => i.id === current?.id);
  useEffect(() => {
    if (host.current && index >= 0)
      renderer?.scrollTo?.(
        host.current.id,
        0,
        -Math.max(0, index - Math.floor(height / rowHeight) + 2) * rowHeight,
      );
  }, [renderer, index, height, rowHeight]);
  const activate = (item: T, event: EventPayload) => {
    if (item.disabled || loading) return;
    setActive(item.id);
    onActiveChange?.(item.id);
    const range = !!event.modifiers?.shift,
      toggle = !!(event.modifiers?.cmd || event.modifiers?.ctrl);
    if (selectionMode !== "none")
      onSelectionChange(
        selectItems(
          items,
          selectedIds,
          item.id,
          anchor.current ?? current?.id ?? null,
          selectionMode,
          { range, toggle },
        ),
      );
    if (!range) anchor.current = item.id;
  };
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={loading ? -1 : 0}
      onMouseDown={focus.onMouseDown}
      onKeyDown={(event) => {
        if (loading) return;
        focus.onKeyDown(event);
        if (!current) return;
        if (onItemKeyDown?.(event, current)) return;
        if (event.key === "enter" && !event.isHeld) {
          onActivate?.(current);
          return;
        }
        if (
          event.key === "a" &&
          (event.modifiers?.cmd || event.modifiers?.ctrl) &&
          selectionMode === "multiple"
        ) {
          onSelectionChange([
            ...new Set([...selectedIds, ...enabled.map((i) => i.id)]),
          ]);
          return;
        }
        if (event.key === "space") {
          activate(current, {
            ...event,
            modifiers: {
              shift: false,
              alt: false,
              cmd: false,
              ...event.modifiers,
              ctrl: true,
            },
          });
          return;
        }
        const position = enabled.findIndex((i) => i.id === current.id);
        const delta =
          event.key === "down"
            ? 1
            : event.key === "up"
              ? -1
              : event.key === "pagedown"
                ? Math.max(1, Math.floor(height / rowHeight))
                : event.key === "pageup"
                  ? -Math.max(1, Math.floor(height / rowHeight))
                  : 0;
        const next =
          event.key === "home"
            ? enabled[0]
            : event.key === "end"
              ? enabled.at(-1)
              : delta
                ? enabled[
                    Math.min(enabled.length - 1, Math.max(0, position + delta))
                  ]
                : undefined;
        if (next) activate(next, event);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        height,
        minHeight: 0,
        overflowY: "scroll",
        borderWidth: 1,
        borderColor: focus.focused ? c.accent : c.border,
        borderRadius: 8,
        backgroundColor: c.surface,
      }}
    >
      {loading ? (
        <Text
          testId={`${testId}-loading`}
          size={12}
          color={c.muted}
          style={{ padding: 14 }}
        >
          Loading…
        </Text>
      ) : !items.length ? (
        <Text
          testId={`${testId}-empty`}
          size={12}
          color={c.muted}
          style={{ padding: 14 }}
        >
          {emptyLabel}
        </Text>
      ) : (
        items.map((item) => {
          const selected = selectedIds.includes(item.id),
            active = current?.id === item.id;
          return (
            <div
              key={item.id}
              testId={`${testId}-${item.id}`}
              onClick={(event) => {
                if (event.button !== undefined && event.button !== 0) return;
                activate(item, event);
                if (!item.disabled && event.clickCount === 2)
                  onActivate?.(item);
              }}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                height: rowHeight,
                flexShrink: 0,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomWidth: 1,
                borderColor: c.border,
                backgroundColor: selected
                  ? c.accentSoft
                  : active && focus.focused
                    ? c.subtle
                    : "transparent",
                opacity: item.disabled ? 0.45 : 1,
                hover: item.disabled
                  ? {}
                  : { backgroundColor: selected ? c.accentSoft : c.subtle },
              }}
            >
              {renderItem(item, { selected, active })}
            </div>
          );
        })
      )}
    </div>
  );
}
export type {
  SelectionMode,
  SelectableItem,
} from "../../interaction/selection";
