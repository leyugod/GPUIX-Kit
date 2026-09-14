# 表格配置、排序与显示偏好（0.18.0）

入口：`@mirai/gpuix-kit/table-preferences`、`@mirai/gpuix-kit/table-preferences-model`。组件也从包根导出。全部使用原生 JSX、语义主题色和受控快照；不访问数据库或偏好文件。

## 组件契约

| 组件 | 输入与回调 | 行为和边界 |
| --- | --- | --- |
| ColumnVisibilityMenu | columns、value、onValueChange、testId、disabled? | 六项分页；必需列和最后可见列不能隐藏 |
| ColumnOrderList | 同上 | 五项分页；上/下移动，锁定列保持原始位置；无拖放 |
| SortRuleList | 同上 | 最多三层排序，添加、方向、上移优先级、删除；只描述排序 |
| DensityControl | value: TableDensity、onValueChange、testId、disabled? | compact / regular / comfortable，对应行高 34 / 42 / 54 |
| TablePreferencesPanel | columns、value、onApply、onCancel、revision?、testId、disabled? | Columns / Sort / Display；克隆草稿，Apply / Cancel / Reset draft / Defaults |
| ConfigurableDataGrid | DataGrid 属性去除 columns、sort、onSortChange、density；加 columns、preferences、onPreferencesChange | 列顺序/可见性/密度映射到 DataGrid；表头修改排序描述，保留其余排序层 |

ConfigurableDataColumn 是 DataColumn 加 hideable?、reorderable?；header 作为偏好目录 label。selectedIds、onSelectionChange、rowKey 等仍是必需的 DataGrid 属性。height 是行列表高度，还需为列头、选择工具栏和外层间距留空间。默认 DataGrid density 为 regular，既有使用方式保持兼容。

## 受控示例

```tsx
import { useState } from "react";
import {
  TablePreferencesPanel, ConfigurableDataGrid,
  type ConfigurableDataColumn, type TablePreferences,
} from "@mirai/gpuix-kit/table-preferences";
import {
  defaultTablePreferences, sortByRules,
} from "@mirai/gpuix-kit/table-preferences-model";

type RecordRow = { id: string; name: string; amount: number };
const columns: ConfigurableDataColumn<RecordRow>[] = [
  { id: "name", header: "Name", value: r => r.name,
    sortable: true, hideable: false, reorderable: false },
  { id: "amount", header: "Amount", value: r => r.amount, sortable: true },
];
const options = columns.map(c => ({ ...c, label: c.header }));

export function Example({ records }: { records: readonly RecordRow[] }) {
  const [prefs, setPrefs] = useState<TablePreferences>(
    () => defaultTablePreferences(options),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  // 先对完整本地集合排序，再分页；远程集合由应用查询层排序。
  const sorted = sortByRules(records, prefs.sorts,
    (row, id) => columns.find(c => c.id === id)?.value(row));
  return <>
    <TablePreferencesPanel testId="view-prefs" columns={options}
      value={prefs} revision={revision} onApply={setPrefs}
      onCancel={() => setRevision(n => n + 1)} />
    <ConfigurableDataGrid testId="records" columns={columns}
      rows={sorted.slice(0, 30)} rowKey={r => r.id} height={240}
      preferences={prefs} onPreferencesChange={setPrefs}
      selectedIds={selected} onSelectionChange={setSelected} />
  </>;
}
```

把 Example 放入 UIKitProvider 与 AppShell。应用在 onApply 中决定持久化和错误反馈；本组件不会把保存回调当成数据库事务。onCancel 发出取消意图；关闭面板或更新 revision 可丢弃草稿。Reset draft 恢复外部 value；Defaults 只修改草稿，仍需 Apply。

外部 value、columns 或 revision 改变会重建草稿。提交返回独立数组和排序对象。disabled 禁止编辑和 Apply，但允许浏览分组及 Cancel。改变排序/分页后，受控选择是否保留由应用决定。

## 模型与校验

TablePreferences 包含 order、hiddenIds、sorts、density。TableColumnOption 包含 id、label、hideable?、reorderable?、sortable?。

- columnOptionsError：1–24 列，唯一非空 id ≤128、label ≤100。
- tablePreferencesError：order 完整且无重复；锁定列留在目录原始位置；hiddenIds 有效且不隐藏必需列或全部列；sorts ≤3 且列唯一、可排序，方向 asc/desc；密度有效。
- defaultTablePreferences / cloneTablePreferences：默认快照和防共享克隆。
- toggleColumn / moveColumn：不可行操作返回原值的克隆，不产生无效状态。
- reconcileTablePreferences：应用主动迁移已解析的偏好对象到新目录，移除消失列、补充新列并恢复约束。它不解析 JSON，也不把任意不可信对象变成合法输入；先校验外部数据形状及目录。
- sortByRules：复制并稳定排序，数值按数值，字符串按字典顺序；null、undefined 和非有限数排最后；无区域语言排序或远端查询实现。
- rowHeightForDensity：34 / 42 / 54。原生内容 bounds 可能不含行末边框。

## 交互与验证

菜单复用已有键盘分页与 Escape；变更导致节点消失时恢复到稳定根节点。内层事件边界防止 GPUIX 祖先 keydown 重派误触父对话框。测试覆盖菜单、列锁、最后可见列、三层排序、禁用、草稿隔离、外部 revision、嵌套 Escape、焦点及宽窄深浅主题。

仓库命令：`bun run test:table-prefs`、`test:table-prefs:narrow`、`test:table-prefs:states`、`test:live:table-prefs`；纯规则包含在 `bun run check`。

本版无冻结列、分组聚合、跨页自动选择、列拖放、虚拟化或服务端查询。它们不因存在配置面板而被宣称完成。
