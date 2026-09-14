import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { FiltersGallery } from "@mirai/gallery/filters";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
const root = createTestRoot({ width, height });
root.render(<FiltersGallery />);
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
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
const choose = async (id: string, value: string) => {
  await click(id);
  await click(id + "-item-" + value);
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/filters-" + name + (narrow ? "-narrow" : "") + ".png",
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
  assert.equal(await text("filters-count"), "2 matching records");
  await fill("filters-panel-builder-title-rule-value", "Research");
  assert.equal(await text("filters-count"), "2 matching records");
  await click("filters-panel-cancel");
  assert.equal(
    get("filters-panel-builder-title-rule-value")!.customProps?.value,
    "Design",
  );
  await click("filters-panel-builder-add");
  assert(get("filters-panel-error"));
  await choose("filters-panel-builder-condition-1-field", "amount");
  await choose("filters-panel-builder-condition-1-operator", "gt");
  await fill("filters-panel-builder-condition-1-value", "100");
  await fits("filters-panel-apply");
  await click("filters-panel-apply");
  assert.equal(await text("filters-count"), "1 matching records");
  await click("filters-panel-builder-match-any");
  await click("filters-panel-apply");
  assert.equal(await text("filters-count"), "3 matching records");
  await shot("conditions-dark");
  assert((await text("filters-views-status")).includes("Unsaved"));
  await fill("filters-views-name", "Priority");
  await click("filters-views-create");
  assert(get("filters-views-save-error"));
  await shot("save-error-dark");
  await click("filters-views-create");
  assert((await text("filters-event")).includes("Created Priority"));
  await fill("filters-views-name", "Priority renamed");
  await click("filters-views-rename");
  assert((await text("filters-event")).includes("Renamed Priority renamed"));
  await click("filters-views-update");
  assert((await text("filters-event")).includes("Updated created-2"));
  await click("filters-views-remove");
  assert((await text("filters-event")).includes("Deleted created-2"));
  await choose("filters-views-select", "all");
  assert.equal(await text("filters-count"), "3 matching records");
  await click("filters-views-remove");
  assert(
    (await text("filters-event")).includes("Selected all"),
    "readonly view protected",
  );
  await click("filters-theme-light");
  await shot("readonly-light");
  await click("filters-views-select");
  await click("filters-views-select-next");
  assert(get("filters-views-select-item-view-6"));
  await shot("menu-light");
  await click("filters-views-select-item-view-6");
  assert((await text("filters-event")).includes("Selected view-6"));
  await click("filters-views-select");
  await click("filters-views-select-previous");
  await click("filters-views-select-item-design");
  await click("filters-summary-title-rule-remove");
  assert.equal(await text("filters-count"), "3 matching records");
  assert(get("filters-panel-builder-empty"));
  await shot("empty-light");
  await fits("filters-views-create");
  await fits("filters-panel-apply");
  console.log(
    "PASS filters gallery " +
      width +
      "x" +
      height +
      ": draft/apply/cancel, typed conditions, all/any, saved view failure/retry/create/update/rename/remove/protection/pagination, summaries and themes",
  );
} finally {
  root.render(null);
  await app.close();
}
