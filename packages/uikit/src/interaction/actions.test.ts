import { describe, it, expect } from "vitest";
import {
  collectionError,
  partitionActions,
  partitionPath,
  nextActionId,
  actionEnabled,
  type UIKitAction,
} from "../components/actions/model";
const action = (id: string, props: Partial<UIKitAction> = {}): UIKitAction => ({
  id,
  label: id,
  run: () => {},
  ...props,
});
describe("bounded actions and navigation", () => {
  it("rejects duplicate, blank and excessive collections", () => {
    expect(collectionError([action("a"), action("a")])).toBeTruthy();
    expect(collectionError([action(" ")])).toBeTruthy();
    expect(collectionError([action("a", { label: " " })])).toBeTruthy();
    expect(
      collectionError(Array.from({ length: 101 }, (_, i) => action(String(i)))),
    ).toBeTruthy();
    expect(collectionError([action("a")])).toBeNull();
  });
  it("partitions after hiding actions and preserves source order", () => {
    const items = [
      action("a"),
      action("hidden", { hidden: true }),
      action("locked", { disabled: true }),
      action("b"),
    ];
    const parts = partitionActions(items, 2);
    expect(parts.visible.map((i) => i.id)).toEqual(["a", "locked"]);
    expect(parts.overflow.map((i) => i.id)).toEqual(["b"]);
    expect(items).toHaveLength(4);
  });
  it("normalizes counts without losing actions", () => {
    const items = Array.from({ length: 20 }, (_, i) => action(String(i)));
    expect(partitionActions(items, -1).visible).toHaveLength(0);
    expect(partitionActions(items, NaN).overflow).toHaveLength(20);
    expect(partitionActions(items, 3.9).visible).toHaveLength(3);
    expect(partitionActions(items, 999).visible).toHaveLength(12);
  });
  it("skips disabled, pending and hidden commands with wrapping", () => {
    const items = [
      action("a"),
      action("b", { disabled: true }),
      action("c", { loading: true }),
      action("d", { hidden: true }),
      action("e"),
    ];
    expect(nextActionId(items, "a", "right")).toBe("e");
    expect(nextActionId(items, "a", "left")).toBe("e");
    expect(nextActionId(items, "e", "down")).toBe("a");
    expect(nextActionId(items, "e", "home")).toBe("a");
    expect(nextActionId(items, "a", "end")).toBe("e");
    expect(
      nextActionId([action("a", { disabled: true })], "a", "down"),
    ).toBeUndefined();
    expect(actionEnabled(items[2]!)).toBe(false);
  });
  it("retains root and current path while exposing every ancestor exactly once", () => {
    const items = Array.from({ length: 8 }, (_, i) => action(String(i)));
    const parts = partitionPath(items, 3);
    expect(parts.leading.map((i) => i.id)).toEqual(["0"]);
    expect(parts.hidden.map((i) => i.id)).toEqual(["1", "2", "3", "4", "5"]);
    expect(parts.trailing.map((i) => i.id)).toEqual(["6", "7"]);
    expect([...parts.leading, ...parts.hidden, ...parts.trailing]).toEqual(
      items,
    );
    expect(partitionPath(items, NaN).hidden).toHaveLength(6);
  });
  it("handles empty and single-location paths", () => {
    expect(partitionPath([], 2)).toEqual({
      leading: [],
      hidden: [],
      trailing: [],
    });
    expect(partitionPath([action("root")], 2).trailing[0]?.id).toBe("root");
    expect(partitionPath([action("root")], 2).leading).toHaveLength(0);
  });
});
