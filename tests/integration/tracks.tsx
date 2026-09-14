import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { ControlsGallery } from "@mirai/gallery/controls";
const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<ControlsGallery initialPage="tracks" />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const shot = (mode: string) =>
  app.screenshot({
    path: resolve(`artifacts/tracks-${mode}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  await click("track-volume-stop-15");
  assert.equal(await text("track-volume-value"), "75");
  assert.equal(await text("track-commits"), "Commits: 1");
  root.renderer.simulateKeystrokes("left");
  await settle();
  assert.equal(await text("track-volume-value"), "70");
  assert.equal(await text("track-commits"), "Commits: 2");
  const right = await app.getByTestId("track-volume-stop-0").bounds();
  root.renderer.nativeSimulateClick(right.x + right.width / 2, right.y + 16, 2);
  await settle();
  assert.equal(await text("track-volume-value"), "70");
  const thumb = await app.getByTestId("track-volume-thumb-0").bounds();
  root.renderer.nativeSimulateMouseDown(thumb.x + 10, thumb.y + 10);
  await settle();
  root.renderer.nativeSimulateMouseMove(thumb.x + 62, thumb.y + 10, 0);
  await settle();
  assert.equal(await text("track-volume-value"), "90");
  root.renderer.simulateKeystrokes("escape");
  await settle();
  assert.equal(await text("track-volume-value"), "70");
  root.renderer.nativeSimulateMouseUp(thumb.x + 62, thumb.y + 10, 0);
  await settle();
  assert.equal(await text("track-commits"), "Commits: 2");
  await click("track-range-stop-9");
  assert.equal(await text("track-range-value"), "20 – 90");
  await click("track-range-stop-5");
  assert.equal(await text("track-range-value"), "50 – 90");
  await press("track-range-thumb-1", "home");
  assert.equal(await text("track-range-value"), "50 – 50");
  await click("track-range-stop-8");
  assert.equal(await text("track-range-value"), "50 – 80");
  await click("track-range-stop-1");
  assert.equal(await text("track-range-value"), "10 – 80");
  await click("track-level-stop-9");
  assert.equal(await text("track-level-value"), "90");
  await click("track-interval-stop-9");
  assert.equal(await text("track-interval-value"), "20 – 90");
  await click("track-interval-stop-0");
  assert.equal(await text("track-interval-value"), "0 – 90");
  await click("track-readonly-stop-20");
  await press("track-readonly-thumb-0", "end");
  assert.equal(await text("track-readonly-value"), "60");
  await click("track-disabled-stop-9");
  await press("track-disabled-thumb-0", "end");
  assert.equal(await text("track-disabled-value"), "30");
  const track = await app.getByTestId("track-level-track").bounds();
  const top = await app.getByTestId("track-level-mark-100").bounds(),
    bottom = await app.getByTestId("track-level-mark-0").bounds();
  assert(top.y < bottom.y);
  assert(Math.abs(top.y - track.y - 10) < 1);
  assert.equal(await text("track-level-mark-label-100"), "Full");
  await app.getByTestId("controls-name").fill("保留刻度草稿");
  await click("controls-theme-light");
  assert(root.renderer.getPaintedText().includes("保留刻度草稿"));
  await shot("light");
  console.log(
    `PASS tracks pointer steps/focus, nearest and coincident range thumbs, readonly/disabled/right-click, marks and drag regression (${narrow ? "1000x720" : "1320x920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
