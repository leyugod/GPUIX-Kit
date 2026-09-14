import { describe, it, expect } from "vitest";
import {
  collectionError,
  collectionLayout,
  collectionTarget,
} from "../components/collection/model";
import {
  lazyTreeError,
  lazyTreeRows,
  lazyBranch,
  treeLoadState,
  treeRequestKey,
  type LazyTreeNode,
} from "../components/lazy-tree/model";
const items = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  disabled: i === 1 || i === 4,
}));
describe("collection page rules", () => {
  it("rejects duplicate or oversized pages", () => {
    expect(collectionError(items)).toBeNull();
    expect(collectionError([{ id: "a" }, { id: "a" }])).toBeTruthy();
    expect(
      collectionError(
        Array.from({ length: 101 }, (_, i) => ({ id: String(i) })),
      ),
    ).toBeTruthy();
  });
  it("bounds columns and cell dimensions", () => {
    const l = collectionLayout(600, 20, Infinity);
    expect(l.columns).toBe(3);
    expect(l.cellWidth * l.columns + (l.columns - 1) * 12).toBe(574);
    expect(l.cardHeight).toBe(140);
    expect(collectionLayout(120, 6).columns).toBe(1);
  });
  it("handles nonfinite geometry", () => {
    expect(collectionLayout(NaN, NaN, -3)).toMatchObject({
      width: 600,
      cardHeight: 80,
    });
    expect(collectionLayout(0).cellWidth).toBeGreaterThan(0);
  });
  it("skips disabled cells horizontally", () => {
    expect(collectionTarget(items, "0", "right", 3)).toBe("2");
    expect(collectionTarget(items, "2", "left", 3)).toBe("0");
  });
  it("maintains column intent vertically", () => {
    expect(collectionTarget(items, "0", "down", 3)).toBe("3");
    expect(collectionTarget(items, "2", "down", 3)).toBe("5");
    expect(collectionTarget(items, "5", "down", 3)).toBe("7");
  });
  it("skips an unavailable target row", () => {
    const a = Array.from({ length: 9 }, (_, i) => ({
      id: String(i),
      disabled: i >= 3 && i <= 5,
    }));
    expect(collectionTarget(a, "1", "down", 3)).toBe("7");
  });
  it("clamps ends and page navigation", () => {
    expect(collectionTarget(items, "0", "home", 3)).toBe("0");
    expect(collectionTarget(items, "0", "end", 3)).toBe("7");
    expect(collectionTarget(items, "0", "pagedown", 3, 2)).toBe("6");
    expect(collectionTarget(items, "0", "up", 3)).toBeNull();
  });
  it("ignores empty or all-disabled collections", () => {
    expect(collectionTarget([], null, "end", 3)).toBeNull();
    expect(
      collectionTarget([{ id: "x", disabled: true }], null, "right", 1),
    ).toBeNull();
  });
});
describe("lazy tree rules", () => {
  const tree: LazyTreeNode[] = [
    { id: "root", label: "Root", children: [{ id: "child", label: "Child" }] },
    { id: "remote", label: "Remote", hasChildren: true },
  ];
  it("distinguishes unloaded branches from loaded empty branches", () => {
    expect(treeLoadState(tree[1]!)).toBe("unloaded");
    expect(
      treeLoadState({ id: "x", label: "X", hasChildren: true, children: [] }),
    ).toBe("ready");
    expect(lazyBranch(tree[1]!)).toBe(true);
  });
  it("flattens only open descendants but preserves parent identities", () => {
    expect(lazyTreeRows(tree, []).length).toBe(2);
    expect(lazyTreeRows(tree, ["root"])[1]).toMatchObject({
      depth: 1,
      parentId: "root",
      node: { id: "child" },
    });
    expect(lazyTreeRows(tree, [], true).length).toBe(3);
  });
  it("validates hidden branches and cycles", () => {
    expect(
      lazyTreeError([
        {
          id: "root",
          label: "Root",
          children: [{ id: "root", label: "Duplicate" }],
        },
      ]),
    ).toBeTruthy();
    const cyclic: LazyTreeNode = { id: "x", label: "X" };
    cyclic.children = [cyclic];
    expect(lazyTreeError([cyclic])).toBeTruthy();
  });
  it("bounds depth and total nodes", () => {
    let chain: LazyTreeNode = { id: "0", label: "N" };
    for (let i = 1; i < 10; i++)
      chain = { id: String(i), label: "N", children: [chain] };
    expect(lazyTreeError([chain])).toBeTruthy();
    expect(
      lazyTreeError(
        Array.from({ length: 201 }, (_, i) => ({ id: String(i), label: "N" })),
      ),
    ).toBeTruthy();
  });
  it("keys requests by stable identity and revision", () => {
    expect(treeRequestKey({ id: "a", label: "A" })).toBe(
      treeRequestKey({ id: "a", label: "Renamed" }),
    );
    expect(treeRequestKey({ id: "a", label: "A", revision: 1 })).not.toBe(
      treeRequestKey({ id: "a", label: "A", revision: 2 }),
    );
  });
  it("does not mutate immutable input while flattening", () => {
    const t = Object.freeze([
      {
        id: "x",
        label: "X",
        children: Object.freeze([{ id: "y", label: "Y" }]),
      },
    ]);
    expect(lazyTreeRows(t, ["x"]).map((r) => r.node.id)).toEqual(["x", "y"]);
    expect(t[0]!.children.length).toBe(1);
  });
});
