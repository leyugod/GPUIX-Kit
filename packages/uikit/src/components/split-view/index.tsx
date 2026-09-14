import { OverlayCapture } from "../../core/layers";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowSize, type EventPayload, type StyleDesc } from "@gpuix/react";
import { useFocusTarget } from "../../core/focus";
import { useTheme } from "../../core/theme";
import { clamp } from "../../core/rules";
import { Button, Row, Stack, Text } from "../../base";
export interface SplitViewProps {
  primary: ReactNode;
  children: ReactNode;
  size: number;
  onSizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  orientation?: "horizontal" | "vertical";
  collapsed?: boolean;
  disabled?: boolean;
  step?: number;
  testId: string;
  style?: StyleDesc;
}
/** 尺寸用容器内像素；应用按可用空间传 min/max，持久化仍由应用负责。 */
export function SplitView({
  primary,
  children,
  size,
  onSizeChange,
  minSize = 160,
  maxSize = 480,
  orientation = "horizontal",
  collapsed = false,
  disabled = false,
  step = 10,
  testId,
  style,
}: SplitViewProps) {
  const { colors: c } = useTheme();
  const focus = useFocusTarget(disabled);
  const window = useWindowSize();
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ position: 0, size: 0 });
  // 受控折叠/禁用立即销毁捕获层，防止隐藏分隔条仍截获整个窗口。
  useEffect(() => {
    if (collapsed || disabled) setDragging(false);
  }, [collapsed, disabled]);
  const horizontal = orientation === "horizontal";
  const lower = Math.max(0, minSize),
    upper = Math.max(lower, maxSize);
  const bounded = clamp(size, lower, upper);
  const resize = (n: number) => {
    if (!disabled) onSizeChange(clamp(n, lower, upper));
  };
  const move = (event: EventPayload) => {
    if (dragging)
      resize(
        origin.current.size +
          (horizontal ? (event.x ?? 0) : (event.y ?? 0)) -
          origin.current.position,
      );
  };
  return (
    <div
      testId={testId}
      style={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {!collapsed ? (
        <>
          <div
            testId={`${testId}-primary`}
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              width: horizontal ? bounded : "100%",
              height: horizontal ? "100%" : bounded,
            }}
          >
            {primary}
          </div>
          <div
            ref={focus.ref}
            testId={`${testId}-divider`}
            tabIndex={disabled ? -1 : 0}
            onMouseDown={(event) => {
              if (event.button !== undefined && event.button !== 0) return;
              focus.onMouseDown();
              if (!disabled) {
                origin.current = {
                  position: horizontal ? (event.x ?? 0) : (event.y ?? 0),
                  size: bounded,
                };
                setDragging(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "escape" && dragging) {
                resize(origin.current.size);
                setDragging(false);
                return;
              }
              focus.onKeyDown(event);
              if (disabled) return;
              const delta =
                Math.max(1, step) * (event.modifiers?.shift ? 5 : 1);
              if (event.key === (horizontal ? "left" : "up"))
                resize(bounded - delta);
              if (event.key === (horizontal ? "right" : "down"))
                resize(bounded + delta);
              if (event.key === "home") resize(lower);
              if (event.key === "end") resize(upper);
              if (event.key === "escape") {
                if (dragging) resize(origin.current.size);
                setDragging(false);
              }
            }}
            style={{
              flexShrink: 0,
              width: horizontal ? 6 : "100%",
              height: horizontal ? "100%" : 6,
              backgroundColor: focus.focused || dragging ? c.accent : c.border,
              cursor: disabled
                ? "default"
                : horizontal
                  ? "col-resize"
                  : "row-resize",
            }}
          />
        </>
      ) : null}
      <div
        testId={`${testId}-content`}
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {dragging && !collapsed && !disabled ? (
        <OverlayCapture position={{ x: 0, y: 0 }} deferred occlude>
          <div
            testId={`${testId}-drag`}
            onMouseMove={move}
            onMouseUp={(event) => {
              move(event);
              setDragging(false);
            }}
            onMouseDownOutside={() => setDragging(false)}
            style={{
              width: window.width,
              height: window.height,
              pointerEvents: "auto",
              cursor: horizontal ? "col-resize" : "row-resize",
            }}
          />
        </OverlayCapture>
      ) : null}
    </div>
  );
}
export function Inspector({
  title = "Inspector",
  children,
  onClose,
  testId,
}: {
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  testId: string;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      testId={testId}
      gap={0}
      style={{ height: "100%", minHeight: 0, backgroundColor: c.surface }}
    >
      <Row style={{ padding: 12, borderBottomWidth: 1, borderColor: c.border }}>
        <Text size={13} weight={600} style={{ flexGrow: 1 }}>
          {title}
        </Text>
        {onClose ? (
          <Button
            testId={`${testId}-close`}
            size="sm"
            variant="ghost"
            onPress={onClose}
          >
            Close
          </Button>
        ) : null}
      </Row>
      <Stack
        style={{
          padding: 14,
          minHeight: 0,
          flexShrink: 1,
          overflowY: "scroll",
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}
export function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { colors: c } = useTheme();
  return (
    <Stack
      gap={10}
      style={{ paddingBottom: 16, borderBottomWidth: 1, borderColor: c.border }}
    >
      <Text size={11} weight={600} color={c.muted}>
        {title}
      </Text>
      {children}
    </Stack>
  );
}
