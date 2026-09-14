# v0.15 Apple 风格侧栏与导航分栏

使用固定 GPUIX React/native 0.7.0 的原生 JSX。SourceListSidebar 用于来源导航，NavigationSplitView 负责来源—集合—详情及可选 Inspector 的窗口内组合。视觉遵循现有 Darwin 深浅 tokens，不需要 DOM、CSS 或浏览器路由。

## 公共入口

```tsx
import {
  SourceListSidebar,
  SourceListSectionHeader,
  SourceListRow,
  type SourceListGroup,
  type SourceListItem,
} from "@mirai/gpuix-kit/source-list";
import {
  SidebarToggle,
  NavigationPane,
  NavigationSplitView,
} from "@mirai/gpuix-kit/navigation-split";
import {
  sourceListError,
  sourceEntries,
  sourceTargets,
  sourceActive,
  sourceMove,
  toggleSourceGroup,
  sourceScrollOffset,
} from "@mirai/gpuix-kit/source-list-model";
import { navigationLayout } from "@mirai/gpuix-kit/navigation-split-model";
```

六个组件与其 Props 类型也从包根导出；纯模型通过上述模型子路径使用。原 SidebarNavigation 的 simple/slim/dual-tier、两级子项 API 保留；新的来源列表采用平面分组，深层集合在中间列展开。

## SourceListSidebar

必需属性：groups、value: string | null、onValueChange(id)、collapsed: readonly string[]、onCollapsedChange(ids)、height: number、testId。宽度填充父列，由 NavigationSplitView 或调用方设置。

```tsx
const groups: SourceListGroup[] = [
  {
    id: "favorites",
    label: "收藏",
    items: [
      { id: "inbox", label: "收件箱", badge: "12" },
      { id: "drafts", label: "草稿", badge: "2" },
      { id: "offline", label: "离线账户", disabled: true },
    ],
  },
];

<SourceListSidebar
  testId="app-sources"
  groups={groups}
  value={selectedSource}
  onValueChange={setSelectedSource}
  collapsed={collapsedGroups}
  onCollapsedChange={setCollapsedGroups}
  height={availableHeight}
  header={<Text>我的工作区</Text>}
  search={
    <Input testId="source-search" value={query} onValueChange={setQuery} />
  }
  footer={<Text>本地资料库</Text>}
/>;
```

示例中的状态和 Text/Input 由应用提供。搜索插槽不会隐式过滤数据；应用按 query 生成 groups，保持 ID 稳定。没有数据请求、持久化或文件/邮件连接。

| 属性                  | 契约                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| group                 | id、label、items；collapsible 默认 true，false 时忽略该组的 collapsed 标记                                |
| item                  | 全局唯一 id、label、可选原生 icon、字符串 badge、disabled、action                                         |
| action                | label 是行末可见短标签，例如 ＋；onPress 为同步意图，disabled 可单独锁定；长说明/菜单由应用组合           |
| header/search/footer  | 固定插槽，默认高度分别为 56/44/52；对应 headerHeight/searchHeight/footerHeight 可覆盖，仅存在插槽时占空间 |
| density               | compact 默认行高 32；comfortable 行高 38；分组头固定 32                                                   |
| windowActive          | 默认 true；false 显示非活动选中底色；由应用注入，不检测 OS 活动窗口                                       |
| selectionFollowsFocus | 默认 true，方向键移动到可用来源即发出选择；false 时 Enter/Space 才选择                                    |
| disabled/loading      | 锁定来源列表与动作；插槽中的输入/按钮由调用方独立控制；loadingLabel 可覆盖等待文字                        |
| emptyLabel            | 空列表提示，可本地化；非法数据有独立错误提示                                                              |

最多 20 组、100 个来源项；组 ID 在组内域唯一，项 ID 在全部组中唯一，长度 1–128。组标题最长 200、项名称最长 300、徽标最长 24 code unit。非法集合显示错误并不挂载导航行。来源项全部挂载，**不是虚拟化集合**；大型文件、邮件、人员列表应在中间列按页提供。

height 显式传入，内部至少按 120 计算，非有限值回退 600。调用方需为固定插槽与正文提供足够空间；不声明极小高度下所有插槽可用。正文独立滚动，固定行高用于方向键定位；长名称单行裁切，不改变行高。icon 是调用方提供的原生内容，颜色也由应用结合选中态选择；库没有捆绑 SF Symbols。

## 来源键盘与受控身份

来源正文只有一个 Tab 入口。Up/Down、Home/End 在分组头和可用来源之间移动，到边界停止；禁用来源跳过。分组 Enter/Space 切换折叠，Left 收起，Right 展开或进入第一项。来源 Left 回到分组头，Right 进入可用行末动作。动作 Enter/Space 执行，Left/Escape 返回正文，Tab 从正文离开；普通 Escape 继续交给外层 Dialog/Popover 焦点范围。

折叠不会清除应用的 value。数据变化后，仍有效的键盘目标优先，其次可见已选项，再按原可用索引回退。该回退不触发隐式 onValueChange：如果应用删除已选项后需要换选其他来源，应用应明确更新 value；Gallery 的删除示例演示此方式。不存在的旧 ID 不会被再次激活。自动展开选中项、多选、拖放排序和 typeahead 尚未实现。

SourceListRow 和 SourceListSectionHeader 可独立使用，默认 tabStop=true。组合列表传 tabStop=false，由稳定根节点管理键盘。独立行 Right 进入 action、Left/Escape 返回行。稳定测试 ID 为 list 的 `-list`/`-scroll`、`-group-{id}`、`-item-{id}` 和行末 `-action`。

## NavigationSplitView

必需：width、height、sidebar、children（详情）、sidebarWidth/onSidebarWidthChange 中的回调、testId。sidebarWidth 可省略并回退 224。可选 content、inspector 和其受控宽度回调，以及 sidebarVisible、contentVisible、inspectorVisible、compactPane、detailMinWidth、fallbackFocusRef。

```tsx
<NavigationSplitView
  testId="workspace"
  width={availableWidth}
  height={availableHeight}
  sidebarVisible={sidebarVisible}
  sidebarWidth={sidebarWidth}
  onSidebarWidthChange={setSidebarWidth}
  contentWidth={listWidth}
  onContentWidthChange={setListWidth}
  inspectorVisible={inspectorVisible}
  inspectorWidth={inspectorWidth}
  onInspectorWidthChange={setInspectorWidth}
  fallbackFocusRef={sidebarToggleRef}
  sidebar={sourceList}
  content={collectionPane}
  inspector={inspectorPane}
>
  {detailPane}
</NavigationSplitView>
```

width/height 是容器可用像素，嵌入子区域时不能直接把窗口宽度当容器宽度。省略 content 为来源—详情两栏；提供 content 为三栏；inspectorVisible 默认 false。SidebarToggle 只发出显隐偏好；实际列可能因窄窗口被临时收起。应用可以调用纯 navigationLayout 查询当前布局并提示用户。

默认宽度与边界：侧栏 224（180–360），集合 280（220–420），Inspector 260（220–360），详情最小宽 320（可设置 160–1200）。分隔条宽 6。空间不足时依次临时隐藏 Inspector、侧栏、集合；最后只保留详情。compactPane="content" 时最后保留集合，适合应用先选项再切到详情；此阶段不会提供隐藏列的自动弹出替代。

自动收起不回写显隐或宽度偏好；窗口变宽后恢复。所有布局数值进行有限值和范围校验。侧栏/集合分隔条继承 SplitView 指针拖动、方向键、Shift 大步进、Home/End；Inspector 位于右侧，向右移动分隔条会缩小 Inspector。缺少集合/Inspector 宽度回调时对应分隔条禁用；disabled 只禁用调整大小，不禁用列内业务内容。

隐藏列会卸载内容，部分重组也会重新挂载详情。因此输入草稿、选中项、远程请求和分页状态必须由应用持有；Gallery 验证了显隐/主题变化后的受控草稿保留。新版本同时修复已有 SplitView：拖动时受控折叠/禁用会立即清理整窗捕获，避免不可见分隔条阻挡后续操作。

## NavigationPane 与恢复焦点

NavigationPane 提供 title、可选 subtitle、actions、children、footer、testId。固定头部高 64，页脚保持在正文外。scroll 默认 false；嵌套 ListView 等已有滚动控件时保持 false，普通长内容设置 true，避免同轴滚动套滚动。

SidebarToggle 提供 visible/onVisibleChange、testId、disabled、showLabel/hideLabel 和 ref。将稳定工具栏按钮 ref 传给 NavigationSplitView.fallbackFocusRef，可在持有焦点的列或分隔条被移除时恢复到该按钮；不会因为无关列隐藏而主动抢走仍有效的已登记焦点。

焦点区域通过 useFocusTarget 注册并订阅 UIKit 记录，不依赖冒泡事件推断所属列。此契约覆盖 UIKit 控件和使用公开 focus API 的自定义控件，**不是系统焦点查询**。固定 GPUIX 编辑器的部分指针/End 等内部操作不转发 JSX，原生 focusNext 也不总派发 focus 事件；只有宿主焦点变化而无 UIKit 记录时，自动恢复不能保证。状态测试分别验证按钮、经转发按键登记的编辑器及分隔条。IME/AX/system responder 专项尚缺。

## 示例、验证和边界

运行 `bun run dev:sidebars`。Mail 展示来源—邮件列表—阅读/回复；Files 切换收藏/位置/长标签来源。它们是内存交互示例，Files 不是完整 Finder，Mail 不收发邮件。没有账号、同步服务或磁盘存取。

```sh
bun run check
bun run test:sidebars
bun run test:sidebars:narrow
bun run test:sidebars:states
bun run test:live:sidebars
bun run test:package
```

本批新增 12 个纯规则测试。原生示例验证 1320×920 / 1000×720 深浅主题、来源/动作/折叠/删除、长列表定位、固定插槽、宽度调整、Inspector 和受控草稿。状态测试另以 500px 可用宽度验证紧凑单列、显式焦点恢复及捕获清理。真实 macOS ARM64 窗口验证启动、中文注入、主题和截图；不使用 live simulateClick。

Vibrancy/Liquid Glass、系统强调色/主题/窗口激活检测、SF Symbols、AX/真实 IME、多账户服务、拖放和虚拟化均不在本批完成范围。普通颜色面板不能冒充系统材质。
