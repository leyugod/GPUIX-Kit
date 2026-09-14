import { useRef, type ReactNode, type Ref } from "react";
import { useGpuix, type PublicInstance, type EventPayload } from "@gpuix/react";
import { Text, Row } from "../../base";
import { useTheme } from "../../core/theme";
import { useFocusTarget, focusElement } from "../../core/focus";
import { isActivation } from "../../core/rules";
export interface SourceListRowProps {
  label: string;
  icon?: ReactNode;
  badge?: string;
  selected?: boolean;
  active?: boolean;
  windowActive?: boolean;
  disabled?: boolean;
  density?: "compact" | "comfortable";
  onPress: () => void;
  testId: string;
  action?: { label: string; onPress: () => void; disabled?: boolean };
  /** 组合来源列表只保留根节点为 Tab 入口；独立行默认可 Tab。 */
  tabStop?: boolean;
  onNavigate?: (event: EventPayload) => boolean | void;
  onPointerFocus?: () => void;
  ref?: Ref<PublicInstance>;
  actionRef?: Ref<PublicInstance>;
}
export function SourceListRow({
  label,
  icon,
  badge,
  selected = false,
  active = false,
  windowActive = true,
  disabled = false,
  density = "compact",
  onPress,
  testId,
  action,
  tabStop = true,
  onNavigate,
  onPointerFocus,
  ref,
  actionRef,
}: SourceListRowProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix();
  const localAction = useRef<PublicInstance>(null);
  const localRow = useRef<PublicInstance>(null);
  const focus = useFocusTarget(disabled || !tabStop, (node) => {
    localRow.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  });
  const actionFocus = useFocusTarget(
    disabled || !!action?.disabled || !tabStop,
    (node) => {
      localAction.current = node;
      if (typeof actionRef === "function") actionRef(node);
      else if (actionRef) actionRef.current = node;
    },
  );
  const fill = selected ? (windowActive ? c.primary : c.border) : "transparent";
  const ink =
    selected && windowActive ? c.onPrimary : disabled ? c.faint : c.text;
  const height = density === "compact" ? 32 : 38;
  const navigate = (e: EventPayload) => {
    if (onNavigate?.(e) === true) return;
    if (
      e.key === "right" &&
      action &&
      !action.disabled &&
      localAction.current
    ) {
      focusElement(renderer, localAction.current.id);
      return;
    }
    focus.onKeyDown(e);
    if (!e.isHeld && isActivation(e.key)) onPress();
  };
  return (
    <Row
      testId={testId + "-surface"}
      gap={0}
      style={{
        height,
        borderRadius: 6,
        backgroundColor: fill,
        overflow: "hidden",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          height: "100%",
          flexGrow: 1,
          minWidth: 0,
          paddingLeft: 9,
          paddingRight: 8,
          borderWidth: 1,
          borderColor: active || focus.focused ? c.accent : "transparent",
          borderRadius: 6,
          hover: disabled
            ? {}
            : { backgroundColor: selected ? fill : c.subtle },
          active: disabled
            ? {}
            : {
                backgroundColor:
                  selected && windowActive ? c.primaryHover : c.border,
              },
        }}
      >
        {icon ? (
          <div
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        ) : null}
        <Text
          size={13}
          color={ink}
          lines={1}
          style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
        >
          {label}
        </Text>
        {badge ? (
          <Text
            size={11}
            color={ink}
            lines={1}
            style={{ maxWidth: 55, flexShrink: 0 }}
          >
            {badge}
          </Text>
        ) : null}
        <div
          ref={focus.ref}
          testId={testId}
          tabIndex={!disabled && tabStop ? 0 : -1}
          onMouseDown={() => {
            if (!disabled) {
              if (tabStop) focus.onMouseDown();
              onPointerFocus?.();
            }
          }}
          onClick={(e) => {
            if (!disabled && (e.button === undefined || e.button === 0))
              onPress();
          }}
          onKeyDown={(e) => {
            if (!disabled) navigate(e);
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            cursor: disabled ? "default" : "pointer",
          }}
        />
      </div>
      {action ? (
        <div
          ref={actionFocus.ref}
          testId={testId + "-action"}
          tabIndex={!disabled && !action.disabled && tabStop ? 0 : -1}
          onMouseDown={() => {
            if (!disabled && !action.disabled && localAction.current)
              focusElement(renderer, localAction.current.id);
          }}
          onClick={(e) => {
            if (
              !disabled &&
              !action.disabled &&
              (e.button === undefined || e.button === 0)
            )
              action.onPress();
          }}
          onKeyDown={(e) => {
            if (disabled || action.disabled) return;
            if (onNavigate?.(e) === true) return;
            if ((e.key === "left" || e.key === "escape") && localRow.current) {
              focusElement(renderer, localRow.current.id);
              return;
            }
            actionFocus.onKeyDown(e);
            if (!e.isHeld && isActivation(e.key)) action.onPress();
          }}
          style={{
            width: 28,
            height,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: actionFocus.focused ? c.accent : "transparent",
            borderRadius: 5,
            opacity: action.disabled ? 0.4 : 1,
            cursor: "pointer",
            backgroundColor: "transparent",
            hover:
              disabled || action.disabled
                ? {}
                : {
                    backgroundColor:
                      selected && windowActive ? c.primaryHover : c.subtle,
                  },
          }}
        >
          <Text size={13} color={ink} lines={1}>
            {action.label}
          </Text>
        </div>
      ) : null}
    </Row>
  );
}
export interface SourceListSectionHeaderProps {
  label: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  collapsible?: boolean;
  active?: boolean;
  testId: string;
  tabStop?: boolean;
  onPointerFocus?: () => void;
}
export function SourceListSectionHeader({
  label,
  collapsed,
  onCollapsedChange,
  collapsible = true,
  active = false,
  testId,
  tabStop = true,
  onPointerFocus,
}: SourceListSectionHeaderProps) {
  const { colors: c } = useTheme(),
    focus = useFocusTarget(!tabStop || !collapsible);
  return (
    <div
      style={{
        height: 32,
        flexShrink: 0,
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingLeft: 9,
        paddingRight: 6,
        borderWidth: 1,
        borderColor: active || focus.focused ? c.accent : "transparent",
        borderRadius: 5,
      }}
    >
      <Text
        size={11}
        weight={600}
        color={c.muted}
        lines={1}
        style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
      >
        {label}
      </Text>
      {collapsible ? (
        <Text size={12} color={c.muted}>
          {collapsed ? "›" : "⌄"}
        </Text>
      ) : null}
      <div
        ref={focus.ref}
        testId={testId}
        tabIndex={tabStop && collapsible ? 0 : -1}
        onMouseDown={() => {
          if (tabStop) focus.onMouseDown();
          onPointerFocus?.();
        }}
        onClick={(e) => {
          if (collapsible && (e.button === undefined || e.button === 0))
            onCollapsedChange(!collapsed);
        }}
        onKeyDown={(e) => {
          if (!collapsible) return;
          focus.onKeyDown(e);
          if (e.key === "left") onCollapsedChange(true);
          else if (e.key === "right") onCollapsedChange(false);
          else if (!e.isHeld && isActivation(e.key))
            onCollapsedChange(!collapsed);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          cursor: collapsible ? "pointer" : "default",
        }}
      />
    </div>
  );
}
