# Controls：滑块与日期组件目录

运行 `bun run dev:controls`。公开 API、参数边界和键盘约定见[包内文档](../../packages/uikit/docs/controls.md)。

| 页面         | 能力                                    | 已验证行为                                               |
| ------------ | --------------------------------------- | -------------------------------------------------------- |
| Sliders      | Slider、RangeSlider、横纵方向、格式化值 | 原生拖动/释放/取消、双拇指夹紧、小数步长、禁用与提交回调 |
| Calendars    | Calendar、RangeCalendar                 | 本地化月/周标签、闰年、跨月、边界、区间中间的禁用日期    |
| Date pickers | DatePicker、DateRangePicker             | 初始焦点、选择/清空、范围未完成状态、Escape 与焦点恢复   |

验证命令为 `test:controls`、`test:controls:narrow`、`test:controls:states`、`test:live:controls`。截图位于 artifacts/controls-\*.png。

这批没有完成轨道点击/刻度、时间选择、双月/年月面板、快捷范围、全局弹层栈和完整 AX 语义；组件族仍标为基础，见[覆盖矩阵](../component-coverage.md)。
