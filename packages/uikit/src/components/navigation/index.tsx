import { useRef, type ReactNode } from "react";
import { useGpuix, type PublicInstance, type EventPayload } from "@gpuix/react";
import { Button, Row, Stack, Text } from "../../base";
import { useTheme } from "../../core/theme";
import { focusElement } from "../../core/focus";
import { Tooltip } from "../../overlays";
export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
  children?: readonly SidebarItem[];
}
export interface SidebarSection {
  id: string;
  label?: string;
  items: readonly SidebarItem[];
}
export interface SidebarNavigationProps {
  sections: readonly SidebarSection[];
  value: string;
  onValueChange: (value: string) => void;
  expanded: readonly string[];
  onExpandedChange: (expanded: string[]) => void;
  variant?: "simple" | "slim" | "dual-tier";
  rail?: {
    items: readonly SidebarItem[];
    value: string;
    onValueChange: (value: string) => void;
  };
  header?: ReactNode;
  search?: ReactNode;
  footer?: ReactNode;
  width?: number;
  testId: string;
}
/** 分组与展开受控；只呈现两级导航，更深数据应使用 TreeView。 */
export function SidebarNavigation({
  sections,
  value,
  onValueChange,
  expanded,
  onExpandedChange,
  variant = "simple",
  rail,
  header,
  search,
  footer,
  width = 224,
  testId,
}: SidebarNavigationProps) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const refs = useRef(new Map<string, PublicInstance>());
  const slim = variant === "slim";
  const visible = sections
    .flatMap((s) =>
      s.items.flatMap((item) => [
        item,
        ...(!slim && expanded.includes(item.id) && !item.disabled
          ? (item.children ?? [])
          : []),
      ]),
    )
    .filter((i) => !i.disabled);
  const toggle = (id: string) =>
    onExpandedChange(
      expanded.includes(id)
        ? expanded.filter((x) => x !== id)
        : [...expanded, id],
    );
  const key = (event: EventPayload, item: SidebarItem) => {
    const index = visible.findIndex((x) => x.id === item.id);
    let target: SidebarItem | undefined;
    if (event.key === "down") target = visible[(index + 1) % visible.length];
    if (event.key === "up")
      target = visible[(index - 1 + visible.length) % visible.length];
    if (event.key === "home") target = visible[0];
    if (event.key === "end") target = visible.at(-1);
    if (target) {
      const node = refs.current.get(target.id);
      if (node) focusElement(renderer, node.id);
      return true;
    }
    if (
      item.children?.length &&
      !slim &&
      (event.key === "right" || event.key === "left")
    ) {
      if (expanded.includes(item.id) !== (event.key === "right"))
        toggle(item.id);
      return true;
    }
    return false;
  };
  const render = (item: SidebarItem, child = false) => {
    const button = (
      <Button
        ref={(node) => {
          if (node) refs.current.set(item.id, node);
          else refs.current.delete(item.id);
        }}
        testId={`${testId}-${item.id}`}
        disabled={item.disabled}
        variant="ghost"
        fullWidth
        onKeyDown={(event) => key(event, item)}
        onPress={() =>
          item.children?.length && !slim
            ? toggle(item.id)
            : onValueChange(item.id)
        }
        leading={item.icon}
        trailing={
          !slim && item.badge ? (
            <Text size={11} color={c.muted}>
              {item.badge}
            </Text>
          ) : undefined
        }
        style={{
          justifyContent: slim ? "center" : "flex-start",
          paddingLeft: child ? 28 : 10,
          backgroundColor: value === item.id ? c.accentSoft : "transparent",
        }}
      >
        {slim
          ? item.icon
            ? undefined
            : item.label.slice(0, 1)
          : `${item.children?.length ? (expanded.includes(item.id) ? "⌄  " : "›  ") : ""}${item.label}`}
      </Button>
    );
    return (
      <Stack key={item.id} gap={3}>
        {slim ? (
          <Tooltip testId={`${testId}-${item.id}-label`} content={item.label}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
        {!slim && !child && !item.disabled && expanded.includes(item.id)
          ? item.children?.map((i) => render(i, true))
          : null}
      </Stack>
    );
  };
  return (
    <Row
      testId={testId}
      gap={0}
      style={{ height: "100%", alignItems: "stretch", flexShrink: 0 }}
    >
      {variant === "dual-tier" && rail ? (
        <Stack
          gap={8}
          style={{
            width: 62,
            padding: 8,
            backgroundColor: c.subtle,
            borderRightWidth: 1,
            borderColor: c.border,
          }}
        >
          {rail.items.map((item) => (
            <Tooltip
              key={item.id}
              testId={`${testId}-rail-${item.id}-label`}
              content={item.label}
            >
              <Button
                testId={`${testId}-rail-${item.id}`}
                disabled={item.disabled}
                fullWidth
                variant={rail.value === item.id ? "secondary" : "ghost"}
                onPress={() => rail.onValueChange(item.id)}
                leading={item.icon}
              >
                {item.icon ? undefined : item.label.slice(0, 1)}
              </Button>
            </Tooltip>
          ))}
        </Stack>
      ) : null}
      <Stack
        gap={14}
        style={{
          width: slim ? 64 : width,
          minHeight: 0,
          padding: slim ? 8 : 14,
          backgroundColor: c.surface,
          borderRightWidth: 1,
          borderColor: c.border,
        }}
      >
        {header}
        {!slim ? search : null}
        <Stack
          testId={`${testId}-scroll`}
          gap={18}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
          }}
        >
          {sections.map((section, index) => (
            <Stack
              key={section.id}
              gap={4}
              style={{
                borderTopWidth: index ? 1 : 0,
                borderColor: c.border,
                paddingTop: index ? 12 : 0,
              }}
            >
              {!slim && section.label ? (
                <Text size={11} color={c.muted} style={{ padding: 6 }}>
                  {section.label}
                </Text>
              ) : null}
              {section.items.map((i) => render(i))}
            </Stack>
          ))}
        </Stack>
        {footer}
      </Stack>
    </Row>
  );
}
export function Breadcrumb({
  items,
  onNavigate,
  testId,
}: {
  items: readonly { id: string; label: string }[];
  onNavigate: (id: string) => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Row testId={testId} gap={2} style={{ flexWrap: "wrap" }}>
      {items.map((item, index) => (
        <Row key={item.id} gap={2}>
          {index ? <Text color={c.faint}>/</Text> : null}
          {index === items.length - 1 ? (
            <Text size={12}>{item.label}</Text>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              testId={`${testId}-${item.id}`}
              onPress={() => onNavigate(item.id)}
            >
              {item.label}
            </Button>
          )}
        </Row>
      ))}
    </Row>
  );
}
