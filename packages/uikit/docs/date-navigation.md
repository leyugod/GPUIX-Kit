# 日期导航与范围工作流（v0.9）

本批新增 7 个公开组件，并扩展现有日历的年月导航和只读能力。组件使用同一组公历日期规则、原生 Text、焦点服务与深浅主题，不复制浏览器组件。

| 入口                | 组件或模型                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/period-picker`    | MonthPicker、YearPicker 及 props                                                                                  |
| `/period-model`     | validYear、monthValue、yearPage、monthPickerError、yearPickerError                                                |
| `/date-range`       | DualCalendar、DualRangeCalendar、DateRangePresets、DateRangePanel、DateRangeDialog、createDateRangePresets 及类型 |
| `/date-range-model` | 双月窗口计算、完整范围/预设配置校验、createDateRangePresets                                                       |
| `/calendar`         | 现有 Calendar/RangeCalendar/DatePicker/DateRangePicker；增加 navigation、readOnly                                 |

组件和类型均从包根导出。纯 helper 使用相应 model 子路径；monthValue/yearPage 的参数须先通过 validYear 等校验。

## MonthPicker / YearPicker

```tsx
import { useState } from "react";
import { MonthPicker, YearPicker } from "@mirai/gpuix-kit";

export function PeriodControls() {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState<string | null>("2024-02");
  const [pageYear, setPageYear] = useState(2024);
  const [selectedYear, setSelectedYear] = useState<number | null>(2024);
  return (
    <>
      <MonthPicker
        testId="month"
        year={year}
        onYearChange={setYear}
        value={month}
        onValueChange={setMonth}
        min="2023-01"
        max="2025-12"
        locale="zh-CN"
      />
      <YearPicker
        testId="year"
        pageYear={pageYear}
        onPageYearChange={setPageYear}
        value={selectedYear}
        onValueChange={setSelectedYear}
        min={1900}
        max={2100}
      />
    </>
  );
}
```

MonthPicker 的 value 是 `YYYY-MM | null`，显示年 `year/onYearChange` 单独受控。min/max 使用 YYYY-MM；isMonthDisabled 可提供同步禁选规则。locale 格式化月份标签，强制公历；不支持的 locale 回退月序号。可选 onYearPress 把标题变成按钮，供组合年月面板使用。

YearPicker 的 value 是 `number | null`，`pageYear/onPageYearChange` 控制显示页。年份限制 1–9999，每页最多 12 年、3 列 4 行，从第 1 年起分组；最后一页为 9997–9999。min/max 和 isYearDisabled 控制可选年份。非法配置显示错误；不自动修改外部 value。外部不可选值可能保留选中显示，但不能由用户重新提交。

两者支持 disabled、readOnly、autoFocus、onEscape、testId。只读允许翻页和聚焦，不修改选择；禁用不交互。默认 autoFocus=false。自定义 onEscape 会先消费本层 Escape；未传时交给当前 Dialog/Popover 范围。

网格是单个 Tab 焦点：左右移动一格，上下移动三格，Home/End 到当前行首/尾，PageUp/PageDown 翻页（月份选择翻年、年份选择翻 12 年）。翻页尽量保留格子位置。Enter/Space 确认当前可选项，按住激活键不重复提交。禁用项可被高亮查看，但不能选中；点击只响应主按钮。

## 现有日历的年月导航

给 Calendar、RangeCalendar、DatePicker 或 DateRangePicker 传 `navigation="month-year"`，点击标题进入月份网格，再点击年份标题进入年份网格。选择年份只改变导航面板，选择月份只改变可见月份；只有选择日期才回写日期值。原默认 `navigation="arrows"` 保持兼容。

Escape 按“年份 → 月份 → 日期 → 当前弹层”逐层退出，返回日期视图后聚焦网格。`readOnly` 允许日历浏览但不选择日期；日期选择器的清除按钮在只读状态下禁用。min/max 的空字符串现在视为非法配置，应使用 undefined 表示无边界。

## DualCalendar / DualRangeCalendar

与已有单月组件共享 value、month/onMonthChange、日期边界、禁选规则、locale、weekStartsOn、today 和键盘约定。month 是左侧月份，右侧显示紧邻的下一月；默认 `navigation="month-year"`。

```tsx
<DualRangeCalendar
  testId="stay"
  month={visibleMonth}
  onMonthChange={setVisibleMonth}
  value={range}
  onValueChange={setRange}
  min="2024-01-01"
  max="2025-12-31"
  maxRangeDays={62}
/>
```

默认横排约 580 px；`layout="vertical"` 改为上下排列，宽约 282 px。调用方选择适合容器的布局，没有自动断点。双月不重复显示相邻月的日期单元格，最多各 42 个位置。

两个网格分别参与 Tab 导航；方向键跨越月份时自动聚焦另一个网格。如果目标不在当前双月窗口，移动窗口以容纳目标，继续保持焦点日期。键盘浏览可以进入不可选日期，但不能提交越界或禁选值。顶部箭头按整个月移动窗口，选择值不随之变化。

最早窗口从 0001-01 开始；最晚从 9999-11 开始。传入 month=9999-12 时显示夹取到 9999-11/12，不在挂载时回写外部 month。范围校验仍逐日检查内部禁选日期，并受 maxRangeDays 约束（默认 366，最大 3660）；反向选择会排序，失败保留草稿起点。

年月导航期间日期网格保持挂载，但隐藏并退出焦点范围；返回时恢复组件顺序，避免 Tab 跳过面板底部操作。双月组件没有拖拽选区、悬停预览或任意月数模式。

## DateRangePresets

接收 `presets: readonly { id, label, value: DateRange, disabled? }[]`、value、onValueChange，以及 min/max、isDateDisabled、maxRangeDays、disabled/readOnly/testId。

最多 24 项，ID 必须非空且唯一、label 非空。未完成、越界、内部存在禁选日期或超过最大天数的预设显示为不可用；不会裁切范围或忽略中间日期。点击合法项发出一份值快照。数据为空时显示空容器。

`createDateRangePresets(referenceDate, weekStartsOn=1)` 从明确提供的日期生成 Today、Last 7 days、Last 30 days、This week、This month、Last month；包含首尾日期，“本周/本月”包含相应完整区间，可能包括参考日之后的日期。跨越 0001–9999 日期域的项省略，非法参考日返回空数组。函数不读取时钟或系统时区。默认标签为英文，可映射 label 或直接提供自己的数组。

## DateRangePanel / DateRangeDialog

```tsx
import { useState } from "react";
import {
  DateRangePanel,
  createDateRangePresets,
  type DateRange,
} from "@mirai/gpuix-kit";

export function ReportingPeriod() {
  const [month, setMonth] = useState("2024-02");
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return (
    <DateRangePanel
      testId="period"
      month={month}
      onMonthChange={setMonth}
      value={value}
      onApply={setValue}
      onCancel={() => {}}
      presets={createDateRangePresets("2024-03-15")}
      maxRangeDays={62}
      applyLabel="应用"
      cancelLabel="取消"
      clearLabel="清除"
    />
  );
}
```

面板内部持有日期草稿，预设和日历选择只更新草稿。onApply 仅在完整合法范围且控件可编辑时触发；没有自动保存或异步提交。Clear 只清空草稿并把焦点移到 Cancel。Cancel 恢复当前外部 value 后调用 onCancel；外部 value.start/end 明确变化时替换草稿。month/onMonthChange 是应用持有的导航状态，取消不回滚浏览月份。

DateRangeDialog 使用相同参数，将 onApply/onCancel 替换为 `open/onOpenChange`、`onValueChange`；可传 title 与 restoreFocusRef。Apply 回写值并关闭，Cancel/Escape/关闭按钮只关闭；重新打开从外部值建立新草稿。日期层的 Escape 才关闭 Dialog，年月层先返回上一视图。

Dialog 应放在 AppShell.overlay 中。默认横排对话框宽 640 px；窄容器可显式选择 layout="vertical"，其长内容使用既有 Dialog 的正文滚动，不增加第二个同轴滚动区。该实现复用已有 Dialog，不代表已提供全局多模态栈。禁用不等于系统级不可关闭模态。

## 验证及尚未覆盖

`bun run dev:dates` 提供四个展示页面。`test:dates` 与 `:narrow` 验证 1320×920、1000×720 的原生事件及深浅截图；`:states` 覆盖只读/禁用/错误、0001/9999 年份、纵向双月、范围内部禁选、外部值替换草稿、预设错误，以及 Dialog/Popover 内逐层 Escape 和年月返回后的 Tab 顺序。

纯规则验证双月窗口、预设跨闰年/周起点/年份域及完整范围校验；原有日历/时间用例回归。`test:live:dates` 验证真实 macOS 窗口启动、中文注入、键盘主题切换和展示截图；复杂选择行为在 TestRenderer 验证，不使用 live simulateClick。

仍缺日期时间组合、秒/AM-PM、时区/DST、非公历、系统日期面板、AX 认证、真实 IME 与 Windows/Linux 验证。内部错误文字尚无完整国际化层。组件数量不作为框架完成率。
