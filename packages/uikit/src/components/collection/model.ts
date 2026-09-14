import type { SelectableItem } from "../../interaction/selection";
export function collectionError(items: readonly SelectableItem[]) {
  if (items.length > 100) return "Use at most 100 items per collection page.";
  const seen = new Set<string>();
  for (const item of items) {
    if (
      typeof item.id !== "string" ||
      !item.id ||
      item.id.length > 128 ||
      seen.has(item.id)
    )
      return "Invalid or duplicate collection ID.";
    seen.add(item.id);
  }
  return null;
}
export function collectionLayout(
  width: number,
  columns?: number,
  cardHeight = 140,
) {
  const w = Number.isFinite(width)
    ? Math.max(120, Math.min(20000, width))
    : 600;
  const inner = Math.max(1, w - 26),
    max = Math.max(1, Math.min(6, Math.floor((inner + 12) / 172)));
  const cols = Number.isFinite(columns)
    ? Math.max(1, Math.min(max, Math.floor(columns!)))
    : max;
  return {
    width: w,
    columns: cols,
    cellWidth: Math.max(1, (inner - (cols - 1) * 12) / cols),
    cardHeight: Number.isFinite(cardHeight)
      ? Math.max(80, Math.min(320, cardHeight))
      : 140,
    gap: 12,
  };
}
/** 二维导航保持列方向；跳过禁用项，最后一行不完整时使用最接近的可用列。 */
export function collectionTarget(
  items: readonly SelectableItem[],
  active: string | null,
  key: string,
  columns: number,
  pageRows = 1,
) {
  const first = items.findIndex((i) => !i.disabled);
  let last = items.length - 1;
  while (last >= 0 && items[last]!.disabled) last--;
  if (first < 0) return null;
  const current = Math.max(
      0,
      items.findIndex((i) => i.id === active),
    ),
    cols = Math.max(1, Math.floor(columns));
  if (key === "home") return items[first]!.id;
  if (key === "end") return items[last]!.id;
  if (key === "left" || key === "right") {
    for (
      let i = current + (key === "left" ? -1 : 1);
      i >= 0 && i < items.length;
      i += key === "left" ? -1 : 1
    )
      if (!items[i]!.disabled) return items[i]!.id;
    return null;
  }
  if (!["up", "down", "pageup", "pagedown"].includes(key)) return null;
  const direction = key === "up" || key === "pageup" ? -1 : 1,
    rows = Math.ceil(items.length / cols),
    distance = key.startsWith("page") ? Math.max(1, pageRows) : 1;
  let row = Math.max(
    0,
    Math.min(rows - 1, Math.floor(current / cols) + direction * distance),
  );
  if (row === Math.floor(current / cols)) return null;
  for (; row >= 0 && row < rows; row += direction) {
    const choices = items
      .map((item, index) => ({ item, index }))
      .filter((x) => Math.floor(x.index / cols) === row && !x.item.disabled)
      .sort(
        (a, b) =>
          Math.abs((a.index % cols) - (current % cols)) -
          Math.abs((b.index % cols) - (current % cols)),
      );
    if (choices[0]) return choices[0].item.id;
  }
  return null;
}
