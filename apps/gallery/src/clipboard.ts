import { createHostAdapter } from "@mirai/gpuix-kit";
// 系统剪贴板只存在于示例应用入口；组件库只依赖适配接口。
export const clipboard = createHostAdapter(
  process.platform === "darwin"
    ? {
        async writeClipboardText(text: string) {
          const child = Bun.spawn(["/usr/bin/pbcopy"], {
            stdin: new Blob([text]),
            stdout: "ignore",
            stderr: "pipe",
          });
          if ((await child.exited) !== 0) throw Error("Clipboard write failed");
        },
      }
    : {},
);
