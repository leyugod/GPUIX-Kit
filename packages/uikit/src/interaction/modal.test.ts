import { describe, it, expect } from "vitest";
import { createOverlayStack } from "../core/layer-model";
import { modalDimensions, validatePrompt } from "../components/modal/model";
describe("modal layers and geometry", () => {
  it("preserves parent-before-child order when effects mount children first", () => {
    const s = createOverlayStack(),
      parent = s.allocate("modal"),
      child = s.allocate("popover", parent.id);
    s.mount(child);
    s.mount(parent);
    expect(s.getSnapshot().map((x) => x.id)).toEqual([parent.id, child.id]);
    expect(s.isTop(child.id)).toBe(true);
  });
  it("new sibling modals cover earlier branches", () => {
    const s = createOverlayStack(),
      a = s.allocate("modal"),
      b = s.allocate("popover", a.id),
      c = s.allocate("modal");
    s.mount(a);
    s.mount(b);
    s.mount(c);
    expect(s.isTop(c.id)).toBe(true);
    expect(c.priority).toBeGreaterThan(b.priority + 3);
  });
  it("supports effect cleanup and replay without duplicate registrations", () => {
    const s = createOverlayStack(),
      a = s.allocate("modal");
    let calls = 0;
    const unsub = s.subscribe(() => calls++);
    s.mount(a);
    s.mount(a);
    s.unmount(a.id);
    s.mount(a);
    expect(calls).toBe(3);
    expect(s.getSnapshot()).toHaveLength(1);
    unsub();
    s.unmount(a.id);
    expect(calls).toBe(3);
  });
  it("keeps immutable snapshots and ignores missing removals", () => {
    const s = createOverlayStack(),
      a = s.allocate("modal");
    const before = s.getSnapshot();
    s.unmount(9);
    expect(s.getSnapshot()).toBe(before);
    s.mount(a);
    expect(Object.isFrozen(s.getSnapshot())).toBe(true);
    expect(Object.isFrozen(a)).toBe(true);
    expect(before).toHaveLength(0);
  });
  it("removing a lower layer never makes it the active layer", () => {
    const s = createOverlayStack(),
      a = s.allocate("modal"),
      b = s.allocate("modal", a.id);
    s.mount(a);
    s.mount(b);
    s.unmount(a.id);
    expect(s.has(a.id)).toBe(false);
    expect(s.isTop(b.id)).toBe(true);
    s.unmount(b.id);
    expect(s.getSnapshot()).toEqual([]);
  });
  it("bounds ordinary dialog dimensions", () => {
    expect(modalDimensions(1000, 720, "dialog", 9999)).toEqual({
      width: 968,
      maxHeight: 640,
      height: undefined,
    });
  });
  it("positions sheets and drawers with bounded fixed height", () => {
    expect(modalDimensions(1000, 720, "sheet")).toEqual({
      width: 620,
      maxHeight: 420,
      height: 420,
    });
    expect(modalDimensions(1000, 720, "drawer")).toEqual({
      width: 380,
      maxHeight: 720,
      height: 720,
    });
  });
  it("keeps geometry finite and within tiny viewports", () => {
    for (const kind of ["dialog", "sheet", "drawer"] as const) {
      const d = modalDimensions(100, 90, kind, NaN, Infinity);
      expect(d.width).toBeLessThanOrEqual(100);
      expect(d.maxHeight).toBeLessThanOrEqual(90);
      expect(Number.isFinite(d.width)).toBe(true);
    }
    expect(modalDimensions(NaN, NaN, "sheet").width).toBe(620);
  });
  it("validates prompt text only through explicit application rules", () => {
    expect(validatePrompt("")).toBe(null);
    expect(validatePrompt("", (v) => (v.trim() ? null : "Required"))).toBe(
      "Required",
    );
    expect(validatePrompt("x".repeat(10001))).toBeTruthy();
  });
  it("does not disclose validation exceptions", () => {
    expect(
      validatePrompt("x", () => {
        throw Error("secret");
      }),
    ).toBe("Unable to validate this value.");
  });
});
