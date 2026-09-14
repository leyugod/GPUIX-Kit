# v0.6 三态选择和标签输入

沿用 UIKitProvider 的 Darwin 深浅主题。运行 `bun run dev:choices` 查看选择范围、受保护标签和原生键盘示例。

## 公开入口

| 子路径            | API                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `/checkbox`       | Checkbox、CheckboxGroup、CheckboxProps、CheckboxState、CheckboxOption、CheckboxGroupProps |
| `/checkbox-model` | checkboxState、toggleCheckboxScope、checkboxOptionsError                                  |
| `/tags`           | Tag、TokenField、TagProps、TokenFieldProps、Token、TokenRules、TokenResult                |
| `/token-model`    | tokenKey、tokenConfigurationError、prepareTokens 及规则类型                               |

组件和组件类型也从包根导出。现有 `/base` 的 Checkbox 仍可使用布尔值；没有另建一套三态 Checkbox。纯规则从 model 子路径导入。

## Checkbox 和 CheckboxGroup

Checkbox 的 `checked` 为 `boolean | "indeterminate"`；`onCheckedChange(next:boolean)` 只发出布尔值。未选或中间态激活后为 true，已选后为 false；中间态由应用根据集合计算，不会通过连续点击自动轮转三种值。

鼠标主键、Enter、Space 激活；长按重复键不会反复切换。`disabled` 禁止操作并退出 Tab 顺序；`readOnly` 保持可聚焦但禁止修改。Switch 同时支持 readOnly，checked 仍为 boolean。指示器文字显式使用主题对比色。

```tsx
import { useState } from "react";
import { CheckboxGroup } from "@mirai/gpuix-kit/checkbox";

function Permissions() {
  const [selected, setSelected] = useState(["reports", "other-page"]);
  return (
    <CheckboxGroup
      testId="permissions"
      label="Permissions"
      options={[
        { value: "reports", label: "Reports" },
        { value: "exports", label: "Exports" },
        { value: "managed", label: "Managed policy", disabled: true },
      ]}
      value={selected}
      onValueChange={setSelected}
    />
  );
}
```

CheckboxGroup 接收 `options: {value,label,disabled?}[]`、`value: string[]` 和 onValueChange。最多 200 个选项，value 必须非空且唯一；选中列表可包含当前范围之外的 ID。

- 全选状态只根据**当前未禁用选项**计算。全选或清空时，禁用项和范围外的 ID 保持原状；不会默默改写其他页数据。
- `showSelectAll` 默认 true，`selectAllLabel` 默认 Select all；可配置 `label/emptyLabel/disabled/readOnly/testId`。
- 无选项显示空态；全部禁用时全选也禁用。非法选项配置显示错误，不渲染可操作项。
- `testId-all` 为全选入口，`testId-{option.value}` 为子项，`-indicator` 为视觉状态节点。

组件不执行搜索、服务端“所有结果”选择或权限请求。业务若需要跨查询全选，应在应用层定义目标范围。当前没有额外方向键组导航或完整 AX checkbox 语义认证。

## Tag

Tag 接收 `label/testId`，可选 `tone`、`selected`、`onPress`、`onRemove`、`disabled/readOnly`、`maxWidth`。主体和移除按钮是相邻控件，避免嵌套激活。

有 onPress 时标签主体可以聚焦、点击和 Enter/Space 激活；移除按钮只在有 onRemove 时显示。readOnly 禁止移除，但仍允许选择/查看；disabled 禁止全部交互。selected 由调用方控制。

默认 maxWidth 为 220 px，可设置 48–600；长标签保持单行裁剪，不保证显示省略号或自动完整文字 Tooltip。标签主体入口为 `testId-label`，移除为 `testId-remove`。ref 指向主体原生节点，自定义键盘扩展使用 onKeyDown，返回 true 时消费 UIKit 层后续处理。

## TokenField 的受控模型

```tsx
import { useState } from "react";
import { TokenField, type Token } from "@mirai/gpuix-kit/tags";

function Labels() {
  const [tokens, setTokens] = useState<Token[]>([
    { id: "system", label: "System", removable: false },
  ]);
  const [draft, setDraft] = useState("");
  return (
    <TokenField
      testId="labels"
      value={tokens}
      onValueChange={setTokens}
      inputValue={draft}
      onInputValueChange={setDraft}
      maxTokens={20}
      maxTokenLength={80}
    />
  );
}
```

Token 为 `{id,label,disabled?,removable?}`。ID 非空且唯一；removable=false 的标签可选择但不可删除，disabled 标签不参与键盘标签导航，也不可删除。整个字段的 readOnly 允许浏览与选择，禁止增删/输入；disabled 禁止全部交互。

value/onValueChange 管理标签集合，inputValue/onInputValueChange 管理草稿。调用方应同步应用回调提供的数据，再在应用层处理异步保存；组件不等待 Promise、不自动回滚网络失败。标签不会在失焦时自动提交。

## 提交与校验

点击 Add 或 Enter 明确提交草稿。默认按逗号、分号、换行拆分，再 trim + NFC 规范化，忽略空片段。

- 默认 maxTokens=20，可设置 1–100；maxTokenLength=80，可设置 1–1000，按 Unicode code point 计数，不是字素簇。草稿提交长度不超过 10000 个 UTF-16 code unit。
- 默认大小写不敏感，使用规范化文字的小写形式判重；`caseSensitive=true` 可保留大小写区别。这不是完整 Unicode case folding。
- `separators` 最多 10 个非空字符串，每项最多 4 个 code unit，按声明顺序拆分。空数组表示整个草稿作为单一候选。
- 当前集合和同批候选之间都不能重复。**任何一项失败，整批拒绝且草稿保留**；不会偷偷跳过重复项或先添加部分有效项。
- `validateToken(label): string|null` 提供同步应用校验。`createToken(label): Token` 可创建业务 ID；默认 ID 是用于判重的规范化标签文字。
- 校验/工厂必须同步且无副作用。工厂抛出异常时显示通用失败信息，不显示原始异常正文；工厂输出仍会检查 ID、标签和重复。
- 只有整批成功才调用一次 onValueChange，随后调用 onInputValueChange("")。此处“整批”描述前置校验与变更意图，不是数据库事务，也不保证调用方两个回调的事务性。

`prepareTokens` 返回 `{ok:true,value,added}` 或 `{ok:false,code,message}`，不会修改传入数组。configuration/empty/duplicate/length/count/validation/creation 类错误可在应用中进一步映射。字段可覆盖 label/placeholder/addLabel/hint，其余内置错误文字目前为英文。

## 键盘与固定宿主限制

- 从编辑器按 **Shift+Tab** 聚焦最后一个可导航标签；也可点击主体，或使用常规 Tab 顺序。
- 标签聚焦后，Left/Right 移至邻项，Home/End 到首/末项；末项 Right 返回输入。Backspace/Delete 删除当前可移除项，焦点移至下一项或前一项；删除最后一项后回到输入。
- Escape 先清除标签选择、返回输入；随后 Escape 才交给外层 Dialog/Popover。非空草稿不会被 Escape 自动清空。
- GPUIX 0.7.0 原生编辑器提前消费 Backspace 与左右键，组件收不到这些 keydown，**不支持空编辑器 Backspace 自动选中前一标签**。不假定存在 DOM 光标/选区 API。
- 同一宿主在 Tab 导航后仍会报告制表符插入。TokenField 抑制该次草稿变更并重建内部原生编辑器恢复受控内容。副作用是重置原生撤销历史和光标/选区；不承诺完整文本编辑器语义。

Input/Textarea 现在提供可选 `resetKey`，用于明确要求重建内部编辑器；通常无需手动使用。焦点适配保留 React 组件首次注册顺序，避免重建后的宿主 ID 改变 Dialog/Popover 的 Tab 顺序。普通 Input 的所有编辑行为并未因此得到完整兼容性保证。

TokenField 稳定入口为 `testId-input`、`testId-add`、`testId-token-{id}-label/remove`、`testId-error/count`。最多渲染受限集合并换行；不添加内部同轴滚动容器，由使用方安排页面滚动。

## 验证边界

原生 TestRenderer 覆盖 1320×920、1000×720、深浅主题、三态切换、禁用项/范围外值保留、批量重复/长度/数量校验、原生输入、标签导航/删除/保护、只读及嵌套焦点。状态夹具还覆盖工厂失败不泄露异常、按住激活键、非法配置、删除末项，以及编辑器重建后的 editor → Add → following control 顺序。

真实 macOS ARM64 窗口单独验证启动、中文文本注入、键盘主题切换和截图；不使用 live simulateClick。Windows/Linux、真实 IME 组合、AX 语义仍未验证。

v0.13 已通过独立组合提供建议列表与既有标签改名，见[标签建议与编辑](token-input.md)。原 TokenField 保持批量输入接口；远程查询、拖放重排、虚拟化、多标签范围选择、系统剪贴板和完整 macOS TokenField 等价能力仍缺。
