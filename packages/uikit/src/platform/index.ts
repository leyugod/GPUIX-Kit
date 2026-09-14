import type { NativeRenderer } from "@gpuix/react";
export type PlatformResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; reason: "unsupported" | "failed"; message: string };
/** 这里只报告 UIKit 已映射的端口，不据此推断操作系统的全部能力。 */
export function createWindowAdapter(renderer: NativeRenderer | null) {
  const attempt = <T>(action: (() => T) | undefined): PlatformResult<T> => {
    if (!action)
      return {
        ok: false,
        reason: "unsupported",
        message:
          "This renderer does not expose the requested window capability.",
      };
    try {
      return { ok: true, value: action() };
    } catch {
      return {
        ok: false,
        reason: "failed",
        message: "The native window operation failed.",
      };
    }
  };
  return {
    capabilities: {
      windowMetrics: typeof renderer?.getWindowSize === "function",
      windowTitle: typeof renderer?.setWindowTitle === "function",
      activateWindow: typeof renderer?.activateWindow === "function",
      systemMenus: false,
      filePanels: false,
      clipboard: false,
      screenReaderSemantics: false,
    },
    getSize: () =>
      attempt(
        renderer?.getWindowSize ? () => renderer.getWindowSize!() : undefined,
      ),
    setTitle: (title: string) =>
      attempt(
        renderer?.setWindowTitle
          ? () => renderer.setWindowTitle!(title)
          : undefined,
      ),
    activate: () =>
      attempt(
        renderer?.activateWindow ? () => renderer.activateWindow!() : undefined,
      ),
  };
}

export * from "./host";
