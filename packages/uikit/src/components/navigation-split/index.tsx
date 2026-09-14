import {
  useContext,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useGpuix, type PublicInstance } from "@gpuix/react";
import { Button, Row, Text } from "../../base";
import { useTheme } from "../../core/theme";
import {
  focusElement,
  getManagedFocus,
  subscribeManagedFocus,
  FocusRegionContext,
} from "../../core/focus";
import { SplitView } from "../split-view";
import { navigationLayout, type NavigationLayoutOptions } from "./model";
export interface SidebarToggleProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  testId: string;
  disabled?: boolean;
  showLabel?: string;
  hideLabel?: string;
  ref?: RefObject<PublicInstance | null>;
}
export function SidebarToggle({
  visible,
  onVisibleChange,
  testId,
  disabled,
  showLabel = "Show sidebar",
  hideLabel = "Hide sidebar",
  ref,
}: SidebarToggleProps) {
  return (
    <Button
      testId={testId}
      ref={ref}
      size="sm"
      variant="ghost"
      disabled={disabled}
      onPress={() => onVisibleChange(!visible)}
    >
      {visible ? hideLabel : showLabel}
    </Button>
  );
}
export interface NavigationPaneProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
  scroll?: boolean;
}
/** 每一列自行选择唯一滚动容器；已有 ListView 等滚动内容应保持 scroll=false。 */
export function NavigationPane({
  title,
  subtitle,
  actions,
  children,
  footer,
  testId,
  scroll = false,
}: NavigationPaneProps) {
  const { colors: c } = useTheme();
  return (
    <div
      testId={testId}
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: c.canvas,
      }}
    >
      <Row
        testId={testId + "-header"}
        style={{
          height: 64,
          padding: 12,
          borderBottomWidth: 1,
          borderColor: c.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          <Text size={15} weight={600} lines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text size={11} color={c.muted} lines={1}>
              {subtitle}
            </Text>
          ) : null}
        </div>
        {actions}
      </Row>
      <div
        testId={testId + "-body"}
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: scroll ? "scroll" : "hidden",
        }}
      >
        {children}
      </div>
      {footer ? (
        <div
          testId={testId + "-footer"}
          style={{
            padding: 10,
            borderTopWidth: 1,
            borderColor: c.border,
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
export interface NavigationSplitViewProps extends NavigationLayoutOptions {
  height: number;
  sidebar: ReactNode;
  content?: ReactNode;
  children: ReactNode;
  inspector?: ReactNode;
  testId: string;
  onSidebarWidthChange: (width: number) => void;
  onContentWidthChange?: (width: number) => void;
  onInspectorWidthChange?: (width: number) => void;
  /** 列被卸载且仍持有焦点时，恢复到应用提供的稳定工具栏控件。 */
  fallbackFocusRef?: RefObject<PublicInstance | null>;
  disabled?: boolean;
}
export function NavigationSplitView(props: NavigationSplitViewProps) {
  const { renderer } = useGpuix();
  const layout = navigationLayout({
    ...props,
    contentVisible: props.contentVisible !== false && props.content != null,
    inspectorVisible:
      props.inspectorVisible === true && props.inspector != null,
  });
  const owner = useRef<{ pane: string; id: number | null } | null>(null);
  const visible = {
    sidebar: layout.sidebar,
    content: layout.content,
    detail: layout.detail,
    inspector: layout.inspector,
  };
  const parentRegion = useContext(FocusRegionContext);
  const nodeRegions = useRef(new Map<number, string>());
  const regions = useMemo(
    () =>
      Object.fromEntries(
        ["sidebar", "content", "detail", "inspector"].map((name) => [
          name,
          {
            register: (id: number) => {
              nodeRegions.current.set(id, name);
              parentRegion?.register(id);
            },
            unregister: (id: number) => {
              nodeRegions.current.delete(id);
              parentRegion?.unregister(id);
            },
          },
        ]),
      ),
    [parentRegion],
  );
  useEffect(() => {
    if (!renderer) return;
    return subscribeManagedFocus(renderer, () => {
      const id = getManagedFocus(renderer),
        pane = id === null ? undefined : nodeRegions.current.get(id);
      if (pane) owner.current = { pane, id };
    });
  }, [renderer]);
  useEffect(() => {
    const last = owner.current;
    if (
      last &&
      !visible[last.pane as keyof typeof visible] &&
      last.id === getManagedFocus(renderer) &&
      props.fallbackFocusRef?.current
    ) {
      focusElement(renderer, props.fallbackFocusRef.current.id);
      owner.current = null;
    }
  }, [
    renderer,
    layout.sidebar,
    layout.content,
    layout.detail,
    layout.inspector,
    props.fallbackFocusRef,
  ]);
  const pane = (name: string, node: ReactNode) => (
    <FocusRegionContext.Provider value={regions[name]!}>
      <div
        testId={props.testId + "-pane-" + name}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {node}
      </div>
    </FocusRegionContext.Provider>
  );
  const remainder =
    layout.width - (layout.sidebar ? layout.sidebarWidth + 6 : 0);
  const detailArea = remainder - (layout.content ? layout.contentWidth + 6 : 0);
  const detail = (
    <FocusRegionContext.Provider value={regions.inspector!}>
      <SplitView
        testId={props.testId + "-inspector"}
        size={Math.max(0, detailArea - layout.inspectorWidth - 6)}
        minSize={Math.max(layout.detailMinWidth, detailArea - 366)}
        maxSize={Math.max(0, detailArea - 226)}
        collapsed={!layout.inspector}
        disabled={props.disabled || !props.onInspectorWidthChange}
        onSizeChange={(size) =>
          props.onInspectorWidthChange?.(detailArea - size - 6)
        }
        primary={pane("detail", props.children)}
      >
        {layout.inspector
          ? pane("inspector", props.inspector)
          : pane("detail", props.children)}
      </SplitView>
    </FocusRegionContext.Provider>
  );
  return (
    <div
      testId={props.testId}
      style={{
        width: layout.width,
        height: Number.isFinite(props.height) ? Math.max(1, props.height) : 600,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {layout.detail ? (
        <FocusRegionContext.Provider value={regions.sidebar!}>
          <SplitView
            testId={props.testId + "-sidebar"}
            size={layout.sidebarWidth}
            minSize={180}
            maxSize={Math.min(
              360,
              layout.width -
                6 -
                (layout.content ? layout.contentWidth + 6 : 0) -
                (layout.inspector ? layout.inspectorWidth + 6 : 0) -
                layout.detailMinWidth,
            )}
            collapsed={!layout.sidebar}
            disabled={props.disabled}
            onSizeChange={props.onSidebarWidthChange}
            primary={pane("sidebar", props.sidebar)}
          >
            <FocusRegionContext.Provider value={regions.content!}>
              <SplitView
                testId={props.testId + "-content"}
                size={layout.contentWidth}
                minSize={220}
                maxSize={Math.min(
                  420,
                  remainder -
                    6 -
                    (layout.inspector ? layout.inspectorWidth + 6 : 0) -
                    layout.detailMinWidth,
                )}
                collapsed={!layout.content}
                disabled={props.disabled || !props.onContentWidthChange}
                onSizeChange={(size) => props.onContentWidthChange?.(size)}
                primary={pane("content", props.content)}
              >
                {detail}
              </SplitView>
            </FocusRegionContext.Provider>
          </SplitView>
        </FocusRegionContext.Provider>
      ) : (
        pane("content", props.content)
      )}
    </div>
  );
}
