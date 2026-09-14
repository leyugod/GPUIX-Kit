import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ControlsGallery } from "@mirai/gallery/controls";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<ControlsGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/controls-${name}${narrow ? "-narrow" : ""}.png`),
  });
async function drag(id: string, dx: number, dy: number, cancel = false) {
  const b = await app.getByTestId(id).bounds();
  const x = b.x + b.width / 2,
    y = b.y + b.height / 2;
  root.renderer.nativeSimulateMouseDown(x, y);
  await settle();
  root.renderer.nativeSimulateMouseMove(x + dx, y + dy, 0);
  await settle();
  if (cancel) {
    root.renderer.simulateKeystrokes("escape");
    await settle();
  }
  root.renderer.nativeSimulateMouseUp(x + dx, y + dy, 0);
  await settle();
}
try {
  await settle();
  await shot("dark");
  await app.getByTestId("controls-name").fill("保留控件草稿");
  await click("controls-theme-light");
  assert(root.renderer.getPaintedText().includes("保留控件草稿"));
  await shot("light");
  await press("volume-thumb-0", "right");
  assert.equal(await text("volume-value"), "45%");
  await press("volume-thumb-0", "end");
  assert.equal(await text("volume-value"), "100%");
  await press("volume-thumb-0", "home");
  assert.equal(await text("volume-value"), "0%");
  await drag("volume-thumb-0", 130, 0);
  assert.equal(await text("volume-value"), "50%");
  assert.equal(await text("commit-count"), "Commits: 4");
  await drag("volume-thumb-0", 52, 0, true);
  assert.equal(await text("volume-value"), "50%");
  assert.equal(await text("commit-count"), "Commits: 4");
  assert(!get("volume-drag"));
  await press("range-thumb-0", "end");
  assert.equal(await text("range-value"), "70 – 70");
  await press("range-thumb-1", "home");
  assert.equal(await text("range-value"), "70 – 70");
  await press("range-thumb-0", "home");
  assert.equal(await text("range-value"), "0 – 70");
  await drag("vertical-thumb-0", 0, -28);
  assert.equal(await text("vertical-value"), "70");
  await press("vertical-thumb-0", "down");
  assert.equal(await text("vertical-value"), "60");
  await press("decimal-thumb-0", "right");
  assert.equal(await text("decimal-value"), "0.4");
  await press("disabled-slider-thumb-0", "end");
  assert.equal(await text("disabled-slider-value"), "30");
  await click("controls-page-calendar");
  await shot("calendar-light");
  await press("calendar-grid", "right");
  assert((await text("calendar-active")).includes("2024-03-01"));
  await press("calendar-grid", "enter");
  assert.equal(await text("calendar-value"), "2024-03-01");
  await press("calendar-grid", "pageup");
  assert((await text("calendar-active")).includes("2024-02-01"));
  await click("calendar-day-2024-02-13");
  assert.equal(await text("calendar-value"), "2024-03-01");
  await click("calendar-day-2024-02-29");
  assert.equal(await text("calendar-value"), "2024-02-29");
  await click("range-calendar-day-2024-02-10");
  await click("range-calendar-day-2024-02-15");
  assert(get("range-calendar-selection-error"));
  assert.equal(await text("range-calendar-value"), "2024-02-10 / none");
  await click("range-calendar-day-2024-02-12");
  assert.equal(await text("range-calendar-value"), "2024-02-10 / 2024-02-12");
  assert(!get("range-calendar-selection-error"));
  await click("controls-theme-dark");
  await shot("calendar-dark");
  await click("controls-page-pickers");
  await click("date-picker-trigger");
  assert(get("date-picker-popover"));
  root.renderer.simulateKeystrokes("right");
  await settle();
  assert((await text("date-picker-calendar-active")).includes("2024-02-11"));
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(!get("date-picker-popover"));
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(get("date-picker-popover"), "Escape restores trigger focus");
  await click("date-picker-calendar-day-2024-02-12");
  assert.equal(await text("picked-value"), "2024-02-12");
  assert(!get("date-picker-popover"));
  await click("date-picker-clear");
  assert.equal(await text("picked-value"), "none");
  await click("range-picker-trigger");
  await click("range-picker-calendar-day-2024-02-10");
  assert(get("range-picker-popover"), "Range stays open after first endpoint");
  await click("range-picker-calendar-day-2024-02-12");
  assert(!get("range-picker-popover"));
  assert.equal(await text("picked-range-value"), "2024-02-10 / 2024-02-12");
  await click("date-picker-trigger");
  await shot("picker-dark");
  await press("date-picker-calendar-grid", "escape");
  await click("controls-theme-light");
  await click("date-picker-trigger");
  await shot("picker-light");
  await press("date-picker-calendar-grid", "escape");
  console.log(
    `PASS controls native drag/cancel/commit, range clamp, decimal/disabled, calendar leap/month/range, picker focus/clear and themes (${narrow ? 1000 : 1320}x${height})`,
  );
} finally {
  root.render(null);
  await app.close();
}
