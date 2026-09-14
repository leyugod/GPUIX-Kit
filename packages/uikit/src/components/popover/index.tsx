import { OverlayLayerContext, useOverlayLayer } from "../../core/layers";
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useGpuix, useWindowSize, type PublicInstance } from "@gpuix/react";
import { FocusScopeContext, focusElement } from "../../core/focus";
import { useTheme } from "../../core/theme";

export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: ReactNode;
  children: ReactNode;
  testId: string;
  width?: number;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  restoreFocusRef?: RefObject<PublicInstance | null>;
  /** 搜索选择器保留编辑器焦点；普通弹层自动聚焦内容。 */
  autoFocus?: boolean;
  /** 固定行高列表的键盘高亮滚动位置；普通内容不设置。 */
  scrollOffset?: number;
}
export function Popover({ anchor, open, ...props }: PopoverProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minWidth: 0,
      }}
    >
      {anchor}
      {open ? <PopoverContent {...props} /> : null}
    </div>
  );
}
function PopoverContent({
  children,
  testId,
  onOpenChange,
  width = 260,
  side = "bottom",
  align = "start",
  restoreFocusRef,
  autoFocus = true,
  scrollOffset,
}: Omit<PopoverProps, "anchor" | "open">) {
  const { colors: c } = useTheme();
  const { renderer } = useGpuix();
  const window = useWindowSize();
  const outside = useRef(false);
  const contentRef = useRef<PublicInstance>(null);
  useEffect(() => {
    if (scrollOffset !== undefined && contentRef.current)
      renderer?.scrollTo?.(
        contentRef.current.id,
        0,
        -Math.max(0, scrollOffset),
      );
  }, [renderer, scrollOffset]);
  const nodes = useRef(new Map<number, PublicInstance>());
  const nodeOrder = useRef(new Map<number, number>());
  const close = useRef(onOpenChange);
  close.current = onOpenChange;
  const managed = useOverlayLayer("popover", {
    focus: () => {
      const first = nodes.current.keys().next().value;
      if (autoFocus && first !== undefined) focusElement(renderer, first);
    },
    restoreFocusRef,
    restoreAllowed: () => !outside.current,
  });
  const scope = useMemo(
    () => ({
      register: (node: PublicInstance, order = node.id) => {
        nodes.current.set(node.id, node);
        nodeOrder.current.set(node.id, order);
      },
      unregister: (id: number) => {
        nodes.current.delete(id);
        nodeOrder.current.delete(id);
      },
      escape: () => {
        if (managed.isTop()) close.current(false);
      },
      move: (id: number, backward: boolean) => {
        if (!managed.isTop()) return;
        const ids = [...nodes.current.keys()].sort(
          (a, b) =>
            (nodeOrder.current.get(a) ?? a) - (nodeOrder.current.get(b) ?? b),
        );
        const target =
          ids[
            (ids.indexOf(id) + (backward ? -1 : 1) + ids.length) % ids.length
          ];
        if (target !== undefined) focusElement(renderer, target);
      },
    }),
    [renderer],
  );
  return (
    <OverlayLayerContext.Provider value={managed.layer}>
      <FocusScopeContext.Provider value={scope}>
        {/* 显式透明背景，避免 0.7.0 anchored 默认底色露出圆角外侧。 */}
        <anchored
          style={{ backgroundColor: "transparent", borderRadius: 10 }}
          side={side}
          align={align}
          gap={6}
          fit="snap"
          snapMargin={8}
          deferred
          priority={managed.layer.priority}
          occlude
        >
          <div
            ref={contentRef}
            testId={testId}
            onMouseDownOutside={() => {
              if (!managed.isTop()) return;
              outside.current = true;
              close.current(false);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              width: Math.min(width, window.width - 16),
              maxHeight: Math.min(320, window.height - 32),
              padding: 6,
              gap: 4,
              backgroundColor: c.elevated,
              borderColor: c.border,
              borderWidth: 1,
              borderRadius: 10,
              pointerEvents: "auto",
              overflowY: "scroll",
              boxShadow: {
                offsetX: 0,
                offsetY: 8,
                blurRadius: 24,
                spreadRadius: 0,
                color: c.shadow,
              },
            }}
          >
            {children}
          </div>
        </anchored>
      </FocusScopeContext.Provider>
    </OverlayLayerContext.Provider>
  );
}
