import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { Handbook, handbookEntries, examples } from "@mirai/gallery/handbook";
import {
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  createHostAdapter,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1320, height: 920 }),
  app = await connectTest(root.renderer);
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
let copied = "";
mkdirSync("artifacts", { recursive: true });
mkdirSync("docs/images/components", { recursive: true });
try {
  root.render(
    <Handbook
      clipboard={createHostAdapter({
        writeClipboardText: (text) => {
          copied = text;
        },
      })}
    />,
  );
  await settle();
  assert(
    (await app.getByTestId("handbook-title").textContent()).includes("Buttons"),
  );
  await app.getByTestId("handbook-copy").click();
  await settle();
  assert.equal(
    copied,
    handbookEntries.find((e) => e.id === "base-buttons")!.code,
  );
  await app.getByTestId("handbook-search").fill("sidebar");
  await settle();
  assert((await app.getByTestId("handbook-count").textContent()).includes("1"));
  await app
    .getByTestId("handbook-nav-item-application-sidebar-navigations")
    .click();
  await settle();
  assert(
    (await app.getByTestId("handbook-title").textContent()).includes("Sidebar"),
  );
  await app.getByTestId("handbook-tab-props").click();
  await settle();
  assert(
    JSON.stringify(root.renderer.getPaintedText()).includes(
      "SourceListSidebar",
    ),
  );
  await app.getByTestId("handbook-search").fill("not-a-component");
  await settle();
  assert(root.renderer.findByTestId("handbook-empty"));
  await app.getByTestId("handbook-search").fill("buttons");
  await settle();
  await app.getByTestId("handbook-nav-item-base-buttons").click();
  await settle();
  assert(
    (await app.getByTestId("handbook-title").textContent()).includes("Buttons"),
  );
  for (const mode of ["light", "dark"]) {
    await app.getByTestId("handbook-theme-" + mode).click();
    await settle();
    await app.screenshot({
      path: resolve("artifacts/handbook-" + mode + ".png"),
    });
  }
  // 每个分类独立挂载，两种主题截图来自与手册完全相同的示例。
  for (const mode of ["light", "dark"] as const) {
    for (const entry of handbookEntries) {
      const Example = examples[entry.id]!;
      root.render(
        <UIKitProvider mode={mode}>
          <AppShell>
            <Stack gap={22} style={{ padding: 28 }}>
              <Text size={24} weight={700}>
                {entry.reference}
              </Text>
              <Stack style={{ maxWidth: 850 }}>
                <Example key={entry.id + mode} />
              </Stack>
            </Stack>
          </AppShell>
        </UIKitProvider>,
      );
      await settle();
      if (
        [
          "application-modals",
          "application-drawers",
          "application-command-menus",
        ].includes(entry.id)
      ) {
        await app.getByTestId("example-open").click();
        await settle();
      }
      assert(root.renderer.getPaintedText().length > 0, entry.id);
      assert(
        !JSON.stringify(root.renderer.getPaintedText()).includes("Invalid "),
        entry.id + " renders valid data",
      );
      await app.screenshot({
        path: resolve(
          "docs/images/components/" + entry.id + "-" + mode + ".png",
        ),
      });
    }
  }
  console.log(
    "PASS handbook: search, selection, Props, clipboard and 85 examples in both themes",
  );
} finally {
  root.render(null);
  await app.close();
}
