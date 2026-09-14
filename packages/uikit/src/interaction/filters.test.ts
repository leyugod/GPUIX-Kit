import { describe, it, expect } from "vitest";
import {
  filterFieldsError,
  filterShapeError,
  filterExpressionError,
  conditionValueError,
  filterOperators,
  defaultCondition,
  cloneFilter,
  filterFingerprint,
  conditionLabel,
  nextConditionId,
  savedViewsError,
  viewNameError,
  normalizeViewName,
  type FilterField,
  type FilterExpression,
} from "../components/filters/model";
const fields: FilterField[] = [
  { id: "t", label: "Text", kind: "text" },
  { id: "n", label: "Number", kind: "number" },
  { id: "d", label: "Date", kind: "date" },
  {
    id: "e",
    label: "Enum",
    kind: "enum",
    options: [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta", disabled: true },
    ],
  },
  { id: "b", label: "Boolean", kind: "boolean" },
  { id: "x", label: "Off", kind: "text", disabled: true },
];
const expr = (
  fieldId = "t",
  value = "hello",
  operator = "equals",
): FilterExpression => ({
  match: "all",
  conditions: [{ id: "c", fieldId, value, operator: operator as "equals" }],
});
describe("filter expressions", () => {
  it("bounds and unique field identities", () => {
    expect(filterFieldsError(fields)).toBeNull();
    expect(filterFieldsError([...fields, fields[0]!])).toBeTruthy();
    expect(
      filterFieldsError(
        Array.from({ length: 25 }, (_, i) => ({
          ...fields[0]!,
          id: String(i),
        })),
      ),
    ).toBeTruthy();
  });
  it("requires bounded unique enum options", () => {
    expect(
      filterFieldsError([{ id: "e", label: "E", kind: "enum" }]),
    ).toBeTruthy();
    expect(
      filterFieldsError([
        {
          ...fields[3]!,
          options: [
            { value: "a", label: "A" },
            { value: "a", label: "B" },
          ],
        },
      ]),
    ).toBeTruthy();
  });
  it("operators are typed", () => {
    expect(filterOperators("number")).toContain("gt");
    expect(filterOperators("text")).not.toContain("gt");
    expect(filterShapeError(fields, expr("t", "1", "gt"))).toBeTruthy();
  });
  it("draft blanks are structurally valid but not applicable", () => {
    expect(filterShapeError(fields, expr("t", ""))).toBeNull();
    expect(filterExpressionError(fields, expr("t", ""))).toBeTruthy();
  });
  it("accepts decimal numbers and rejects nonfinite or alternate notation", () => {
    for (const value of ["1", "-0.25", ".5", "+10."])
      expect(filterExpressionError(fields, expr("n", value))).toBeNull();
    for (const value of ["NaN", "Infinity", "0x10", "1e4", "1,2", "2a"])
      expect(filterExpressionError(fields, expr("n", value))).toBeTruthy();
  });
  it("validates calendar dates", () => {
    expect(filterExpressionError(fields, expr("d", "2024-02-29"))).toBeNull();
    expect(filterExpressionError(fields, expr("d", "2025-02-29"))).toBeTruthy();
  });
  it("checks enum membership and availability", () => {
    expect(filterExpressionError(fields, expr("e", "a"))).toBeNull();
    expect(filterExpressionError(fields, expr("e", "b"))).toBeTruthy();
    expect(filterExpressionError(fields, expr("e", "missing"))).toBeTruthy();
  });
  it("boolean values remain explicit strings", () => {
    expect(filterExpressionError(fields, expr("b", "false"))).toBeNull();
    expect(filterExpressionError(fields, expr("b", "0"))).toBeTruthy();
  });
  it("valueless operators reject stale hidden values", () => {
    expect(filterExpressionError(fields, expr("t", "", "isEmpty"))).toBeNull();
    expect(
      filterExpressionError(fields, expr("t", "stale", "isEmpty")),
    ).toBeTruthy();
    expect(
      filterExpressionError(fields, expr("x", "", "isEmpty")),
    ).toBeTruthy();
  });
  it("bounds conditions, identity, unknown fields and long drafts", () => {
    const e = expr();
    expect(
      filterShapeError(fields, {
        ...e,
        conditions: [...e.conditions, ...e.conditions],
      }),
    ).toBeTruthy();
    expect(filterShapeError(fields, expr("missing"))).toBeTruthy();
    expect(
      filterExpressionError(fields, expr("t", "a".repeat(501))),
    ).toBeTruthy();
    expect(
      filterShapeError(fields, {
        ...e,
        conditions: Array.from({ length: 13 }, (_, i) => ({
          ...e.conditions[0]!,
          id: String(i),
        })),
      }),
    ).toBeTruthy();
  });
  it("empty expressions are valid for either mode", () => {
    for (const match of ["all", "any"] as const)
      expect(
        filterExpressionError(fields, { match, conditions: [] }),
      ).toBeNull();
  });
  it("clones snapshots and preserves order identity", () => {
    const source = expr(),
      copy = cloneFilter(source);
    copy.conditions[0]!.value = "changed";
    expect(source.conditions[0]!.value).toBe("hello");
    expect(filterFingerprint(source)).not.toBe(filterFingerprint(copy));
  });
  it("new conditions reset values by kind and find free IDs", () => {
    expect(defaultCondition("a", fields[3]!).value).toBe("a");
    expect(defaultCondition("a", fields[4]!).value).toBe("true");
    expect(
      nextConditionId({
        match: "all",
        conditions: [{ ...expr().conditions[0]!, id: "condition-1" }],
      }),
    ).toBe("condition-2");
  });
  it("labels use enum display names", () => {
    expect(conditionLabel(fields, expr("e", "a").conditions[0]!)).toBe(
      "Enum is Alpha",
    );
  });
});
describe("saved view catalog", () => {
  it("normalizes and validates names case-insensitively", () => {
    const views = [{ id: "a", label: "Design", filter: expr() }];
    expect(normalizeViewName("  Cafe\u0301 ")).toBe("Café");
    expect(viewNameError("design", views)).toBeTruthy();
    expect(viewNameError("DESIGN", views, "a")).toBeNull();
    expect(viewNameError(" ", views)).toBeTruthy();
    expect(viewNameError("x".repeat(81), views)).toBeTruthy();
  });
  it("rejects duplicate names, IDs and oversized catalogs", () => {
    const view = { id: "a", label: "A", filter: expr() };
    expect(savedViewsError(fields, [view])).toBeNull();
    expect(
      savedViewsError(fields, [view, { ...view, id: "b", label: "a" }]),
    ).toBeTruthy();
    expect(
      savedViewsError(
        fields,
        Array.from({ length: 51 }, (_, i) => ({
          ...view,
          id: String(i),
          label: String(i),
        })),
      ),
    ).toBeTruthy();
  });
  it("retains structurally valid but obsolete values for repair", () => {
    expect(
      savedViewsError(fields, [
        { id: "v", label: "Old", filter: expr("e", "removed") },
      ]),
    ).toBeNull();
    expect(
      savedViewsError(fields, [
        { id: "v", label: "Bad", filter: expr("removed") },
      ]),
    ).toBeTruthy();
  });
});
