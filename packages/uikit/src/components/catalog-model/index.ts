/** 目录补齐组件共享的纯边界；不访问宿主、网络或业务存储。 */
export function catalogError(
  items: readonly { id: string; label?: string }[],
  max = 100,
): string | null {
  if (items.length > max) return "Too many items";
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || item.id.length > 128 || ids.has(item.id))
      return "Invalid or duplicate identity";
    ids.add(item.id);
  }
  return null;
}
export const bounded = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
export function verificationValue(value: string, length = 6) {
  return value.replace(/[^0-9]/g, "").slice(0, length);
}
export function ratingValue(value: number, max = 5, step = 1) {
  return bounded(Math.round(value / step) * step, 0, max);
}
export interface GradientStop {
  id: string;
  position: number;
  color: string;
}
export interface GradientValue {
  angle: number;
  stops: readonly GradientStop[];
}
export function gradientError(value: GradientValue): string | null {
  if (!Number.isFinite(value.angle) || value.angle < 0 || value.angle > 360)
    return "Angle must be 0–360";
  if (
    value.stops.length < 2 ||
    value.stops.length > 8 ||
    catalogError(value.stops, 8)
  )
    return "Use 2–8 unique stops";
  return value.stops.some(
    (s) =>
      !Number.isFinite(s.position) ||
      s.position < 0 ||
      s.position > 1 ||
      !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(s.color),
  )
    ? "Invalid stop"
    : null;
}
export function gradientAt(value: GradientValue, t: number): string {
  const stops = [...value.stops].sort((a, b) => a.position - b.position);
  const right = stops.findIndex((s) => s.position >= t);
  if (right === 0) return stops[0]!.color;
  if (right < 0) return stops[stops.length - 1]!.color;
  const a = stops[right - 1]!,
    b = stops[right]!,
    mix =
      b.position === a.position
        ? 1
        : (t - a.position) / (b.position - a.position);
  const channels = (hex: string) =>
    [1, 3, 5, 7].map((offset) =>
      offset === 7 && hex.length === 7
        ? 255
        : parseInt(hex.slice(offset, offset + 2), 16),
    );
  return (
    "#" +
    channels(a.color)
      .map((n, i) =>
        Math.round(n + (channels(b.color)[i]! - n) * mix)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export interface RadarAxis {
  id: string;
  label: string;
  max: number;
}
export interface RadarSeries {
  id: string;
  label: string;
  values: readonly number[];
}
export function radarError(
  axes: readonly RadarAxis[],
  series: readonly RadarSeries[],
) {
  if (
    axes.length < 3 ||
    axes.length > 12 ||
    catalogError(axes, 12) ||
    catalogError(series, 6)
  )
    return "Use 3–12 axes and up to 6 unique series";
  if (axes.some((a) => !Number.isFinite(a.max) || a.max <= 0))
    return "Invalid axis maximum";
  return series.some(
    (s) =>
      s.values.length !== axes.length ||
      s.values.some((n, i) => !Number.isFinite(n) || n < 0 || n > axes[i]!.max),
  )
    ? "Invalid radar values"
    : null;
}
export function radarPoints(
  axes: readonly RadarAxis[],
  values: readonly number[],
  radius: number,
) {
  return axes.map((a, i) => {
    const angle = (i / axes.length) * Math.PI * 2 - Math.PI / 2,
      r = (radius * values[i]!) / a.max;
    return [
      radius + Math.cos(angle) * r,
      radius + Math.sin(angle) * r,
    ] as const;
  });
}
export interface RichBlock {
  id: string;
  kind: "paragraph" | "heading" | "bullet" | "quote";
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: string;
}
export type RichDocument = readonly RichBlock[];
export const validLink = (link: string) => /^https?:\/\/[^\s<>]+$/i.test(link);
export function richDocumentError(doc: RichDocument) {
  if (!doc.length || doc.length > 100 || catalogError(doc, 100))
    return "Use 1–100 unique blocks";
  return doc.some(
    (b) =>
      !["paragraph", "heading", "bullet", "quote"].includes(b.kind) ||
      b.text.length > 10000 ||
      (b.link && !validLink(b.link)),
  )
    ? "Invalid rich text block"
    : null;
}
export function updateRichBlock(
  doc: RichDocument,
  id: string,
  change: Partial<Omit<RichBlock, "id">>,
): RichBlock[] {
  return doc.map((b) => (b.id === id ? { ...b, ...change } : { ...b }));
}
export function richMarkdown(doc: RichDocument) {
  // 转义文本，链接协议单独校验，绝不把业务正文作为原始 HTML。
  const escape = (text: string) => text.replace(/[\\`*_{}\[\]<>#!|~]/g, "\\$&");
  return doc
    .map((b) => {
      let text = escape(b.text);
      if (b.bold) text = "**" + text + "**";
      if (b.italic) text = "_" + text + "_";
      if (b.link && validLink(b.link))
        text =
          "[" +
          text +
          "](" +
          b.link.replace(/[()]/g, (c) => (c === "(" ? "%28" : "%29")) +
          ")";
      return (
        (b.kind === "heading"
          ? "## "
          : b.kind === "bullet"
            ? "- "
            : b.kind === "quote"
              ? "> "
              : "") + text
      );
    })
    .join("\n\n");
}
