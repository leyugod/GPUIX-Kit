import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ActionsGallery } from "@mirai/gallery/actions";
const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<ActionsGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, k: string) => {
  await app.getByTestId(id).press(k);
  await settle();
};
const key = async (k: string) => {
  root.renderer.simulateKeystrokes(k);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/actions-" + name + (narrow ? "-narrow" : "") + ".png",
    ),
  });
try {
  await settle();
  await shot("dark");
  await app.getByTestId("actions-name").fill("Reusable workspace");
  await click("editing-cut");
  assert.equal(await text("actions-event"), "cut");
  await press("editing-cut", "right");
  await key("enter");
  assert.equal(
    await text("actions-event"),
    "paste",
    "Horizontal group skips disabled item",
  );
  await press("editing-locked", "enter");
  assert.equal(await text("actions-event"), "paste");
  await click("publish-primary");
  assert.equal(await text("actions-event"), "publish");
  await press("publish-menu", "down");
  await key("down");
  await key("enter");
  assert.equal(await text("actions-event"), "schedule");
  assert(!get("publish-menu-popup"));
  await key("enter");
  assert(
    get("publish-menu-popup"),
    "Secondary action restores menu trigger focus",
  );
  await key("escape");
  assert(!get("publish-menu-popup"));
  await click("tools-overflow");
  assert.equal(await text("tools-overflow-page"), "1 / 2");
  assert(!get("tools-overflow-item-hidden"));
  assert(!get("tools-overflow-item-delete"));
  await press("tools-overflow-item-archive", "enter");
  assert(get("tools-overflow-popup"));
  await press("tools-overflow-item-rename", "end");
  assert(get("tools-overflow-item-delete"));
  assert(!get("tools-overflow-item-rename"));
  await shot("overflow-dark");
  const bound = await app.getByTestId("tools-overflow-item-delete").bounds();
  assert(
    bound && bound.y >= 0 && bound.y + bound.height <= (narrow ? 720 : 920),
    "Keyboard target stays visible",
  );
  await key("enter");
  assert.equal(await text("actions-event"), "delete");
  await key("enter");
  await key("pagedown");
  await key("home");
  await key("enter");
  assert.equal(
    await text("actions-event"),
    "rename",
    "Home returns across pages",
  );
  await click("path-overflow");
  assert(get("path-overflow-item-1"));
  assert(!get("path-1"));
  await click("path-overflow-item-2");
  assert.equal(await text("actions-event"), "path:2");
  assert.equal(await text("path-current"), "Components");
  await click("workspace");
  await key("down");
  await key("enter");
  assert.equal(await text("actions-event"), "workspace:engineering");
  assert((await text("workspace")).includes("Engineering"));
  await click("workspace");
  await key("enter");
  assert.equal(
    await text("actions-event"),
    "workspace:engineering",
    "Re-selecting current workspace is a no-op",
  );
  await click("account");
  await key("end");
  await shot("account-dark");
  await key("enter");
  assert.equal(await text("actions-event"), "signout");
  await press("actions-theme-light", "enter");
  assert(root.renderer.getPaintedText().includes("Reusable workspace"));
  await shot("light");
  await click("tools-overflow");
  await shot("overflow-light");
  await key("escape");
  await click("account");
  await shot("account-light");
  await key("escape");
  console.log(
    "PASS: six action/navigation components; native pointer and keyboard, pagination, disabled states, focus restoration, dark/light and retained draft",
  );
} finally {
  root.render(null);
  await app.close();
}
