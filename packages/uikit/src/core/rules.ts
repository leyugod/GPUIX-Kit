/** 控件的纯规则可脱离原生 GUI 测试。 */
export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
export function pageWindow(page: number, pageSize: number, total: number) {
  const size = Math.max(
    1,
    Math.floor(Number.isFinite(pageSize) ? pageSize : 20),
  );
  const count = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const pages = Math.max(1, Math.ceil(count / size));
  const current = clamp(Math.floor(page), 1, pages);
  return {
    page: current,
    pages,
    start: (current - 1) * size,
    end: Math.min(current * size, count),
    size,
    total: count,
  };
}
export function nextEnabled<T extends { value: string; disabled?: boolean }>(
  items: readonly T[],
  value: string,
  direction: 1 | -1,
) {
  const enabled = items.filter((item) => !item.disabled);
  if (!enabled.length) return undefined;
  const index = enabled.findIndex((item) => item.value === value);
  const start = index < 0 ? (direction > 0 ? -1 : 0) : index;
  return enabled[(start + direction + enabled.length) % enabled.length]?.value;
}
export function normalizeKey(key?: string) {
  return key?.toLowerCase() ?? "";
}
export function isActivation(key?: string) {
  return ["enter", "space", " "].includes(normalizeKey(key));
}
