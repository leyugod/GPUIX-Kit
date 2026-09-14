export interface ChartCategory {
  id: string;
  label: string;
}
export interface ChartSeries {
  id: string;
  label: string;
  values: readonly (number | null)[];
  color?: string;
}
export interface ChartDatum {
  id: string;
  label: string;
  value: number;
  color?: string;
}
export interface ChartDomain {
  min: number;
  max: number;
}
const supported = (n: number) => Number.isFinite(n) && Math.abs(n) <= 1e15;
/** 拒绝无效数据而不是将缺失/溢出静默绘制为零；null 代表折线断点。 */
export function validateChart(
  categories: readonly ChartCategory[],
  series: readonly ChartSeries[],
): string | null {
  if (categories.length > 200 || series.length > 12)
    return "Aggregate to at most 200 categories and 12 series.";
  if (
    new Set(categories.map((c) => c.id)).size !== categories.length ||
    new Set(series.map((s) => s.id)).size !== series.length
  )
    return "Chart IDs must be unique.";
  if (series.some((s) => s.values.length !== categories.length))
    return "Each series must match the category count.";
  if (series.some((s) => s.values.some((v) => v !== null && !supported(v))))
    return "Chart values must be finite and within ±1e15.";
  return null;
}
export function chartDomain(
  series: readonly ChartSeries[],
  stacked = false,
): ChartDomain {
  let low = 0,
    high = 0;
  if (stacked) {
    const count = series[0]?.values.length ?? 0;
    for (let i = 0; i < count; i++) {
      let positive = 0,
        negative = 0;
      for (const s of series) {
        const n = s.values[i] ?? 0;
        if (n >= 0) positive += n;
        else negative += n;
      }
      low = Math.min(low, negative);
      high = Math.max(high, positive);
    }
  } else
    for (const s of series)
      for (const n of s.values)
        if (n !== null) {
          low = Math.min(low, n);
          high = Math.max(high, n);
        }
  return low === high ? { min: 0, max: 1 } : { min: low, max: high };
}
export function chartY(value: number, domain: ChartDomain, height: number) {
  return height * (1 - (value - domain.min) / (domain.max - domain.min));
}
export function categoryX(index: number, count: number, width: number) {
  return (width * (index + 0.5)) / Math.max(1, count);
}
export function lineSegments(
  values: readonly (number | null)[],
  domain: ChartDomain,
  width: number,
  height: number,
) {
  const segments: string[] = [];
  let path = "";
  values.forEach((value, index) => {
    if (value === null) {
      if (path) segments.push(path);
      path = "";
      return;
    }
    const x = categoryX(index, values.length, width);
    path += `${path ? " L" : "M"}${x.toFixed(3)},${chartY(value, domain, height).toFixed(3)}`;
  });
  if (path) segments.push(path);
  return segments;
}
export function pieModel(data: readonly ChartDatum[]): {
  error: string | null;
  total: number;
  segments: {
    datum: ChartDatum;
    start: number;
    end: number;
    fraction: number;
  }[];
} {
  if (data.length > 50 || new Set(data.map((d) => d.id)).size !== data.length)
    return {
      error: "Use at most 50 slices with unique IDs.",
      total: 0,
      segments: [],
    };
  if (data.some((d) => !supported(d.value) || d.value < 0))
    return {
      error: "Slice values must be finite, non-negative, and at most 1e15.",
      total: 0,
      segments: [],
    };
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let angle = -Math.PI / 2;
  return {
    error: null,
    total,
    segments: data
      .filter((d) => d.value > 0)
      .map((datum) => {
        const fraction = datum.value / total,
          start = angle;
        angle += fraction * Math.PI * 2;
        return { datum, start, end: angle, fraction };
      }),
  };
}
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
  inner = 0,
) {
  const point = (radius: number, angle: number) =>
    `${(cx + radius * Math.cos(angle)).toFixed(3)},${(cy + radius * Math.sin(angle)).toFixed(3)}`;
  // 整圆拆成两段弧，避免 SVG 起终点重合时路径消失。
  const sweep = Math.min(end - start, Math.PI * 2),
    mid = start + sweep / 2;
  const outer = `M${point(r, start)} A${r},${r} 0 0 1 ${point(r, mid)} A${r},${r} 0 0 1 ${point(r, start + sweep)}`;
  return inner
    ? `${outer} L${point(inner, start + sweep)} A${inner},${inner} 0 0 0 ${point(inner, mid)} A${inner},${inner} 0 0 0 ${point(inner, start)} Z`
    : `${outer} L${cx},${cy} Z`;
}
/** 颜色只允许十六进制，SVG 内容不接受外部标签、URL 或脚本。 */
export function chartColor(value: string | undefined, fallback: string) {
  return value &&
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? value
    : fallback;
}
