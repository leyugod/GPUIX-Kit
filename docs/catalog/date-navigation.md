# 日期导航与范围工作流

v0.9 批次新增 MonthPicker、YearPicker、DualCalendar、DualRangeCalendar、DateRangePresets、DateRangePanel、DateRangeDialog；原有日历增加可选年月导航与只读状态。

- [完整 API、示例与限制](../../packages/uikit/docs/date-navigation.md)
- 展示：`bun run dev:dates`
- 原生测试：`bun run test:dates`、`bun run test:dates:narrow`、`bun run test:dates:states`
- 真实窗口：`bun run test:live:dates`

重点验收：双月键盘焦点转移、逐日范围校验、草稿与提交分离、取消/外部值替换、年份边界及年月层级 Escape。仍不是完整日期时间或系统日历组件族。
