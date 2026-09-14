import { useRef, useState } from "react";
import type { PublicInstance } from "@gpuix/react";
import assert from "node:assert/strict";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Button,
  Dialog,
  ComboBox,
  MultiSelect,
  SplitView,
  Text,
  NumberField,
  CommandPalette,
} from "@mirai/gpuix-kit";
let calls = 0;
function Fixture() {
  const [value, setValue] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [size, setSize] = useState(120);
  const trigger = useRef<PublicInstance>(null);
  return (
    <UIKitProvider>
      <AppShell
        overlay={
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title="Nested selection"
            testId="modal"
            restoreFocusRef={trigger}
          >
            <ComboBox
              testId="nested"
              options={[{ value: "a", label: "Alpha" }]}
              value={value}
              onValueChange={setValue}
            />
          </Dialog>
        }
      >
        <Stack style={{ padding: 20 }}>
          <Button testId="open" ref={trigger} onPress={() => setOpen(true)}>
            Open
          </Button>
          <ComboBox
            testId="disabled"
            disabled
            options={[{ value: "a", label: "Alpha" }]}
            value={null}
            onValueChange={() => calls++}
          />
          <ComboBox
            testId="loading"
            loading
            options={[{ value: "a", label: "Alpha" }]}
            value={null}
            onValueChange={() => calls++}
          />
          <MultiSelect
            testId="empty"
            options={[]}
            value={[]}
            onValueChange={() => calls++}
          />
          <NumberField
            testId="number"
            min={0}
            max={1}
            step={0.1}
            value={1}
            onValueChange={() => calls++}
          />
          <SplitView
            testId="vertical"
            orientation="vertical"
            size={size}
            onSizeChange={setSize}
            minSize={80}
            maxSize={160}
            style={{ height: 260 }}
            primary={<Text>Primary</Text>}
          >
            <Text>Secondary</Text>
          </SplitView>
          <SplitView
            testId="collapsed"
            collapsed
            size={100}
            onSizeChange={() => calls++}
            style={{ height: 60 }}
            primary={<Text>Hidden</Text>}
          >
            <Text>Visible</Text>
          </SplitView>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function LongSearch() {
  const options = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: `Option ${i}`,
  }));
  const [value, setValue] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell
        overlay={
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            testId="long-command"
            commands={options.map((o) => ({
              id: o.value,
              label: o.label,
              run: () => setValue(o.value),
            }))}
          />
        }
      >
        <Stack style={{ padding: 20 }}>
          <ComboBox
            testId="long"
            options={options}
            value={value}
            onValueChange={setValue}
          />
          <Button testId="long-open" onPress={() => setOpen(true)}>
            Commands
          </Button>
          <Text testId="long-value">{value ?? "none"}</Text>
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
const root = createTestRoot({ width: 700, height: 800 });
root.render(<Fixture />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const get = (id: string) => root.renderer.findByTestId(id);
try {
  await settle();
  await press("disabled", "down");
  assert(!get("disabled-popup"));
  await press("loading", "down");
  assert(root.renderer.getPaintedText().includes("Loading…"));
  assert(!get("loading-option-a"));
  await press("loading", "enter");
  assert.equal(calls, 0);
  await press("loading", "escape");
  await press("empty", "down");
  assert(get("empty-empty"));
  await press("empty", "enter");
  assert.equal(calls, 0);
  await press("empty", "escape");
  await press("number-increment", "enter");
  assert.equal(calls, 0);
  assert(!get("collapsed-primary"));
  assert(!get("collapsed-divider"));
  await press("vertical-divider", "down");
  assert.equal(get("vertical-primary")?.style.height, 130);
  const b = await app.getByTestId("vertical-divider").bounds();
  root.renderer.nativeSimulateMouseDown(b.x + 10, b.y + 3);
  await settle();
  root.renderer.nativeSimulateMouseMove(b.x + 10, b.y + 23, 0);
  await settle();
  assert.equal(get("vertical-primary")?.style.height, 150);
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert.equal(get("vertical-primary")?.style.height, 130);
  assert(!get("vertical-drag"));
  await press("open", "enter");
  await press("nested", "down");
  assert(get("nested-popup"));
  await press("nested", "escape");
  assert(!get("nested-popup"));
  assert(get("modal"), "First Escape closes inner selection only");
  await press("nested", "escape");
  assert(!get("modal"));
  root.render(<LongSearch />);
  await settle();
  await press("long", "down");
  assert(!get("long-option-50"), "Search mounts at most 50 matching rows");
  for (let i = 0; i < 12; i++) await press("long", "down");
  const choiceBounds = await app.getByTestId("long-option-12").bounds();
  const popupBounds = await app.getByTestId("long-popup").bounds();
  // 0.7.0 的滚动节点 bounds 包含自身偏移；还原其可视窗口位置。
  const popupTop =
    popupBounds.y -
    (root.renderer.getScrollOffset(get("long-popup")!.id)?.[1] ?? 0);
  assert(
    choiceBounds.y >= popupTop &&
      choiceBounds.y + choiceBounds.height <= popupTop + popupBounds.height,
    "Keyboard highlight scrolls into popup",
  );
  await press("long", "enter");
  assert(get("long-remove-12"));
  await press("long-open", "enter");
  for (let i = 0; i < 12; i++) await press("long-command-search", "down");
  const commandBounds = await app.getByTestId("long-command-12").bounds();
  const bodyBounds = await app.getByTestId("long-command-body").bounds();
  const bodyTop =
    bodyBounds.y -
    (root.renderer.getScrollOffset(get("long-command-body")!.id)?.[1] ?? 0);
  assert(
    commandBounds.y >= bodyTop &&
      commandBounds.y + commandBounds.height <= bodyTop + bodyBounds.height,
    "Command highlight scrolls into modal body",
  );
  await press("long-command-search", "enter");
  assert(!get("long-command"));
  console.log(
    "PASS desktop empty/loading/disabled, vertical drag/cancel/collapse, nested Escape, long-list keyboard visibility",
  );
} finally {
  root.render(null);
  await app.close();
}
