import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { DatesGallery } from "@mirai/gallery/dates";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<DatesGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const key = async (key: string) => {
  root.renderer.simulateKeystrokes(key);
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const click = async (id: string) => {
  const b = await app.getByTestId(id).bounds(),
    scroll = get("dates-scroll");
  if (!get("range-dialog") && scroll) {
    const y = root.renderer.getScrollOffset(scroll.id)?.[1] ?? 0;
    if (b.y + b.height > height - 12)
      root.renderer.scrollTo(scroll.id, 0, y - (b.y + b.height - height + 24));
    else if (b.y < 80) root.renderer.scrollTo(scroll.id, 0, y + 80 - b.y);
    await settle();
  }
  await app.getByTestId(id).click();
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/dates-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("periods-dark");
  await click("month-picker-item-2024-06");
  assert.equal(await text("month-picked"), "2024-02");
  await click("month-picker-item-2024-03");
  await key("right");
  await key("enter");
  assert.equal(await text("month-picked"), "2024-04");
  await press("month-picker-grid", "pagedown");
  assert.equal(await text("month-picker-title"), "2025");
  await click("month-picker-item-2025-03");
  assert.equal(await text("month-picked"), "2025-03");
  await press("year-picker-grid", "end");
  await key("enter");
  assert.equal(await text("year-picked"), "2025");
  await click("year-picker-next");
  await click("year-picker-item-2030");
  assert.equal(await text("year-picked"), "2030");
  await app.getByTestId("dates-name").fill("日期工作流草稿");
  await click("dates-theme-light");
  assert(root.renderer.getPaintedText().includes("日期工作流草稿"));
  await shot("periods-light");
  await click("dates-page-navigation");
  await click("quick-calendar-month-button");
  assert(get("quick-calendar-months"));
  await click("quick-calendar-months-title");
  assert(get("quick-calendar-years"));
  await click("quick-calendar-years-item-2025");
  await click("quick-calendar-months-item-2025-05");
  assert(get("quick-calendar-grid"));
  assert.equal(await text("quick-date"), "2024-02-29");
  await click("quick-calendar-day-2025-05-14");
  assert.equal(await text("quick-date"), "2025-05-14");
  await shot("navigation-light");
  await click("dates-page-duals");
  await press("dual-left-grid", "right");
  assert.equal(await text("dual-right-active"), "2024-03-01");
  await key("right");
  await key("enter");
  assert.equal(await text("dual-date"), "2024-03-02");
  assert(
    !get("dual-left-day-2024-03-01"),
    "Dual grids omit duplicate adjacent-month cells",
  );
  await click("dual-right-day-2024-03-05");
  assert.equal(await text("dual-date"), "2024-03-02");
  await press("dual-right-grid", "pagedown");
  await key("enter");
  assert.equal(await text("dual-date"), "2024-04-02");
  await shot("dual-light");
  await click("dates-theme-dark");
  await shot("dual-dark");
  await click("dates-page-ranges");
  await click("range-panel-presets-this-month");
  assert.equal(await text("range-panel-draft"), "2024-03-01 – 2024-03-31");
  assert.equal(await text("range-committed"), "2024-02-26 / 2024-03-02");
  await click("range-panel-cancel");
  assert.equal(await text("range-cancels"), "Cancelled: 1");
  assert.equal(await text("range-panel-draft"), "2024-02-26 – 2024-03-02");
  await click("range-panel-presets-last-7-days");
  await click("range-panel-apply");
  assert.equal(await text("range-committed"), "2024-03-09 / 2024-03-15");
  await click("range-panel-clear");
  await press("range-panel-apply", "enter");
  assert.equal(await text("range-committed"), "2024-03-09 / 2024-03-15");
  await click("range-panel-calendar-left-day-2024-03-28");
  await click("range-panel-calendar-right-day-2024-04-03");
  assert.equal(await text("range-panel-draft"), "2024-03-28 – 2024-04-03");
  await shot("range-dark");
  await click("range-panel-cancel");
  await click("range-dialog-trigger");
  assert(get("range-dialog"));
  await press("range-dialog-panel-presets-today", "enter");
  await shot("dialog-dark");
  await press("range-dialog-panel-cancel", "enter");
  assert(!get("range-dialog"));
  assert.equal(await text("range-committed"), "2024-03-09 / 2024-03-15");
  await key("enter");
  assert(get("range-dialog"), "Cancel restores trigger focus");
  assert.equal(
    await text("range-dialog-panel-draft"),
    "2024-03-09 – 2024-03-15",
  );
  await press("range-dialog-panel-presets-today", "enter");
  await press("range-dialog-panel-apply", "enter");
  assert(!get("range-dialog"));
  assert.equal(await text("range-committed"), "2024-03-15 / 2024-03-15");
  await click("dates-theme-light");
  await click("range-dialog-trigger");
  await shot("dialog-light");
  await press("range-dialog-panel-calendar-left-grid", "escape");
  assert(!get("range-dialog"));
  console.log(
    `PASS date periods, quick year/month navigation, dual-grid keyboard handoff, disabled dates, cross-month range drafts/presets/apply/cancel/dialog focus and themes (${narrow ? "1000x720" : "1320x920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
