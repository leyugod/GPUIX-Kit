import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type EventPayload, type PublicInstance } from "@gpuix/react";
import { Text, Stack, Row } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import {
  selectItems,
  type SelectableItem,
  type SelectionMode,
} from "../../interaction/selection";
import { collectionError, collectionLayout, collectionTarget } from "./model";
export interface CollectionItemProps {
  title: string;
  description?: string;
  preview?: ReactNode;
  badge?: string;
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  testId?: string;
}
/** 卡片只呈现内容；选择命中由 CollectionView 统一处理，不在卡片内嵌业务按钮。 */
export function CollectionItem({
  title,
  description,
  preview,
  badge,
  selected = false,
  active = false,
  disabled = false,
  testId,
}: CollectionItemProps) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={8}
      style={{
        height: "100%",
        padding: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: active ? c.accent : selected ? c.primary : c.border,
        borderRadius: 10,
        backgroundColor: selected ? c.accentSoft : c.elevated,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div
        style={{
          minHeight: 20,
          flexGrow: 1,
          flexShrink: 1,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.surface,
          borderRadius: 6,
        }}
      >
        {preview ?? (
          <Text size={26} color={c.accent}>
            ▤
          </Text>
        )}
      </div>
      <Row>
        <Text
          size={12}
          weight={600}
          lines={1}
          style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
        >
          {title}
        </Text>
        {badge ? (
          <Text size={10} color={c.muted} lines={1}>
            {badge}
          </Text>
        ) : null}
      </Row>
      {description ? (
        <Text size={11} color={c.muted} lines={1}>
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
export interface CollectionViewProps<T extends SelectableItem> {
  items: readonly T[];
  selectedIds: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  renderItem: (
    item: T,
    state: { selected: boolean; active: boolean },
  ) => ReactNode;
  width: number;
  height?: number;
  columns?: number;
  cardHeight?: number;
  selectionMode?: SelectionMode;
  disabled?: boolean;
  onActivate?: (item: T) => void;
  emptyLabel?: string;
  testId: string;
}
export function CollectionView<T extends SelectableItem>({
  items,
  selectedIds,
  onSelectionChange,
  renderItem,
  width,
  height = 360,
  columns,
  cardHeight,
  selectionMode = "single",
  disabled = false,
  onActivate,
  emptyLabel = "No items",
  testId,
}: CollectionViewProps<T>) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    host = useRef<PublicInstance>(null),
    focus = useFocusTarget(disabled, host);
  const [active, setActive] = useState<string | null>(null),
    anchor = useRef<string | null>(null);
  const layout = collectionLayout(width, columns, cardHeight),
    h = Number.isFinite(height) ? Math.max(100, height) : 360,
    error = collectionError(items),
    data = error ? [] : items;
  const current =
    data.find((i) => i.id === active && !i.disabled) ??
    data.find((i) => selectedIds.includes(i.id) && !i.disabled) ??
    data.find((i) => !i.disabled);
  const index = data.findIndex((i) => i.id === current?.id),
    stride = layout.cardHeight + 12;
  useEffect(() => {
    if (host.current)
      renderer?.scrollTo?.(
        host.current.id,
        0,
        -Math.max(
          0,
          index < 0
            ? 0
            : (Math.floor(index / layout.columns) + 1) * stride - (h - 24),
        ),
      );
  }, [renderer, index, current?.id, layout.columns, stride, h]);
  const select = (item: T, e: EventPayload) => {
    if (disabled || item.disabled) return;
    if (host.current) focusElement(renderer, host.current.id);
    setActive(item.id);
    if (selectionMode !== "none")
      onSelectionChange(
        selectItems(
          data,
          selectedIds,
          item.id,
          anchor.current ?? current?.id ?? null,
          selectionMode,
          {
            range: !!e.modifiers?.shift,
            toggle: !!(e.modifiers?.cmd || e.modifiers?.ctrl),
          },
        ),
      );
    if (!e.modifiers?.shift) anchor.current = item.id;
  };
  return (
    <div
      ref={focus.ref}
      testId={testId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        focus.onKeyDown(e);
        if (!current) return;
        if (e.key === "enter" && !e.isHeld) {
          onActivate?.(current);
          return;
        }
        if (e.key === "space" && !e.isHeld) {
          select(current, {
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
        if (
          e.key === "a" &&
          (e.modifiers?.cmd || e.modifiers?.ctrl) &&
          selectionMode === "multiple"
        ) {
          onSelectionChange([
            ...new Set([
              ...selectedIds,
              ...data.filter((i) => !i.disabled).map((i) => i.id),
            ]),
          ]);
          return;
        }
        const id = collectionTarget(
            data,
            current.id,
            e.key ?? "",
            layout.columns,
            Math.max(1, Math.floor((h - 24) / stride)),
          ),
          next = data.find((i) => i.id === id);
        if (next) select(next, e);
      }}
      style={{
        width: layout.width,
        height: h,
        minHeight: 0,
        padding: 12,
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderWidth: 1,
        borderColor: focus.focused ? c.accent : c.border,
        borderRadius: 10,
        backgroundColor: c.surface,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {error || !data.length ? (
        <Text
          testId={testId + "-status"}
          size={12}
          color={error ? c.danger : c.muted}
        >
          {error ?? emptyLabel}
        </Text>
      ) : (
        Array.from(
          { length: Math.ceil(data.length / layout.columns) },
          (_, row) => (
            <Row
              key={row}
              gap={12}
              style={{ height: layout.cardHeight, alignItems: "stretch" }}
            >
              {data
                .slice(row * layout.columns, (row + 1) * layout.columns)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      width: layout.cellWidth,
                      height: layout.cardHeight,
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    {renderItem(item, {
                      selected: selectedIds.includes(item.id),
                      active: focus.focused && current?.id === item.id,
                    })}
                    <div
                      testId={testId + "-item-" + item.id}
                      onMouseDown={() => {
                        if (!disabled && !item.disabled && host.current)
                          focusElement(renderer, host.current.id);
                      }}
                      onClick={(e) => {
                        if (e.button !== undefined && e.button !== 0) return;
                        select(item, e);
                        if (!disabled && !item.disabled && e.clickCount === 2)
                          onActivate?.(item);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "transparent",
                        cursor:
                          disabled || item.disabled ? "default" : "pointer",
                      }}
                    />
                  </div>
                ))}
            </Row>
          ),
        )
      )}
    </div>
  );
}
