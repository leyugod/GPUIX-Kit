import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { TokensGallery } from "@mirai/gallery/tokens";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<TokensGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const reveal = async (id: string) => {
  const b = await app.getByTestId(id).bounds(),
    s = get("tokens-scroll")!,
    offset = root.renderer.getScrollOffset(s.id)?.[1] ?? 0;
  if (b.y < 80) root.renderer.scrollTo(s.id, 0, offset + 80 - b.y);
  else if (b.y + b.height > height - 12)
    root.renderer.scrollTo(s.id, 0, offset - (b.y + b.height - height + 12));
  await settle();
};
const click = async (id: string) => {
  await reveal(id);
  await app.getByTestId(id).click();
  await settle();
};
const fill = async (id: string, value: string) => {
  await reveal(id);
  await app.getByTestId(id).fill(value);
  await settle();
};
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/tokens-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
try {
  await settle();
  await shot("dark");
  const editor = await app.getByTestId("editor").bounds();
  assert(editor.width > 300 && editor.height < 350);
  assert(!get("editor-token-locked"));
  assert(!get("suggestions-item-urgent"));
  await click("suggestions-item-design");
  assert.equal(await text("tokens-event"), "suggestion:design");
  await press("suggestions-list", "end");
  assert(get("suggestions-item-team-14"));
  await key("enter");
  assert.equal(await text("tokens-event"), "suggestion:team-14");
  await fill("combo-input", "开发");
  assert(get("combo-popup"));
  assert(get("combo-suggestions-item-engineering"));
  await shot("suggestions-dark");
  await click("combo-suggestions-item-engineering");
  assert(!get("combo-popup"));
  assert((await text("combo-value")).includes("Engineering"));
  await fill("combo-input", "New label");
  await click("combo-create");
  assert((await text("combo-value")).includes("New label"));
  await click("combo-token-new label-remove");
  assert(!(await text("combo-value")).includes("New label"));
  assert(!get("combo-token-system-remove"));
  await click("editor-token-design-edit");
  await fill("editor-token-design-input", "Engineering");
  await press("editor-token-design-input", "enter");
  assert(get("editor-token-design-error"));
  await fill("editor-token-design-input", "Product");
  await press("editor-token-design-input", "enter");
  assert(!get("editor-token-design-input"));
  assert((await text("editor-value")).includes("design:Product"));
  await click("editor-next");
  assert(get("editor-token-locked"));
  await click("editor-previous");
  await click("single-edit");
  await fill("single-input", "Draft");
  await press("single-input", "escape");
  assert.equal(await text("single-tag-text"), "Personal");
  await key("enter");
  assert(get("single-input"));
  await fill("single-input", "Personal revised");
  await click("single-save");
  assert.equal(await text("single-tag-text"), "Personal revised");
  await click("picker-trigger");
  assert(get("picker-popup"));
  await press("picker-panel-chooser-input", "escape");
  assert(!get("picker-popup"));
  await key("enter");
  assert(get("picker-popup"));
  await app.getByTestId("picker-panel-chooser-input").fill("Design");
  await settle();
  await app.getByTestId("picker-panel-chooser-suggestions-item-design").click();
  await settle();
  await press("picker-panel-cancel", "enter");
  assert.equal(await text("picker-value"), "Research");
  await click("picker-trigger");
  await app.getByTestId("picker-panel-chooser-input").fill("Design");
  await settle();
  await app.getByTestId("picker-panel-chooser-suggestions-item-design").click();
  await settle();
  const popupBounds = await app.getByTestId("picker-popup").bounds();
  const applyBounds = await app.getByTestId("picker-panel-apply").bounds();
  assert(
    applyBounds.y + applyBounds.height <=
      popupBounds.y + popupBounds.height + 1,
    "Ordinary picker selection keeps Apply visible",
  );
  await shot("picker-dark");
  await press("picker-panel-apply", "enter");
  assert.equal(await text("picker-value"), "Research, Design");
  await click("panel-chooser-suggestions-item-design");
  assert.equal(await text("panel-value"), "None");
  await click("panel-apply");
  assert.equal(await text("panel-value"), "Design");
  await click("editor-clear");
  assert.equal(await text("editor-count"), "2 labels");
  assert((await text("editor-value")).includes("system:System"));
  assert((await text("editor-value")).includes("locked:Managed"));
  await app.getByTestId("tokens-theme-light").click();
  await settle();
  root.renderer.scrollTo(get("tokens-scroll")!.id, 0, 0);
  await settle();
  await shot("light");
  await click("picker-trigger");
  await shot("picker-light");
  await press("picker-panel-cancel", "enter");
  console.log("PASS token input gallery", narrow ? "1000x720" : "1320x920");
} finally {
  root.render(null);
  await app.close();
}
