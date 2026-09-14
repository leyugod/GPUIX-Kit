import { describe, it, expect } from "vitest";
import {
  selectItems,
  togglePageSelection,
  flattenTree,
  nextSort,
  sortRows,
  closeDocument,
} from "./selection";
import {
  validateForm,
  required,
  minLength,
  composeRules,
} from "../components/form/rules";
describe("shared selection and document rules", () => {
  const items = [
    { id: "a" },
    { id: "b", disabled: true },
    { id: "c" },
    { id: "d" },
  ];
  it("skips disabled rows in ranges and preserves off-page selection only for additive intents", () => {
    expect(
      selectItems(items, ["outside"], "c", "a", "multiple", { range: true }),
    ).toEqual(["a", "c"]);
    expect(
      selectItems(items, ["outside"], "c", "a", "multiple", {
        range: true,
        toggle: true,
      }),
    ).toEqual(["outside", "a", "c"]);
    expect(selectItems(items, ["a"], "b", "a", "multiple")).toEqual(["a"]);
    expect(
      selectItems(items, ["a"], "a", null, "multiple", { toggle: true }),
    ).toEqual([]);
    expect(selectItems(items, ["a"], "c", null, "none")).toEqual(["a"]);
  });
  it("selects/deselects only enabled rows on the current page", () => {
    expect(togglePageSelection(items, ["outside"])).toEqual([
      "outside",
      "a",
      "c",
      "d",
    ]);
    expect(togglePageSelection(items, ["outside", "a", "c", "d"])).toEqual([
      "outside",
    ]);
  });
  it("flattens expanded descendants with parent/depth and rejects ambiguous IDs", () => {
    const nodes = [
      {
        id: "a",
        label: "A",
        children: [
          { id: "b", label: "B", children: [{ id: "c", label: "C" }] },
        ],
      },
    ];
    expect(flattenTree(nodes, []).map((r) => r.node.id)).toEqual(["a"]);
    expect(flattenTree(nodes, ["a", "b"]).at(-1)).toMatchObject({
      depth: 2,
      parentId: "b",
    });
    expect(() =>
      flattenTree(
        [{ id: "a", label: "A", children: [{ id: "a", label: "Duplicate" }] }],
        ["a"],
      ),
    ).toThrow("Duplicate");
  });
  it("sorts full records stably with nulls last and cycles sort intent", () => {
    const rows = [
      { id: 1, n: 2 },
      { id: 2, n: null },
      { id: 3, n: 2 },
      { id: 4, n: 1 },
    ];
    expect(
      sortRows(rows, { columnId: "n", direction: "desc" }, (r) => r.n).map(
        (r) => r.id,
      ),
    ).toEqual([1, 3, 4, 2]);
    expect(
      sortRows(rows, { columnId: "n", direction: "asc" }, (r) => r.n)
        .slice(0, 2)
        .map((r) => r.id),
    ).toEqual([4, 1]);
    expect(nextSort(nextSort(null, "n"), "n")).toEqual({
      columnId: "n",
      direction: "desc",
    });
    expect(nextSort({ columnId: "n", direction: "desc" }, "n")).toBeNull();
  });
  it("chooses a non-disabled neighboring document only when the active document closes", () => {
    const tabs = [
      { id: "a" },
      { id: "b" },
      { id: "c", disabled: true },
      { id: "d" },
    ];
    expect(closeDocument(tabs, "b", "b").value).toBe("d");
    expect(closeDocument(tabs, "a", "b").value).toBe("a");
    expect(closeDocument([{ id: "a" }], "a", "a").value).toBeNull();
  });
  it("returns field errors in rule order and supports cross-field validation", () => {
    const rules = {
      name: composeRules(required("Required"), minLength(3)),
      confirm: (v: string, all: { name: string; confirm: string }) =>
        v === all.name ? undefined : "Mismatch",
    };
    expect(validateForm({ name: "", confirm: "x" }, rules)).toEqual({
      name: "Required",
      confirm: "Mismatch",
    });
    expect(validateForm({ name: "Alex", confirm: "Alex" }, rules)).toEqual({});
  });
});
