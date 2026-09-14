import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { SidebarsGallery } from "@mirai/gallery/sidebars";
const narrow = process.argv.includes("--narrow"),
  width = narrow ? 1000 : 1320,
  height = narrow ? 720 : 920;
const root = createTestRoot({ width, height });
root.render(<SidebarsGallery />);
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
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
const text = (id: string) => app.getByTestId(id).textContent();
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/sidebars-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
const bounds = async (id: string) => {
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
  await shot("mail-dark");
  await bounds("sidebars-source");
  await bounds("sidebars-content");
  await bounds("sidebars-detail");
  await click("sidebars-source-item-unread");
  assert((await text("sidebars-selection")).includes("unread"));
  await key("down");
  assert((await text("sidebars-selection")).includes("starred"));
  await key("down");
  await key("right");
  await key("enter");
  assert((await text("sidebars-event")).includes("New draft requested"));
  await key("left");
  await key("left");
  await key("left");
  assert(!get("sidebars-source-item-inbox"), "left on group collapses");
  assert(
    (await text("sidebars-selection")).includes("drafts"),
    "collapsed selection retained",
  );
  await key("right");
  assert(get("sidebars-source-item-inbox"));
  await click("sidebars-source-item-offline");
  assert(
    (await text("sidebars-selection")).includes("drafts"),
    "disabled source blocked",
  );
  await click("sidebars-source-item-project");
  await key("right");
  await key("enter");
  assert(!get("sidebars-source-item-project"));
  assert(
    (await text("sidebars-selection")).includes("inbox"),
    "application chooses deletion fallback",
  );
  await click("sidebars-source-item-inbox");
  await fill("sidebars-draft", "Retained local reply");
  const before = get("sidebars-layout-sidebar-primary")!.style.width as number;
  await press("sidebars-layout-sidebar-divider", "right");
  assert.equal(
    get("sidebars-layout-sidebar-primary")!.style.width,
    before + 10,
  );
  const d = await app.getByTestId("sidebars-layout-sidebar-divider").bounds();
  root.renderer.nativeSimulateMouseDown(d.x + 3, d.y + 30, 0);
  await settle();
  assert(get("sidebars-layout-sidebar-drag"));
  root.renderer.nativeSimulateMouseMove(d.x + 33, d.y + 30, 0);
  await settle();
  root.renderer.nativeSimulateMouseUp(d.x + 33, d.y + 30, 0);
  await settle();
  assert.equal(
    get("sidebars-layout-sidebar-primary")!.style.width,
    before + 40,
  );
  await click("sidebars-toggle");
  assert(!get("sidebars-source"));
  await click("sidebars-toggle");
  assert(get("sidebars-source"));
  assert.equal(
    get("sidebars-draft")!.customProps?.value,
    "Retained local reply",
  );
  await click("sidebars-inspector-toggle");
  assert.equal(
    !!get("sidebars-inspector"),
    !narrow,
    "inspector yields before sidebar in narrow window",
  );
  await shot("inspector-dark");
  await bounds("sidebars-detail");
  if (!narrow) {
    const w = get("sidebars-layout-inspector-primary")!.style.width as number;
    await press("sidebars-layout-inspector-divider", "left");
    assert.equal(get("sidebars-layout-inspector-primary")!.style.width, w - 10);
  }
  await click("sidebars-inspector-toggle");
  await click("sidebars-window-active");
  await shot("inactive-dark");
  await click("sidebars-theme-light");
  assert.equal(
    get("sidebars-draft")!.customProps?.value,
    "Retained local reply",
  );
  await shot("mail-light");
  await click("sidebars-kind-files");
  await shot("files-light");
  await click("sidebars-source-item-documents");
  await key("end");
  assert((await text("sidebars-selection")).includes("tag15"));
  const footer = await bounds("sidebars-source-footer"),
    scroll = await app.getByTestId("sidebars-source-scroll").bounds(),
    last = await app.getByTestId("sidebars-source-item-tag15").bounds();
  assert(
    last.y + last.height <= footer.y + 1,
    "keyboard target visible above fixed footer",
  );
  await bounds("sidebars-source-search");
  await fill("sidebars-search", "studio");
  assert(get("sidebars-source-item-drive"));
  assert(!get("sidebars-source-item-documents"));
  await fill("sidebars-search", "missing");
  assert(get("sidebars-source-status"));
  await fill("sidebars-search", "");
  await click("sidebars-theme-dark");
  await shot("files-dark");
  console.log(
    "PASS sidebars gallery " +
      width +
      "x" +
      height +
      ": source navigation, actions, collapse/deletion, drag/keyboard widths, hidden preferences, fixed slots and themes",
  );
} finally {
  root.render(null);
  await app.close();
}
