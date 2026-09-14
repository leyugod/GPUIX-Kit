/** 以 8 位 sRGB 通道作为边界；不调用系统颜色面板或隐式转换颜色配置。 */
export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
export type ColorChannel = keyof RGBAColor;
export interface PaletteColor {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
}
export function parseHexColor(
  value: string,
  allowAlpha = true,
): RGBAColor | null {
  const hex = value.trim();
  if (!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(hex))
    return null;
  let digits = hex.slice(1);
  if (digits.length < 5) digits = [...digits].map((c) => c + c).join("");
  const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) : 255;
  if (!allowAlpha && a !== 255) return null;
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
    a,
  };
}
export function formatHexColor(color: RGBAColor): string | null {
  if (
    ![color.r, color.g, color.b, color.a].every(
      (v) => Number.isInteger(v) && v >= 0 && v <= 255,
    )
  )
    return null;
  const byte = (v: number) => v.toString(16).padStart(2, "0").toUpperCase();
  return (
    "#" +
    byte(color.r) +
    byte(color.g) +
    byte(color.b) +
    (color.a === 255 ? "" : byte(color.a))
  );
}
export function normalizeHexColor(value: string, allowAlpha = true) {
  const color = parseHexColor(value, allowAlpha);
  return color ? formatHexColor(color) : null;
}
export function setColorChannel(
  value: string,
  channel: ColorChannel,
  next: number,
) {
  const color = parseHexColor(value);
  return color ? formatHexColor({ ...color, [channel]: next }) : null;
}
/** 透明色预览先合成到固定棋盘底色，不依赖未验证的宿主颜色字符串语法。 */
export function compositeColor(
  color: RGBAColor,
  background: string,
): string | null {
  const bg = parseHexColor(background);
  if (!formatHexColor(color) || !bg || bg.a !== 255) return null;
  const mix = (source: number, target: number) =>
    Math.round((source * color.a) / 255 + target * (1 - color.a / 255));
  return formatHexColor({
    r: mix(color.r, bg.r),
    g: mix(color.g, bg.g),
    b: mix(color.b, bg.b),
    a: 255,
  });
}
export function paletteError(items: readonly PaletteColor[]): string | null {
  if (items.length > 96) return "A palette supports at most 96 colors.";
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || !item.label.trim())
      return "Colors require non-empty ids and labels.";
    if (ids.has(item.id)) return "Palette ids must be unique.";
    if (!parseHexColor(item.value))
      return "Palette colors must use valid hexadecimal values.";
    ids.add(item.id);
  }
  return null;
}
export function paletteColumns(value: number) {
  return Number.isFinite(value)
    ? Math.max(2, Math.min(8, Math.floor(value)))
    : 6;
}
export function movePalette(
  index: number,
  key: string,
  items: readonly PaletteColor[],
  columns: number,
  allowAlpha = true,
) {
  const enabled = (i: number) =>
    !!items[i] &&
    !items[i]!.disabled &&
    !!parseHexColor(items[i]!.value, allowAlpha);
  if (!items.length) return 0;
  if (key === "home" || key === "end") {
    for (
      let i = key === "home" ? 0 : items.length - 1;
      i >= 0 && i < items.length;
      i += key === "home" ? 1 : -1
    )
      if (enabled(i)) return i;
    return index;
  }
  const step =
    key === "up"
      ? -columns
      : key === "down"
        ? columns
        : key === "left"
          ? -1
          : key === "right"
            ? 1
            : key === "pageup"
              ? -columns * 2
              : key === "pagedown"
                ? columns * 2
                : 0;
  if (!step) return index;
  let target = Math.max(0, Math.min(items.length - 1, index + step));
  const direction = step < 0 ? -1 : 1;
  while (target >= 0 && target < items.length) {
    if (enabled(target)) return target;
    target += direction;
  }
  return index;
}
export const defaultPalette: readonly PaletteColor[] = Object.freeze(
  [
    ["graphite", "Graphite", "#343A46"],
    ["gray", "Gray", "#8B95A5"],
    ["white", "White", "#FFFFFF"],
    ["red", "Red", "#EF4444"],
    ["orange", "Orange", "#F97316"],
    ["amber", "Amber", "#F59E0B"],
    ["yellow", "Yellow", "#EAB308"],
    ["lime", "Lime", "#84CC16"],
    ["green", "Green", "#22C55E"],
    ["teal", "Teal", "#14B8A6"],
    ["cyan", "Cyan", "#06B6D4"],
    ["blue", "Blue", "#2563EB"],
    ["indigo", "Indigo", "#6366F1"],
    ["violet", "Violet", "#8B5CF6"],
    ["purple", "Purple", "#A855F7"],
    ["pink", "Pink", "#EC4899"],
    ["rose", "Rose", "#F43F5E"],
    ["transparent", "Transparent", "#00000000"],
  ].map(([id, label, value]) =>
    Object.freeze({ id: id!, label: label!, value: value! }),
  ),
);
