import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useGpuix, useWindowSize, type PublicInstance } from "@gpuix/react";
import {
  FocusScopeContext,
  getManagedFocus,
  focusElement,
} from "../../core/focus";
import { OverlayLayerContext, useOverlayLayer } from "../../core/layers";
import { useTheme } from "../../core/theme";
import { Button, Row, Stack, Text } from "../../base";
import { modalDimensions, type ModalPresentation } from "./model";
export interface ModalSurfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  testId: string;
  width?: number;
  height?: number;
  closeLabel?: string;
  restoreFocusRef?: RefObject<PublicInstance | null>;
  dismissOnBackdrop?: boolean;
  initialFocusRef?: RefObject<PublicInstance | null>;
  bodyScrollOffset?: number;
  surfaceRef?: RefObject<PublicInstance | null>;
  dismissible?: boolean;
  showClose?: boolean;
  presentation?: ModalPresentation;
  side?: "left" | "right";
}
export function ModalSurface(props: ModalSurfaceProps) {
  return props.open ? <OpenSurface {...props} /> : null;
}
function OpenSurface({
  onOpenChange,
  title,
  description,
  children,
  footer,
  testId,
  width,
  height,
  closeLabel = "Close",
  restoreFocusRef,
  dismissOnBackdrop = false,
  initialFocusRef,
  bodyScrollOffset,
  surfaceRef,
  dismissible = true,
  showClose = true,
  presentation = "dialog",
  side = "right",
}: ModalSurfaceProps) {
  const { colors: c } = useTheme(),
    { renderer } = useGpuix(),
    window = useWindowSize(),
    dimensions = modalDimensions(
      window.width,
      window.height,
      presentation,
      width,
      height,
    );
  const nodes = useRef(
      new Map<number, { node: PublicInstance; order: number }>(),
    ),
    body = useRef<PublicInstance>(null),
    fallback = useRef<PublicInstance>(null);
  const action = useRef({ onOpenChange, dismissible });
  action.current = { onOpenChange, dismissible };
  const sorted = () =>
    [...nodes.current.values()]
      .sort((a, b) => a.order - b.order)
      .map((x) => x.node);
  const initial = () => {
    const preferred = initialFocusRef?.current;
    const node = preferred ?? sorted()[0] ?? fallback.current;
    if (node) focusElement(renderer, node.id);
  };
  const managed = useOverlayLayer("modal", { focus: initial, restoreFocusRef });
  const close = () => {
    if (managed.isTop() && action.current.dismissible)
      action.current.onOpenChange(false);
  };
  const scope = useMemo(
    () => ({
      register: (node: PublicInstance, order = node.id) => {
        nodes.current.set(node.id, { node, order });
      },
      unregister: (id: number) => {
        nodes.current.delete(id);
      },
      escape: close,
      move: (id: number, backward: boolean) => {
        if (!managed.isTop()) return;
        const values = sorted(),
          index = values.findIndex((n) => n.id === id);
        const target = values.length
          ? values[
              (index + (backward ? -1 : 1) + values.length) % values.length
            ]
          : fallback.current;
        if (target) focusElement(renderer, target.id);
      },
    }),
    [renderer, managed.layer.id],
  );
  useEffect(() => {
    if (bodyScrollOffset !== undefined && body.current)
      renderer?.scrollTo?.(body.current.id, 0, -Math.max(0, bodyScrollOffset));
  }, [renderer, bodyScrollOffset]);
  return (
    <OverlayLayerContext.Provider value={managed.layer}>
      <FocusScopeContext.Provider value={scope}>
        <anchored
          position={{ x: 0, y: 0 }}
          deferred
          priority={managed.layer.priority}
          occlude
          style={{ backgroundColor: "transparent" }}
        >
          <div
            testId={testId + "-overlay"}
            style={{
              backgroundColor: "transparent",
              width: window.width,
              height: window.height,
              position: "relative",
              display: "flex",
              flexDirection: "row",
              alignItems:
                presentation === "sheet"
                  ? "flex-start"
                  : presentation === "drawer"
                    ? "stretch"
                    : "center",
              justifyContent:
                presentation === "drawer"
                  ? side === "left"
                    ? "flex-start"
                    : "flex-end"
                  : "center",
              pointerEvents: "auto",
            }}
          >
            <div
              testId={testId + "-backdrop"}
              onClick={(e) => {
                if (
                  dismissOnBackdrop &&
                  (e.button === undefined || e.button === 0)
                )
                  close();
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: c.overlay,
                pointerEvents: "auto",
              }}
            />
            <div
              ref={(node) => {
                fallback.current = node;
                if (surfaceRef) surfaceRef.current = node;
              }}
              tabIndex={-1}
              testId={testId}
              onKeyDown={(e) => {
                if (getManagedFocus(renderer) !== fallback.current?.id) return;
                if (e.key === "escape") close();
                if (e.key === "tab")
                  scope.move(e.elementId, Boolean(e.modifiers?.shift));
              }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                flexShrink: 0,
                ...dimensions,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: presentation === "drawer" ? 0 : 12,
                backgroundColor: c.elevated,
                pointerEvents: "auto",
                overflow: "hidden",
                boxShadow: {
                  offsetX: 0,
                  offsetY: 20,
                  blurRadius: 50,
                  spreadRadius: 0,
                  color: c.shadow,
                },
              }}
            >
              <Row style={{ padding: 18, justifyContent: "space-between" }}>
                <Stack
                  gap={6}
                  style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}
                >
                  <Text size={17} weight={600} lines={2}>
                    {title}
                  </Text>
                  {description ? (
                    <Text size={12} color={c.muted} lines={3}>
                      {description}
                    </Text>
                  ) : null}
                </Stack>
                {showClose ? (
                  <Button
                    testId={testId + "-close"}
                    disabled={!dismissible}
                    onPress={close}
                    size="sm"
                    variant="ghost"
                  >
                    {closeLabel}
                  </Button>
                ) : null}
              </Row>
              <div
                ref={body}
                testId={testId + "-body"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minWidth: 0,
                  padding: 18,
                  paddingTop: 0,
                  overflowY: "scroll",
                  minHeight: 0,
                  maxHeight:
                    presentation === "dialog"
                      ? Math.max(1, dimensions.maxHeight - 160)
                      : undefined,
                  flexGrow: presentation === "dialog" ? 0 : 1,
                  flexShrink: 1,
                }}
              >
                {children}
              </div>
              {footer ? (
                <Row
                  testId={testId + "-footer"}
                  style={{
                    padding: 14,
                    justifyContent: "flex-end",
                    borderTopWidth: 1,
                    borderColor: c.border,
                    flexWrap: "wrap",
                  }}
                >
                  {footer}
                </Row>
              ) : null}
            </div>
          </div>
        </anchored>
      </FocusScopeContext.Provider>
    </OverlayLayerContext.Provider>
  );
}
