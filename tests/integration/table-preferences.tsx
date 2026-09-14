import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { TablePreferencesGallery } from "@mirai/gallery/table-preferences";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
const root = createTestRoot({ width, height });
root.render(<TablePreferencesGallery />);
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
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const choose = async (id: string, value: string) => {
  await click(id);
  await click(id + "-item-" + value);
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/table-prefs-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
const fits = async (id: string) => {
  const b = await app.getByTestId(id).bounds();
  assert(
    b.x >= 0 &&
      b.y >= 0 &&
      b.x + b.width <= width + 1 &&
      b.y + b.height <= height + 1,
    id + " fits",
  );
};
try {
  await settle();
  await shot("initial-dark");
  await fits("table-prefs-panel-apply");
  const firstBounds = await app.getByTestId("table-prefs-first").bounds();
  assert(firstBounds.y + firstBounds.height <= height - 40, "table summary stays above footer: " + JSON.stringify(firstBounds));
  await choose("table-prefs-panel-visibility", "status");
  assert(
    get("table-prefs-grid-cell-row-0-status"),
    "draft does not alter visible columns",
  );
  await click("table-prefs-panel-apply");
  assert(!get("table-prefs-grid-cell-row-0-status"));
  await click("table-prefs-panel-order-down-amount");
  await click("table-prefs-panel-apply");
  assert((await text("table-prefs-state")).includes("name, owner, amount"));
  await click("table-prefs-panel-order-next");
  assert(get("table-prefs-panel-order-row-code"));
  await click("table-prefs-panel-order-previous");
  await click("table-prefs-panel-tab-sort");
  await choose("table-prefs-panel-sort-add", "amount");
  await click("table-prefs-panel-sort-direction-amount");
  await choose("table-prefs-panel-sort-add", "name");
  await click("table-prefs-panel-apply");
  assert.equal(await text("table-prefs-first"), "First: row-10");
  await shot("sort-dark");
  await click("table-prefs-panel-tab-display");
  await click("table-prefs-panel-density-compact");
  await click("table-prefs-panel-apply");
  assert((await text("table-prefs-state")).startsWith("compact"));
  const compact = (
    await app.getByTestId("table-prefs-grid-rows-row-0").bounds()
  ).height;
  assert.equal(get("table-prefs-grid-rows-row-0")!.style.height, 34);
  assert.equal(compact, 33, "native bounds exclude the bottom border");
  await press("table-prefs-grid-rows", "end");
  await fits("table-prefs-grid-cell-row-11-name");
  await click("table-prefs-theme-light");
  await shot("compact-light");
  await click("table-prefs-panel-tab-display");
  await click("table-prefs-panel-density-comfortable");
  await click("table-prefs-panel-cancel");
  assert((await text("table-prefs-state")).startsWith("compact"));
  await click("table-prefs-panel-tab-display");
  await click("table-prefs-panel-density-comfortable");
  await click("table-prefs-panel-apply");
  assert.equal(
    (await app.getByTestId("table-prefs-grid-rows-row-0").bounds()).height,
    53,
  );
  await shot("comfortable-light");
  await click("table-prefs-panel-defaults");
  await click("table-prefs-panel-apply");
  assert(get("table-prefs-grid-cell-row-0-status"));
  assert((await text("table-prefs-state")).startsWith("regular"));
  await shot("defaults-light");
  console.log(
    "PASS table preferences " +
      width +
      "x" +
      height +
      ": visibility/order/draft/cancel/defaults, priority sorts, density geometry and themes",
  );
} finally {
  root.render(null);
  await app.close();
}
