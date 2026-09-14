import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { connectStdio } from "@gpuix/react/automation";
// 真实窗口验证启动和编辑器输入；点击交互交给 TestRenderer，避免 0.7.0 重入。
const catalog = process.argv.includes("--catalog");
const tablePrefs = process.argv.includes("--table-prefs");
const filters = process.argv.includes("--filters");
const collections = process.argv.includes("--collections");
const sidebars = process.argv.includes("--sidebars");
const modals = process.argv.includes("--modals");
const tokens = process.argv.includes("--tokens");
const notifications = process.argv.includes("--notifications");
const colors = process.argv.includes("--colors");
const actions = process.argv.includes("--actions");
const dates = process.argv.includes("--dates");
const time = process.argv.includes("--time");
const choices = process.argv.includes("--choices");
const tracks = process.argv.includes("--tracks");
const controls = tracks || process.argv.includes("--controls");
const studio = process.argv.includes("--studio");
const workbench = process.argv.includes("--workbench");
const desktop = process.argv.includes("--desktop");
const prefix = catalog
  ? "catalog"
  : tablePrefs
    ? "table-prefs"
    : filters
      ? "filters"
      : collections
        ? "collections"
        : sidebars
          ? "sidebars"
          : modals
            ? "modals"
            : tokens
              ? "tokens"
              : notifications
                ? "notifications"
                : colors
                  ? "colors"
                  : actions
                    ? "actions"
                    : dates
                      ? "dates"
                      : tracks
                        ? "tracks"
                        : time
                          ? "time"
                          : choices
                            ? "choices"
                            : controls
                              ? "controls"
                              : studio
                                ? "studio"
                                : workbench
                                  ? "workbench"
                                  : desktop
                                    ? "desktop"
                                    : "uikit";
const nameId = catalog
  ? "catalog-name"
  : tablePrefs
    ? "table-prefs-name"
    : filters
      ? "filters-name"
      : collections
        ? "collections-name"
        : sidebars
          ? "sidebars-name"
          : modals
            ? "modals-name"
            : tokens
              ? "tokens-name"
              : notifications
                ? "notifications-name"
                : colors
                  ? "colors-name"
                  : actions
                    ? "actions-name"
                    : dates
                      ? "dates-name"
                      : time
                        ? "time-name"
                        : choices
                          ? "choices-name"
                          : controls
                            ? "controls-name"
                            : studio
                              ? "studio-name"
                              : workbench
                                ? "workbench-name"
                                : desktop
                                  ? "desktop-name"
                                  : "demo-name";
const themeId = catalog
  ? "catalog-theme"
  : tablePrefs
    ? "table-prefs-theme"
    : filters
      ? "filters-theme"
      : collections
        ? "collections-theme"
        : sidebars
          ? "sidebars-theme"
          : modals
            ? "modals-theme"
            : tokens
              ? "tokens-theme"
              : notifications
                ? "notifications-theme"
                : colors
                  ? "colors-theme"
                  : actions
                    ? "actions-theme"
                    : dates
                      ? "dates-theme"
                      : time
                        ? "time-theme"
                        : choices
                          ? "choices-theme"
                          : controls
                            ? "controls-theme"
                            : studio
                              ? "studio-theme"
                              : workbench
                                ? "workbench-theme"
                                : desktop
                                  ? "desktop-theme"
                                  : "theme";
const child = spawn(
  process.execPath,
  [
    "apps/gallery/src/main.tsx",
    ...(catalog
      ? ["--catalog"]
      : tablePrefs
        ? ["--table-prefs"]
        : filters
          ? ["--filters"]
          : collections
            ? ["--collections"]
            : sidebars
              ? ["--sidebars"]
              : modals
                ? ["--modals"]
                : tokens
                  ? ["--tokens"]
                  : notifications
                    ? ["--notifications"]
                    : colors
                      ? ["--colors"]
                      : actions
                        ? ["--actions"]
                        : dates
                          ? ["--dates"]
                          : time
                            ? ["--time"]
                            : choices
                              ? ["--choices"]
                              : controls
                                ? ["--controls"]
                                : studio
                                  ? ["--studio"]
                                  : workbench
                                    ? ["--workbench"]
                                    : desktop
                                      ? ["--desktop"]
                                      : []),
  ],
  {
    stdio: ["pipe", "pipe", "pipe"],
  },
);
let errors = "";
child.stderr.on("data", (chunk) => {
  errors += String(chunk);
});
const deadline = setTimeout(() => {
  console.error(errors || "Native window timed out");
  child.kill();
  process.exit(1);
}, 30000);
const app = await connectStdio({
  write: (chunk) => {
    child.stdin.write(chunk);
  },
  feed: (listener) => {
    child.stdout.on("data", (chunk) => listener(String(chunk)));
  },
  close: async () => {
    clearTimeout(deadline);
    child.kill();
  },
});
try {
  await app.getByTestId(nameId).waitFor({ timeoutMs: 15000 });
  await app.getByTestId(nameId).fill("真实窗口输入");
  if (tracks) await app.getByTestId("controls-page-tracks").press("enter");
  await app.getByTestId(`${themeId}-light`).press("enter");
  assert(
    JSON.stringify(await app.call("getPaintedText", {})).includes(
      "真实窗口输入",
    ),
  );
  mkdirSync("artifacts", { recursive: true });
  await app.screenshot({ path: resolve(`artifacts/${prefix}-live-light.png`) });
  await app.getByTestId(`${themeId}-dark`).press("enter");
  await app.screenshot({ path: resolve(`artifacts/${prefix}-live-dark.png`) });
  console.log(
    "PASS: real macOS window startup, Chinese text injection, keyboard theme changes, screenshots and close",
  );
} catch (error) {
  console.error(errors);
  throw error;
} finally {
  await app.close();
}
