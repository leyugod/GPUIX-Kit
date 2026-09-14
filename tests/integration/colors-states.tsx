import assert from "node:assert/strict";
import { useState } from "react";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Input,
  Button,
  Dialog,
  ColorField,
  ColorPanel,
  ColorPalette,
  ColorPicker,
  ColorSwatch,
  defaultPalette,
  type PaletteColor,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 720 }),
  app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
let changes: string[] = [];
function Fixture({
  value = "#12345680",
  disabled = false,
  readOnly = false,
  allowAlpha = true,
}: {
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  allowAlpha?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [input, setInput] = useState("");
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24, width: 340 }}>
          <ColorPicker
            testId="pick"
            value={value}
            onValueChange={(v) => changes.push(v ?? "null")}
            open={open}
            onOpenChange={setOpen}
            disabled={disabled}
            readOnly={readOnly}
            allowAlpha={allowAlpha}
            clearable
          />
          <Input
            testId="outside"
            value={input}
            onValueChange={setInput}
            style={{ width: 240, marginLeft: 360 }}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function PaletteFixture({
  items = defaultPalette,
  readOnly = false,
  disabled = false,
  allowAlpha = true,
}: {
  items?: readonly PaletteColor[];
  readOnly?: boolean;
  disabled?: boolean;
  allowAlpha?: boolean;
}) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <ColorPalette
            testId="pal"
            items={items}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            allowAlpha={allowAlpha}
            onValueChange={(v) => {
              changes.push(v);
              setValue(v);
            }}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function Fields({
  disabled = false,
  readOnly = false,
}: {
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState("#abc"),
    [next, setNext] = useState("");
  return (
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24, width: 320 }}>
          <ColorField
            testId="field"
            value={value}
            onValueChange={(v) => {
              setValue(v);
              changes.push("raw:" + v);
            }}
            onValueCommit={(v) => changes.push(v)}
            disabled={disabled}
            readOnly={readOnly}
          />
          <Input testId="after" value={next} onValueChange={setNext} />
        </Stack>
      </AppShell>
    </UIKitProvider>
  );
}
function InvalidPaletteDialog() {
  const [open, setOpen] = useState(true);
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <Dialog
            testId="invalid-dialog"
            title="Palette"
            open={open}
            onOpenChange={setOpen}
          >
            <ColorPalette
              testId="invalid-palette"
              items={[{ id: "bad", label: "Bad", value: "red" }]}
              value={null}
              onValueChange={() => {}}
            />
          </Dialog>
        }
      />
    </UIKitProvider>
  );
}
function Nested() {
  const [dialog, setDialog] = useState(true),
    [open, setOpen] = useState(false);
  return (
    <UIKitProvider>
      <AppShell
        children={null}
        overlay={
          <Dialog
            testId="dialog"
            title="Color"
            open={dialog}
            onOpenChange={setDialog}
          >
            <ColorPicker
              testId="nested"
              value="#abc"
              onValueChange={(v) => changes.push(v ?? "null")}
              open={open}
              onOpenChange={setOpen}
            />
          </Dialog>
        }
      />
    </UIKitProvider>
  );
}
try {
  root.render(<Fields />);
  await settle();
  await press("field", "tab");
  await key("x");
  assert(root.renderer.getPaintedText().includes("#abc"));
  assert(root.renderer.getPaintedText().includes("x"));
  assert.equal(changes.length, 0, "Tab does not emit a raw color draft");
  for (const props of [{ readOnly: true }, { disabled: true }]) {
    root.render(<Fields {...props} />);
    await settle();
    await press("field", "enter");
    assert.equal(changes.length, 0);
  }
  root.render(
    <PaletteFixture
      items={Array.from({ length: 96 }, (_, i) => ({
        id: String(i),
        label: "Color " + i,
        value: "#123456",
      }))}
    />,
  );
  await settle();
  let count = 0;
  for (let i = 0; i < 96; i++) if (get("pal-item-" + i)) count++;
  assert.equal(count, 12);
  await press("pal-grid", "end");
  assert(get("pal-item-95"));
  assert(!get("pal-item-0"));
  root.render(
    <PaletteFixture items={[{ id: "single", label: "One", value: "#fff" }]} />,
  );
  await settle();
  await key("enter");
  assert.equal(changes.at(-1), "#FFFFFF", "Shrinking palette repairs cursor");
  root.render(<PaletteFixture items={[]} />);
  await settle();
  await press("pal-grid", "end");
  await key("enter");
  assert.equal(await text("pal-active"), "No colors available");
  root.render(
    <PaletteFixture
      items={[
        { id: "dup", label: "A", value: "#fff" },
        { id: "dup", label: "B", value: "#000" },
      ]}
    />,
  );
  await settle();
  assert((await text("pal-active")).includes("unique"));
  root.render(
    <PaletteFixture items={[{ id: "bad", label: "Bad", value: "red" }]} />,
  );
  await settle();
  assert((await text("pal-active")).includes("hexadecimal"));
  const before: number = changes.length;
  for (const props of [{ readOnly: true }, { disabled: true }]) {
    root.render(<PaletteFixture {...props} />);
    await settle();
    await press("pal-grid", "end");
    await key("enter");
    await click("pal-item-transparent");
    assert.equal(changes.length, before);
  }
  root.render(<PaletteFixture allowAlpha={false} />);
  await settle();
  await press("pal-grid", "end");
  await key("enter");
  assert.equal(changes.at(-1), "#F43F5E");
  root.render(<Fixture />);
  await settle();
  await click("pick-trigger");
  await fill("pick-panel-hex", "#abcdef");
  root.render(<Fixture value="#112233" />);
  await settle();
  await click("pick-apply");
  assert.equal(
    changes.at(-1),
    "#112233",
    "External value replaces pending draft",
  );
  await click("pick-trigger");
  await fill("pick-panel-hex", "#ff0000");
  const unchanged: number = changes.length;
  await click("outside");
  await key("z");
  assert(!get("pick-popup"));
  assert.equal(changes.length, unchanged);
  assert(root.renderer.getPaintedText().includes("z"));
  for (const props of [{ readOnly: true }, { disabled: true }]) {
    root.render(<Fixture {...props} />);
    await settle();
    await press("pick-trigger", "enter");
    assert(!get("pick-popup"));
  }
  root.render(<Fixture allowAlpha={false} />);
  await settle();
  await click("pick-trigger");
  assert(get("pick-panel-hex-error"));
  assert(!get("pick-panel-a"));
  await press("pick-apply", "enter");
  assert(get("pick-popup"));
  await click("pick-panel-mode-palette");
  await press("pick-panel-palette-grid", "end");
  await key("enter");
  await click("pick-apply");
  assert.equal(changes.at(-1), "#F43F5E");
  root.render(<InvalidPaletteDialog />);
  await settle();
  await press("invalid-palette-grid", "escape");
  assert(!get("invalid-dialog-close"), "Invalid palette retains Escape route");
  root.render(<Nested />);
  await settle();
  await click("nested-trigger");
  await press("nested-panel-hex", "tab");
  await key("tab");
  await key("tab");
  await key("right");
  assert.equal(
    await text("nested-panel-r-value"),
    "171",
    "Tab skips hidden palette and reaches R channel after mode controls",
  );
  await click("nested-panel-mode-palette");
  await press("nested-panel-palette-grid", "tab");
  await key("tab");
  await key("enter");
  assert(!get("nested-popup"), "Palette Tab passes Next and reaches Cancel");
  assert(get("dialog-close"));
  await key("escape");
  assert(!get("dialog-close"));
  root.render(<Fixture value="#12345680" />);
  await settle();
  await click("pick-trigger");
  const thumb = await app.getByTestId("pick-panel-r-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(thumb.x + 10, thumb.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(thumb.x + 60, thumb.y + 10, 0);
  await settle();
  assert.notEqual(await text("pick-panel-r-value"), "18");
  await key("escape");
  assert.equal(await text("pick-panel-r-value"), "18");
  assert(get("pick-popup"), "First Escape cancels drag only");
  root.renderer.nativeSimulateMouseUp(thumb.x + 60, thumb.y + 10, 0);
  await settle();
  await key("escape");
  assert(!get("pick-popup"));
  await click("pick-trigger");
  const released = await app.getByTestId("pick-panel-r-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(released.x + 10, released.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(released.x + 30, released.y + 10, 0);
  await settle();
  root.renderer.nativeSimulateMouseUp(released.x + 30, released.y + 10, 0);
  await settle();
  const releaseValue = Number(await text("pick-panel-r-value"));
  await key("right");
  assert.equal(
    Number(await text("pick-panel-r-value")),
    releaseValue + 1,
    "Release restores thumb keyboard focus",
  );
  const tabThumb = await app.getByTestId("pick-panel-r-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(tabThumb.x + 10, tabThumb.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(tabThumb.x + 40, tabThumb.y + 10, 0);
  await settle();
  await key("tab");
  assert.equal(Number(await text("pick-panel-r-value")), releaseValue + 1);
  root.renderer.nativeSimulateMouseUp(tabThumb.x + 40, tabThumb.y + 10, 0);
  await settle();
  await key("right");
  assert.equal(
    await text("pick-panel-g-value"),
    "53",
    "Capture Tab cancels and advances to G",
  );
  await key("escape");
  root.render(
    <UIKitProvider>
      <AppShell>
        <Stack style={{ padding: 24 }}>
          <ColorSwatch testId="invalid" value="rgb(1,2,3)" />
          <ColorSwatch testId="none" value={null} />
          <ColorPanel
            testId="readonly"
            value="#12345680"
            readOnly
            onValueChange={(v) => changes.push(v)}
          />
        </Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
  assert.equal(await text("invalid-status"), "?");
  assert.equal(await text("none-status"), "—");
  const locked: number = changes.length;
  await press("readonly-r-thumb-0", "end");
  await press("readonly-hex", "enter");
  assert.equal(changes.length, locked);
  await app.screenshot({ path: resolve("artifacts/colors-states.png") });
  console.log(
    "PASS: palette bounds/mutations, invalid/empty/readOnly/disabled/opaque states, external draft replacement, Tab focus, nested Escape, outside cancellation and native slider drag rollback",
  );
} finally {
  root.render(null);
  await app.close();
}
