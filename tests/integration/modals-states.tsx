import assert from "node:assert/strict";
import { resolve } from "node:path";
import { useRef, useState, type ReactNode } from "react";
import { type PublicInstance } from "@gpuix/react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Button,
  Input,
  Dialog,
  ConfirmDialog,
  PromptDialog,
  Sheet,
  Drawer,
  ProgressDialog,
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
const get = (id: string) => root.renderer.findByTestId(id),
  text = (id: string) => app.getByTestId(id).textContent();
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const fill = async (id: string, v: string) => {
  await app.getByTestId(id).fill(v);
  await settle();
};
const render = async (children: ReactNode) => {
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>{children}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
let closes = 0,
  calls = 0,
  resolveAction: () => void = () => {},
  rejectAction: (e: Error) => void = () => {};
const pending = () => {
  calls++;
  return new Promise<void>((resolve, reject) => {
    resolveAction = resolve;
    rejectAction = reject;
  });
};
let dropAll = () => {};
function Nested() {
  const [parent, setParent] = useState(true),
    [child, setChild] = useState(true),
    [value, setValue] = useState("Child input");
  const outer = useRef<PublicInstance>(null),
    trigger = useRef<PublicInstance>(null);
  dropAll = () => setParent(false);
  return (
    <>
      <Button
        ref={outer}
        testId="reopen"
        onPress={() => {
          setChild(true);
          setParent(true);
        }}
      >
        Open branch
      </Button>
      <Sheet
        testId="parent"
        open={parent}
        onOpenChange={setParent}
        title="Parent"
        restoreFocusRef={outer}
        height={420}
      >
        <Button
          ref={trigger}
          testId="child-open"
          onPress={() => setChild(true)}
        >
          Child
        </Button>
        <Drawer
          testId="child"
          open={child}
          onOpenChange={setChild}
          title="Child"
          restoreFocusRef={trigger}
          side="left"
          width={320}
        >
          <Input testId="child-input" value={value} onValueChange={setValue} />
        </Drawer>
      </Sheet>
    </>
  );
}
function Siblings() {
  const [first, setFirst] = useState(true),
    [second, setSecond] = useState(true);
  return (
    <>
      <Dialog
        testId="first"
        width={900}
        open={first}
        onOpenChange={setFirst}
        title="First"
      >
        <Text>Earlier modal</Text>
      </Dialog>
      <Dialog
        testId="second"
        open={second}
        onOpenChange={setSecond}
        title="Second"
      >
        <Text>Latest modal</Text>
      </Dialog>
    </>
  );
}
try {
  await render(
    <ConfirmDialog
      testId="c"
      open
      onOpenChange={() => closes++}
      title="Async confirmation"
      onConfirm={pending}
    />,
  );
  await click("c-confirm");
  assert.equal(calls, 1);
  await press("c-confirm", "enter");
  assert.equal(calls, 1);
  await key("escape");
  assert.equal(closes, 0);
  rejectAction(Error("private detail"));
  await settle();
  assert(get("c-error"));
  assert(!(await text("c-error")).includes("private detail"));
  await key("tab");
  await key("enter");
  assert.equal(closes, 1, "Failure releases Tab to Cancel");
  await click("c-confirm");
  resolveAction();
  await settle();
  assert.equal(closes, 2);
  await click("c-confirm");
  await render(
    <ConfirmDialog
      testId="c"
      open
      revision={1}
      onOpenChange={() => closes++}
      title="New request"
      onConfirm={pending}
    />,
  );
  resolveAction();
  await settle();
  assert.equal(closes, 2);
  await click("c-confirm");
  await render(null);
  resolveAction();
  await settle();
  assert.equal(closes, 2);
  let received = "";
  const prompt = (value: string, revision = 0) => (
    <PromptDialog
      testId="p"
      open
      title="Prompt"
      value={value}
      revision={revision}
      validate={(v) => (v.trim() ? null : "Required")}
      onOpenChange={() => closes++}
      onSubmit={(v) => {
        received = v;
        return pending();
      }}
    />
  );
  await render(prompt(""));
  await press("p-input", "enter");
  assert.equal(await text("p-error"), "Required");
  await fill("p-input", "Snapshot");
  await press("p-input", "tab");
  assert(!root.renderer.getPaintedText().includes("Snapshot\t"));
  await click("p-submit");
  assert.equal(received, "Snapshot");
  const prior = closes;
  await press("p-cancel", "enter");
  await key("escape");
  assert.equal(closes, prior);
  await render(prompt("External", 1));
  resolveAction();
  await settle();
  assert.equal(closes, prior);
  assert(root.renderer.getPaintedText().includes("External"));
  await fill("p-input", "Retry");
  await click("p-submit");
  rejectAction(Error("hidden"));
  await settle();
  assert(get("p-error"));
  assert(!root.renderer.getPaintedText().includes("hidden"));
  await click("p-submit");
  resolveAction();
  await settle();
  assert.equal(closes, prior + 1);
  await render(
    <Dialog
      testId="empty"
      open
      showClose={false}
      title="Empty"
      onOpenChange={() => closes++}
    />,
  );
  const empty = closes;
  await key("tab");
  await key("escape");
  assert.equal(
    closes,
    empty + 1,
    "Empty modal retains a keyboard close target",
  );
  await render(<Siblings />);
  await click("first-close");
  assert(
    get("first") && get("second"),
    "Top backdrop blocks lower modal controls",
  );
  await key("escape");
  assert(!get("second"));
  assert(get("first"));
  // 没有显式恢复引用的独立兄弟层不承诺自动聚焦；用首层控件继续验证。
  await press("first-close", "escape");
  assert(!get("first"));
  await render(<Nested />);
  const child = await app.getByTestId("child").bounds();
  assert(Math.abs(child.x) <= 1);
  assert.equal(child.height, 718); // Native bounds exclude the one-pixel border.
  await press("child-input", "tab");
  await key("enter");
  assert(!get("child"));
  assert(get("parent"));
  await key("enter");
  assert(get("child"));
  dropAll();
  await settle();
  assert(!get("parent"));
  assert(!get("child"));
  await key("enter");
  assert(
    get("parent") && get("child"),
    "Whole branch close restores the outer trigger",
  );
  await key("escape");
  assert(!get("child"));
  await key("escape");
  assert(!get("parent"));
  await render(
    <Drawer
      testId="bounds"
      open
      onOpenChange={() => {}}
      title={"Long title ".repeat(40)}
      description={"Long description ".repeat(40)}
      width={9999}
      height={9999}
    >
      <Text>Body</Text>
    </Drawer>,
  );
  const b = await app.getByTestId("bounds").bounds();
  assert(b.x >= 0 && b.width <= 1000 && b.height <= 720);
  await app.screenshot({ path: resolve("artifacts/modals-states.png") });
  let task: ProgressTask = {
    id: "job",
    title: "Running",
    status: "running",
    cancellable: true,
  };
  const progress = () => (
    <ProgressDialog
      testId="progress"
      open
      onOpenChange={() => closes++}
      title="Task"
      task={task}
      onTaskAction={async (_, action) => {
        received = action;
      }}
    />
  );
  await render(progress());
  const active = closes;
  await press("progress-done", "enter");
  await key("escape");
  assert.equal(closes, active);
  await click("progress-task-cancel");
  assert.equal(received, "cancel");
  assert.equal(await text("progress-task-status"), "running");
  task = { ...task, status: "succeeded" };
  await render(progress());
  await click("progress-done");
  assert.equal(closes, active + 1);
  console.log(
    "PASS modal states: async failure/retry/duplicate/stale/unmount, prompt snapshots, empty focus, sibling shielding, nested branch restoration, bounds and controlled progress",
  );
} finally {
  root.render(null);
  await app.close();
}
