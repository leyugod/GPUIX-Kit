import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ModalsGallery } from "@mirai/gallery/modals";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
const root = createTestRoot({ width, height });
root.render(<ModalsGallery />);
const app = await connectTest(root.renderer);
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
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/modals-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
const bounds = async (id: string) => {
  const b = await app.getByTestId(id).bounds();
  assert(
    b.x >= 0 &&
      b.y >= 0 &&
      b.x + b.width <= width + 1 &&
      b.y + b.height <= height + 1,
    id + " fits window",
  );
  return b;
};
try {
  await settle();
  await shot("dark");
  await click("open-alert");
  await bounds("alert");
  await shot("alert-dark");
  await key("enter");
  assert(!get("alert"));
  await key("enter");
  assert(get("alert"));
  await key("escape");
  assert(!get("alert"));
  await click("open-confirm");
  await key("enter");
  assert(!get("confirm"));
  assert.equal(
    await text("modals-event"),
    "Ready",
    "Cancel is the initial confirmation target",
  );
  await click("open-confirm");
  await shot("confirm-dark");
  await click("confirm-confirm");
  assert(!get("confirm"));
  assert.equal(await text("modals-event"), "confirmed");
  await click("open-prompt");
  await fill("prompt-input", "");
  await press("prompt-input", "enter");
  assert(get("prompt-error"));
  await fill("prompt-input", "New workspace");
  await shot("prompt-dark");
  await press("prompt-input", "enter");
  assert(!get("prompt"));
  assert.equal(await text("modals-event"), "renamed");
  await click("open-sheet");
  const sheet = await bounds("sheet");
  assert(Math.abs(sheet.y) <= 1);
  await fill("sheet-input", "Preserved settings");
  await shot("sheet-dark");
  await click("sheet-color-trigger");
  assert(get("sheet-color-popup"));
  await key("escape");
  assert(!get("sheet-color-popup"));
  assert(get("sheet"));
  await click("sheet-nested");
  await bounds("nested");
  await shot("nested-dark");
  await key("escape");
  assert(!get("nested"));
  assert(get("sheet"));
  await key("enter");
  assert(get("nested"));
  await click("nested-done");
  assert(!get("nested"));
  await click("sheet-save");
  assert(!get("sheet"));
  assert.equal(await text("modals-event"), "sheet:saved");
  await click("open-drawer");
  const drawer = await bounds("drawer");
  assert(Math.abs(drawer.x + drawer.width - width) <= 1);
  assert.equal(drawer.height, height - 2);
  await shot("drawer-dark");
  await click("drawer-done");
  assert(!get("drawer"));
  await click("open-progress");
  await key("escape");
  assert(get("progress"));
  await click("progress-task-pause");
  assert.equal(await text("progress-task-status"), "paused");
  await click("progress-task-resume");
  assert.equal(await text("progress-task-status"), "running");
  await shot("progress-dark");
  await click("progress-task-cancel");
  assert.equal(await text("progress-task-status"), "cancelled");
  await click("progress-done");
  assert(!get("progress"));
  await click("modals-theme-light");
  await shot("light");
  for (const kind of [
    "alert",
    "confirm",
    "prompt",
    "sheet",
    "drawer",
    "progress",
  ]) {
    await click("open-" + kind);
    await bounds(kind);
    await shot(kind + "-light");
    if (kind === "progress") {
      await click("progress-task-cancel");
      await click("progress-done");
    } else await key("escape");
    assert(!get(kind));
  }
  console.log(
    "PASS modal gallery",
    width + "x" + height,
    "six components, themes, nested focus, size/edge bounds and task actions",
  );
} finally {
  root.render(null);
  await app.close();
}
