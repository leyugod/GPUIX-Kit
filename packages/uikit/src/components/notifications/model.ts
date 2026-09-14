import type { Tone } from "../../core/tokens";
export interface Notification {
  id: string;
  title: string;
  description?: string;
  tone?: Tone;
  durationMs?: number | null;
  actionLabel?: string;
  kind?: "notice" | "undo";
  dismissible?: boolean;
}
export type PauseReason = "manual" | "hover" | "keyboard" | "busy" | "error";
export interface QueuedNotification {
  readonly notice: Readonly<Notification>;
  readonly revision: number;
  readonly remainingMs: number | null;
  readonly pauses: readonly PauseReason[];
}
export function notificationError(notice: Notification): string | null {
  if (!notice.id.trim() || !notice.title.trim())
    return "Notifications require a non-empty id and title.";
  if (notice.title.length > 500 || (notice.description?.length ?? 0) > 4000)
    return "Notification text exceeds the supported length.";
  if (
    notice.durationMs !== undefined &&
    notice.durationMs !== null &&
    (!Number.isInteger(notice.durationMs) ||
      notice.durationMs < 1 ||
      notice.durationMs > 86400000)
  )
    return "Duration must be null or 1–86400000 milliseconds.";
  return null;
}
/** 本轮只消耗已显示通知的时间；新补位的通知保留完整时长。 */
export function advanceNotifications(
  entries: readonly QueuedNotification[],
  elapsedMs: number,
  visibleLimit: number,
  paused = false,
) {
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const expired: QueuedNotification[] = [];
  const next = entries.flatMap((entry, index) => {
    if (
      paused ||
      index >= visibleLimit ||
      entry.pauses.length ||
      entry.remainingMs === null ||
      elapsed === 0
    )
      return [entry];
    const remainingMs = Math.max(0, entry.remainingMs - elapsed);
    if (remainingMs === 0) {
      expired.push(entry);
      return [];
    }
    return [{ ...entry, remainingMs }];
  });
  return { entries: next, expired };
}
export function nextNotificationDelay(
  entries: readonly QueuedNotification[],
  visibleLimit: number,
  paused = false,
): number | null {
  if (paused) return null;
  const times = entries
    .slice(0, visibleLimit)
    .filter((e) => !e.pauses.length && e.remainingMs !== null)
    .map((e) => e.remainingMs!);
  return times.length ? Math.min(...times) : null;
}
