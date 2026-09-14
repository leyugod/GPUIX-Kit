export function stepNumber(
  value: number,
  delta: number,
  step: number,
  min: number,
  max: number,
) {
  if (
    ![value, delta, step, min, max].every(Number.isFinite) ||
    step <= 0 ||
    max < min
  )
    throw new RangeError("Invalid numeric bounds or step");
  // 十进制步进舍去浮点尾差，不引入金额或单位领域语义。
  return Math.min(
    max,
    Math.max(min, Number((value + delta * step).toPrecision(14))),
  );
}
export function isISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number) as [number, number, number];
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  return (
    y >= 1 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <=
      ([31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0)
  );
}
export function dateWithinBounds(value: string, min?: string, max?: string) {
  return (
    isISODate(value) &&
    (!min || (isISODate(min) && value >= min)) &&
    (!max || (isISODate(max) && value <= max))
  );
}
