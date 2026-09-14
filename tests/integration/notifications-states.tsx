import assert from "node:assert/strict";
import { resolve } from "node:path";
import { type ReactNode } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  ToastViewport,
  NoticeCard,
  UndoToast,
  TaskProgress,
  TaskList,
  ProgressRing,
  createNotificationQueue,
  type NotificationClock,
  type ProgressTask,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 720 }),
  app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const render = async (node: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24, width: 480 }}>{node}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
let now = 0,
  next = 0;
const timers = new Map<number, { at: number; run: () => void }>();
const clock: NotificationClock = {
  now: () => now,
  setTimeout: (run, delay) => {
    const id = ++next;
    timers.set(id, { at: now + delay, run });
    return id;
  },
  clearTimeout: (id) => {
    timers.delete(id as number);
  },
};
const advance = async (ms: number) => {
  now += ms;
  for (const [id, timer] of [...timers])
    if (timer.at <= now) {
      timers.delete(id);
      timer.run();
    }
  await settle();
};
const queue = createNotificationQueue({ clock, visibleLimit: 1 });
let calls = 0,
  resolveAction: () => void = () => {},
  rejectAction: (e: Error) => void = () => {};
const pending = () => {
  calls++;
  return new Promise<void>((resolve, reject) => {
    resolveAction = resolve;
    rejectAction = reject;
  });
};
const viewport = () => (
  <ToastViewport queue={queue} testId="q" onAction={pending} />
);
try {
  queue.enqueue({
    id: "a",
    title: "Action",
    actionLabel: "Run",
    durationMs: 1000,
  });
  queue.enqueue({ id: "b", title: "Waiting", durationMs: 1000 });
  await render(viewport());
  await press("q-a-action", "enter");
  assert.equal(calls, 1);
  await press("q-a-action", "enter");
  assert.equal(calls, 1);
  await press("q-a", "escape");
  assert(get("q-a"));
  await advance(5000);
  assert(get("q-a"));
  assert(!get("q-b"));
  rejectAction(new Error("sample"));
  await settle();
  assert(get("q-a-error"));
  assert(queue.getSnapshot().entries[0]!.pauses.includes("error"));
  await advance(5000);
  assert(get("q-a"));
  await click("q-a-action");
  assert.equal(calls, 2);
  resolveAction();
  await settle();
  assert(!get("q-a"));
  assert(get("q-b"));
  // 移出鼠标后剩余时间才继续，等待项获得完整时长。
  root.renderer.nativeSimulateMouseMove(900, 650, 0);
  await settle();
  await advance(999);
  assert(get("q-b"));
  await advance(1);
  assert(!get("q-b"));
  queue.enqueue({
    id: "a",
    title: "Old",
    actionLabel: "Run",
    durationMs: null,
  });
  await settle();
  await click("q-a-action");
  assert.equal(calls, 3);
  queue.enqueue({
    id: "a",
    title: "Replacement",
    actionLabel: "Run",
    durationMs: null,
  });
  await settle();
  resolveAction();
  await settle();
  assert.equal(await text("q-a-title"), "Replacement");
  await click("q-a-action");
  await render(null);
  resolveAction();
  await settle();
  assert(!queue.getSnapshot().entries[0]!.pauses.includes("busy"));
  assert(!queue.getSnapshot().entries[0]!.pauses.includes("hover"));
  await render(viewport());
  assert(get("q-a"));
  queue.clear();
  await settle();
  queue.enqueue({ id: "hover", title: "Hover timer", durationMs: 1000 });
  await settle();
  const bounds = await app.getByTestId("q-hover").bounds();
  root.renderer.nativeSimulateMouseMove(bounds.x + 5, bounds.y + 5, 0);
  await settle();
  assert(queue.getSnapshot().entries[0]!.pauses.includes("hover"));
  await advance(2000);
  assert(get("q-hover"));
  root.renderer.nativeSimulateMouseMove(900, 650, 0);
  await settle();
  await press("q-hover", "right");
  await advance(2000);
  assert(get("q-hover"));
  assert(queue.getSnapshot().entries[0]!.pauses.includes("keyboard"));
  await click("q-hover-pause");
  root.renderer.nativeSimulateMouseMove(900, 650, 0);
  await settle();
  await advance(1000);
  assert(!get("q-hover"));
  let undo = 0;
  await render(
    <UndoToast
      testId="u"
      title="Undo"
      state="available"
      onUndo={pending}
      onStateChange={() => undo++}
    />,
  );
  await click("u-action");
  await render(
    <UndoToast
      testId="u"
      title="Undo"
      state="expired"
      onUndo={pending}
      onStateChange={() => undo++}
    />,
  );
  resolveAction();
  await settle();
  assert.equal(undo, 0);
  assert(!get("u-action"));
  let dismissed = 0;
  await render(
    <NoticeCard
      testId="disabled"
      title="Disabled"
      disabled
      action={{
        label: "Run",
        onPress: () => {
          calls++;
        },
      }}
      onDismiss={() => dismissed++}
    />,
  );
  const before = calls;
  await press("disabled-action", "enter");
  await press("disabled", "escape");
  assert.equal(calls, before);
  assert.equal(dismissed, 0);
  const task: ProgressTask = {
    id: "job",
    title: "Task",
    status: "running",
    completed: 25,
    total: 100,
    pausable: true,
    cancellable: true,
  };
  await render(<TaskProgress testId="t" task={task} onAction={pending} />);
  await click("t-pause");
  const locked = calls;
  await press("t-cancel", "enter");
  assert.equal(calls, locked);
  rejectAction(new Error("sample"));
  await settle();
  assert(get("t-error"));
  assert.equal(await text("t-status"), "running");
  await click("t-cancel");
  resolveAction();
  await settle();
  assert(!get("t-error"));
  assert.equal(await text("t-status"), "running");
  await render(
    <TaskProgress testId="t" task={{ ...task, total: 0 }} onAction={pending} />,
  );
  assert(get("t-error"));
  assert(!get("t-pause"));
  await render(<TaskProgress testId="t" task={task} />);
  assert(!get("t-pause"));
  let page = -1;
  const tasks = Array.from({ length: 25 }, (_, i) => ({
    ...task,
    id: String(i),
  }));
  await render(
    <TaskList
      testId="list"
      tasks={tasks}
      page={999}
      pageSize={3}
      onPageChange={(v) => {
        page = v;
      }}
    />,
  );
  assert.equal(await text("list-page"), "9 / 9");
  assert(get("list-24"));
  assert(!get("list-23"));
  await click("list-next");
  assert.equal(page, -1);
  await click("list-previous");
  assert.equal(page, 7);
  await render(
    <TaskList testId="list" tasks={[]} page={0} onPageChange={() => {}} />,
  );
  assert(get("list-empty"));
  await render(
    <TaskList
      testId="list"
      tasks={[task]}
      loading
      page={0}
      onPageChange={() => {}}
    />,
  );
  assert(get("list-loading"));
  assert(!get("list-job"));
  await render(
    <TaskList
      testId="list"
      tasks={[task, task]}
      page={0}
      onPageChange={() => {}}
    />,
  );
  assert(get("list-error"));
  await render(<ProgressRing testId="invalid" value={101} />);
  assert.equal(await text("invalid-label"), "?");
  queue.enqueue({
    id: "floating",
    title: "Floating notification",
    description: "Native anchored placement",
    durationMs: null,
  });
  await render(
    <ToastViewport
      testId="float"
      queue={queue}
      placement="top-right"
      width={10000}
    />,
  );
  const floating = await app.getByTestId("float").bounds();
  assert(floating.x >= 0 && floating.x + floating.width <= 1000);
  assert(floating.width <= 480);
  await app.screenshot({
    path: resolve("artifacts/notifications-floating.png"),
  });
  console.log(
    "PASS notifications states: timers/hover/keyboard, async retry/duplicate/stale/unmount, controlled undo/task, paging/validation, anchored bounds",
  );
} finally {
  root.render(null);
  queue.dispose();
  await app.close();
}
