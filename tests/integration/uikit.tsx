import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { Gallery } from "@mirai/gallery";
import { darkColors, lightColors } from "@mirai/gpuix-kit/tokens";

const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<Gallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((done) => setImmediate(done));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const click = async (id: string) => {
  const bounds = await app.getByTestId(id).bounds();
  const height = narrow ? 720 : 920;
  if (bounds.y + bounds.height > height || bounds.y < 68) {
    const scroll = root.renderer.findByTestId("gallery-scroll")!;
    const offset = root.renderer.getScrollOffset(scroll.id)?.[1] ?? 0;
    root.renderer.scrollTo(
      scroll.id,
      0,
      offset +
        (bounds.y < 68
          ? 90 - bounds.y
          : height - 20 - bounds.y - bounds.height),
    );
    await settle();
  }
  await app.getByTestId(id).click();
  await settle();
};
const text = () => root.renderer.getPaintedText().join("\n");
const get = (id: string) => {
  const node = root.renderer.findByTestId(id);
  assert(node, `Missing ${id}`);
  return node;
};
const snapshot = async (name: string) => {
  await app.screenshot({
    path: resolve(`artifacts/${name}${narrow ? "-narrow" : ""}.png`),
  });
};
try {
  await app.getByTestId("demo-name").waitFor();
  mkdirSync("artifacts", { recursive: true });
  assert.equal(get("uikit-root").style.backgroundColor, darkColors.canvas);
  await snapshot("uikit-dark");
  await app.getByTestId("demo-name").fill("原生工作区");
  await click("theme-light");
  assert.equal(get("uikit-root").style.backgroundColor, lightColors.canvas);
  assert(text().includes("原生工作区"), "Theme changes preserve input drafts");
  await snapshot("uikit-light");
  await click("demo-primary");
  assert(text().includes("Changes saved"));
  await click("demo-toast-dismiss");
  const before = await app.getByTestId("demo-saved").textContent();
  await click("demo-disabled");
  assert.equal(
    await app.getByTestId("demo-saved").textContent(),
    before,
    "Disabled pointer activation is blocked",
  );
  root.renderer.nativeSimulateKeystrokes(get("demo-disabled").id, "enter");
  await settle();
  assert.equal(
    await app.getByTestId("demo-saved").textContent(),
    before,
    "Disabled keyboard activation is blocked",
  );
  await click("demo-switch");
  assert.equal(
    get("demo-switch-indicator").style.backgroundColor,
    lightColors.elevated,
  );
  await click("demo-checkbox");
  assert.equal(
    get("demo-checkbox-indicator").style.backgroundColor,
    lightColors.elevated,
  );
  await click("demo-team");
  await click("demo-team-engineering");
  assert(
    (await app.getByTestId("demo-team").textContent()).includes("Engineering"),
  );
  // 打开选择器后 Escape 关闭，禁止选中 disabled 选项。
  await click("demo-team");
  await click("demo-team-archived");
  assert(
    (await app.getByTestId("demo-team").textContent()).includes("Engineering"),
  );
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert(!root.renderer.findByTestId("demo-team-menu"));
  await click("demo-dialog-trigger");
  await app.getByTestId("dialog-name").fill("对话框草稿");
  const scroll = get("gallery-scroll");
  const offset = root.renderer.getScrollOffset(scroll.id);
  const overlay = await app.getByTestId("demo-dialog-backdrop").bounds();
  root.renderer.nativeSimulateScrollWheel(
    overlay.x + 10,
    overlay.y + 10,
    0,
    -180,
  );
  await settle();
  assert.deepEqual(
    root.renderer.getScrollOffset(scroll.id),
    offset,
    "Dialog wheel cannot scroll the background",
  );
  root.renderer.nativeSimulateKeystrokes(get("demo-dialog-close").id, "tab");
  await settle();
  root.renderer.simulateKeystrokes("x");
  await settle();
  assert(
    root.renderer.getPaintedText().includes("对话框草稿x"),
    "Tab moves from button into native editor",
  );
  root.renderer.nativeSimulateKeystrokes(get("dialog-name").id, "tab");
  await settle();
  root.renderer.simulateKeystrokes("y");
  await settle();
  assert(
    root.renderer.getPaintedText().includes("y"),
    "Tab moves between native editors",
  );
  await snapshot("uikit-dialog");
  // 最后一个控件的 Tab 回到关闭按钮；Enter 不指定目标以验证实际焦点。
  root.renderer.nativeSimulateKeystrokes(get("dialog-create").id, "tab");
  await settle();
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(
    !root.renderer.findByTestId("demo-dialog"),
    "Tab cycles to the first dialog control",
  );
  root.renderer.simulateKeystrokes("enter");
  await settle();
  assert(
    root.renderer.findByTestId("demo-dialog"),
    "Closing returns focus to the trigger",
  );
  await app.getByTestId("dialog-name").press("escape");
  await settle();
  assert(
    !root.renderer.findByTestId("demo-dialog"),
    "Escape in a native editor closes the dialog",
  );
  await click("gallery-nav-controls");
  await click("demo-radio-design");
  root.renderer.nativeSimulateKeystrokes(get("demo-radio-design").id, "right");
  await settle();
  assert(
    (await app.getByTestId("demo-team").textContent()).includes("Engineering"),
  );
  await snapshot("uikit-controls");
  await click("gallery-nav-data");
  await click("demo-pagination-next");
  assert(root.renderer.findByTestId("demo-table-member-5"));
  assert(
    !root.renderer.findByTestId("demo-table-member-0"),
    "Only the selected page is mounted",
  );
  await app.getByTestId("demo-search").fill("no matching member");
  await settle();
  assert(text().includes("No results"));
  await app.getByTestId("demo-search").fill("");
  await settle();
  await snapshot("uikit-data");
  await click("gallery-nav-layout");
  await click("demo-tabs-members");
  assert(text().includes("Team members panel"));
  await click("demo-tabs-billing");
  assert(text().includes("Team members panel"));
  await click("demo-accordion-trigger");
  assert(root.renderer.findByTestId("demo-accordion-content"));
  await click("demo-accordion-trigger");
  assert(!root.renderer.findByTestId("demo-accordion-content"));
  await snapshot("uikit-layout");
  await click("gallery-nav-feedback");
  await app.getByTestId("demo-tooltip-trigger").press("enter");
  await settle();
  assert(
    root.renderer.findByTestId("demo-tooltip"),
    "Tooltip opens from the keyboard",
  );
  await app.getByTestId("demo-tooltip-trigger").press("escape");
  await settle();
  assert(
    !root.renderer.findByTestId("demo-tooltip"),
    "Tooltip closes with Escape",
  );
  await click("demo-notify");
  assert(root.renderer.findByTestId("demo-toast"));
  await click("theme-dark");
  assert.equal(get("uikit-root").style.backgroundColor, darkColors.canvas);
  await snapshot("uikit-feedback");
  console.log(
    `PASS: native UIKit themes, drafts, pointer/keyboard disabled state, controls, Select, modal focus/restore/Escape/wheel, pagination, tabs, accordion and feedback (${narrow ? "1000×720" : "1320×920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
