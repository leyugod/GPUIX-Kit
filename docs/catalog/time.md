# 时间输入与选择目录

v0.7 增加 TimeField、TimeList、TimePicker，使用统一的原生深浅主题。

- [API、示例、键盘与限制](../../packages/uikit/docs/time.md)
- 展示：`bun run dev:time`
- 原生交互：`bun run test:time`、`bun run test:time:narrow`、`bun run test:time:states`
- 真实窗口：`bun run test:live:time`
- 纯规则：`packages/uikit/src/interaction/time.test.ts`

范围是同一天内的 HH:mm 时间，包含步长、最小/最大、禁选项、原始草稿与显式提交。列表八行分页，打开选中时间所在页。空弹层、嵌套 Escape 和 Tab 编辑器重建均有原生回归。

当前仍是日期时间组件族的基础能力。没有秒、AM/PM、跨午夜范围、日期时间组合、时区/夏令时转换或系统面板。
