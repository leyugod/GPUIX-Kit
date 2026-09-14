import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ChoicesGallery } from "@mirai/gallery/choices";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<ChoicesGallery />);
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
const fill = async (value: string) => {
  await app.getByTestId("tokens-input").fill(value);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/choices-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  assert.equal(await text("permissions-all-indicator"), "−");
  await click("permissions-all");
  assert.equal(await text("permissions-all-indicator"), "✓");
  assert.equal(
    await text("permissions-value"),
    "settings, locked, other-page, reports, exports",
  );
  await press("permissions-all", "space");
  assert.equal(await text("permissions-value"), "locked, other-page");
  await click("permissions-reports");
  assert.equal(await text("permissions-all-indicator"), "−");
  await press("permissions-locked", "space");
  assert.equal(await text("permissions-value"), "locked, other-page, reports");
  const b = await app.getByTestId("permissions-all").bounds();
  root.renderer.nativeSimulateClick(b.x + 10, b.y + 10, 2);
  await settle();
  assert.equal(
    await text("permissions-value"),
    "locked, other-page, reports",
    "Right click must not change checkbox values",
  );
  await press("mixed", "space");
  assert.equal(await text("mixed-value"), "true");
  await press("mixed", "enter");
  assert.equal(await text("mixed-value"), "false");
  await press("readonly-check", "space");
  assert.equal(await text("readonly-check-indicator"), "−");
  await press("disabled-check", "enter");
  assert.equal(await text("disabled-check-indicator"), "−");
  await app.getByTestId("choices-name").fill("选择和标签草稿");
  await click("choices-theme-light");
  assert(root.renderer.getPaintedText().includes("选择和标签草稿"));
  await shot("light");
  await click("choices-page-tokens");
  await shot("tokens-light");
  assert((await app.getByTestId("tag-long").bounds()).width <= 160);
  await fill("design; New");
  await press("tokens-input", "enter");
  assert(get("tokens-error"));
  assert.equal(await text("tokens-count"), "3/8");
  assert.equal(await text("token-draft"), "design; New");
  await fill("Engineering; Research");
  await press("tokens-input", "enter");
  assert.equal(await text("tokens-count"), "5/8");
  assert.equal(await text("token-draft"), "");
  assert(get("tokens-token-engineering"));
  assert(get("tokens-token-research"));
  assert(!get("tokens-error"));
  await press("tokens-input", "shift-tab");
  assert(get("tokens-token-research"));
  root.renderer.simulateKeystrokes("backspace");
  await settle();
  assert(!get("tokens-token-research"));
  assert.equal(await text("tokens-count"), "4/8");
  root.renderer.simulateKeystrokes("left");
  await settle();
  root.renderer.simulateKeystrokes("backspace");
  await settle();
  assert(get("tokens-token-system"), "Protected token cannot be removed");
  assert.equal(await text("tokens-count"), "4/8");
  root.renderer.simulateKeystrokes("end");
  await settle();
  root.renderer.simulateKeystrokes("right");
  await settle();
  root.renderer.simulateKeystrokes("z");
  await settle();
  assert.equal(
    await text("token-draft"),
    "z",
    "Right from final token returns to editor",
  );
  await fill("One, Two, Three, Four, Five");
  await click("tokens-add");
  assert(get("tokens-error"));
  assert.equal(await text("tokens-count"), "4/8");
  assert.equal(await text("token-draft"), "One, Two, Three, Four, Five");
  await fill("Reserved");
  await press("tokens-input", "enter");
  assert((await text("tokens-error")).includes("reserved"));
  await fill("设计");
  await click("tokens-add");
  assert(get("tokens-token-设计"));
  await click("tokens-token-design-remove");
  assert(!get("tokens-token-design"));
  await press("tokens-token-offline-remove", "enter");
  assert(get("tokens-token-offline"));
  await press("readonly-tokens-token-protected-remove", "enter");
  assert(get("readonly-tokens-token-protected"));
  await app.getByTestId("readonly-tokens-input").fill("changed");
  await settle();
  assert(root.renderer.getPaintedText().includes("Read-only draft"));
  await press("disabled-tokens-add", "enter");
  assert(get("disabled-tokens-token-disabled"));
  await fill("待提交");
  await click("choices-theme-dark");
  assert.equal(await text("token-draft"), "待提交");
  await shot("tokens-dark");
  console.log(
    `PASS choices tri-state/scope/protected/read-only, token atomic add/duplicates/limits/keyboard/remove/focus and themes (${narrow ? 1000 : 1320}x${height})`,
  );
} finally {
  root.render(null);
  await app.close();
}
