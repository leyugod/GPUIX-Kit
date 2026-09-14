# v0.5 滑块、日历与日期选择

本批补齐数值和日期组件族的基础能力，沿用 Darwin 风格和 UIKitProvider 深浅主题。运行 `bun run dev:controls` 查看展示页。

## 导出

| 入口              | API                                                                           |
| ----------------- | ----------------------------------------------------------------------------- |
| `/slider`         | Slider、RangeSlider、SliderProps、RangeSliderProps                            |
| `/slider-model`   | SliderBounds、sliderError、snapSlider、moveSlider                             |
| `/calendar`       | Calendar、RangeCalendar、DatePicker、DateRangePicker、DateRange 及 props      |
| `/calendar-model` | 日期整数转换、加日/月、周序与月网格、配置校验、可选日期/范围校验、chooseRange |

组件与组件类型也从包根导出；纯规则由相应 model 子路径导入。组件不保存偏好、加载业务数据或调用系统日期面板。

## Slider / RangeSlider

```tsx
import { useState } from "react";
import { Slider, RangeSlider } from "@mirai/gpuix-kit/slider";

function Values() {
  const [volume, setVolume] = useState(40);
  const [interval, setInterval] = useState<[number, number]>([20, 70]);
  return (
    <>
      <Slider
        testId="volume"
        label="Volume"
        value={volume}
        onValueChange={setVolume}
        min={0}
        max={100}
        step={5}
      />
      <RangeSlider
        testId="interval"
        value={interval}
        onValueChange={setInterval}
        step={5}
      />
    </>
  );
}
```

共同属性：`min=0`、`max=100`、`step=1`、`length=280`、`orientation="horizontal" | "vertical"`、`disabled`、`label`、`formatValue`、`testId`。必须置于 UIKitProvider；实例 ID 唯一。

- value/onValueChange 受控，RangeSlider 使用 `[lower,upper]` 元组。越界值在显示时夹紧，步长以 min 为原点，max 始终可达；不会在挂载时主动改写调用方数据。倒置范围、非有限数值、非正步长和无效尺寸显示错误。
- `length` 是轨道连同拇指的像素长度，允许 80–2048，调用方负责容器适配。数值边界允许 ±1e12，min=max 显示静态值并禁止操作。十进制尾差按 14 位有效数字处理，不是任意精度数值工具。
- 拖动拇指连续发出 onValueChange；松开鼠标后发出可选 `onValueCommit`。Escape 或 Tab 取消拖动、通过 onValueChange 恢复起点，不发出 commit。Tab 继续移至下一个控件。
- Left/Down 减少，Right/Up 增加；Home/End 到达端点，PageUp/PageDown 或 Shift+方向键增减 10 个步长。键盘每次有效操作发出 change/commit，包括端点处没有改变值的操作；应用可自行去重。
- RangeSlider 两个拇指分别可聚焦，互相夹紧，不能交换顺序。拇指重合时可用 Tab 选择另一个再移动。
- 禁用或 min/max/step/length/orientation 改变会结束当前拖动，不回滚应用已经接收的值，不再发出 commit。应用应避免在一次拖动中同步其他来源的值，组件不做多来源冲突合并。

v0.8 增加可选轨道点击、刻度和只读，详见[滑块轨道与刻度](slider-tracks.md)。仍没有单位编辑、对数尺度、触控手势和完整 AX slider 语义。`testId-thumb-0` 与范围的 `testId-thumb-1` 是键盘/拖动入口，`testId-value` 是格式化读数。

## Calendar / RangeCalendar

```tsx
import { useState } from "react";
import { Calendar } from "@mirai/gpuix-kit/calendar";

function Dates() {
  const [month, setMonth] = useState("2024-02");
  const [date, setDate] = useState<string | null>(null);
  return (
    <Calendar
      testId="date"
      month={month}
      onMonthChange={setMonth}
      value={date}
      onValueChange={setDate}
      locale="zh-CN"
      min="2024-01-01"
      max="2024-12-31"
    />
  );
}
```

- month/onMonthChange 为独立受控 `YYYY-MM`；单选 value 是 `YYYY-MM-DD | null`。Calendar 的 onValueChange 只发出有效日期；清空由应用或 DatePicker 提供。外部修改 value 不会自动改变 month。
- 公历年份 0001–9999。运算使用 UTC 整数日避免夏令时偏移，公开值始终不含时间/时区；不接收时间戳，不使用机器当前时间。`today` 可由调用方按其时区提供。
- `min/max` 包含端点；`isDateDisabled(date)` 是同步、纯、快速的禁用规则。它会在渲染和区间验证时多次调用，不应访问网络或修改状态。
- `weekStartsOn` 为 0（周日）或 1（周一，默认）。`locale` 默认 en-US，月份/星期标签使用 Intl 并强制公历；不支持的 locale 回退稳定标签。错误提示和其他内部文字尚未全面国际化。
- 固定 42 个日期位置、单月网格约 282 px 宽。两端年份之外的格子为空；相邻月份日期可点击，选择后发出 onMonthChange。无效配置显示错误；无效选中值提示不可用，可重新选择。
- 默认键盘活动日期为本月有效选中日期，否则本月首个可选日期；没有可选日期时回退月初。`autoFocus` 默认 false，日期弹层内为 true。
- 网格是一个 Tab 焦点：Left/Right 移动一天，Up/Down 移动一周，Home/End 移至周首/尾；PageUp/PageDown 上下月，Shift+PageUp/PageDown 上下年；短月份夹紧到月底。Enter/Space 选择，按住激活键不会重复提交。
- 键盘可定位到禁用日期查看其状态，但不能提交；键盘月份浏览可越过 min/max 所在月，仍不会选中越界日期。上一月/下一月按钮在配置边界处禁用。

RangeCalendar 的 value 是 `{start: string|null,end: string|null}`。空值或完整范围时，下一次选择开始新区间；第二次选择按日期排序，允许反向选择和同一天范围。`maxRangeDays` 默认 366，可设置 1–3660，按包含首尾的日数计数。提交完整区间前**逐日检查**边界与禁用规则；失败保留起点并显示错误，调用方不会收到非法区间。

低层 dateNumber、dateString、addDays、addMonths 等函数假设调用方已校验日期/整数参数；UI 已先做配置与值检查。不要把任意字符串直接传给这些几何式日期运算函数。

## DatePicker / DateRangePicker

两者沿用对应日历 props，包含受控 month。DatePicker 的 onValueChange 允许 null；DateRangePicker 清空后发出 `{start:null,end:null}`。可覆盖 `placeholder/clearLabel`。

- 触发器打开内置 Popover，默认聚焦日历网格。选中单日期或完整范围后关闭并归还触发器焦点。
- RangePicker 第一次选择立即发出未完成范围，弹层继续打开；Escape 或外部点击关闭时保留该起点，不自动回滚。如果业务要求 Apply/Cancel 的草稿事务，应在应用层暂存。
- Escape 只关闭当前日期弹层，嵌套 Dialog 会继续存在；再次 Escape 才交给 Dialog。外部点击遵循原 Popover 的焦点规则，不抢回被点击编辑器焦点。
- 禁用会关闭弹层；重新启用不会自动打开。Clear 独立于日历，清空受控值。

现有日期选择器仍为单月；v0.9 新增可选年月导航，以及独立双月日历、范围快捷项和应用/取消面板，见[日期导航与范围工作流](date-navigation.md)。仍没有内联文本编辑、日期时间组合、农历或非公历、系统日期面板及完整屏幕阅读器语义。需要文本输入时可组合已有 DateField，应用负责统一校验和值。

## 验证与覆盖

原生测试覆盖 1320×920 与 1000×720、深浅主题、横纵拖动/取消/提交、范围防交叉、小数步进、禁用、日历跨月/闰年、区间禁用日期、弹层初始与恢复焦点、清空。状态夹具覆盖非法/恒定/外部受控值、年份边界、范围长度、反向选择、嵌套 Escape 和拖动期间禁用。

真实 macOS ARM64 窗口单独验证启动、中文注入、键盘主题切换、截图和关闭；没有 live simulateClick、真实 IME 组合输入、Windows/Linux 或 AX 认证。该版本仍是通用框架的一批基础增量。
