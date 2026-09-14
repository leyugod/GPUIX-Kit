import { spawn } from "node:child_process";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { connectStdio } from "@gpuix/react/automation";
// 真实窗口验证输入和键盘主题操作；点击交互在 TestRenderer 中执行。
const entry = process.argv[2] ?? "apps/gallery/src/main.tsx",
  prefix = process.argv[3] ?? "handbook",
  name = process.argv[4] ?? "handbook";
const child = spawn(process.execPath, [entry, "--automation-stdio"], {
  stdio: ["pipe", "pipe", "pipe"],
});
let errors = "";
child.stderr.on("data", (c) => {
  errors += String(c);
});
const deadline = setTimeout(() => {
  child.kill();
  console.error(errors || "Window timeout");
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
  const input = prefix === "handbook" ? "handbook-search" : "starter-name";
  await app.getByTestId(input).waitFor({ timeoutMs: 15000 });
  await app
    .getByTestId(input)
    .fill(prefix === "handbook" ? "buttons" : "Independent window");
  for (const mode of ["light", "dark"]) {
    await app.getByTestId(prefix + "-theme-" + mode).press("enter");
    const text = JSON.stringify(await app.call("getPaintedText", {}));
    assert(
      text.includes(prefix === "handbook" ? "Buttons" : "Independent window"),
    );
    await app.screenshot({
      path: resolve(
        process.env.DELIVERY_ARTIFACTS ?? "artifacts",
        name + "-live-" + mode + ".png",
      ),
    });
  }
  console.log("PASS real window: " + name);
} catch (e) {
  console.error(errors);
  throw e;
} finally {
  await app.close();
}
