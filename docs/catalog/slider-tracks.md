# 滑块轨道与刻度目录

v0.8 扩展原有 Slider/RangeSlider：可选轨道点击、最多 51 个自定义刻度、刻度标签和只读状态。

- [API 与边界](../../packages/uikit/docs/slider-tracks.md)
- 展示：`bun run dev:tracks`
- 原生交互：`bun run test:tracks`、`bun run test:tracks:narrow`、`bun run test:tracks:states`
- 真实窗口：`bun run test:live:tracks`

轨道使用有界原生命中区域，最多 201 个停靠值。更细步长保留原有拖动/键盘能力，需要关闭 trackPress。范围点击移动最近拇指；重合拇指允许向两侧展开；没有空轨道按住拖动、触控或 AX 认证。
