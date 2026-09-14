import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { StudioGallery } from "@mirai/gallery/studio";
const narrow = process.argv.includes("--narrow"),
  height = narrow ? 720 : 920;
const root = createTestRoot({ width: narrow ? 1000 : 1320, height });
root.render(<StudioGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => {
  const n = root.renderer.findByTestId(id);
  assert(n, `Missing ${id}`);
  return n;
};
const reveal = async (id: string) => {
  const bounds = await app.getByTestId(id).bounds();
  let container = id.startsWith("studio-messages-")
    ? root.renderer.findByTestId("studio-messages")
    : (root.renderer.findByTestId("studio-dashboard") ??
      root.renderer.findByTestId("studio-charts-scroll"));
  if (!container) return;
  const parent = await app.getByTestId(container.testId!).bounds();
  const offset = root.renderer.getScrollOffset(container.id)?.[1] ?? 0;
  const top = parent.y - offset,
    bottom = Math.min(height, top + parent.height);
  if (bounds.y < top || bounds.y + bounds.height > bottom) {
    root.renderer.scrollTo(container.id, 0, offset + top + 8 - bounds.y);
    await settle();
  }
};
const click = async (id: string) => {
  await reveal(id);
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
    path: resolve(`artifacts/studio-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  await fill("studio-name", "原生 Studio");
  await click("studio-theme-light");
  assert(root.renderer.getPaintedText().includes("原生 Studio"));
  await shot("light");
  await click("studio-timeline-event-0-review");
  assert(
    (await app.getByTestId("studio-review-count").textContent()).includes("1"),
  );
  await click("studio-timeline-more");
  get("studio-timeline-event-4");
  assert(!root.renderer.findByTestId("studio-timeline-more"));
  await click("studio-nav-charts");
  await press("studio-chart-plot", "right");
  assert(
    (await app.getByTestId("studio-chart-readout").textContent()).includes(
      "Mon",
    ),
  );
  await press("studio-chart-plot", "end");
  assert(
    (await app.getByTestId("studio-chart-readout").textContent()).includes(
      "Sat",
    ),
  );
  await press("studio-chart-plot", "enter");
  assert(
    (await app.getByTestId("studio-chart-actions").textContent()).includes("1"),
  );
  await click("studio-chart-legend-design");
  assert(!root.renderer.findByTestId("studio-chart-line-design"));
  await click("studio-chart-legend-engineering");
  get("studio-chart-empty");
  await click("studio-chart-legend-design");
  await click("studio-chart-legend-engineering");
  await click("studio-chart-kind-area");
  get("studio-chart-area-design");
  await shot("area");
  await click("studio-chart-kind-bar");
  get("studio-chart-bar-day-0-design");
  await shot("bar");
  await click("studio-chart-kind-stacked-bar");
  const positive = get("studio-chart-bar-day-0-design"),
    negative = get("studio-chart-bar-day-0-engineering");
  assert(
    (negative.style.top as number) > (positive.style.top as number),
    "Negative stacks render below positive stacks",
  );
  await shot("stacked");
  await click("studio-pie-legend-mobile");
  assert(
    (await app.getByTestId("studio-pie-readout").textContent()).includes(
      "27.0%",
    ),
  );
  await press("studio-pie-plot", "end");
  assert(
    (await app.getByTestId("studio-pie-readout").textContent()).includes("Web"),
  );
  await click("studio-pie-toggle");
  await reveal("studio-pie");
  await shot("pie");
  await click("studio-nav-conversation");
  await shot("conversation");
  await click("studio-composer-send");
  assert(
    !root.renderer.findByTestId("studio-messages-local-4"),
    "Empty draft does not send",
  );
  await click("studio-messages-failed-retry");
  assert(
    (await app.getByTestId("studio-messages-failed").textContent()).includes(
      "sending",
    ),
  );
  await click("studio-stream");
  assert(
    (
      await app.getByTestId("studio-messages-stream-text").textContent()
    ).includes("Native rendering is responsive."),
  );
  get("studio-composer-stop");
  await click("studio-composer-stop");
  assert(!root.renderer.findByTestId("studio-composer-stop"));
  await click("studio-follow");
  await click("studio-messages-hello-reply");
  get("studio-composer-cancel-reply");
  await fill("studio-composer-input", "Native reply");
  await click("studio-composer-attach");
  get("studio-composer-remove-attachment-0");
  await press("studio-composer-input", "enter");
  get("studio-messages-local-4");
  assert(
    (
      await app.getByTestId("studio-messages-local-4-text").textContent()
    ).includes("Native reply"),
  );
  assert(!root.renderer.findByTestId("studio-composer-cancel-reply"));
  await click("studio-messages-earlier");
  get("studio-messages-earlier-text");
  assert(!root.renderer.findByTestId("studio-messages-earlier-earlier"));
  await click("studio-messages-latest");
  await fill("studio-composer-input", "草稿保留");
  await click("studio-theme-dark");
  assert(root.renderer.getPaintedText().includes("草稿保留"));
  await shot("messages-dark");
  await click("studio-nav-platform");
  await click("studio-host-metrics");
  assert(
    (await app.getByTestId("studio-host-result").textContent()).includes(
      `${narrow ? 1000 : 1320} × ${height}`,
    ),
  );
  await shot("platform");
  console.log(
    `PASS Studio chart variants/legend/keyboard, timeline actions, conversation retry/stream/reply/attachment, theme drafts and host metrics (${narrow ? "1000x720" : "1320x920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
