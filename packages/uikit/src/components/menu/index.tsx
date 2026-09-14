import { useRef, useState, type ReactNode } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement, useFocusTarget } from "../../core/focus";
import { Popover } from "../popover";
import type { Command } from "../../interaction/commands";
export type MenuItem =
  | Command
  | {
      id: string;
      label: string;
      children: readonly MenuItem[];
      disabled?: boolean;
    };
export interface DropdownMenuProps {
  label: string;
  items: readonly MenuItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  disabled?: boolean;
}
export function DropdownMenu({
  label,
  items,
  open,
  onOpenChange,
  testId,
  disabled,
}: DropdownMenuProps) {
  const trigger = useRef<PublicInstance>(null);
  return (
    <Popover
      open={open && !disabled}
      onOpenChange={onOpenChange}
      testId={`${testId}-popup`}
      restoreFocusRef={trigger}
      anchor={
        <Button
          ref={trigger}
          disabled={disabled}
          testId={testId}
          onPress={() => onOpenChange(!open)}
          onKeyDown={(event) => {
            if (event.key === "down") {
              if (!disabled) onOpenChange(true);
              return true;
            }
            if (event.key === "escape" && open) {
              onOpenChange(false);
              return true;
            }
          }}
        >
          {" "}
          {label}{" "}
        </Button>
      }
    >
      <MenuContent
        items={items}
        onClose={() => onOpenChange(false)}
        testId={testId}
      />
    </Popover>
  );
}
/** 子菜单在同一浮层内逐级进入，避免未验证的跨层鼠标热区。 */
function MenuContent({
  items,
  onClose,
  testId,
}: {
  items: readonly MenuItem[];
  onClose: () => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const [path, setPath] = useState<
    { label: string; items: readonly MenuItem[] }[]
  >([]);
  const current = path.at(-1)?.items ?? items;
  const refs = useRef(new Map<string, PublicInstance>());
  const pending = useRef<string | null>(null);
  const enabled = current.filter((i) => !i.disabled);
  const enter = (item: MenuItem) => {
    if (item.disabled) return;
    if ("children" in item) {
      pending.current = item.children.find((i) => !i.disabled)?.id ?? "$back";
      setPath([...path, { label: item.label, items: item.children }]);
    } else {
      onClose();
      item.run();
    }
  };
  const back = () => {
    pending.current = "$back";
    setPath(path.slice(0, -1));
  };
  return (
    <>
      {path.length ? (
        <Button
          ref={(node) => {
            if (node && pending.current === "$back") {
              pending.current = null;
              focusElement(renderer, node.id);
            }
          }}
          testId={`${testId}-back`}
          size="sm"
          variant="ghost"
          onPress={back}
        >
          ‹ {path.at(-1)?.label}
        </Button>
      ) : null}
      {current.map((item, index) => (
        <Button
          key={item.id}
          ref={(node) => {
            if (node) {
              refs.current.set(item.id, node);
              if (
                pending.current === item.id ||
                (pending.current === "$back" && !path.length)
              ) {
                pending.current = null;
                focusElement(renderer, node.id);
              }
            } else refs.current.delete(item.id);
          }}
          testId={`${testId}-${item.id}`}
          disabled={item.disabled}
          size="sm"
          variant={
            "destructive" in item && item.destructive ? "destructive" : "ghost"
          }
          fullWidth
          leading={
            "checked" in item && item.checked ? (
              <Text color={c.accent}>✓</Text>
            ) : undefined
          }
          trailing={
            <Text size={11} color={c.muted}>
              {"children" in item ? "›" : (item.shortcut ?? "")}
            </Text>
          }
          style={{
            justifyContent: "space-between",
            marginTop:
              "group" in item &&
              item.group &&
              (index === 0 ||
                !("group" in current[index - 1]!) ||
                (current[index - 1] as Command).group !== item.group)
                ? 6
                : 0,
          }}
          onPress={() => enter(item)}
          onKeyDown={(event) => {
            const keys = ["up", "down", "home", "end"];
            if (keys.includes(event.key ?? "")) {
              const index = enabled.findIndex((i) => i.id === item.id);
              const target =
                event.key === "home"
                  ? enabled[0]
                  : event.key === "end"
                    ? enabled.at(-1)
                    : enabled[
                        (index +
                          (event.key === "down" ? 1 : -1) +
                          enabled.length) %
                          enabled.length
                      ];
              const node = target && refs.current.get(target.id);
              if (node) focusElement(renderer, node.id);
              return true;
            }
            if (event.key === "right" && "children" in item) {
              enter(item);
              return true;
            }
            if (event.key === "left" && path.length) {
              back();
              return true;
            }
            return false;
          }}
        >
          {item.label}
        </Button>
      ))}
      {!current.length ? (
        <Text size={12} color={c.muted}>
          No actions
        </Text>
      ) : null}
    </>
  );
}

export function ContextMenu({
  children,
  items,
  open,
  onOpenChange,
  testId,
  disabled,
}: Omit<DropdownMenuProps, "label"> & { children: ReactNode }) {
  const trigger = useRef<PublicInstance>(null);
  const focus = useFocusTarget(disabled, trigger);
  return (
    <Popover
      open={open && !disabled}
      onOpenChange={onOpenChange}
      testId={`${testId}-popup`}
      restoreFocusRef={trigger}
      anchor={
        <div
          ref={focus.ref}
          testId={testId}
          tabIndex={disabled ? -1 : 0}
          onMouseDown={(event) => {
            focus.onMouseDown();
            if (
              !disabled &&
              (event.button === 2 ||
                (event.button === 0 && event.modifiers?.ctrl))
            )
              onOpenChange(true);
          }}
          onKeyDown={(event) => {
            if (
              !disabled &&
              ((event.key === "f10" && event.modifiers?.shift) ||
                event.key === "enter")
            )
              onOpenChange(true);
            else focus.onKeyDown(event);
          }}
          style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
        >
          {children}
        </div>
      }
    >
      <MenuContent
        items={items}
        testId={testId}
        onClose={() => onOpenChange(false)}
      />
    </Popover>
  );
}
