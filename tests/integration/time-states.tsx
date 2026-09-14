import assert from "node:assert/strict";
import { useState, useRef } from "react";
import type { PublicInstance } from "@gpuix/react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Button,
  Dialog,
  TimeField,
  TimeList,
  TimePicker,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 900, height: 800 });
const app = await connectTest(root.renderer);
let calls = 0,
  following = 0;
const changed = () => {
  calls++;
};
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const key = async (key: string) => {
  root.renderer.simulateKeystrokes(key);
  await settle();
};
function States() {
  return (
    <UIKitProvider>
      <AppShell>
        <Stack>
          <TimeField
            testId="readonly"
            value="10:00"
            readOnly
            onValueChange={changed}
            onValueCommit={changed}
          />
          <TimeField
            testId="bad-field"
            value="09:00"
            stepMinutes={0}
            onValueChange={changed}
            onValueCommit={changed}
          />
          <TimePicker
            testId="bad-picker"
            value="24:00"
            min="23:00"
            max="01:00"
            onValueChange={changed}
          />
          <TimePicker
            testId="readonly-picker"
            value="09:00"
            readOnly
            onValueChange={changed}
          />
          <TimeList
            testId="empty"
            value={null}
            isTimeDisabled={() => true}
            onValueChange={changed}
          />
          <TimeList
            testId="readonly-list"
            value="00:00"
            min="00:00"
            max="00:01"
            readOnly
            onValueChange={changed}
          />
          <TimeList
            testId="held-list"
            value={null}
            min="00:00"
            max="00:01"
            onValueChange={changed}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested() {
  const [open, setOpen] = useState(true),
    [value, setValue] = useState("09:00"),
    [time, setTime] = useState<string | null>("09:00");
  const trigger = useRef<PublicInstance>(null);
  return (
    <UIKitProvider>
      <AppShell
        overlay={
          <Dialog
            testId="outer"
            title="Schedule"
            open={open}
            onOpenChange={setOpen}
            restoreFocusRef={trigger}
          >
            <TimeField
              testId="nested-field"
              value={value}
              onValueChange={setValue}
              min="09:00"
              max="10:00"
              stepMinutes={15}
            />
            <Text testId="draft">{value}</Text>
            <Button
              testId="after"
              onPress={() => {
                following++;
              }}
            >
              Following
            </Button>
            <TimePicker
              testId="empty-picker"
              value={null}
              onValueChange={changed}
              isTimeDisabled={() => true}
            />
            <TimePicker
              testId="nested-picker"
              value={time}
              onValueChange={setTime}
            />
          </Dialog>
        }
      >
        <Button
          testId="outer-trigger"
          ref={trigger}
          onPress={() => setOpen(true)}
        >
          Schedule
        </Button>
      </AppShell>
    </UIKitProvider>
  );
}
try {
  root.render(<States />);
  await settle();
  await press("readonly", "up");
  await press("readonly", "enter");
  await press("readonly-increment", "enter");
  await press("bad-field-increment", "enter");
  await press("bad-field", "enter");
  assert(get("bad-field-error"));
  assert(get("bad-picker-error"));
  assert(get("empty-empty"));
  assert(!get("empty-list"));
  await press("bad-picker-trigger", "enter");
  assert(!get("bad-picker-popup"));
  await press("readonly-picker-trigger", "enter");
  assert(!get("readonly-picker-popup"));
  await press("readonly-list-list", "end");
  await key("enter");
  assert.equal(calls, 0);
  const held = get("held-list-list")!;
  root.renderer.nativeSimulateKeyDown(held.id, "enter", true);
  await settle();
  assert.equal(calls, 0);
  const b = await app.getByTestId("held-list-option-00:00").bounds();
  root.renderer.nativeSimulateClick(b.x + 10, b.y + 10, 2);
  await settle();
  assert.equal(calls, 0);
  await press("held-list-list", "end");
  await key("enter");
  assert.equal(calls, 1);
  root.render(<Nested />);
  await settle();
  const before = get("nested-field")!.id;
  await press("nested-field", "tab");
  assert.equal(await app.getByTestId("draft").textContent(), "09:00");
  assert.notEqual(get("nested-field")!.id, before);
  // 下限使减号不可聚焦；输入后的下一项是加号，随后到 Following。
  await key("tab");
  await key("enter");
  assert.equal(
    following,
    1,
    "Tab preserves component focus order after editor recreation",
  );
  await press("nested-picker-trigger", "enter");
  assert(get("nested-picker-popup"));
  await key("escape");
  assert(!get("nested-picker-popup"));
  assert(get("outer"));
  await key("escape");
  assert(!get("outer"));
  await key("enter");
  assert(get("outer"));
  await press("empty-picker-trigger", "enter");
  assert(get("empty-picker-popup"));
  assert(get("empty-picker-times-empty"));
  await key("escape");
  assert(!get("empty-picker-popup"));
  assert(get("outer"), "Empty popup handles Escape before outer Dialog");
  root.render(
    <UIKitProvider>
      <AppShell>
        <TimePicker testId="dynamic" value={null} onValueChange={changed} />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  await press("dynamic-trigger", "enter");
  assert(get("dynamic-popup"));
  root.render(
    <UIKitProvider>
      <AppShell>
        <TimePicker
          testId="dynamic"
          value={null}
          disabled
          onValueChange={changed}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert(!get("dynamic-popup"));
  assert.equal(calls, 1);
  console.log(
    "PASS time invalid/empty/read-only/held/right-click, nested Escape, Tab draft and focus order, dynamic disable",
  );
} finally {
  root.render(null);
  await app.close();
}
