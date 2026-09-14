export interface SliderBounds {
  min: number;
  max: number;
  step: number;
}
export function sliderError(
  { min, max, step }: SliderBounds,
  values: readonly number[],
) {
  if (
    ![min, max, step, ...values].every(Number.isFinite) ||
    min > max ||
    step <= 0 ||
    Math.max(Math.abs(min), Math.abs(max)) > 1e12
  )
    return "Use finite values, min ≤ max, positive step and bounds within ±1e12.";
  if (values.length === 2 && values[0]! > values[1]!)
    return "Range values must be ordered.";
  return null;
}
/** 步长以 min 为原点；max 始终可达，并移除常见十进制尾差。 */
export function snapSlider(value: number, { min, max, step }: SliderBounds) {
  if (value <= min) return min;
  if (value >= max) return max;
  return Math.min(
    max,
    Math.max(
      min,
      Number((min + Math.round((value - min) / step) * step).toPrecision(14)),
    ),
  );
}
export function moveSlider(
  value: number,
  key: string,
  bounds: SliderBounds,
  shift = false,
) {
  const { min, max, step } = bounds;
  if (key === "home") return min;
  if (key === "end") return max;
  const direction = ["right", "up", "pageup"].includes(key)
    ? 1
    : ["left", "down", "pagedown"].includes(key)
      ? -1
      : 0;
  if (!direction) return null;
  // 非整步 max 回退到相邻网格点，避免一次方向键越过最后一格。
  const index = (snapSlider(value, bounds) - min) / step;
  const steps = key.startsWith("page") || shift ? 10 : 1;
  const next =
    direction > 0
      ? Math.floor(index + 1e-9) + steps
      : Math.ceil(index - 1e-9) - steps;
  return snapSlider(min + next * step, bounds);
}

export interface SliderMark {
  value: number;
  label?: string;
}
/** 命中区域数量有界；细步长继续使用拇指拖动，不生成巨型原生树。 */
export function sliderStops(bounds: SliderBounds): number[] | null {
  if (sliderError(bounds, [])) return null;
  const { min, max, step } = bounds;
  if (min === max) return [min];
  const intervals = Math.ceil(Number(((max - min) / step).toPrecision(14)));
  if (intervals > 200) return null;
  return [
    ...new Set(
      Array.from({ length: intervals + 1 }, (_, i) =>
        i === intervals ? max : snapSlider(min + i * step, bounds),
      ),
    ),
  ];
}
export function sliderMarksError(
  marks: readonly SliderMark[],
  { min, max }: SliderBounds,
): string | null {
  if (marks.length > 51) return "Use at most 51 slider marks.";
  if (
    marks.some(
      (mark) =>
        !Number.isFinite(mark.value) || mark.value < min || mark.value > max,
    )
  )
    return "Marks must be finite and within slider bounds.";
  if (new Set(marks.map((mark) => mark.value)).size !== marks.length)
    return "Slider mark values must be unique.";
  return null;
}
/** 相邻停靠值中点划分命中区域，不依赖窗口中的绝对坐标。 */
export function sliderHitRegions(bounds: SliderBounds, length: number) {
  const stops = sliderStops(bounds);
  if (!stops || !Number.isFinite(length) || length < 80 || length > 2048)
    return [];
  const positions = stops.map((value) =>
    bounds.max === bounds.min
      ? length / 2
      : 10 + ((value - bounds.min) / (bounds.max - bounds.min)) * (length - 20),
  );
  return stops.map((value, index) => {
    const start =
      index === 0 ? 0 : (positions[index - 1]! + positions[index]!) / 2;
    const end =
      index === stops.length - 1
        ? length
        : (positions[index]! + positions[index + 1]!) / 2;
    return { value, start, length: end - start };
  });
}
export function nearestSliderThumb(
  values: readonly number[],
  target: number,
  preferred = 0,
): number {
  if (values.length !== 2) return 0;
  const first = Math.abs(values[0]! - target),
    second = Math.abs(values[1]! - target);
  // 距离相同时沿用最近操作的拇指；重合值允许朝两侧展开。
  if (values[0] === values[1] && target !== values[0])
    return target < values[0]! ? 0 : 1;
  return first === second ? (preferred === 1 ? 1 : 0) : first < second ? 0 : 1;
}
