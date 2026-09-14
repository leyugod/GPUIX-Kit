# 颜色组件 · v0.11.0

六个公开组件：ColorSwatch、ColorWell、ColorField、ColorPalette、ColorPanel、ColorPicker。通过 `@mirai/gpuix-kit` 或 `@mirai/gpuix-kit/color` 导入；纯规则通过 `@mirai/gpuix-kit/color-model` 导入。

组件随 UIKitProvider 使用深浅语义色，颜色本身作为应用数据保持原值。只使用固定 GPUIX 0.7.0 原生元素，不调用系统颜色面板、剪贴板、屏幕取色或外部服务。

## 颜色模型

输入支持带 # 的 `#RGB、#RGBA、#RRGGBB、#RRGGBBAA`，允许首尾空白和大小写。规范化输出为大写 `#RRGGBB`；非全不透明值保留为 `#RRGGBBAA`，如 `#abc8 → #AABBCC88`、`#ffffffFF → #FFFFFF`。透明黑 `#0000` 与未设置值 null 不同。

RGBAColor 为 `{r, g, b, a}`，四个通道都是 0–255 整数。透明度也是字节值，128 表示约 50.2%，不是百分数。

- parseHexColor(value, allowAlpha = true)：解析为 RGBAColor，非法返回 null。
- formatHexColor(color)：验证所有通道并规范化输出，非法返回 null。
- normalizeHexColor(value, allowAlpha = true)：解析和格式化的组合。
- setColorChannel(value, channel, next)：只改一个通道，保留其他通道和透明度；非法返回 null。
- compositeColor(color, opaqueBackground)：为棋盘格预览合成不透明十六进制颜色。
- paletteError、paletteColumns、movePalette：有界集合、几何与键盘规则。
- defaultPalette：18 个默认颜色，包含透明色；数组和条目冻结。

不解析 CSS 命名色、rgb()/hsl()、CSS 变量、渐变或 ICC/P3；不会把非法值强制变成黑色。allowAlpha=false 拒绝非不透明值，也不会静默丢弃透明度。

## 六个组件

| 组件         | 主要 API                                                                                                                                      | 行为                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ColorSwatch  | value: string 或 null、testId、size                                                                                                           | 装饰预览。size 默认 28，限制 16–96px。透明色显示棋盘底；null 显示“—”，非法色显示“?”。                                                   |
| ColorWell    | value、onPress、testId、label、size、disabled、readOnly、ref、onKeyDown                                                                       | 通用打开意图按钮。色块与标签整个区域可点击；支持 Enter/Space 和原生焦点。内嵌色块默认 22，限制 16–24px；label 默认颜色文本或 No color。 |
| ColorField   | value: string、onValueChange(raw)、onValueCommit?(normalized)、testId、label、allowAlpha、disabled、readOnly、ref                             | 原始文本由应用持有；合法 Enter 才发出规范化 commit。非法草稿可继续编辑，显示错误；空草稿不提交。                                        |
| ColorPalette | value: string 或 null、onValueChange(normalized)、testId、items、columns、allowAlpha、disabled、readOnly、autoFocus                           | 两行一页的选择网格，默认 6 列/12 项。键盘浏览与选择分开；未知 value 不自动回写。                                                        |
| ColorPanel   | value: string、onValueChange(raw)、onValueCommit?(normalized)、testId、items、allowAlpha、disabled、readOnly                                  | 组合 ColorField、RGB/A Slider 和 ColorPalette。内部切换 Channels/Palette；原始文本可能不完整，通道调节和调色板发出合法值。              |
| ColorPicker  | value: string 或 null、onValueChange(normalized 或 null)、open、onOpenChange、testId、label、items、allowAlpha、clearable、disabled、readOnly | ColorWell + Popover + 本地草稿面板。Apply 提交，Cancel/Escape/外部点击丢弃草稿。clearable 默认 false，Clear 显式提交 null 并关闭。      |

**ColorPanel 的 onValueChange 可能收到非法原始文本。** 它适合实时编辑草稿；要在最终确认前保护应用的颜色值，使用 ColorPicker。ColorField/ColorPanel 的 onValueCommit 是局部编辑提交事件，不等同于持久化成功。ColorPanel 的合法 Enter、滑块键盘/释放及调色板选择都会发出该事件；拖动取消不会提交。

ColorPicker 打开时复制 value；打开期间外部 value 变化也替换本地草稿。Apply 按当前 allowAlpha 规则校验并规范化，非法时不可用。Enter 在内部文本框只校验局部值，不代替 Apply。相同合法值也可以 Apply，由应用决定是否去重。disabled/readOnly 阻止打开；应用仍负责同步受控 open 的生命周期。

## 调色板与键盘

PaletteColor 为 `{ id, label, value, disabled? }`。最多 96 项，id 与 label 非空且 id 唯一，value 必须是可解析的十六进制颜色。不同 id 可以使用相同颜色。错误配置显示原因并禁止选择，保留 Tab/Escape 退出路径。

columns 向下取整后限制 2–8，非有限值用 6。每页最多两行，所以默认只挂载 12 个颜色单元，最多 16 个；页数由当前集合决定。单元外框为 36px，间距 4px，网格宽度为 columns × 40 − 4，不自动测量父容器。

- Up/Down 按列数移动，Left/Right 按一项移动；遇到禁用项继续沿移动方向寻找可选项，边缘停止。
- Home/End 到整个集合的首尾可选项；PageUp/PageDown 按两行偏移，可跨页。
- Enter/Space 确认当前可选项，持续按住激活键不重复提交。右键不选择。
- 上一页/下一页按钮切换页面并将焦点返回网格，允许查看全禁用页；不会自动提交该页的颜色。
- readOnly 允许浏览，但不会提交。allowAlpha=false 时透明色条目不可选。
- value 或集合变化时校正游标；有有效选中项时显示其所在页，否则回到首个可选项。空集合显示提示，不写入默认颜色。

ColorWell 的 label 和调色板当前项 label 都限制一行。颜色单元按当前值显示选中边框，焦点项使用主题强调色；相同颜色可使多个条目显示选中边框。没有自动 tooltip、远程搜索、最近使用持久化或拖动重排。

## 原生交互与布局边界

颜色选择面板宽 280px；弹层请求宽度 300px，并复用 Popover 的窗口边界限制。建议应用窗口至少 320px 宽。面板内部没有第二个纵向滚动容器。

透明预览先把 8 位通道合成到白色/灰色棋盘，再以不透明原生色块绘制；应用数据中的 alpha 不变。它用于视觉辨认，不是色彩管理或显示器配置验证。

固定宿主的深层装饰 div 会影响父节点命中，本批对 ColorWell 和调色板采用独立透明点击层。面板切换通过零高度裁切并禁用隐藏控件，保持 React 组件身份与 Tab 注册顺序，不依赖 display:none 的实际效果。

滑块新增可选 showValue（默认 true）；颜色面板设为 false，在通道右侧统一显示数值。拖动捕获层临时持有焦点，并在受控值重绘后再次确保焦点：Escape 回滚到拖动起点；Tab 回滚并移到下一个控件；鼠标释放提交并恢复拇指焦点。普通 Slider/RangeSlider 的现有行为已回归。

ColorField 复用 Input.resetKey 抑制 GPUIX 0.7.0 的 Tab 制表符插入，保留原草稿与组件焦点顺序，但原生撤销/光标历史会重置。这不是完整 IME 或编辑器语义保证。

## 使用示例

```tsx
import { useState } from "react";
import { ColorPicker, ColorPanel, Stack } from "@mirai/gpuix-kit";

export function AccentSettings() {
  const [accent, setAccent] = useState<string | null>("#2563EB");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("#2563EB80");
  return (
    <Stack>
      <ColorPicker
        testId="accent"
        label="Accent color"
        value={accent}
        onValueChange={setAccent}
        open={open}
        onOpenChange={setOpen}
        clearable
      />
      <ColorPanel testId="preview" value={draft} onValueChange={setDraft} />
    </Stack>
  );
}
```

组件应放在 UIKitProvider 和应用的正常原生布局中；保存、撤销、品牌约束和偏好持久化属于应用。

## testId 与验证

ColorField 使用传入 id 标识输入，附带 -preview、-error。ColorPanel 子节点为 -hex、-mode-channels/-mode-palette、-r/-g/-b/-a、-palette；滑块拇指为 -r-thumb-0 等，显示值为 -r-value 等。

ColorPalette 的子节点为 -grid、-item-{id}、-hit-{id}、-active、-page、-previous、-next，仅当前页单元挂载。ColorPicker 子节点为 -trigger、-popup、-panel、-apply、-cancel、-clear。ColorSwatch 状态为 -status，ColorWell 内嵌色块为 -swatch。

运行 `bun run dev:colors`。原生验证：test:colors、test:colors:narrow、test:colors:states；真实窗口：test:live:colors；独立消费：test:package。

已验证 macOS ARM64、1320×920/1000×720、深浅主题、文本注入、真实 TestRenderer 指针/键盘、草稿和拖动取消、分页及焦点。Windows/Linux、完整 IME、AX、系统取色、HSV/HSL 二维色域、渐变和广色域仍未实现或验证。
