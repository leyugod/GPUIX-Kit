import { useEffect, useRef } from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Text } from "../../base";
import { focusElement } from "../../core/focus";
import { useTheme } from "../../core/theme";
export interface DocumentTab {
  id: string;
  label: string;
  dirty?: boolean;
  closable?: boolean;
  disabled?: boolean;
}
export interface DocumentTabsProps {
  tabs: readonly DocumentTab[];
  value: string | null;
  onValueChange: (id: string) => void;
  onClose: (id: string) => void;
  onAdd?: () => void;
  onReorder?: (ids: string[]) => void;
  testId: string;
  tabWidth?: number;
}
/** 关闭是请求：应用处理未保存确认，并在 tabs/value 中提交实际结果。 */
export function DocumentTabs({
  tabs,
  value,
  onValueChange,
  onClose,
  onAdd,
  onReorder,
  testId,
  tabWidth = 124,
}: DocumentTabsProps) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const refs = useRef(new Map<string, PublicInstance>());
  const scroll = useRef<PublicInstance>(null);
  const activeIndex = tabs.findIndex((t) => t.id === value);
  useEffect(() => {
    if (scroll.current && activeIndex >= 0)
      renderer?.scrollTo?.(scroll.current.id, -activeIndex * (tabWidth + 4), 0);
  }, [renderer, activeIndex, tabWidth]);
  const pendingClose = useRef<string | null>(null);
  const requestClose = (id: string) => {
    pendingClose.current = id;
    onClose(id);
  };
  useEffect(() => {
    if (
      pendingClose.current &&
      !tabs.some((t) => t.id === pendingClose.current)
    ) {
      pendingClose.current = null;
      const node = value ? refs.current.get(value) : undefined;
      if (node) focusElement(renderer, node.id);
    }
  }, [tabs, value, renderer]);
  const enabled = tabs.filter((t) => !t.disabled);
  return (
    <Row
      testId={testId}
      gap={4}
      style={{
        borderBottomWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        padding: 6,
      }}
    >
      <div
        ref={scroll}
        testId={`${testId}-scroll`}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          overflowX: "scroll",
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        {tabs.map((tab) => (
          <Row
            key={tab.id}
            gap={0}
            style={{
              width: tabWidth,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: tab.id === value ? c.borderStrong : c.border,
              backgroundColor: tab.id === value ? c.elevated : c.subtle,
            }}
          >
            <Button
              ref={(node) => {
                if (node) refs.current.set(tab.id, node);
                else refs.current.delete(tab.id);
              }}
              testId={`${testId}-${tab.id}`}
              variant="ghost"
              size="sm"
              disabled={tab.disabled}
              style={{
                width: tabWidth - (tab.closable !== false ? 28 : 0) - 2,
                paddingLeft: 8,
                paddingRight: 8,
              }}
              leading={
                <Row gap={4} style={{ flexGrow: 1, flexShrink: 1 }}>
                  {tab.dirty ? (
                    <Text color={c.accent} size={10}>
                      ●
                    </Text>
                  ) : null}
                  <Text
                    size={12}
                    lines={1}
                    style={{ flexGrow: 1, flexShrink: 1 }}
                  >
                    {tab.label}
                  </Text>
                </Row>
              }
              onPress={() => {
                pendingClose.current = null;
                onValueChange(tab.id);
              }}
              onKeyDown={(event) => {
                if (
                  (event.key === "left" || event.key === "right") &&
                  event.modifiers?.alt &&
                  onReorder
                ) {
                  const index = tabs.findIndex((t) => t.id === tab.id),
                    next = index + (event.key === "right" ? 1 : -1);
                  if (next >= 0 && next < tabs.length) {
                    const ids = tabs.map((t) => t.id);
                    [ids[index], ids[next]] = [ids[next]!, ids[index]!];
                    onReorder(ids);
                  }
                  return true;
                }
                if (
                  event.key === "left" ||
                  event.key === "right" ||
                  event.key === "home" ||
                  event.key === "end"
                ) {
                  const index = enabled.findIndex((t) => t.id === tab.id);
                  const target =
                    event.key === "home"
                      ? enabled[0]
                      : event.key === "end"
                        ? enabled.at(-1)
                        : enabled[
                            (index +
                              (event.key === "right" ? 1 : -1) +
                              enabled.length) %
                              enabled.length
                          ];
                  if (target) {
                    onValueChange(target.id);
                    const node = refs.current.get(target.id);
                    if (node) focusElement(renderer, node.id);
                  }
                  return true;
                }
                if (
                  event.key === "w" &&
                  event.modifiers?.cmd &&
                  tab.closable !== false
                ) {
                  requestClose(tab.id);
                  return true;
                }
                return false;
              }}
            />
            {tab.closable !== false ? (
              <Button
                testId={`${testId}-close-${tab.id}`}
                size="sm"
                disabled={tab.disabled}
                variant="ghost"
                onPress={() => requestClose(tab.id)}
                style={{ width: 28, paddingLeft: 6, paddingRight: 6 }}
              >
                ×
              </Button>
            ) : null}
          </Row>
        ))}
      </div>
      {onAdd ? (
        <Button
          testId={`${testId}-add`}
          variant="ghost"
          size="sm"
          onPress={onAdd}
        >
          +
        </Button>
      ) : null}
    </Row>
  );
}
export { closeDocument } from "../../interaction/selection";
