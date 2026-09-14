export interface NavigationLayoutOptions {
  width: number;
  sidebarVisible?: boolean;
  contentVisible?: boolean;
  inspectorVisible?: boolean;
  sidebarWidth?: number;
  contentWidth?: number;
  inspectorWidth?: number;
  detailMinWidth?: number;
  compactPane?: "content" | "detail";
}
const bounded = (
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) => Math.min(max, Math.max(min, Number.isFinite(value) ? value! : fallback));
/** 实际可见列与应用偏好分离；自动收起不回写用户偏好。 */
export function navigationLayout(options: NavigationLayoutOptions) {
  const width = bounded(options.width, 1000, 1, 20000),
    sidebarWidth = bounded(options.sidebarWidth, 224, 180, 360),
    contentWidth = bounded(options.contentWidth, 280, 220, 420),
    inspectorWidth = bounded(options.inspectorWidth, 260, 220, 360),
    detailMinWidth = bounded(options.detailMinWidth, 320, 160, 1200);
  let sidebar = options.sidebarVisible !== false,
    content = options.contentVisible === true,
    inspector = options.inspectorVisible === true,
    detail = true;
  const total = () =>
    detailMinWidth +
    (sidebar ? sidebarWidth + 6 : 0) +
    (content ? contentWidth + 6 : 0) +
    (inspector ? inspectorWidth + 6 : 0);
  if (total() > width) inspector = false;
  if (total() > width) sidebar = false;
  if (total() > width && content) {
    if (options.compactPane === "content") detail = false;
    else content = false;
  }
  const contentOnly = content && !detail;
  return {
    width,
    sidebar,
    content,
    inspector,
    detail,
    sidebarWidth,
    contentWidth: contentOnly ? width : contentWidth,
    inspectorWidth,
    detailMinWidth,
    detailWidth: detail
      ? Math.max(
          1,
          width -
            (sidebar ? sidebarWidth + 6 : 0) -
            (content ? contentWidth + 6 : 0) -
            (inspector ? inspectorWidth + 6 : 0),
        )
      : 0,
  };
}
