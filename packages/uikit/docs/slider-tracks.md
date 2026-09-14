# 滑块轨道与刻度（v0.8）

在已有 `Slider` / `RangeSlider` 上增加 `trackPress`、`marks` 和 `readOnly`，不增加平行的滑块组件。公共入口仍是 `/slider` 或包根；纯模型由 `/slider-model` 导出。

```tsx
import { useState } from "react";
import { Slider, RangeSlider } from "@mirai/gpuix-kit/slider";

export function Levels() {
  const [value, setValue] = useState(25);
  const [range, setRange] = useState<[number, number]>([20, 80]);
  const marks = [
    { value: 0, label: "最低" },
    { value: 50, label: "50%" },
    { value: 100, label: "最高" },
  ];
  return (
    <>
      <Slider
        testId="level"
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={5}
        trackPress
        marks={marks}
      />
      <RangeSlider
        testId="range"
        value={range}
        onValueChange={setRange}
        step={10}
        trackPress
        marks={marks}
      />
    </>
  );
}
```

## 轨道点击

`trackPress` 默认 false，保持现有细步长拖动的兼容性。开启后，主按钮单击轨道选择最近的停靠值，发生变化时依次发出一次 `onValueChange` 和一次 `onValueCommit`，随后聚焦对应拇指。辅助/右键不改值。点击拇指继续采用原来的拖动/提交逻辑。

停靠值包含 min、从 min 对齐的步长网格及 max；非整步 max 也可点击。例如 0–10、step=3 的候选为 0/3/6/9/10，9 与 10 中点以后点击可到 10。原有拖动的 snapSlider 规则保持不变。轨道事件使用离散候选之间的中点区域，边界上的归属以宿主命中为准。

固定 GPUIX 0.7.0 只报告窗口坐标，没有公开元素布局测量接口。本实现将已知局部轨道长度划分为原生命中区域，不读取 DOM、不缓存窗口绝对位置。横纵布局、父容器偏移无需调用方提供坐标。

**最多 201 个停靠值**（最多 200 个间隔）；超过上限时显示配置错误并阻止该控件操作，不偷偷降低精度。`trackPress={false}` 时仍可使用更细的原有拖动和键盘步长。规则数据和原生命中节点均有界。极密的停靠区域可能窄于一个物理像素；需精确到达每个值时使用键盘，或增加 length / step。

范围轨道选择距离候选值最近的拇指。距离相同时采用最近操作的拇指，初始为下界；拇指重合时，较低点击移动下界、较高点击移动上界。两个值不会交叉。Tab 和 Escape 仍遵循原来的焦点范围与拖动取消规则。

轨道点击是一次选择动作，不支持从空轨道按住后连续拖动；连续拖动请从拇指开始。没有触控、对数尺度或系统 slider 面板。

## 刻度

`marks: readonly SliderMark[]`，`SliderMark = { value: number; label?: string }`，最多 51 项。数值须有限、唯一且位于 min/max 内，不要求与 step 对齐。组件按值排序显示，不修改传入数组。非法刻度显示错误。

刻度是信息展示，不增加 Tab 停靠点，也不改变步长或候选值。横向标签居中对齐刻度，端点标签向轨道内部对齐；纵向标签在右侧。文本使用统一 Text 和主题语义色。

标签最多占 80 px；横向根据相邻刻度进一步约束宽度并单行截断，宽度小于 10 px 时省略。纵向相邻分配高度不足 14 px 时省略标签。刻度线仍显示，建议密集数组只给重要刻度设置 label。带标签的横向轨道区域高 54 px；纵向区域宽 120 px。没有自动 Tooltip 或完整本地化格式化，label 由应用提供。

## 只读与状态

`readOnly` 保留拇指焦点和 Tab/Escape 导航，不允许键盘、鼠标拖动或轨道点击改值。`disabled` 不进入焦点范围。min=max 继续作为不可操作的静态值。

拖动过程中改成只读、禁用或改变轨道参数会销毁捕获层，不再提交，也不回滚应用已收到的值。应用仍持有 value，组件不保存或覆盖外部数据。

稳定 testId：`-track` 为轨道区域，`-stop-{index}` 为从低到高的命中项，`-mark-{value}` 为刻度，`-mark-label-{value}` 为可见标签；原 `-thumb-0/-thumb-1` 与 `-value` 保留。

## 模型与验证

新增模型函数：`sliderStops(bounds)` 返回有界候选或 null；`sliderHitRegions(bounds,length)` 返回局部命中区域或空数组；`sliderMarksError(marks,bounds)` 返回错误或 null；`nearestSliderThumb(values,target,preferred)` 返回拇指索引。后者的 values/target 应由调用方预先校验。

展示：`bun run dev:tracks`，也可在 Controls Gallery 选择 Tracks and marks。

测试：`test:tracks`、`test:tracks:narrow`、`test:tracks:states` 覆盖横纵点击、最近/重合拇指、点击后键盘焦点、右键、只读/禁用、取消拖动、受控值、上限/错误、非整步 max、标签对齐和 Dialog 内导航。原有 `test:controls`、`:narrow`、`:states` 回归滑块、日期和弹层。`test:live:tracks` 单独验证真实 macOS 窗口启动、中文输入、键盘切换主题和截图；未执行 live simulateClick。

仍未声明 Windows/Linux、真实 IME、AX slider 认证、完整 macOS 原生控件等价性。
