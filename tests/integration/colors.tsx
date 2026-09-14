import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ColorsGallery } from "@mirai/gallery/colors";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<ColorsGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const reveal = async (id: string) => {
  const bounds = await app.getByTestId(id).bounds();
  const scroll = get("colors-scroll")!;
  const offset = root.renderer.getScrollOffset(scroll.id)?.[1] ?? 0;
  if (bounds.y < 80)
    root.renderer.scrollTo(scroll.id, 0, offset + (80 - bounds.y));
  else if (bounds.y + bounds.height > height - 12)
    root.renderer.scrollTo(
      scroll.id,
      0,
      offset - (bounds.y + bounds.height - height + 12),
    );
  await settle();
};
const click = async (id: string) => {
  await reveal(id);
  await app.getByTestId(id).click();
  await settle();
};
const press = async (id: string, k: string) => {
  await reveal(id);
  await app.getByTestId(id).press(k);
  await settle();
};
const fill = async (id: string, value: string) => {
  await reveal(id);
  await app.getByTestId(id).fill(value);
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/colors-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
try {
  await settle();
  await shot("dark");
  await fill("colors-name", "Reusable colors");
  await fill("hex", "#abc8");
  await press("hex", "enter");
  assert.equal(await text("hex-commit"), "#AABBCC88");
  await fill("hex", "#zz");
  await press("hex", "enter");
  assert(get("hex-error"));
  assert.equal(await text("hex-commit"), "#AABBCC88");
  await fill("hex", "#123456");
  await press("hex", "tab");
  assert(root.renderer.getPaintedText().includes("#123456"));
  await click("well");
  assert.equal(await text("well-count"), "Open intents: 1");
  await click("well-swatch");
  assert.equal(await text("well-count"), "Open intents: 2");
  await press("readonly-well", "enter");
  assert.equal(await text("well-count"), "Open intents: 2");
  await press("panel-r-thumb-0", "end");
  assert.equal(await text("panel-value"), "#FF63EB80");
  await press("panel-a-thumb-0", "home");
  assert.equal(await text("panel-value"), "#FF63EB00");
  await press("panel-a-thumb-0", "end");
  assert.equal(await text("panel-value"), "#FF63EB");
  await click("panel-mode-palette");
  await click("panel-palette-item-red");
  assert.equal(await text("panel-value"), "#EF4444");
  await click("panel-mode-channels");
  await press("saved-grid", "end");
  assert(!get("saved-item-graphite"));
  await key("enter");
  assert.equal(await text("saved-value"), "#00000000");
  await press("saved-grid", "home");
  await key("enter");
  assert.equal(await text("saved-value"), "#343A46");
  await shot("palette-dark");
  await click("picker-trigger");
  assert(get("picker-popup"));
  await fill("picker-panel-hex", "#abc");
  await click("picker-cancel");
  assert.equal(await text("picker-value"), "#8B5CF6");
  await key("enter");
  assert(get("picker-popup"), "Cancel restores trigger focus");
  await fill("picker-panel-hex", "#zz");
  assert(get("picker-panel-hex-error"));
  await press("picker-apply", "enter");
  assert(get("picker-popup"));
  await fill("picker-panel-hex", "#12345680");
  await shot("picker-dark");
  await click("picker-apply");
  assert.equal(await text("picker-value"), "#12345680");
  await key("enter");
  await key("escape");
  assert(!get("picker-popup"));
  await click("picker-trigger");
  await click("picker-panel-mode-palette");
  await press("picker-panel-palette-grid", "end");
  await key("enter");
  assert.equal(
    await text("picker-value"),
    "#12345680",
    "Palette edits stay local until Apply",
  );
  await click("picker-apply");
  assert.equal(await text("picker-value"), "#00000000");
  await click("picker-trigger");
  await click("picker-clear");
  assert.equal(await text("picker-value"), "None");
  await press("colors-theme-light", "enter");
  root.renderer.scrollTo(get("colors-scroll")!.id, 0, 0);
  await settle();
  await shot("light");
  assert(root.renderer.getPaintedText().includes("Reusable colors"));
  await click("picker-trigger");
  await fill("picker-panel-hex", "#14B8A680");
  await shot("picker-light");
  await click("picker-apply");
  assert.equal(await text("picker-value"), "#14B8A680");
  console.log(
    "PASS: six native color components, hex validation, RGB/alpha channels, palette paging, draft Apply/Cancel/Clear, focus restoration and dark/light screenshots",
  );
} finally {
  root.render(null);
  await app.close();
}
