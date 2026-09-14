import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { WorkbenchGallery } from "@mirai/gallery/workbench";
const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<WorkbenchGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((done) => setImmediate(done));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => {
  const n = root.renderer.findByTestId(id);
  assert(n, `Missing ${id}`);
  return n;
};
const click = async (id: string, modifiers?: string) => {
  if (modifiers) {
    const b = await app.getByTestId(id).bounds();
    root.renderer.nativeSimulateClick(
      b.x + 5,
      b.y + b.height / 2,
      0,
      modifiers,
    );
  } else await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
const text = () => root.renderer.getPaintedText().join("\n");
const shot = async (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/workbench-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  await fill("workbench-name", "原生工作台");
  await click("workbench-theme-light");
  assert(text().includes("原生工作台"));
  await shot("light");
  await click("workbench-grid-rows-record-0");
  await press("workbench-grid-rows", "shift-down");
  assert(
    (await app.getByTestId("workbench-grid-selection").textContent()).includes(
      "2 selected",
    ),
  );
  await press("workbench-grid-rows", "shift-down");
  assert(
    (await app.getByTestId("workbench-grid-selection").textContent()).includes(
      "3 selected",
    ),
    "Ranges skip disabled record-2",
  );
  await click("workbench-grid-all");
  assert(
    (await app.getByTestId("workbench-grid-selection").textContent()).includes(
      "5 selected",
    ),
  );
  await click("workbench-pages-next");
  get("workbench-grid-rows-record-6");
  assert(!root.renderer.findByTestId("workbench-grid-rows-record-0"));
  await click("workbench-grid-all");
  assert(
    (await app.getByTestId("workbench-grid-selection").textContent()).includes(
      "11 selected",
    ),
    "Page selection preserves other pages",
  );
  await click("workbench-grid-sort-name");
  get("workbench-grid-rows-record-14");
  await fill("workbench-filter-search", "Native keyboard");
  assert(!root.renderer.findByTestId("workbench-grid-rows-record-0"));
  get("workbench-grid-rows-record-12");
  await fill("workbench-filter-search", "no-matches");
  get("workbench-grid-rows-empty");
  await click("workbench-filter-clear");
  const resize = await app.getByTestId("workbench-grid-resize-name").bounds();
  const before = get("workbench-grid-cell-record-14-name").style
    .width as number;
  root.renderer.nativeSimulateMouseDown(resize.x + 2, resize.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(resize.x + 32, resize.y + 10, 0);
  await settle();
  root.renderer.nativeSimulateMouseUp(resize.x + 32, resize.y + 10, 0);
  await settle();
  assert.equal(
    get("workbench-grid-cell-record-14-name").style.width,
    before + 30,
  );
  await press("workbench-grid-resize-name", "left");
  assert.equal(
    get("workbench-grid-cell-record-14-name").style.width,
    before + 20,
  );
  await click("workbench-grid-edit-record-14-name");
  await fill("workbench-grid-edit-record-14-name-input", "");
  await press("workbench-grid-edit-record-14-name-input", "enter");
  get("workbench-grid-edit-record-14-name-input");
  await fill("workbench-grid-edit-record-14-name-input", "Updated record");
  await press("workbench-grid-edit-record-14-name-input", "enter");
  assert(
    !root.renderer.findByTestId("workbench-grid-edit-record-14-name-input"),
  );
  await fill("workbench-filter-search", "Updated record");
  get("workbench-grid-rows-record-14");
  await click("workbench-tabs-settings");
  await click("workbench-form-submit");
  get("workbench-errors");
  root.renderer.simulateKeystrokes("a");
  await settle();
  assert(text().includes("a"), "Invalid submit focuses first editor");
  await fill("workbench-form-name", "Native kit");
  await fill("workbench-form-description", "Reusable workspace settings");
  await click("workbench-form-submit");
  assert(text().includes("Saved in memory: 1"));
  assert(!root.renderer.findByTestId("workbench-errors"));
  await shot("form");
  await click("workbench-tabs-source");
  assert(
    text().includes("appearance"),
    "CodeBlock uses native syntax renderer",
  );
  await shot("source");
  const diffBounds = await app.getByTestId("workbench-diff").bounds();
  const beforeCollapse = root.renderer
    .getPaintedText()
    .filter((line) => line.includes("appearance")).length;
  root.renderer.nativeSimulateClick(diffBounds.x + 20, diffBounds.y + 12);
  await settle();
  assert(
    root.renderer.getPaintedText().filter((line) => line.includes("appearance"))
      .length < beforeCollapse,
    "Diff file header collapses its native patch lines",
  );
  await click("workbench-tabs-files");
  await click("workbench-files-retry-archive");
  assert(text().includes("queued"));
  await click("workbench-files-remove-media");
  assert(!root.renderer.findByTestId("workbench-files-media"));
  await click("workbench-picker-choose");
  get("workbench-files-sample-2");
  await shot("files");
  await click("workbench-tabs-activity");
  await click("workbench-list-item-0");
  await press("workbench-list", "shift-down");
  assert(
    (await app.getByTestId("workbench-list-value").textContent()).includes(
      "item-0,item-1",
    ),
  );
  await press("workbench-list", "shift-down");
  assert(
    (await app.getByTestId("workbench-list-value").textContent()).includes(
      "item-0,item-1,item-3",
    ),
  );
  await click("workbench-list-item-5", "cmd");
  assert(
    (await app.getByTestId("workbench-list-value").textContent()).includes(
      "item-5",
    ),
  );
  await press("workbench-list", "end");
  assert(
    (await app.getByTestId("workbench-list-value").textContent()).includes(
      "item-11",
    ),
  );
  await shot("list");
  await click("workbench-tree-workspace");
  await press("workbench-tree", "left");
  assert(!root.renderer.findByTestId("workbench-tree-records"));
  await press("workbench-tree", "right");
  get("workbench-tree-records");
  await press("workbench-tree", "right");
  await press("workbench-tree", "enter");
  get("workbench-filter");
  await click("workbench-tree-remote");
  await press("workbench-tree", "right");
  get("workbench-tree-remote-item");
  await press("workbench-tabs-records", "right");
  get("workbench-form-submit");
  const beforeOrder = await app.getByTestId("workbench-tabs-settings").bounds();
  await press("workbench-tabs-settings", "alt-right");
  const afterOrder = await app.getByTestId("workbench-tabs-settings").bounds();
  assert(
    afterOrder.x > beforeOrder.x,
    "Alt+Right moves the document after its neighbor",
  );
  const nodes = get("workbench-tabs").children;
  assert(nodes.length > 0);
  await click("workbench-tabs-close-settings");
  assert(!root.renderer.findByTestId("workbench-tabs-settings"));
  await click("workbench-tabs-add");
  assert(text().includes("New document — application-owned content."));
  await click("workbench-theme-dark");
  await shot("complete");
  console.log(
    `PASS Workbench themes/drafts, range/page selection, sort/filter/edit/resize, form focus, native code/diff, files, tree and document tabs (${narrow ? "1000x720" : "1320x920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
