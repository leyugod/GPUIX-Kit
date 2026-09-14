# 标签建议、编辑与选择 · v0.13

本批新增 6 个组件：TokenSuggestionList、TokenCombobox、EditableTag、TokenEditor、TokenPickerPanel、TokenPicker。它们复用 Tag、TokenRules、Popover 和原生焦点适配，沿用 Darwin 风格的深浅主题。原 TokenField 的批量拆分 API 保持兼容。

## 公开入口

| 入口 | 能力 |
| --- | --- |
| /token-input | 六个组件、组件 Props、TokenSuggestion、EditableToken、TokenEditRules |
| /token-input-model | suggestionConfigurationError、filterTokenSuggestions、addTokenSuggestion、createSuggestedToken、renameToken、clearRemovableTokens、tokenPage |
| /tags | 原有 Tag、TokenField、Token、TokenRules |
| /token-model | 原有 tokenKey、prepareTokens、tokenConfigurationError |

组件和类型也从包根导出。模型不依赖 React 或原生宿主；未公开内部 TokenChooser/TokenInput。

## 数据与约束

Token 保持 id、label、disabled、removable 字段。TokenSuggestion 扩展 description 和 keywords；EditableToken 扩展 editable。editable=false 只禁止改名，removable=false 只禁止删除；disabled 禁止两者。ID 是身份，改名不会重新生成 ID，也不会丢失保护标记。

默认 maxTokens=20（1–100），maxTokenLength=80（1–1000 个 Unicode code point）。标签使用 trim + NFC；默认大小写不敏感，可用 caseSensitive 调整。此规则不是完整 Unicode case folding，也不按字素簇计数。

建议目录最多 500 项，ID 和规范化标签都须非空且唯一；description 最多 1000 code unit，keywords 最多 20 个，每个最多 100 code unit。目录与当前选中集合分离，已选择但不在当前目录中的标签仍会保留。

校验和 createToken 工厂必须同步且无副作用。组件回调是同步的数据变更意图；应用应立即更新受控值，然后自行持久化，不将 Promise 当成 UIKit 的提交协议。没有远程查询、数据库或认证依赖。

## TokenSuggestionList

接收 options、query（默认空）、value（已选择标签）、onSelect、testId，以及 pageSize、disabled/readOnly、loading、error/onRetry、emptyLabel、showDescriptions、onEscape 和原生 ref。可配置 maxTokenLength/caseSensitive。

本地匹配 label、description、keywords 的子串；过滤已选 ID 和规范化标签，保留禁用项以显示不可用状态。不自动排序或模糊打分。远程检索由应用根据查询更新 options，并负责请求取消和过时结果隔离。

每页默认 5 行，pageSize 限制为 1–8。只挂载当前页，query 或候选身份/禁用状态变化回到首页；不会创建内部滚动容器。showDescriptions 默认 true，关闭后每行只保留名称。

列表只有一个常规焦点。Up/Down 跳过禁用项并跨页，Home/End 到首末可用项，PageUp/PageDown 翻页，Enter/Space 选择；按住激活键不重复提交。全禁用页不会误选其他页，方向键可继续寻找前后可用项。readOnly 允许浏览而不选择；disabled 禁止交互。空/错误/全禁用列表仍保留可用关闭路径（整个列表 disabled 时除外）。onEscape 优先处理 Escape，否则交给所属 Dialog/Popover。

节点：testId-list、-item-{id}、-previous/-next/-page、-empty/-loading/-error/-retry。ID 应在所属视图内稳定唯一。

## TokenCombobox

```tsx
import { useState } from "react";
import { TokenCombobox, type Token } from "@mirai/gpuix-kit";

function Labels() {
  const [value, setValue] = useState<Token[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <TokenCombobox
      testId="labels"
      value={value}
      onValueChange={setValue}
      inputValue={query}
      onInputValueChange={setQuery}
      options={[
        { id: "design-id", label: "Design", keywords: ["UI"] },
        { id: "engineering-id", label: "Engineering" },
      ]}
      open={open}
      onOpenChange={setOpen}
      allowCreate
    />
  );
}
```

使用 UIKitProvider/AppShell 包裹。value、inputValue 和 open 分别受控；提供 label、placeholder、width（240–480）、disabled/readOnly、loading、error/onRetry 和 TokenRules。默认不允许自由创建，allowCreate=true 时显示 Create。

输入会请求打开候选弹层，Browse 或编辑器 Down 将焦点移至列表。编辑器 Enter 选择当前筛选结果的第一个可用候选；没有可用结果时才尝试自由创建。要选择其他候选，先 Down 进入列表。Escape 关闭当前弹层并回到输入，外点击沿用 Popover 行为。

建议选择保留目录 ID 和保护标记，不调用 createToken。自由创建始终把整个草稿当作一个标签（separators 不参与拆分）；需要批量输入时使用原 TokenField。创建结果若与目录中的 ID 或规范化标签冲突，会提示使用已有建议；即使工厂改变了标签或 ID，也会再次核对。

成功后先发出完整新集合，再清空草稿并关闭浮层；校验失败保留输入。重复、数量、长度和应用 validateToken 都会检查。loading/error 阻止新增/创建，但已有选中标签仍可按保护规则移除。readOnly 可查看，禁止修改和展开；disabled 禁止交互。受控 open 在暂时禁用时不被组件回写，应用可自行关闭。

节点：testId-input、-toggle、-create、-token-{id}-remove、-popup、-suggestions-*、-count、-error。Tag 的主体不用于新的组合导航；移除按钮参与 Tab。

## EditableTag 与 TokenEditor

EditableTag 接收 token、可选 peers（整个集合，默认仅当前 token）、onTokenChange、onRemove、testId、disabled/readOnly 与 TokenEditRules（maxTokens、maxTokenLength、caseSensitive、validateToken）。

Edit 打开局部草稿并聚焦原生输入；Enter/Save 仅提交合法名称，Escape/Cancel 放弃草稿并恢复 Edit 焦点。传 peers 才能对整个集合判重。改名保留 ID、disabled、removable、editable 等原有字段。相同名称不重复发出 onTokenChange；失焦不自动保存。

外部 token 的 ID、名称或保护标记变化会结束旧编辑，旧草稿不会覆盖新值。编辑期间暂时禁止移除；readOnly、disabled、editable=false 阻止改名。验证器抛出异常时只显示通用消息，不展示原始异常正文。应用可通过 validateToken 返回自己可展示的错误。

节点：testId-tag、-edit、-input、-save/-cancel、-error。标签本身继续使用 Tag 的 -text/-remove。

TokenEditor 接收 value/onValueChange、page（从 0 开始）/onPageChange、pageSize（默认 4，上限 8）、label、allowClear（默认 true）、loading、disabled/readOnly 与编辑规则。只挂载当前页，越界页在渲染时夹取，不在挂载时回写应用页码；集合上限由 maxTokens 约束。每行复用 EditableTag，并用完整集合判重。

Clear removable 清除整个传入集合中允许删除的标签，包含其他页；disabled 和 removable=false 的标签保留。删除或清空前把焦点放在管理器的稳定根节点，避免最后一行消失后焦点丢失。分页卸载会丢弃该页未保存的改名草稿。新增标签使用 TokenCombobox，管理器自身不重复实现创建。

## TokenPickerPanel 与 TokenPicker

TokenPickerPanel 接收 value、options、onApply、onCancel、testId，以及 TokenRules、title、allowCreate、disabled/readOnly、loading、error/onRetry。面板持有选择草稿和查询；增加或移除只改变草稿，Apply 才输出新集合。Cancel 重置为外部值再调用 onCancel；外部 value 变化立即替换旧草稿。Apply 会重新检查当前配置；loading/error/readOnly/disabled 时禁止提交，Cancel 仍可用。

面板共享选择逻辑但使用内联候选，不额外创建嵌套浮层。每页 2 个紧凑候选，不显示描述；按名称、描述和关键词匹配的规则不变。普通少量选择时保持底部按钮可见；大量已选标签会增加内容高度，由外部容器或 Popover 滚动。

TokenPicker 用 Popover 包装面板。value/onValueChange 和 open/onOpenChange 受控；label 为触发器标题，width 限制为 260–480。Apply 更新值并关闭，Cancel、Escape、外点击只关闭；再次打开从应用最新值开始。关闭后恢复触发器焦点，外点击除外。disabled/readOnly 时不展开。

稳定节点：testId-trigger/-popup，内部面板为 testId-panel，内部选择器为 testId-panel-chooser。面板本身提供 -apply/-cancel。

## 原生输入、验证和边界

固定 GPUIX 0.7.0 原生编辑器在 Tab 导航时仍可能报告制表符写入。新组件共用内部 TokenInput 抑制该次变更，并重建内部编辑器保留草稿；这会重置原生撤销历史和光标/选区。编辑器提前消费左右键和 Backspace，列表方向键只在列表焦点上使用。不宣称完整 IME 或 macOS TokenField 等价行为。

本批新增 10 项纯规则，总计 86 项。原生 TestRenderer 验证深浅主题、1320×920/1000×720、建议筛选/分页/禁用、按住激活、目录身份与创建冲突、改名判重/取消/外部替换、保护清除、草稿 Apply/Cancel、嵌套 Escape 和布局边界。旧 TokenField 的增删、Tab、原子校验和焦点回归单独执行。

真实 macOS ARM64 窗口验证启动、中文文本注入、键盘主题切换和截图；独立 tgz 消费验证公开入口、类型、建议选择及原生改名。未使用 live simulateClick。

未实现远程请求调度、建议分组与模糊排名、标签拖放重排、多标签范围选择、虚拟化、系统剪贴板/IME/AX 适配或全局 overlay 栈；Windows/Linux 未验证。较多标签和候选由应用分页或约束布局，不能把本批视为完整桌面 framework。
