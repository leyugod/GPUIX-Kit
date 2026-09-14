# v0.17 筛选条件与保存视图

六个 GPUIX 原生组合使用既有 Darwin 深浅主题、按钮、输入与六行分页动作菜单，不依赖 DOM。库提供结构化筛选表达式和操作意图；查询执行、权限、网络与持久化在应用层。

| 组件 | 职责 |
| --- | --- |
| FilterChip | 单个条件的文字与可选移除动作 |
| FilterSummary | all/any 摘要、条件标签、逐项移除与清空 |
| FilterConditionRow | 字段、运算符、类型化值和单行错误反馈 |
| FilterBuilder | 受控条件组合、添加/删除、分页与 all/any |
| FilterPanel | 隔离草稿、Reset draft、Apply 和 Cancel |
| SavedViewPicker | 已存视图分页选择、变更提示、创建/更新/改名/删除 |

组件和类型通过根入口或 `@mirai/gpuix-kit/filters` 导入；纯规则通过 `@mirai/gpuix-kit/filter-model`。原 FilterBar 继续保留。

## 类型与验证

```ts
type FilterKind = "text" | "number" | "date" | "enum" | "boolean";
interface FilterField {
  id: string;
  label: string;
  kind: FilterKind;
  disabled?: boolean;
  options?: readonly { value: string; label: string; disabled?: boolean }[];
}
interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: string;
}
interface FilterExpression {
  match: "all" | "any";
  conditions: readonly FilterCondition[];
}
```

所有条件值使用字符串，保留尚未输入完成的数字/日期草稿。text 支持 equals/notEquals/contains；number 支持 equals/notEquals/gt/lt；date 支持 equals/notEquals/before/after；enum、boolean 支持 equals/notEquals。每类都有 isEmpty/isNotEmpty；无值运算符要求 value=""。

有限十进制数字支持正负和小数，不接受指数、十六进制、NaN 或 Infinity。日期为有效公历 YYYY-MM-DD，布尔为 "true"/"false"，枚举要求可用选项。普通值不可全空白，最多 500 字符。超长、未完成或无效的输入仍可编辑，Apply/保存会阻止提交；空条件集合合法，表示无筛选。库不定义业务字段的大小写、NULL、时区或远程查询语义。

字段最多 24 个；每个枚举 1–50 项。字段/选项/条件 ID 非空、最多 128 字符，分别在各自范围唯一；标签非空且最多 100 字符。表达式最多 12 个条件，当前只支持一层 all/any，不支持任意嵌套组。未知字段、错误运算符、重复 ID 和超限条件显示结构错误，应用应先迁移这些外部数据。

纯规则：filterFieldsError、filterShapeError、conditionValueError、filterExpressionError、filterOperators、valuelessOperator、defaultCondition、nextConditionId、cloneFilter、filterFingerprint、conditionLabel、savedViewsError、normalizeViewName、viewNameError。返回错误字符串或 null 的函数不执行查询。cloneFilter 隔离条件对象；fingerprint 比较匹配方式、条件顺序、ID 和原始字符串，属于编辑状态比较，不是查询等价证明。

## 条件编辑与草稿

```tsx
import { useState } from "react";
import { FilterPanel, FilterSummary, type FilterExpression, type FilterField }
  from "@mirai/gpuix-kit/filters";

const fields: FilterField[] = [
  { id: "title", label: "Title", kind: "text" },
  { id: "amount", label: "Amount", kind: "number" },
];
export function SearchFilters() {
  const [filter, setFilter] = useState<FilterExpression>({
    match: "all", conditions: [],
  });
  const [revision, setRevision] = useState(0);
  return (
    <>
      <FilterPanel testId="filters" fields={fields} value={filter}
        revision={revision} onApply={setFilter}
        onCancel={() => setRevision(revision + 1)} />
      <FilterSummary testId="summary" fields={fields} value={filter}
        onRemove={id => setFilter({
          ...filter, conditions: filter.conditions.filter(c => c.id !== id),
        })}
        onClear={() => setFilter({ match: "all", conditions: [] })} />
    </>
  );
}
```

FilterBuilder 的必填 props 是 fields、value、onValueChange、testId；disabled 锁定编辑，pageSize 默认为 2，可选 1–3 行/页。只挂载当前页，没有内部纵向滚动；父布局可提供一个滚动容器。建议编辑区域至少 560 宽，较长字段名建议留足空间。不是自动适配所有窄容器的表单。

新增条件使用第一个可用字段和当前表达式中未占用的 condition-N ID。切换字段会重置运算符为 equals，文本/数字/日期清空，枚举选择第一个可用项，布尔默认 true；切换到无值运算符会清除旧值。disabled 字段禁止编辑值，已有条件仍允许换成可用字段或删除。FilterConditionRow 接收同样的 fields、单个 value、onValueChange、testId，以及可选 onRemove/disabled。

FilterPanel 使用内部草稿，不在逐字编辑时调用 onApply；Apply 同步提供隔离快照，Cancel 只通知 onCancel，应用决定关闭面板或增加 revision 丢弃草稿。Reset draft 恢复当前外部 value。外部 fields/value/revision 内容变化会重建草稿；Apply/Cancel 先将焦点移到稳定根入口。这里没有 Promise 保存流程，异步持久化使用 SavedViewPicker 或应用自己的提交状态。disabled 阻止修改与 Apply，但保留 Cancel 退出。

FilterSummary 接收 fields/value/testId、可选 onRemove(id)/onClear/disabled。FilterChip 接收 label/testId、可选 onRemove/disabled。移除标签或条件后焦点回到各自稳定根；摘要标签换行排列，没有隐藏额外筛选条件。

## 保存视图

```ts
interface SavedFilterView {
  id: string;
  label: string;
  filter: FilterExpression;
  disabled?: boolean;
  readOnly?: boolean;
  revision?: string | number;
}
```

SavedViewPicker 必填 fields、views、value（选中 ID 或 null）、filter（当前已应用表达式）、onValueChange(id)、testId；可选 disabled、revision 以及：

- onCreate(name, filterSnapshot)
- onUpdate(id, filterSnapshot)
- onRename(id, name)
- onRemove(id)

四个修改回调均返回 void 或 Promise<void>。没有提供的操作不显示按钮。选择只发出 ID；应用按 ID 更新当前 filter 和 value。创建/修改/删除成功后也由应用更新 views、选择值及实际数据。删除没有内建确认窗，应用可接入 ConfirmDialog；真正的权限校验仍应在应用/服务端执行。

视图最多 50 项，选择菜单每页 6 项；disabled 视图不能选择或修改；readOnly 视图可选择、作为新视图的来源，但不能更新、改名或删除。名称经 NFC 和 trim 规范化，1–80 字符，以小写后的名称判重。新视图需要新名称，改名判重排除当前 ID。所有视图的表达式必须结构有效；结构有效但值已失效的旧视图仍可选择和修正，当前无效 filter 不能创建或更新。

异步操作共享锁，等待时禁止新的修改和名称编辑。创建/更新回调接收 cloneFilter 快照。拒绝显示通用失败反馈并保留当前视图，用户可重试，不显示原始异常。查询值、字段、视图快照、选择或 revision 改变时，旧操作不能写回组件内部的失败状态；卸载后同样忽略旧结果。实际取消、陈旧响应处理和数据库写入由应用负责。回调需要返回完整 Promise；fire-and-forget 无法维持等待锁。

建议 Save new 表示保存当前已应用 filter；尚未 Apply 的 FilterPanel 草稿不自动参与保存。示例按此规则组合。只读限制和 dirty 标记是 UI 行为，不是授权系统或持久化服务。

## 键盘、入口与验证

选择菜单复用 ActionMenu：方向键、Home/End、PageUp/PageDown，Enter 激活，Escape 关闭并返回触发器。字段、运算符、枚举和视图菜单均为有界分页。组件中的原生编辑器沿用 GPUIX 0.7.0 的输入/Tab 行为，未提供通用剪贴板或 IME 保证。

稳定 testId：

| 组件 | 派生入口 |
| --- | --- |
| ConditionRow | -field、-operator、-value、-value-error、-remove |
| Builder | -match-all/any、-add、-{conditionId}、-previous、-next、-page、-empty、-error |
| Panel | -focus、-builder、-apply、-cancel、-reset、-error |
| Summary/Chip | -{conditionId}-remove、-clear；Chip 自身 -remove |
| SavedViewPicker | -select、-name、-status、-create、-update、-rename、-remove、-save-error |
| 所有选择菜单 | -item-{id}、-previous、-next、-page |

稳定根入口在原生子节点之后注册；Tab 顺序按实际 UIKit 焦点登记执行，不假定 DOM 顺序。原生宿主向祖先重派 keydown，组件通过内层事件隔离避免重复移动。待保存状态仍可 Tab 或 Escape 离开所属 Dialog。

运行 `bun run dev:filters`。Gallery 使用本地三个样例记录与内存视图，首次创建故意失败。check 包含 139 项纯规则；原生宽窄主题、类型编辑/草稿/分页/异步/焦点专项、真实 macOS 窗口与离线 tgz 消费者验证记录于仓库 docs/compatibility.json。

未完成：嵌套条件组、范围/多值关系运算符、远程字段和查询编译、数据库保存视图、协作权限、跨窗口同步、全面本地化、AX/IME 和 Windows/Linux 验证。
