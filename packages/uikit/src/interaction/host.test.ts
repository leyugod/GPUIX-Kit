import { describe, it, expect } from "vitest";
import { createHostAdapter, type HostPorts } from "../platform/host";
describe("injected host adapter", () => {
  it("reports unsupported without success-shaped placeholders", async () => {
    const host = createHostAdapter();
    expect(host.capabilities.openFiles).toBe(false);
    expect(await host.readClipboardText()).toMatchObject({
      ok: false,
      reason: "unsupported",
    });
    expect(await host.openFiles()).toMatchObject({
      ok: false,
      reason: "unsupported",
    });
  });
  it("captures bound methods and capability snapshot", async () => {
    const ports: HostPorts & { text: string } = {
        text: "Hello",
        readClipboardText() {
          return this.text;
        },
      },
      host = createHostAdapter(ports);
    ports.readClipboardText = undefined;
    expect(await host.readClipboardText()).toEqual({
      ok: true,
      value: "Hello",
    });
    expect(host.capabilities.readClipboardText).toBe(true);
  });
  it("forwards clipboard text once and validates bounds", async () => {
    let text = "",
      calls = 0;
    const host = createHostAdapter({
      writeClipboardText: (v) => {
        text = v;
        calls++;
      },
    });
    expect(await host.writeClipboardText("Local")).toEqual({
      ok: true,
      value: undefined,
    });
    expect(text).toBe("Local");
    expect(await host.writeClipboardText("x".repeat(1048577))).toMatchObject({
      reason: "invalid",
    });
    expect(calls).toBe(1);
  });
  it("sanitizes synchronous and asynchronous failures", async () => {
    const host = createHostAdapter({
      readClipboardText: () => {
        throw Error("SECRET");
      },
      writePreference: async () => {
        throw Error("SECRET");
      },
    });
    expect(JSON.stringify(await host.readClipboardText())).not.toContain(
      "SECRET",
    );
    expect(await host.writePreference("k", "v")).toMatchObject({
      ok: false,
      reason: "failed",
    });
  });
  it("distinguishes cancelled file dialogs from missing preferences", async () => {
    const host = createHostAdapter({
      openFiles: () => null,
      saveFile: () => null,
      readPreference: () => null,
    });
    expect(await host.openFiles()).toMatchObject({ reason: "cancelled" });
    expect(await host.saveFile({ suggestedName: "doc.txt" })).toMatchObject({
      reason: "cancelled",
    });
    expect(await host.readPreference("view")).toEqual({
      ok: true,
      value: null,
    });
  });
  it("validates filenames and filters before invoking ports", async () => {
    let calls = 0;
    const host = createHostAdapter({
      saveFile: () => {
        calls++;
        return "file:///doc";
      },
      openFiles: () => {
        calls++;
        return ["file:///doc"];
      },
    });
    expect(await host.saveFile({ suggestedName: "../doc" })).toMatchObject({
      reason: "invalid",
    });
    expect(
      await host.openFiles({
        filters: [{ label: "Bad", extensions: ["*.txt"] }],
      }),
    ).toMatchObject({ reason: "invalid" });
    expect(await host.saveFile({ suggestedName: "bad\nname" })).toMatchObject({ reason: "invalid" });
    expect(calls).toBe(0);
    expect(await host.saveFile({ suggestedName: "export.txt" })).toEqual({ ok: true, value: "file:///doc" });
  });
  it("copies request filters and returned file references", async () => {
    const refs = ["file:///one"],
      request = { filters: [{ label: "Text", extensions: ["txt"] }] };
    const host = createHostAdapter({
      openFiles: (copy) => {
        copy.filters![0]!.extensions = ["md"];
        return refs;
      },
    });
    const result = await host.openFiles(request);
    expect(request.filters[0]!.extensions).toEqual(["txt"]);
    expect(result).toEqual({ ok: true, value: refs });
    if (result.ok) expect(result.value).not.toBe(refs);
  });
  it("rejects malformed port output and excess selections", async () => {
    const host = createHostAdapter({
      openFiles: () => ["a", "b"],
      readClipboardText: (() => 123) as unknown as () => string,
    });
    expect(await host.openFiles()).toMatchObject({ reason: "failed" });
    expect(await host.openFiles({ multiple: true })).toEqual({
      ok: true,
      value: ["a", "b"],
    });
    expect(await host.readClipboardText()).toMatchObject({ reason: "failed" });
    const mutating = createHostAdapter({ openFiles: request => { request.multiple = true; return ["a", "b"]; } });
    expect(await mutating.openFiles()).toMatchObject({ reason: "failed" });
  });
  it("validates preference keys and returns write outcome", async () => {
    let stored = "";
    const host = createHostAdapter({
      writePreference: (k, v) => {
        stored = k + v;
      },
    });
    expect(await host.writePreference("", "v")).toMatchObject({
      reason: "invalid",
    });
    expect(await host.writePreference("view", "json")).toMatchObject({
      ok: true,
    });
    expect(stored).toBe("viewjson");
  });
});
