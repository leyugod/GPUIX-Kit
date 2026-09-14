import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { NotificationsGallery } from "@mirai/gallery/notifications";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<NotificationsGallery />);
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
const reveal = async (id: string) => {
  const b = await app.getByTestId(id).bounds(),
    s = get("notifications-scroll")!,
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
const shot = (mode: string) =>
  app.screenshot({
    path: resolve(
      "artifacts/notifications-" + mode + (narrow ? "-narrow" : "") + ".png",
    ),
  });
try {
  await settle();
  const summary = await app.getByTestId("task-summary").bounds();
  assert(summary.height < 120, "Task summary must remain compact");
  const counts = await app.getByTestId("task-summary-counts").bounds();
  assert(counts.width > 200, "Task counts need usable text width");
  await shot("dark");
  assert(get("notices-welcome"));
  assert(get("notices-removed"));
  assert(!get("tasks-backup"));
  assert.equal(await text("tasks-page"), "1 / 4");
  await click("notice-add");
  assert.equal(await text("notices-queued"), "1 queued");
  assert(!get("notices-new-1"));
  await click("notices-welcome-dismiss");
  assert(get("notices-new-1"));
  await click("notices-removed-action");
  assert(!get("notices-removed"));
  assert.equal(await text("notifications-event"), "undo:removed");
  await click("undo-example-action");
  assert(!get("undo-example-action"));
  assert.equal(await text("notifications-event"), "restored");
  await click("undo-reset");
  assert(get("undo-example-action"));
  await click("undo-example-dismiss");
  assert(!get("undo-example-action"));
  await click("tasks-download-pause");
  assert.equal(await text("tasks-download-status"), "paused");
  await click("tasks-download-resume");
  assert.equal(await text("tasks-download-status"), "running");
  await click("tasks-index-retry");
  assert.equal(await text("tasks-index-status"), "queued");
  assert(!get("tasks-index-error"));
  await click("tasks-download-cancel");
  assert.equal(await text("tasks-download-status"), "cancelled");
  await click("tasks-next");
  assert(!get("tasks-download"));
  assert(get("tasks-backup-unknown"));
  await click("tasks-sync-resume");
  assert.equal(await text("tasks-sync-status"), "running");
  await click("tasks-previous");
  await click("notice-clear");
  assert(!get("notices-new-1"));
  await click("notice-pause-all");
  assert(get("notices-paused"));
  await click("notice-timed");
  assert(get("notices-timed"));
  await app.getByTestId("notifications-theme-light").click();
  await settle();
  root.renderer.scrollTo(get("notifications-scroll")!.id, 0, 0);
  await settle();
  await shot("light");
  assert.equal(await text("ring-half-label"), "50%");
  assert.equal(await text("ring-unknown-label"), "…");
  console.log("PASS notifications gallery", narrow ? "1000x720" : "1320x920");
} finally {
  root.render(null);
  await app.close();
}
