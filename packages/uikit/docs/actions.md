# 桌面动作与导航组合 · v0.10.0

新增六个公开组件：ButtonGroup、SplitButton、ToolbarActions、PathControl、WorkspaceSwitcher、AccountMenu。采用 Darwin 风格语义色，随 UIKitProvider 的深浅主题变化。

从 `@mirai/gpuix-kit` 或 `@mirai/gpuix-kit/actions` 导入组件；纯模型通过 `@mirai/gpuix-kit/action-model` 导入。组件渲染固定 GPUIX 0.7.0 原生元素，不使用 DOM、浏览器路由或系统账户 API。

## 统一数据与受控状态

`UIKitAction` 扩展已有 Command：必填 `id、label、run: () => void`；支持 `disabled、loading、hidden、checked、destructive、shortcut`。hidden 项不挂载、不占溢出名额；disabled/loading 项仍显示，但不执行。菜单中的 checked 显示勾选；shortcut 只是标签。继承的 group/keywords 在本批平面菜单中不参与分组或搜索。

动作执行前先请求关闭菜单，再调用 run。UIKit 不等待 Promise、不自动保存或处理业务错误；调用方负责异步错误、loading 与重试。受控 loading 生效前不提供内部异步提交锁。

弹出组件必填 `open、onOpenChange、testId`，可传 `disabled、loading、width`。width 默认 280，有限值限制在 180–480，最终还受窗口宽度约束。disabled/loading 阻止打开或隐藏已有弹层；它们不自动回写 open，应用恢复启用前应按需要同步 open。

集合 id 必须唯一且非空，label 不可全空白；无效配置显示 `${testId}-error` 并不挂载交互项。动作/工作区最多 100 项（含 hidden），ButtonGroup 最多 12 项，路径最多 64 段。修改集合时保留稳定 id，不要用每次渲染生成的新 id。

## 六个组件

| 组件              | 主要 API                                                                                            | 行为与边界                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ButtonGroup       | items、testId、disabled、orientation、variant、itemWidth                                            | 横/纵相连动作按钮；左右/上下和 Home/End 移动焦点，跳过禁用、加载和隐藏项。默认每项 120px，限制 48–320。不是互斥选择器，选择场景使用 SegmentedControl。                             |
| SplitButton       | primary: UIKitAction、items、menuLabel，加弹出属性                                                  | 主按钮执行 primary；副按钮打开替代动作。整体 loading 或 primary.loading 锁住两侧；primary.disabled 仅禁用主动作，替代动作仍可用。空替代集合禁用副按钮。primary.hidden 隐藏主按钮。 |
| ToolbarActions    | items、visibleCount、overflowLabel、itemWidth，加弹出属性                                           | 按输入顺序分配可见动作和菜单。visibleCount 向下取整并限制 0–12，非有限值按 0。隐藏项先过滤；禁用项仍占可见名额。                                                                   |
| PathControl       | items: PathItem[]、onNavigate(id)、maxVisible、segmentWidth，加弹出属性                             | 默认最多显示 4 段（限制 2–12）；折叠时保留根和末尾若干段，中间段进入菜单。当前段是静态文字，不发出跳转。默认段宽 120，限制 48–240。                                                |
| WorkspaceSwitcher | items: WorkspaceItem[]、value: string 或 null、onValueChange(id)、placeholder、readOnly，加弹出属性 | 应用持有选中值；当前项勾选并作为打开时的初始焦点。再次选择当前项只关闭菜单，不回调。未知 value 显示 placeholder，不擅自修正值。readOnly 阻止打开。                                 |
| AccountMenu       | account: {name, detail?, avatar?}、items，加弹出属性                                                | 账户信息头部与通用动作菜单；仅传递 Profile/Settings/Sign out 等调用方动作，不实现身份认证、会话或注销。avatar 是布局插槽，调用方应提供紧凑的装饰内容。                             |

PathItem 为 `{ id, label, disabled? }`；WorkspaceItem 增加可选 description，当前工作区的 description 显示在菜单头部。没有远程查询、搜索或创建工作区的隐式行为；创建入口可由旁边的 Button/ToolbarActions 组合。

Button 新增可选 `labelLines`，这些组合统一限制标签一行，长名称由原生 Text 截断。完整名称仍在调用方数据中；没有自动 tooltip。ButtonGroup、ToolbarActions、PathControl 不自动测量容器宽度或换行，应用应根据布局传入合适的数量和宽度。

## 菜单键盘与焦点

本批内部 ActionMenu 共用 Popover，最多挂载六项/页，数量较大时显示上一页、下一页。它是平面菜单；旧 DropdownMenu/ContextMenu 的逐级子菜单仍使用原 API，本批不加入级联悬停。

- 触发按钮：Enter/Space 切换，Down 打开；持续按住激活键不重复执行。
- 菜单：Up/Down 在所有可用项之间循环，跨页后挂载目标页并移动焦点。Home/End 到首尾可用项；PageUp/PageDown 切换一页，页边界不操作。
- Tab/Shift+Tab 在本弹层已注册控件内循环；Escape 关闭当前弹层，焦点返回触发按钮。嵌套 Dialog 中先关闭菜单，再次 Escape 关闭 Dialog。
- 空页/全禁用页提供可聚焦的关闭入口；该入口也支持 PageUp/PageDown、Home/End，避免不可用页困住键盘。
- 打开状态下集合缩短或活动项不可用，修正页码并恢复到当前页有效项或关闭入口。受控选中值变化更新勾选，不主动跳到其他页。
- 右键不执行动作。外部点击关闭交给 Popover，保留外部点击目标的焦点。

不支持菜单 typeahead、拖放、全局快捷键、持久化排序、自动宽度测量或完整 macOS 菜单/AX 等价行为。调用方主动移除整个控件（例如 overflow 变空）时，应负责目标焦点和 open 的同步。

## 组合示例

```tsx
import { useState } from "react";
import {
  Row,
  WorkspaceSwitcher,
  ToolbarActions,
  type UIKitAction,
} from "@mirai/gpuix-kit";

export function WorkspaceToolbar({
  actions,
  onWorkspaceChange,
}: {
  actions: readonly UIKitAction[];
  onWorkspaceChange: (id: string) => void;
}) {
  const [workspace, setWorkspace] = useState<string | null>("design");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <Row>
      <WorkspaceSwitcher
        testId="workspace"
        items={[
          { id: "design", label: "Design" },
          { id: "engineering", label: "Engineering" },
        ]}
        value={workspace}
        onValueChange={(id) => {
          setWorkspace(id);
          onWorkspaceChange(id);
        }}
        open={workspaceOpen}
        onOpenChange={setWorkspaceOpen}
      />
      <ToolbarActions
        testId="actions"
        items={actions}
        visibleCount={2}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
      />
    </Row>
  );
}
```

使用已有 SidebarNavigation 的 header/footer 插槽，也可放入 WorkspaceSwitcher 和 AccountMenu；应用决定多个受控菜单是否互斥打开。本批不建立全局 overlay 栈。

## testId 与验证

ButtonGroup：`{id}-{actionId}`。SplitButton：`{id}-primary`、`{id}-menu`。ToolbarActions：`{id}-visible-{actionId}`、`{id}-overflow`。PathControl：`{id}-{segmentId}`、`{id}-current`、`{id}-overflow`。

菜单触发 id 为组件传入值（或上述 menu/overflow id）；其子节点为 `{triggerId}-popup`、`-item-{itemId}`、`-previous`、`-next`、`-page`、`-close`。只有当前页存在的项可查询。

运行 `bun run dev:actions`。验证命令为 `test:actions`、`test:actions:narrow`、`test:actions:states`、`test:live:actions`、`test:package`。TestRenderer 验证鼠标/键盘/分页/焦点和状态；真实 macOS ARM64 窗口验证启动、中文文本注入、主题与截图，不使用 live simulateClick。Windows/Linux、完整 IME 和屏幕阅读器仍未验证。
