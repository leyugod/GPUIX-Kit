import { describe, it, expect } from "vitest";
import {
  columnOptionsError,
  defaultTablePreferences,
  cloneTablePreferences,
  tablePreferencesError,
  toggleColumn,
  moveColumn,
  rowHeightForDensity,
  reconcileTablePreferences,
  sortByRules,
  type TableColumnOption,
} from "../components/table-preferences/model";
const columns: TableColumnOption[] = [
  {
    id: "name",
    label: "Name",
    hideable: false,
    reorderable: false,
    sortable: true,
  },
  { id: "amount", label: "Amount", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "other", label: "Other" },
];
describe("table preferences", () => {
  it("requires bounded unique columns", () => {
    expect(columnOptionsError(columns)).toBeNull();
    expect(columnOptionsError([])).toBeTruthy();
    expect(columnOptionsError([...columns, columns[0]!])).toBeTruthy();
    expect(
      columnOptionsError(
        Array.from({ length: 25 }, (_, i) => ({
          id: String(i),
          label: String(i),
        })),
      ),
    ).toBeTruthy();
  });
  it("defaults show columns in schema order", () => {
    expect(
      tablePreferencesError(columns, defaultTablePreferences(columns)),
    ).toBeNull();
  });
  it("requires exact order identities", () => {
    const p = defaultTablePreferences(columns);
    expect(
      tablePreferencesError(columns, { ...p, order: ["name", "amount"] }),
    ).toBeTruthy();
    expect(
      tablePreferencesError(columns, {
        ...p,
        order: ["name", "amount", "status", "unknown"],
      }),
    ).toBeTruthy();
  });
  it("protects required and last visible columns", () => {
    const p = defaultTablePreferences(columns);
    expect(toggleColumn(columns, p, "name")).toEqual(p);
    let next = toggleColumn(columns, p, "amount");
    expect(next.hiddenIds).toEqual(["amount"]);
    expect(toggleColumn(columns, next, "amount")).toEqual(p);
    const one = [{ id: "a", label: "A" }],
      single = defaultTablePreferences(one);
    expect(toggleColumn(one, single, "a")).toEqual(single);
  });
  it("does not mutate order or hidden arrays", () => {
    const p = defaultTablePreferences(columns);
    moveColumn(columns, p, "amount", 1);
    toggleColumn(columns, p, "status");
    expect(p).toEqual(defaultTablePreferences(columns));
  });
  it("respects locked positions and bounds", () => {
    const p = defaultTablePreferences(columns);
    expect(moveColumn(columns, p, "amount", -1)).toEqual(p);
    expect(moveColumn(columns, p, "other", 1)).toEqual(p);
    expect(moveColumn(columns, p, "amount", 1).order).toEqual([
      "name",
      "status",
      "amount",
      "other",
    ]);
  });
  it("validates sort count direction and uniqueness", () => {
    const p = defaultTablePreferences(columns);
    expect(
      tablePreferencesError(columns, {
        ...p,
        sorts: [{ columnId: "other", direction: "asc" }],
      }),
    ).toBeTruthy();
    expect(
      tablePreferencesError(columns, {
        ...p,
        sorts: [
          { columnId: "name", direction: "asc" },
          { columnId: "name", direction: "desc" },
        ],
      }),
    ).toBeTruthy();
  });
  it("supports hidden sort columns", () => {
    const p = {
      ...defaultTablePreferences(columns),
      hiddenIds: ["amount"],
      sorts: [{ columnId: "amount", direction: "asc" as const }],
    };
    expect(tablePreferencesError(columns, p)).toBeNull();
  });
  it("clones each mutable level", () => {
    const p = {
        ...defaultTablePreferences(columns),
        sorts: [{ columnId: "name", direction: "asc" as const }],
      },
      clone = cloneTablePreferences(p);
    expect(clone.order).not.toBe(p.order);
    expect(clone.sorts[0]).not.toBe(p.sorts[0]);
  });
  it("maps densities without changing regular row height", () => {
    expect(
      ["compact", "regular", "comfortable"].map((d) =>
        rowHeightForDensity(d as "regular"),
      ),
    ).toEqual([34, 42, 54]);
  });
  it("reconciles schema changes explicitly", () => {
    const p = {
      ...defaultTablePreferences(columns),
      order: ["other", "amount", "status", "name"],
      hiddenIds: ["gone", "status"],
      sorts: [
        { columnId: "gone", direction: "asc" as const },
        { columnId: "amount", direction: "desc" as const },
      ],
    };
    const next = reconcileTablePreferences(columns, p);
    expect(next.order).toEqual(["name", "other", "amount", "status"]);
    expect(next.hiddenIds).toEqual(["status"]);
    expect(next.sorts).toEqual([{ columnId: "amount", direction: "desc" }]);
    expect(tablePreferencesError(columns, next)).toBeNull();
  });
  it("restores visibility when migrated schema would hide everything", () => {
    const c = [{ id: "a", label: "A" }],
      p = { ...defaultTablePreferences(c), hiddenIds: ["a"] };
    expect(reconcileTablePreferences(c, p).hiddenIds).toEqual([]);
  });
  it("sorts by multiple priorities and preserves input", () => {
    const rows = [
      { a: "B", n: 1 },
      { a: "A", n: 2 },
      { a: "A", n: 3 },
    ];
    const next = sortByRules(
      rows,
      [
        { columnId: "a", direction: "asc" },
        { columnId: "n", direction: "desc" },
      ],
      (r, id) => r[id as "a"],
    );
    expect(next).toEqual([rows[2], rows[1], rows[0]]);
    expect(rows[0]!.a).toBe("B");
  });
  it("null undefined and nonfinite values remain last in either direction", () => {
    const rows = [null, 3, undefined, NaN, 1];
    for (const direction of ["asc", "desc"] as const)
      expect(
        sortByRules(rows, [{ columnId: "v", direction }], (r) => r).slice(0, 2),
      ).toEqual(direction === "asc" ? [1, 3] : [3, 1]);
  });
  it("equal keys retain stable source order", () => {
    const rows = [
      { id: 1, v: 2 },
      { id: 2, v: 2 },
    ];
    expect(
      sortByRules(rows, [{ columnId: "v", direction: "asc" }], (r) => r.v),
    ).toEqual(rows);
  });
});
