import { useEffect, useRef, useState } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { focusElement, useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { ColorSwatch } from "./swatch";
import {
  defaultPalette,
  movePalette,
  normalizeHexColor,
  paletteColumns,
  paletteError,
  type PaletteColor,
} from "./model";
export interface ColorPaletteProps {
  items?: readonly PaletteColor[];
  value: string | null;
  onValueChange: (value: string) => void;
  testId: string;
  columns?: number;
  disabled?: boolean;
  readOnly?: boolean;
  allowAlpha?: boolean;
  autoFocus?: boolean;
}
export function ColorPalette({
  items = defaultPalette,
  value,
  onValueChange,
  testId,
  columns = 6,
  disabled,
  readOnly,
  allowAlpha = true,
  autoFocus = false,
}: ColorPaletteProps) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const node = useRef<PublicInstance>(null);
  const error = paletteError(items);
  const blocked = disabled || !!error;
  const focus = useFocusTarget(Boolean(disabled), node);
  const count = paletteColumns(columns),
    pageSize = count * 2;
  const selected = value === null ? null : normalizeHexColor(value, allowAlpha);
  const selectedIndex = items.findIndex(
    (item) =>
      normalizeHexColor(item.value, allowAlpha) === selected &&
      selected !== null &&
      !item.disabled,
  );
  const [cursor, setCursor] = useState(Math.max(0, selectedIndex));
  const signature = JSON.stringify(
    items.map((item) => [item.id, item.value, item.disabled]),
  );
  useEffect(
    () =>
      setCursor((old) =>
        selectedIndex >= 0
          ? selectedIndex
          : movePalette(
              Math.min(old, Math.max(0, items.length - 1)),
              "home",
              items,
              count,
              allowAlpha,
            ),
      ),
    [selected, signature, allowAlpha],
  );
  const active = Math.max(0, Math.min(cursor, items.length - 1));
  const page = Math.floor(active / pageSize),
    pages = Math.max(1, Math.ceil(items.length / pageSize));
  const visible = error
    ? []
    : items.slice(page * pageSize, (page + 1) * pageSize);
  const enabled = (index: number) =>
    !!items[index] &&
    !items[index]!.disabled &&
    !!normalizeHexColor(items[index]!.value, allowAlpha);
  const move = (target: number) => {
    setCursor(target);
    if (node.current && !blocked) focusElement(renderer, node.current.id);
  };
  useEffect(() => {
    if (autoFocus && !blocked && node.current)
      focusElement(renderer, node.current.id);
  }, [autoFocus, blocked, renderer]);
  const choose = (index: number) => {
    if (blocked || readOnly || !enabled(index)) return;
    const normalized = normalizeHexColor(items[index]!.value, allowAlpha)!;
    move(index);
    onValueChange(normalized);
  };
  return (
    <Stack testId={testId} gap={6} style={{ width: count * 40 - 4 }}>
      <div
        ref={focus.ref}
        testId={testId + "-grid"}
        tabIndex={disabled ? -1 : 0}
        onMouseDown={focus.onMouseDown}
        onKeyDown={(event) => {
          if (disabled) return;
          if (error) {
            focus.onKeyDown(event);
            return;
          }
          if (
            [
              "left",
              "right",
              "up",
              "down",
              "home",
              "end",
              "pageup",
              "pagedown",
            ].includes(event.key ?? "")
          ) {
            move(movePalette(active, event.key!, items, count, allowAlpha));
            return;
          }
          if (
            (event.key === "enter" || event.key === "space") &&
            !event.isHeld
          ) {
            choose(active);
            return;
          }
          focus.onKeyDown(event);
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 4,
          width: count * 40 - 4,
          minHeight: 36,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {visible.map((item, index) => {
          const current = page * pageSize + index;
          const isSelected =
            selected !== null &&
            normalizeHexColor(item.value, allowAlpha) === selected;
          return (
            <div
              key={item.id}
              testId={testId + "-item-" + item.id}
              style={{
                position: "relative",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                borderWidth: 2,
                borderColor:
                  focus.focused && current === active
                    ? c.accent
                    : isSelected
                      ? c.text
                      : "transparent",
                backgroundColor: isSelected ? c.subtle : "transparent",
                opacity: enabled(current) ? 1 : 0.35,
                cursor:
                  blocked || readOnly || !enabled(current)
                    ? "default"
                    : "pointer",
              }}
            >
              <ColorSwatch
                value={item.value}
                testId={testId + "-swatch-" + item.id}
                size={26}
              />
              {/* 独立命中层覆盖装饰棋盘，避免宿主深层 div 吞掉选择点击。 */}
              <div
                testId={testId + "-hit-" + item.id}
                onClick={(event) => {
                  if (event.button === undefined || event.button === 0)
                    choose(current);
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "transparent",
                  pointerEvents: "auto",
                }}
              />
            </div>
          );
        })}
      </div>
      <Text
        testId={testId + "-active"}
        lines={1}
        size={11}
        color={error ? c.danger : c.muted}
      >
        {error ?? items[active]?.label ?? "No colors available"}
      </Text>
      {pages > 1 && !error ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Button
            testId={testId + "-previous"}
            size="sm"
            disabled={blocked || page === 0}
            onPress={() => move(Math.max(0, (page - 1) * pageSize))}
          >
            ‹
          </Button>
          <Text testId={testId + "-page"} size={11}>
            {page + 1} / {pages}
          </Text>
          <Button
            testId={testId + "-next"}
            size="sm"
            disabled={blocked || page === pages - 1}
            onPress={() => move((page + 1) * pageSize)}
          >
            ›
          </Button>
        </Row>
      ) : null}
    </Stack>
  );
}
