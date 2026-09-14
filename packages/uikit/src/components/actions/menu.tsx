import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Text, type ButtonVariant } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import { Popover } from "../popover";
import {
  actionEnabled,
  nextActionId,
  visibleActions,
  type UIKitAction,
} from "./model";

export interface ActionMenuOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  width?: number;
}
/** 平面动作菜单共用六行分页；不挂载隐藏页，也不安装全局快捷键。 */
export function ActionMenu({
  label,
  items,
  open,
  onOpenChange,
  testId,
  disabled,
  loading,
  header,
  width = 280,
  variant = "default",
  triggerWidth,
  emptyLabel = "No available actions",
}: ActionMenuOptions & {
  label: string;
  items: readonly UIKitAction[];
  testId: string;
  header?: ReactNode;
  variant?: ButtonVariant;
  triggerWidth?: number;
  emptyLabel?: string;
}) {
  const trigger = useRef<PublicInstance>(null);
  return (
    <Popover
      autoFocus={false}
      open={open && !disabled && !loading}
      onOpenChange={onOpenChange}
      testId={`${testId}-popup`}
      width={Number.isFinite(width) ? Math.max(180, Math.min(480, width)) : 280}
      restoreFocusRef={trigger}
      anchor={
        <Button
          ref={trigger}
          testId={testId}
          disabled={disabled}
          loading={loading}
          variant={variant}
          labelLines={1}
          style={{ maxWidth: triggerWidth ?? 240 }}
          onPress={() => onOpenChange(!open)}
          onKeyDown={(event) => {
            if (event.key === "down" && !event.isHeld) {
              onOpenChange(true);
              return true;
            }
            if (event.key === "escape" && open) {
              onOpenChange(false);
              return true;
            }
          }}
        >
          {label}
        </Button>
      }
    >
      {header}
      <ActionMenuBody
        items={visibleActions(items)}
        onClose={() => onOpenChange(false)}
        testId={testId}
        emptyLabel={emptyLabel}
      />
    </Popover>
  );
}
function ActionMenuBody({
  items,
  onClose,
  testId,
  emptyLabel,
}: {
  items: readonly UIKitAction[];
  onClose: () => void;
  testId: string;
  emptyLabel: string;
}) {
  const { renderer } = useGpuix();
  const { colors: c } = useTheme();
  const initial = Math.max(
    0,
    items.findIndex((item) => item.checked && actionEnabled(item)),
  );
  const [page, setPage] = useState(Math.floor(initial / 6));
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef(new Map<string, PublicInstance>());
  const fallback = useRef<PublicInstance>(null);
  const pending = useRef<string | null>(null);
  const pages = Math.max(1, Math.ceil(items.length / 6));
  const currentPage = Math.min(page, pages - 1);
  const rows = items.slice(currentPage * 6, currentPage * 6 + 6);
  const signature = JSON.stringify(
    rows.map((item) => [item.id, actionEnabled(item)]),
  );
  const go = (id: string | undefined) => {
    if (!id) return;
    pending.current = id;
    setActive(id);
    setPage(Math.floor(items.findIndex((item) => item.id === id) / 6));
    const node = refs.current.get(id);
    if (node) {
      focusElement(renderer, node.id);
      pending.current = null;
    }
  };
  // 集合变化后修正页码与失效焦点，避免焦点留在卸载或禁用的宿主节点。
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
    const desired =
      pending.current ??
      (active && rows.some((item) => item.id === active && actionEnabled(item))
        ? active
        : (rows.find((item) => item.checked && actionEnabled(item))?.id ??
          rows.find(actionEnabled)?.id));
    const node = desired ? refs.current.get(desired) : fallback.current;
    if (node) focusElement(renderer, node.id);
    pending.current = null;
  }, [signature, currentPage, renderer]);
  const changePage = (target: number) => {
    if (target === currentPage) return;
    const row = items.slice(target * 6, target * 6 + 6).find(actionEnabled);
    pending.current = row?.id ?? null;
    setActive(row?.id ?? null);
    setPage(target);
  };
  return (
    <>
      {!rows.some(actionEnabled) ? (
        <Button
          ref={fallback}
          testId={`${testId}-close`}
          size="sm"
          variant="ghost"
          labelLines={1}
          onPress={onClose}
          onKeyDown={(event) => {
            if (["home", "end"].includes(event.key ?? "")) {
              go(nextActionId(items, "", event.key!));
              return true;
            }
            if (event.key === "pageup" || event.key === "pagedown") {
              changePage(
                Math.max(
                  0,
                  Math.min(
                    pages - 1,
                    currentPage + (event.key === "pageup" ? -1 : 1),
                  ),
                ),
              );
              return true;
            }
          }}
        >
          {emptyLabel} · Close
        </Button>
      ) : null}
      {rows.map((item) => (
        <Button
          key={item.id}
          ref={(node) => {
            if (node) refs.current.set(item.id, node);
            else refs.current.delete(item.id);
          }}
          testId={`${testId}-item-${item.id}`}
          size="sm"
          fullWidth
          labelLines={1}
          disabled={item.disabled}
          loading={item.loading}
          variant={item.destructive ? "destructive" : "ghost"}
          style={{ justifyContent: "space-between", minWidth: 0 }}
          leading={item.checked ? <Text color={c.accent}>✓</Text> : undefined}
          trailing={
            item.shortcut ? (
              <Text
                lines={1}
                size={10}
                color={c.muted}
                style={{ maxWidth: 70 }}
              >
                {item.shortcut}
              </Text>
            ) : undefined
          }
          onPress={() => {
            if (actionEnabled(item)) {
              onClose();
              item.run();
            }
          }}
          onKeyDown={(event) => {
            if (["up", "down", "home", "end"].includes(event.key ?? "")) {
              go(nextActionId(items, item.id, event.key!));
              return true;
            }
            if (event.key === "pageup" || event.key === "pagedown") {
              changePage(
                Math.max(
                  0,
                  Math.min(
                    pages - 1,
                    currentPage + (event.key === "pageup" ? -1 : 1),
                  ),
                ),
              );
              return true;
            }
            setActive(item.id);
          }}
        >
          {item.label}
        </Button>
      ))}
      {pages > 1 ? (
        <Row style={{ justifyContent: "space-between" }}>
          <Button
            testId={`${testId}-previous`}
            size="sm"
            disabled={currentPage === 0}
            onPress={() => changePage(currentPage - 1)}
          >
            ‹
          </Button>
          <Text testId={`${testId}-page`} size={11} color={c.muted}>
            {currentPage + 1} / {pages}
          </Text>
          <Button
            testId={`${testId}-next`}
            size="sm"
            disabled={currentPage === pages - 1}
            onPress={() => changePage(currentPage + 1)}
          >
            ›
          </Button>
        </Row>
      ) : null}
    </>
  );
}
