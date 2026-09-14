import {
  advanceNotifications,
  nextNotificationDelay,
  notificationError,
  type Notification,
  type PauseReason,
  type QueuedNotification,
} from "./model";
export interface NotificationClock {
  now: () => number;
  setTimeout: (callback: () => void, delay: number) => unknown;
  clearTimeout: (handle: unknown) => void;
}
export interface NotificationSnapshot {
  readonly entries: readonly QueuedNotification[];
  readonly visibleLimit: number;
  readonly capacity: number;
  readonly paused: boolean;
}
export type DismissReason = "manual" | "timeout" | "action" | "clear";
export interface NotificationQueueOptions {
  capacity?: number;
  visibleLimit?: number;
  defaultDurationMs?: number | null;
  clock?: NotificationClock;
  onDismiss?: (notice: Readonly<Notification>, reason: DismissReason) => void;
}
// Bun 提供计时器；只声明实际所需接口，不引入 DOM 或 node:* 类型与模块。
const host = globalThis as unknown as {
  performance: { now: () => number };
  setTimeout: (callback: () => void, delay: number) => unknown;
  clearTimeout: (handle: unknown) => void;
};
const runtimeClock: NotificationClock = {
  now: () => host.performance.now(),
  setTimeout: (callback, delay) => host.setTimeout(callback, delay),
  clearTimeout: (handle) => host.clearTimeout(handle),
};
export function createNotificationQueue(
  options: NotificationQueueOptions = {},
) {
  const {
    capacity = 50,
    visibleLimit = 3,
    defaultDurationMs = 5000,
    clock = runtimeClock,
  } = options;
  if (
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100 ||
    !Number.isInteger(visibleLimit) ||
    visibleLimit < 1 ||
    visibleLimit > Math.min(5, capacity)
  )
    throw new RangeError(
      "Queue capacity is 1–100; visibleLimit is 1–5 and cannot exceed capacity.",
    );
  const configError = notificationError({
    id: "config",
    title: "config",
    durationMs: defaultDurationMs,
  });
  if (configError) throw new RangeError(configError);
  let snapshot: NotificationSnapshot = Object.freeze({
    entries: Object.freeze([]),
    visibleLimit,
    capacity,
    paused: false,
  });
  let revision = 0,
    last = clock.now(),
    timer: unknown = null,
    active = true,
    disposed = false;
  const listeners = new Set<() => void>();
  const cancel = () => {
    if (timer !== null) clock.clearTimeout(timer);
    timer = null;
  };
  const schedule = () => {
    cancel();
    if (!active || disposed) return;
    const delay = nextNotificationDelay(
      snapshot.entries,
      visibleLimit,
      snapshot.paused,
    );
    if (delay !== null)
      timer = clock.setTimeout(() => {
        timer = null;
        sync();
      }, delay);
  };
  const commit = (
    entries: readonly QueuedNotification[],
    paused = snapshot.paused,
  ) => {
    snapshot = Object.freeze({
      entries: Object.freeze(
        entries.map((e) =>
          Object.freeze({
            ...e,
            notice: Object.freeze({ ...e.notice }),
            pauses: Object.freeze([...e.pauses]),
          }),
        ),
      ),
      visibleLimit,
      capacity,
      paused,
    });
    schedule();
    for (const listener of [...listeners]) listener();
  };
  const sync = () => {
    if (disposed || !active) return;
    const now = clock.now();
    if (!Number.isFinite(now))
      throw new Error(
        "Notification clock must return a finite monotonic time.",
      );
    const result = advanceNotifications(
      snapshot.entries,
      Math.max(0, now - last),
      visibleLimit,
      snapshot.paused,
    );
    last = Math.max(last, now);
    if (
      result.entries.some((e, i) => e !== snapshot.entries[i]) ||
      result.entries.length !== snapshot.entries.length
    )
      commit(result.entries);
    else schedule();
    for (const entry of result.expired)
      options.onDismiss?.(entry.notice, "timeout");
  };
  const matching = (id: string, expectedRevision?: number) =>
    snapshot.entries.find(
      (e) =>
        e.notice.id === id &&
        (expectedRevision === undefined || e.revision === expectedRevision),
    );
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      if (disposed) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    enqueue(
      notice: Notification,
    ): { ok: true; revision: number } | { ok: false; error: string } {
      if (disposed) return { ok: false, error: "Queue has been disposed." };
      const error = notificationError(notice);
      if (error) return { ok: false, error };
      sync();
      const previous = matching(notice.id);
      if (!previous && snapshot.entries.length >= capacity)
        return { ok: false, error: "Notification queue is full." };
      const entry: QueuedNotification = {
        notice: { ...notice },
        revision: ++revision,
        remainingMs:
          notice.durationMs === undefined
            ? defaultDurationMs
            : notice.durationMs,
        pauses:
          previous?.pauses.filter(
            (p) => p !== "busy" && p !== "error" && p !== "hover",
          ) ?? [],
      };
      commit(
        previous
          ? snapshot.entries.map((e) => (e === previous ? entry : e))
          : [...snapshot.entries, entry],
      );
      return { ok: true, revision: entry.revision };
    },
    dismiss(
      id: string,
      reason: DismissReason = "manual",
      expectedRevision?: number,
    ) {
      sync();
      const entry = matching(id, expectedRevision);
      if (disposed || !entry) return false;
      commit(snapshot.entries.filter((e) => e !== entry));
      options.onDismiss?.(entry.notice, reason);
      return true;
    },
    setPaused(
      id: string,
      reason: PauseReason,
      paused: boolean,
      expectedRevision?: number,
    ) {
      sync();
      const entry = matching(id, expectedRevision);
      if (disposed || !entry) return false;
      const reasons = new Set(entry.pauses);
      if (paused) reasons.add(reason);
      else reasons.delete(reason);
      if (
        reasons.size === entry.pauses.length &&
        [...reasons].every((p) => entry.pauses.includes(p))
      )
        return true;
      commit(
        snapshot.entries.map((e) =>
          e === entry ? { ...e, pauses: [...reasons] } : e,
        ),
      );
      return true;
    },
    setPausedAll(paused: boolean) {
      sync();
      if (!disposed && paused !== snapshot.paused)
        commit(snapshot.entries, paused);
    },
    clear() {
      sync();
      if (disposed) return;
      const entries = snapshot.entries;
      commit([]);
      for (const e of entries) options.onDismiss?.(e.notice, "clear");
    },
    /** hook 在 effect 重放时暂停/恢复调度，销毁只用于外部控制器最终释放。 */
    suspend() {
      sync();
      active = false;
      cancel();
    },
    resume() {
      if (disposed || active) return;
      last = clock.now();
      active = true;
      schedule();
    },
    dispose() {
      cancel();
      disposed = true;
      active = false;
      listeners.clear();
    },
  };
}
export type NotificationQueue = ReturnType<typeof createNotificationQueue>;
