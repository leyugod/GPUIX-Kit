import { describe, it, expect } from "vitest";
import {
  createNotificationQueue,
  type NotificationClock,
} from "../components/notifications/queue";
import {
  taskActions,
  taskCollectionError,
  taskFraction,
  summarizeTasks,
  progressFraction,
  type ProgressTask,
} from "../components/task-progress/model";
function fakeClock() {
  let time = 0,
    id = 0;
  const timers = new Map<number, { at: number; run: () => void }>();
  const clock: NotificationClock = {
    now: () => time,
    setTimeout: (run, delay) => {
      const key = ++id;
      timers.set(key, { at: time + delay, run });
      return key;
    },
    clearTimeout: (handle) => {
      timers.delete(handle as number);
    },
  };
  return {
    clock,
    count: () => timers.size,
    advance(ms: number) {
      const end = time + ms;
      let steps = 0;
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        if (++steps > 1000) throw new Error("Timer loop");
        time = next[1].at;
        timers.delete(next[0]);
        next[1].run();
      }
      time = end;
    },
    jump(ms: number) {
      time += ms;
      const pending = [...timers].filter(([, v]) => v.at <= time);
      for (const [key, timer] of pending) {
        timers.delete(key);
        timer.run();
      }
    },
  };
}
describe("notification lifetime", () => {
  it("starts waiting notices only when they become visible", () => {
    const time = fakeClock(),
      queue = createNotificationQueue({ clock: time.clock, visibleLimit: 1 });
    queue.enqueue({ id: "a", title: "A", durationMs: 100 });
    queue.enqueue({ id: "b", title: "B", durationMs: 200 });
    time.advance(100);
    expect(queue.getSnapshot().entries.map((e) => e.notice.id)).toEqual(["b"]);
    expect(queue.getSnapshot().entries[0]!.remainingMs).toBe(200);
    time.advance(199);
    expect(queue.getSnapshot().entries).toHaveLength(1);
    time.advance(1);
    expect(queue.getSnapshot().entries).toHaveLength(0);
    expect(time.count()).toBe(0);
    queue.dispose();
  });
  it("preserves remaining time across multiple pause reasons", () => {
    const time = fakeClock(),
      queue = createNotificationQueue({ clock: time.clock });
    queue.enqueue({ id: "a", title: "A", durationMs: 100 });
    time.advance(30);
    queue.setPaused("a", "hover", true);
    queue.setPaused("a", "manual", true);
    time.advance(500);
    expect(queue.getSnapshot().entries[0]!.remainingMs).toBe(70);
    queue.setPaused("a", "hover", false);
    time.advance(500);
    expect(queue.getSnapshot().entries).toHaveLength(1);
    queue.setPaused("a", "manual", false);
    time.advance(70);
    expect(queue.getSnapshot().entries).toHaveLength(0);
    queue.dispose();
  });
  it("pauses all timers and keeps persistent notices without timer work", () => {
    const time = fakeClock(),
      queue = createNotificationQueue({ clock: time.clock });
    queue.enqueue({ id: "a", title: "A", durationMs: 50 });
    queue.enqueue({ id: "p", title: "Persistent", durationMs: null });
    time.advance(20);
    queue.setPausedAll(true);
    expect(time.count()).toBe(0);
    time.advance(1000);
    queue.setPausedAll(false);
    time.advance(30);
    expect(queue.getSnapshot().entries.map((e) => e.notice.id)).toEqual(["p"]);
    expect(time.count()).toBe(0);
    queue.dispose();
  });
  it("rejects overflow and invalid data without dropping a waiting action", () => {
    const queue = createNotificationQueue({
      clock: fakeClock().clock,
      capacity: 1,
      visibleLimit: 1,
    });
    expect(queue.enqueue({ id: "a", title: "A" }).ok).toBe(true);
    expect(queue.enqueue({ id: "b", title: "B" }).ok).toBe(false);
    expect(queue.enqueue({ id: "a", title: "", durationMs: 0 }).ok).toBe(false);
    expect(queue.getSnapshot().entries[0]!.notice.title).toBe("A");
    expect(() => createNotificationQueue({ visibleLimit: 0 })).toThrow();
    expect(() => createNotificationQueue({ defaultDurationMs: NaN })).toThrow();
    queue.dispose();
  });
  it("upserts in place and rejects stale action completion by revision", () => {
    const queue = createNotificationQueue({ clock: fakeClock().clock });
    const first = queue.enqueue({ id: "a", title: "Old" });
    queue.enqueue({ id: "b", title: "Second" });
    queue.setPaused("a", "hover", true);
    queue.setPaused("a", "manual", true);
    const second = queue.enqueue({ id: "a", title: "New", durationMs: null });
    expect(queue.getSnapshot().entries[0]!.pauses).toEqual(["manual"]);
    expect(first.ok && second.ok && first.revision !== second.revision).toBe(
      true,
    );
    expect(first.ok && queue.dismiss("a", "action", first.revision)).toBe(
      false,
    );
    expect(queue.getSnapshot().entries.map((e) => e.notice.title)).toEqual([
      "New",
      "Second",
    ]);
    queue.dispose();
  });
  it("does not retroactively expire promoted entries when a timer runs late", () => {
    const time = fakeClock(),
      queue = createNotificationQueue({ clock: time.clock, visibleLimit: 1 });
    queue.enqueue({ id: "a", title: "A", durationMs: 20 });
    queue.enqueue({ id: "b", title: "B", durationMs: 20 });
    time.jump(1000);
    expect(queue.getSnapshot().entries[0]!.notice.id).toBe("b");
    expect(queue.getSnapshot().entries[0]!.remainingMs).toBe(20);
    queue.dispose();
  });
  it("cleans timers and supports hook effect suspension/replay", () => {
    const time = fakeClock(),
      queue = createNotificationQueue({ clock: time.clock });
    queue.enqueue({ id: "a", title: "A", durationMs: 100 });
    time.advance(30);
    queue.suspend();
    expect(time.count()).toBe(0);
    time.advance(500);
    queue.resume();
    time.advance(69);
    expect(queue.getSnapshot().entries).toHaveLength(1);
    queue.dispose();
    expect(time.count()).toBe(0);
    time.advance(200);
    expect(queue.enqueue({ id: "b", title: "B" }).ok).toBe(false);
  });
  it("publishes immutable snapshots and supports reentrant dismissal callbacks", () => {
    const time = fakeClock();
    let queue: ReturnType<typeof createNotificationQueue>;
    queue = createNotificationQueue({
      clock: time.clock,
      onDismiss: (_notice, reason) => {
        if (reason === "timeout")
          queue.enqueue({ id: "next", title: "Next", durationMs: null });
      },
    });
    queue.enqueue({ id: "a", title: "A", durationMs: 10 });
    const old = queue.getSnapshot();
    expect(Object.isFrozen(old.entries[0]!.notice)).toBe(true);
    time.advance(10);
    expect(old.entries[0]!.notice.id).toBe("a");
    expect(queue.getSnapshot().entries[0]!.notice.id).toBe("next");
    queue.dispose();
  });
});
describe("application-owned task progress", () => {
  const task: ProgressTask = {
    id: "a",
    title: "A",
    status: "running",
    completed: 20,
    total: 100,
    pausable: true,
    cancellable: true,
    retryable: true,
  };
  it("offers only state-compatible actions", () => {
    expect(taskActions(task)).toEqual(["pause", "cancel"]);
    expect(taskActions({ ...task, status: "paused" })).toEqual([
      "resume",
      "cancel",
    ]);
    expect(taskActions({ ...task, status: "failed" })).toEqual(["retry"]);
    expect(taskActions({ ...task, status: "succeeded" })).toEqual([]);
  });
  it("distinguishes unknown work from measured completion", () => {
    expect(taskFraction(task)).toBe(0.2);
    expect(taskFraction({ ...task, total: undefined })).toBeNull();
    expect(taskFraction({ ...task, status: "succeeded" })).toBe(1);
    expect(progressFraction(-1)).toBeNull();
    expect(progressFraction(Infinity)).toBeNull();
    expect(progressFraction(25, 50)).toBe(0.5);
  });
  it("validates identities, collection bounds and progress numbers", () => {
    expect(taskCollectionError([task, { ...task }])).toBeTruthy();
    expect(taskCollectionError([{ ...task, total: 0 }])).toBeTruthy();
    expect(taskCollectionError([{ ...task, completed: 101 }])).toBeTruthy();
    expect(
      taskCollectionError(
        Array.from({ length: 201 }, (_, i) => ({ ...task, id: String(i) })),
      ),
    ).toBeTruthy();
  });
  it("summarizes task counts without mixing units or counting cancelled work as success", () => {
    expect(
      summarizeTasks([
        task,
        { ...task, id: "b", status: "succeeded" },
        { ...task, id: "c", status: "cancelled" },
      ]),
    ).toEqual({
      queued: 0,
      running: 1,
      paused: 0,
      succeeded: 1,
      failed: 0,
      cancelled: 1,
      total: 3,
      active: 1,
    });
  });
});
