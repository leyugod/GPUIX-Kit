import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { CollectionsGallery } from "@mirai/gallery/collections";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
const root = createTestRoot({ width, height });
root.render(<CollectionsGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
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
const text = (id: string) => app.getByTestId(id).textContent();
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/collections-" + name + (narrow ? "-narrow" : "") + ".png",
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
  return b;
};
try {
  await settle();
  await shot("grid-dark");
  await fits("collections-grid");
  await fits("collections-more-button");
  await click("collections-grid-item-item-0");
  await press("collections-grid", "right");
  assert.equal(await text("collections-selected"), "item-1");
  await press("collections-grid", "right");
  await press("collections-grid", "right");
  assert.equal(await text("collections-selected"), "item-4", "skips disabled");
  await press("collections-grid", "enter");
  assert((await text("collections-event")).startsWith("Opened"));
  await press("collections-grid", "end");
  assert.equal(await text("collections-selected"), "item-11");
  await fits("collections-grid-item-item-11");
  await press("collections-grid", "home");
  await click("collections-tree-toggle-remote");
  assert(
    (await text("collections-tree-row-remote")).includes("Sample load failed"),
  );
  await shot("tree-error-dark");
  await click("collections-tree-retry-remote");
  assert(get("collections-tree-item-shared-a"));
  await click("collections-tree-item-shared-a");
  await press("collections-tree", "left");
  await press("collections-tree", "left");
  assert(!get("collections-tree-item-shared-a"));
  await press("collections-tree", "right");
  assert(get("collections-tree-item-shared-a"));
  await click("collections-more-button");
  assert(get("collections-more-error"));
  await fits("collections-more-button");
  await shot("load-error-dark");
  await click("collections-more-button");
  assert.equal(await text("collections-count"), "18 local items");
  await click("collections-more-button");
  assert.equal(await text("collections-count"), "24 local items");
  await click("collections-more-button");
  assert.equal(await text("collections-count"), "24 local items");
  await click("collections-status-error");
  await click("collections-state-retry");
  assert(get("collections-state-error"));
  await fits("collections-state-retry");
  await shot("resource-error-dark");
  await click("collections-state-retry");
  assert(get("collections-grid"));
  await click("collections-theme-light");
  await shot("grid-light");
  await click("collections-view-list");
  await click("collections-list-item-1");
  assert.equal(await text("collections-selected"), "item-1");
  await click("collections-refresh");
  assert(get("collections-list-refreshing"));
  assert(get("collections-list-item-1"));
  await shot("list-light");
  await click("collections-status-loading");
  assert(get("collections-list-state"));
  assert(!get("collections-list-item-1"));
  await shot("loading-light");
  await click("collections-status-empty");
  assert((await text("collections-list-state")).includes("No items"));
  await shot("empty-light");
  await click("collections-status-ready");
  assert.equal(await text("collections-selected"), "item-1");
  await click("collections-theme-dark");
  await shot("list-dark");
  console.log(
    "PASS collections gallery " +
      width +
      "x" +
      height +
      ": collection navigation/scroll/selection, tree failure/retry, paged load/end, list loading/empty/refreshing, themes and bounds",
  );
} finally {
  root.render(null);
  await app.close();
}
