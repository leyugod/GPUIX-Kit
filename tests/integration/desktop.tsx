import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { DesktopGallery } from "@mirai/gallery/desktop";
const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<DesktopGallery />);
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
const click = async (id: string) => {
  await app.getByTestId(id).click();
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
const shot = async (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/desktop-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  await click("desktop-theme-light");
  await shot("light");
  await click("desktop-nav-workspace");
  assert(!root.renderer.findByTestId("desktop-nav-projects"));
  await press("desktop-nav-workspace", "right");
  get("desktop-nav-projects");
  await press("desktop-nav-projects", "down");
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(root.renderer.getPaintedText().includes("people"));
  await click("desktop-variant-slim");
  await shot("slim");
  await click("desktop-variant-dual-tier");
  await click("desktop-nav-rail-settings");
  await shot("dual-tier");
  await click("desktop-variant-simple");
  const before = get("desktop-split-primary").style.width as number;
  await press("desktop-split-divider", "right");
  assert.equal(get("desktop-split-primary").style.width, before + 10);
  await press("desktop-split-divider", "home");
  assert.equal(get("desktop-split-primary").style.width, 250);
  await press("desktop-split-divider", "end");
  assert.equal(get("desktop-split-primary").style.width, 430);
  const divider = await app.getByTestId("desktop-split-divider").bounds();
  root.renderer.nativeSimulateMouseDown(divider.x + 3, divider.y + 20);
  await settle();
  get("desktop-split-drag");
  root.renderer.nativeSimulateMouseMove(divider.x - 47, divider.y + 20, 0);
  await settle();
  assert.equal(
    get("desktop-split-primary").style.width,
    380,
    "Pointer drag changes width by actual delta",
  );
  root.renderer.nativeSimulateMouseUp(divider.x - 47, divider.y + 20, 0);
  await settle();
  assert(!root.renderer.findByTestId("desktop-split-drag"));
  await fill("desktop-combo", "engi");
  get("desktop-combo-option-engineering");
  assert(!root.renderer.findByTestId("desktop-combo-option-design"));
  await press("desktop-combo", "enter");
  get("desktop-combo-remove-engineering");
  assert(!root.renderer.findByTestId("desktop-combo-popup"));
  await fill("desktop-combo", "Archived");
  await press("desktop-combo", "enter");
  get("desktop-combo-remove-engineering");
  await press("desktop-combo", "escape");
  await fill("desktop-multi", "prod");
  await press("desktop-multi", "enter");
  get("desktop-multi-remove-product");
  get("desktop-multi-remove-design");
  await press("desktop-multi", "escape");
  await click("desktop-multi-remove-design");
  assert(!root.renderer.findByTestId("desktop-multi-remove-design"));
  await fill("desktop-multi", "xyz");
  get("desktop-multi-empty");
  await press("desktop-multi", "escape");
  await click("desktop-menu");
  await press("desktop-menu-new", "down");
  root.renderer.simulateKeystrokes("right");
  await settle();
  get("desktop-menu-inspector");
  await press("desktop-menu-inspector", "escape");
  assert(!root.renderer.findByTestId("desktop-menu-popup"));
  root.renderer.simulateKeystrokes("enter");
  await settle();
  get("desktop-menu-popup");
  await click("desktop-menu-locked");
  assert(root.renderer.getPaintedText().includes("Actions: 0"));
  await click("desktop-menu-new");
  assert(root.renderer.getPaintedText().includes("Actions: 1"));
  const context = await app.getByTestId("desktop-context").bounds();
  root.renderer.nativeSimulateClick(context.x + 10, context.y + 8, 2);
  await settle();
  get("desktop-context-popup");
  await press("desktop-context-new", "escape");
  await click("desktop-command-trigger");
  root.renderer.simulateKeystrokes("n");
  await settle();
  assert(
    root.renderer.getPaintedText().includes("n"),
    "Palette initially focuses native search",
  );
  await fill("desktop-command-search", "new");
  await shot("command");
  await press("desktop-command-search", "enter");
  assert(!root.renderer.findByTestId("desktop-command"));
  assert(root.renderer.getPaintedText().includes("Actions: 2"));
  root.renderer.simulateKeystrokes("enter");
  await settle();
  get("desktop-command");
  await press("desktop-command-search", "escape");
  await click("desktop-number-increment");
  await press("desktop-number", "up");
  assert(root.renderer.getPaintedText().includes("3"));
  await fill("desktop-date", "2026-02-29");
  get("desktop-date-error");
  await fill("desktop-date", "2026-02-28");
  assert(!root.renderer.findByTestId("desktop-date-error"));
  await click("desktop-details");
  get("desktop-popover");
  await press("desktop-popover-close", "escape");
  assert(!root.renderer.findByTestId("desktop-popover"));
  await click("desktop-details");
  await click("desktop-name");
  assert(!root.renderer.findByTestId("desktop-popover"));
  root.renderer.simulateKeystrokes("x");
  await settle();
  assert(
    root.renderer.getPaintedText().includes("Desktop foundationx"),
    "Outside dismissal preserves clicked editor focus",
  );
  await click("desktop-inspector-close");
  get("desktop-inspector-show");
  await click("desktop-inspector-show");
  get("desktop-inspector");
  await click("desktop-theme-dark");
  await shot("complete");
  console.log(
    `PASS desktop navigation, split pointer/keyboard, searchable choices, disabled commands, submenu/context menu, palette focus/restore, value fields, popover (${narrow ? "1000×720" : "1320×920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
