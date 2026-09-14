import { describe, it, expect } from "vitest";
import {
  checkboxState,
  toggleCheckboxScope,
  checkboxOptionsError,
} from "../components/checkbox/model";
import {
  tokenKey,
  tokenConfigurationError,
  prepareTokens,
} from "../components/tags/model";
const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "locked", label: "L", disabled: true },
];
describe("selection scope and tokens", () => {
  it("derives partial state from enabled options only", () => {
    expect(checkboxState(options, ["a", "locked"])).toBe("indeterminate");
    expect(checkboxState(options, ["a", "b"])).toBe(true);
    expect(checkboxState(options, ["locked"])).toBe(false);
    expect(checkboxState([], [])).toBe(false);
  });
  it("preserves out-of-scope and disabled selections for bulk changes", () => {
    expect(
      toggleCheckboxScope(options, ["a", "locked", "other"], false),
    ).toEqual(["locked", "other"]);
    expect(toggleCheckboxScope(options, ["locked", "other"], true)).toEqual([
      "locked",
      "other",
      "a",
      "b",
    ]);
    expect(checkboxOptionsError([options[0]!, options[0]!])).toBeTruthy();
  });
  it("adds a normalized batch while retaining order and immutable inputs", () => {
    const current = [{ id: "old", label: "Old" }];
    const result = prepareTokens(current, " Design; 开发 ,\nResearch ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.added.map((t) => t.label)).toEqual([
        "Design",
        "开发",
        "Research",
      ]);
      expect(result.value.map((t) => t.id)).toEqual([
        "old",
        "design",
        "开发",
        "research",
      ]);
    }
    expect(current).toHaveLength(1);
  });
  it("rejects duplicates across current values and within a batch atomically", () => {
    expect(
      prepareTokens([{ id: "d", label: "Design" }], "design;New"),
    ).toMatchObject({ ok: false, code: "duplicate" });
    expect(prepareTokens([], "New,new")).toMatchObject({
      ok: false,
      code: "duplicate",
    });
    expect(prepareTokens([], "New,new", { caseSensitive: true }).ok).toBe(true);
    expect(tokenKey("e\u0301")).toBe(tokenKey("é"));
  });
  it("counts code points and enforces draft and token bounds", () => {
    expect(prepareTokens([], "😀😀", { maxTokenLength: 2 }).ok).toBe(true);
    expect(prepareTokens([], "😀😀😀", { maxTokenLength: 2 })).toMatchObject({
      ok: false,
      code: "length",
    });
    expect(prepareTokens([], "a,b,c", { maxTokens: 2 })).toMatchObject({
      ok: false,
      code: "count",
    });
    expect(prepareTokens([], "x".repeat(10001))).toMatchObject({
      ok: false,
      code: "length",
    });
    expect(prepareTokens([], " , ; ")).toMatchObject({
      ok: false,
      code: "empty",
    });
  });
  it("honors custom delimiters and rejects invalid existing data", () => {
    expect(prepareTokens([], "a|b", { separators: ["|"] }).ok).toBe(true);
    expect(
      tokenConfigurationError([
        { id: "a", label: "A" },
        { id: "a", label: "B" },
      ]),
    ).toBeTruthy();
    expect(tokenConfigurationError([], { maxTokens: Infinity })).toBeTruthy();
    expect(tokenConfigurationError([], { separators: [""] })).toBeTruthy();
  });
  it("applies application validation and catches invalid factories without leaking exceptions", () => {
    expect(
      prepareTokens([], "valid,bad", {
        validateToken: (t) => (t === "bad" ? "Rejected" : null),
      }),
    ).toMatchObject({ ok: false, code: "validation", message: "Rejected" });
    expect(
      prepareTokens([], "x", {
        createToken: () => {
          throw Error("private details");
        },
      }),
    ).toMatchObject({
      ok: false,
      code: "creation",
      message: "Unable to create this token.",
    });
    expect(
      prepareTokens([], "a,b", {
        createToken: (label) => ({ id: "same", label }),
      }),
    ).toMatchObject({ ok: false, code: "duplicate" });
  });
});
