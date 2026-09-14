# 桌面组件第一批 · v0.2.0

这是通用框架的第一批增量，尚不代表完整组件族已完成。所有组件继承 UIKitProvider 的深浅语义主题，使用 GPUIX 原生宿主。

## API 与边界

| 组件 / 入口                         | 主要受控 API                                                                  | 已有能力                                                                         | 尚未提供                                               |
| ----------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| SidebarNavigation / navigation      | sections、value/onValueChange、expanded/onExpandedChange、variant、rail       | simple/slim/dual-tier；分组标题、分隔、两级展开、徽标、header/search/footer 插槽 | 无限层树、路由、账户/工作区菜单完整组合                |
| Breadcrumb / navigation             | items、onNavigate                                                             | 当前项与可操作祖先、换行                                                         | 溢出菜单、路径历史、文件系统路径语义                   |
| SplitView / split-view              | primary、children、size/onSizeChange、minSize/maxSize、collapsed、orientation | 横/纵分栏，窗口内拖动、键盘调整、取消、受控折叠，可嵌套组合                      | 自动测量容器、尺寸持久化、窗口外拖动捕获、自动折叠策略 |
| Inspector / split-view              | title、children、onClose                                                      | 标题、关闭、单滚动内容；InspectorSection 属性分组                                | 业务属性编辑器、宽度持久化                             |
| Popover / popover                   | anchor、open/onOpenChange、restoreFocusRef、side/align、width、autoFocus      | 原生 anchored 定位及碰撞避让、外点击关闭、内容焦点范围、Escape、焦点恢复         | 全局层管理器、多模态并存、复杂嵌套浮层保证             |
| DropdownMenu / menu                 | label、items、open/onOpenChange                                               | 可复用命令模型、禁用、勾选、危险项、快捷键标签、逐级子菜单                       | 悬停级联、typeahead、全局快捷键注册                    |
| ContextMenu / menu                  | children、items、open/onOpenChange                                            | 右键、Control+左键、Shift+F10/Enter、键盘菜单                                    | 跟随鼠标坐标定位；当前锚定触发区域。不是系统菜单       |
| CommandPalette / command            | commands、open/onOpenChange、restoreFocusRef                                  | 标题/关键词/分组搜索、禁用、方向键选择、初始搜索焦点、执行并关闭                 | 快捷键冲突与作用域、最近使用、异步命令生命周期         |
| createCommandRegistry / interaction | commands → execute(id)、search(query)                                         | 拒绝重复 ID，阻止禁用和不存在的命令，纯 TS                                       | 响应式命令订阅；状态更新时由应用重建 registry          |
| ComboBox / combobox                 | options、value/onValueChange，value 为 string 或 null                         | 搜索单选、清除、禁用项、空/加载状态                                              | 自由文本创建、分组、虚拟化                             |
| MultiSelect / combobox              | options、value/onValueChange，value 为 string[]                               | 搜索多选、切换选择、移除 token、空/加载状态                                      | token 间方向键导航、Backspace 删除、批量操作           |
| NumberField / value-input           | value/onValueChange、min/max/step                                             | 数字输入、步进、上下界、无效草稿、方向键；十进制步进消除浮点尾差                 | 单位/本地化格式、Slider/RangeSlider、货币精度模型      |
| DateField / value-input             | value/onValueChange、min/max                                                  | YYYY-MM-DD 日期草稿、闰年/有效日期/边界提示                                      | Calendar/DatePicker、时间/范围选择、时区转换           |

每个交互组件必须传唯一、稳定的 testId。导航 item.id、选择 option.value、菜单/命令 id 应在各自集合内唯一。两级导航的第二级不应继续提供 children。Slim 通过首字母或应用传入的 icon 显示，并附 label Tooltip；图标应通过原生 JSX 传入。

SplitView 的 min/max 单位是像素，必须有限且 min ≤ max。应用根据容器可用空间扣除其他栏与分隔条后提供约束。当前不会测量嵌套容器，也不会自动读取/写入用户布局。collapsed 只控制 primary 栏；三栏布局可嵌套两个 SplitView。

NumberField 接受有限 value/min/max、正 step。输入中的 `-` 等未完成内容保留为本地草稿并显示无效状态；合法数值发出 onValueChange。Enter 将无效草稿恢复到受控 value，合法值限幅。应用外部更新 value 会同步草稿。DateField 不调用 Date 解析器、不转换 UTC；无效日期仍回传给应用，并显示错误，空值表示未填写。提交表单前使用 dateWithinBounds 再校验。

搜索选择器的 query/onQueryChange 可受控；只提供 query 时相当于只读搜索。异步请求由应用负责，把当前页 options、loading 与 query 传入；服务端已过滤时设置 filter={false}。加载期间不执行选择。每次最多挂载 50 个匹配项，超出时提示收窄搜索；键盘高亮会滚动到相应行。命令面板使用相同的 50 条显示上限；这是有界搜索列表，不是大型数据虚拟列表。

Popover 放在需要定位的内容处，anchor 是触发器。普通 Popover 默认将焦点移入内容；ComboBox 使用 autoFocus={false} 保留原生编辑器焦点。通过 Escape/动作关闭时可以按 restoreFocusRef 恢复；外部点击关闭时保留被点击控件的焦点。不要同时开启多个模态弹窗，也不应假定跨父子 anchored 浮层的所有外部点击场景已覆盖。

## 键盘

| 控件                      | 键盘约定                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| SidebarNavigation         | Up/Down/Home/End 移动可用导航项焦点；Enter/Space 激活；Right/Left 展开/收起当前一级分组                   |
| SplitView 分隔条          | 与分栏方向一致的方向键按 step 调整，Shift ×5；Home/End 到边界；拖动时 Escape 恢复拖动前尺寸               |
| Menu                      | Up/Down/Home/End 选择可用项；Enter/Space 执行；Right 进入子菜单、Left 返回；Escape 关闭；Tab 在弹层内循环 |
| ContextMenu 触发区        | 右键、Control+左键、Shift+F10 或 Enter 打开                                                               |
| ComboBox/MultiSelect 输入 | 输入搜索；Down/Up 打开/移动高亮；Enter 选择；Escape 先关闭选择浮层；Tab 关闭并继续焦点导航                |
| CommandPalette            | 打开时聚焦搜索；Up/Down 移动高亮；Enter 执行；Escape 关闭并恢复触发器焦点                                 |
| NumberField               | Up/Down 步进；Enter 提交/规范化草稿                                                                       |

快捷键字段如 `⌘N` 仅是展示标签，组件不会拦截系统快捷键。应用应显式注册宿主窗口事件，并尊重文本编辑器优先级。Button/Input 的 onKeyDown 返回 true 可消费该次 UIKit 键盘处理；disabled 时不会执行该回调。

## 接入示例

```tsx
import { useState } from "react";
import {
  Stack,
  ComboBox,
  MultiSelect,
  SplitView,
  Inspector,
  Field,
  DateField,
} from "@mirai/gpuix-kit";

export function Details() {
  const [width, setWidth] = useState(320);
  const [team, setTeam] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const options = [
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
  ];
  return (
    <SplitView
      testId="details"
      size={width}
      onSizeChange={setWidth}
      minSize={240}
      maxSize={400}
      primary={
        <Stack style={{ padding: 16 }}>
          <ComboBox
            testId="team"
            options={options}
            value={team}
            onValueChange={setTeam}
          />
          <MultiSelect
            testId="members"
            options={options}
            value={members}
            onValueChange={setMembers}
          />
        </Stack>
      }
    >
      <Inspector testId="inspector">
        <Field label="Start date">
          <DateField testId="start" value={date} onValueChange={setDate} />
        </Field>
      </Inspector>
    </SplitView>
  );
}
```

此组件应置于有明确尺寸的 AppShell 内容区并由 UIKitProvider 包裹。完整可操作示例在仓库 apps/gallery/src/desktop.tsx，运行 `bun run dev:desktop`。

## 验证证据

- test:desktop / test:desktop:narrow：1320×920 与 1000×720、深浅主题；导航展开/精简/双层、横向拖动/键盘、搜索/多选/禁用、子菜单/右键菜单、命令搜索焦点/恢复、数值与日期、Inspector、外点击焦点。
- test:desktop:states：禁用、加载、空结果、纵向拖动/取消、折叠、Dialog 中选择器逐层 Escape；50 条挂载上限和长列表键盘高亮可见性。
- test:live:desktop：真实 macOS ARM64 窗口启动、中文文本注入、键盘切换深浅主题、截图、关闭。
- test:package：本地 tgz 在独立临时 Bun 项目安装、公共子路径类型检查、原生渲染。

上述证据不是完整无障碍或全平台认证；实体键盘 IME 组合、屏幕阅读器、Windows/Linux 仍未验证。
