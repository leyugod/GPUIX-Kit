/** 同一天的本地墙上时间；不读取时钟，也不转换日期或时区。 */
export interface TimeRules {
  min?: string;
  max?: string;
  stepMinutes?: number;
  isTimeDisabled?: (value: string) => boolean;
}
export function timeMinutes(value: string): number | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}
export function timeString(minutes: number): string | null {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1439) return null;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
export function timeConfigError({
  min = "00:00",
  max = "23:59",
  stepMinutes = 1,
}: TimeRules = {}): string | null {
  const start = timeMinutes(min),
    end = timeMinutes(max);
  if (start === null || end === null) return "Use HH:mm for time bounds.";
  if (start > end) return "Time bounds must stay within one day.";
  if (!Number.isInteger(stepMinutes) || stepMinutes < 1 || stepMinutes > 1440)
    return "Minute step must be an integer from 1 to 1440.";
  return null;
}
/** 步长从 min 对齐；禁用项直接排除，最多生成 1440 个纯数据项。 */
export function timeOptions(rules: TimeRules = {}): string[] {
  if (timeConfigError(rules)) return [];
  const start = timeMinutes(rules.min ?? "00:00")!,
    end = timeMinutes(rules.max ?? "23:59")!;
  const values: string[] = [];
  for (let minute = start; minute <= end; minute += rules.stepMinutes ?? 1) {
    const value = timeString(minute)!;
    if (!rules.isTimeDisabled?.(value)) values.push(value);
  }
  return values;
}
export function isSelectableTime(
  value: string,
  rules: TimeRules = {},
): boolean {
  if (timeConfigError(rules)) return false;
  const minute = timeMinutes(value),
    start = timeMinutes(rules.min ?? "00:00")!,
    end = timeMinutes(rules.max ?? "23:59")!;
  return (
    minute !== null &&
    minute >= start &&
    minute <= end &&
    (minute - start) % (rules.stepMinutes ?? 1) === 0 &&
    !rules.isTimeDisabled?.(value)
  );
}
/** 无效格式从首/尾项恢复；合法但不在网格上的时间沿指定方向寻找，端点不循环。 */
export function stepTime(
  value: string,
  direction: -1 | 1,
  rules: TimeRules = {},
): string | null {
  const options = timeOptions(rules);
  if (!options.length) return null;
  const minute = timeMinutes(value);
  if (minute === null) return direction === 1 ? options[0]! : options.at(-1)!;
  return direction === 1
    ? (options.find((option) => timeMinutes(option)! > minute) ??
        options.at(-1)!)
    : ([...options].reverse().find((option) => timeMinutes(option)! < minute) ??
        options[0]!);
}
