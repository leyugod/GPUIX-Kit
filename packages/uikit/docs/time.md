# 时间控件（v0.7）

公共入口 `@mirai/gpuix-kit/time-input` 或根入口；纯规则入口 `/time-model`。基于固定 GPUIX 0.7.0 原生宿主，视觉使用统一深浅主题。

## 时间模型

时间是严格的 24 小时 `HH:mm` 字符串，范围 `00:00`–`23:59`，不包含日期、秒、时区或 UTC 偏移。库不读取当前时钟。

| 参数                   | 语义                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `min` / `max`          | 包含端点，默认 `00:00` / `23:59`；要求 min ≤ max，同一天内      |
| `stepMinutes`          | 1–1440 的整数，默认 1；从 min 开始对齐，未对齐的 max 不加入候选 |
| `isTimeDisabled(time)` | 同步、纯、无副作用的可选规则；禁选项从候选列表排除              |
| `disabled`             | 不编辑、不提交、不进入键盘焦点                                  |
| `readOnly`             | 可聚焦、可浏览，不修改值                                        |
| `label` / `testId`     | 可选标题和必填稳定标识                                          |

例如 `min="09:07" max="10:00" stepMinutes={15}` 产生 09:07、09:22、09:37、09:52。错误配置显示错误并阻止变更；不自动交换范围或猜测跨午夜含义。`isTimeDisabled` 可能每次渲染调用多次，最多遍历一天的分钟；不得执行请求或存储操作。

纯函数：`timeMinutes` / `timeString` 在非法输入时返回 null；`timeConfigError` 返回错误或 null；`timeOptions` 返回合法候选，错误配置返回空数组；`isSelectableTime` 校验格式、边界、网格和禁用条件；`stepTime(value, -1 | 1, rules)` 查找上一/下一可用项，没有候选时返回 null。

## TimeField

`value: string` 与 `onValueChange` 管理原始草稿。输入完整合法值不会自动提交；无效、未完成和空草稿也保留给应用。`onValueCommit?` 只在合法 Enter 提交或步进产生变化时触发。步进先调用 `onValueChange`，再调用 `onValueCommit`；同一端点不重复发出步进提交。Enter 可以再次提交相同合法值。

```tsx
import { useState } from "react";
import { TimeField, TimePicker, Stack } from "@mirai/gpuix-kit";

export function ScheduleControls() {
  const [draft, setDraft] = useState("09:00");
  const [confirmed, setConfirmed] = useState<string | null>(null);
  return (
    <Stack>
      <TimeField
        testId="start-time"
        label="开始时间"
        value={draft}
        onValueChange={setDraft}
        onValueCommit={setConfirmed}
        min="09:00"
        max="17:00"
        stepMinutes={15}
        errorLabel="请输入可用时间，格式为 HH:mm"
      />
      <TimePicker
        testId="confirmed-time"
        label="已确认时间"
        value={confirmed}
        onValueChange={setConfirmed}
        min="09:00"
        max="17:00"
        stepMinutes={15}
        placeholder="选择时间"
        clearLabel="清除"
      />
    </Stack>
  );
}
```

上下键或加减按钮在合法候选之间移动，跳过不可用项，端点夹取、不循环。格式错误的草稿向上恢复首项、向下恢复尾项；合法格式但不在网格/范围上的草稿按方向查找并夹取。`placeholder` 默认 HH:mm，`errorLabel` 自定义值错误提示；配置错误目前使用内置英文。

单行输入没有分段选中、小时/分钟自动补零或 caret 编辑功能。固定宿主会在 Tab 导航时报告制表符输入，本组件抑制该次回调并重建内部编辑器：保留受控草稿和组件焦点顺序，但重置原生撤销/光标历史。Escape 按当前焦点范围处理，不自动回滚草稿。没有失焦自动提交或异步保存。

## TimeList

`value: string | null`、`onValueChange(time)`；支持以上规则、`autoFocus`（默认 false）、`emptyLabel`。候选数据最多 1440 项，**每页仅挂载 8 行**，不使用同轴嵌套滚动或整天列表虚拟化。选中值与当前键盘高亮分开；外部 value/候选变化重新定位高亮，不自动回写应用值。

- ↑ / ↓：移动高亮；Home / End：首尾；Page Up / Down：移动 8 项。
- Enter / Space：确认高亮项；按住激活键不会重复提交。
- 点击行：确认；上一页/下一页按钮换页后恢复列表焦点。
- Tab / Shift+Tab：按当前焦点范围导航；Escape：交给当前范围。
- 只读列表仍可翻页和浏览；禁用列表不操作。无候选时显示 emptyLabel，并保留空状态焦点以处理弹层 Escape。

如需直接定位任意时刻，可用 TimeField；列表没有搜索、小时分组或滚轮转盘。`value` 不在候选中时不显示选中标记，高亮从首项开始；不修正应用值。

## TimePicker

`value: string | null`、`onValueChange(time | null)`；在 Popover 中组合 TimeList。`placeholder`、`clearable`（默认 true）、`clearLabel`、`emptyLabel`、`errorLabel` 可配置。内部仅管理展开状态；选择或清除发出应用值变更。

打开后聚焦当前时间所在页，选择后关闭并恢复触发器焦点。Escape 关闭本层；外部点击关闭并保留被点击控件焦点。空列表也处理本层 Escape。禁用或改为只读会关闭弹层；只读触发器仍可聚焦。清除由独立按钮发出 null。收到非法外部值时显示错误，允许重新选择，绝不悄悄修正值。

## 验证与边界

`bun run test:time`、`:narrow`、`:states` 验证原生输入/提交、步进/禁选、全天八行分页、选择/清空、只读/禁用/空/错误、按住和右键保护、嵌套 Escape、Tab 草稿与焦点顺序。`bun run test:live:time` 验证真实 macOS 窗口启动、中文文本注入、键盘主题切换与截图。纯规则还覆盖全部 1440 分钟往返、非整点网格和跨日配置拒绝。

本批不提供秒、12 小时 AM/PM、本地化时间解析、时间范围/跨午夜、日期时间组合、夏令时/时区换算、系统时间面板或 AX 认证。业务时间解析与存储属于应用层。未验证 Windows/Linux 和真实 IME 组合输入。
