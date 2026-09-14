import assert from "node:assert/strict";
import { useState } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  Slider,
  RangeSlider,
  Button,
  Dialog,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 900, height: 800 });
const app = await connectTest(root.renderer);
let changes = 0,
  commits = 0,
  nextCalls = 0;
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
function Cases() {
  return (
    <UIKitProvider>
      <AppShell>
        <Stack>
          <Slider
            testId="too-many"
            value={0.5}
            min={0}
            max={1}
            step={0.001}
            trackPress
            onValueChange={() => changes++}
          />
          <Slider
            testId="fine"
            value={0.5}
            min={0}
            max={1}
            step={0.001}
            onValueChange={() => changes++}
          />
          <Slider
            testId="bad-marks"
            value={10}
            marks={[{ value: 0 }, { value: 0 }]}
            onValueChange={() => changes++}
          />
          <Slider
            testId="constant"
            value={5}
            min={5}
            max={5}
            trackPress
            marks={[{ value: 5, label: "Fixed" }]}
            onValueChange={() => changes++}
          />
          <Slider
            testId="external"
            value={20}
            step={10}
            trackPress
            onValueChange={() => changes++}
            onValueCommit={() => commits++}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Bounded() {
  const [value, setValue] = useState(0),
    [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 45 }}>
          <Slider
            testId="irregular"
            min={0}
            max={10}
            step={3}
            value={value}
            onValueChange={setValue}
            trackPress
            marks={[
              { value: 0, label: "Minimum with a very long label" },
              { value: 5, label: "Off-grid" },
              { value: 10, label: "Maximum with a very long label" },
            ]}
          />
          <RangeSlider
            testId="tie"
            value={range}
            onValueChange={setRange}
            step={10}
            trackPress
          />
          <Slider
            testId="max-stops"
            value={0}
            min={0}
            max={1}
            step={0.005}
            trackPress
            onValueChange={() => {}}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Scrolled() {
  const [value, setValue] = useState(0);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack
          testId="scroller"
          style={{ height: 160, width: 400, overflowY: "scroll" }}
        >
          <div style={{ height: 200, flexShrink: 0 }} />
          <Slider
            testId="scroll-track"
            value={value}
            step={10}
            trackPress
            onValueChange={setValue}
          />
          <div style={{ height: 100, flexShrink: 0 }} />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Nested({ readOnly = true }: { readOnly?: boolean }) {
  const [value, setValue] = useState(20),
    [open, setOpen] = useState(true);
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <Dialog
            testId="dialog"
            title="Slider focus"
            open={open}
            onOpenChange={setOpen}
          >
            <Slider
              testId="nested"
              value={value}
              readOnly={readOnly}
              onValueChange={setValue}
              onValueCommit={() => commits++}
              step={10}
              trackPress
            />
            <Text testId="nested-value-external">{String(value)}</Text>
            <Button testId="next" onPress={() => nextCalls++}>
              Next
            </Button>
          </Dialog>
        }
      />
    </UIKitProvider>
  );
}
try {
  root.render(<Cases />);
  await settle();
  assert(get("too-many-error"));
  assert(!get("too-many-stop-0"));
  assert(!get("fine-error"));
  assert(!get("fine-stop-0"));
  assert(get("bad-marks-error"));
  await click("constant-stop-0");
  assert.equal(changes, 0);
  await click("external-stop-8");
  assert.equal(changes, 1);
  assert.equal(commits, 1);
  assert.equal(
    await app.getByTestId("external-value").textContent(),
    "20",
    "External controlled values are never overwritten",
  );
  root.render(<Bounded />);
  await settle();
  assert(get("max-stops-stop-200"));
  assert(!get("max-stops-stop-201"));
  await click("irregular-stop-4");
  assert.equal(await app.getByTestId("irregular-value").textContent(), "10");
  await click("irregular-stop-1");
  assert.equal(await app.getByTestId("irregular-value").textContent(), "3");
  await press("tie-thumb-1", "tab");
  await click("tie-stop-5");
  assert.equal(
    await app.getByTestId("tie-value").textContent(),
    "20 – 50",
    "Equidistant track click follows previously focused thumb",
  );
  const track = await app.getByTestId("irregular-track").bounds();
  for (const mark of [0, 5, 10]) {
    const b = await app.getByTestId(`irregular-mark-label-${mark}`).bounds();
    assert(b.x >= track.x - 1 && b.x + b.width <= track.x + track.width + 1);
  }
  const middle = await app.getByTestId("irregular-mark-label-5").bounds();
  assert(
    Math.abs(middle.x + middle.width / 2 - (track.x + track.width / 2)) < 1,
    "Interior label centers on its mark",
  );
  root.render(
    <UIKitProvider>
      <AppShell>
        <Slider
          testId="dense"
          value={50}
          length={80}
          orientation="vertical"
          marks={Array.from({ length: 51 }, (_, i) => ({
            value: i * 2,
            label: String(i * 2),
          }))}
          onValueChange={() => {}}
        />
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert(get("dense-mark-50"));
  assert(
    !get("dense-mark-label-50"),
    "Dense labels are omitted without losing marks",
  );
  root.render(<Scrolled />);
  await settle();
  root.renderer.scrollTo(get("scroller")!.id, 0, -180);
  await settle();
  await click("scroll-track-stop-8");
  assert.equal(
    await app.getByTestId("scroll-track-value").textContent(),
    "80",
    "Native track hit regions remain correct after ancestor scrolling",
  );
  root.render(<Nested />);
  await settle();
  await press("nested-thumb-0", "right");
  assert.equal(
    await app.getByTestId("nested-value-external").textContent(),
    "20",
  );
  await press("nested-thumb-0", "tab");
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert.equal(nextCalls, 1);
  root.render(<Nested readOnly={false} />);
  await settle();
  const thumb = await app.getByTestId("nested-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(thumb.x + 10, thumb.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(thumb.x + 62, thumb.y + 10, 0);
  await settle();
  assert(get("nested-drag"));
  root.render(<Nested readOnly />);
  await settle();
  assert(!get("nested-drag"));
  const before = commits;
  root.renderer.nativeSimulateMouseUp(thumb.x + 62, thumb.y + 10, 0);
  await settle();
  assert.equal(commits, before);
  await press("nested-thumb-0", "escape");
  assert(!get("dialog"));
  console.log(
    "PASS tracks stop cap/fine-step fallback, invalid marks, constant/external ownership, irregular max, tie preference, label bounds, read-only focus and drag cancellation",
  );
} finally {
  root.render(null);
  await app.close();
}
