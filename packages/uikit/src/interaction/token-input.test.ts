import { describe, it, expect } from "vitest";
import {
  addTokenSuggestion,
  createSuggestedToken,
  filterTokenSuggestions,
  renameToken,
  clearRemovableTokens,
  suggestionConfigurationError,
  tokenPage,
  type EditableToken,
} from "../components/token-input/model";
describe("token suggestion and edit rules", () => {
  it("matches normalized labels, descriptions and keywords excluding selected identities", () => {
    const options = [
      { id: "a", label: "Caf\u00e9", keywords: ["coffee"] },
      { id: "b", label: "Design", description: "Native UI" },
      { id: "c", label: "Other" },
    ];
    expect(
      filterTokenSuggestions(options, "CAFE\u0301").map((t) => t.id),
    ).toEqual(["a"]);
    expect(filterTokenSuggestions(options, "coffee").map((t) => t.id)).toEqual([
      "a",
    ]);
    expect(filterTokenSuggestions(options, "native").map((t) => t.id)).toEqual([
      "b",
    ]);
    expect(
      filterTokenSuggestions(options, "", [
        { id: "unknown", label: "DESIGN" },
      ]).map((t) => t.id),
    ).toEqual(["a", "c"]);
    expect(filterTokenSuggestions(options, "caf\u00e9", [], true)).toEqual([]);
  });
  it("validates bounded catalog identities and metadata", () => {
    expect(
      suggestionConfigurationError(
        Array.from({ length: 501 }, (_, i) => ({
          id: String(i),
          label: String(i),
        })),
      ),
    ).toBeTruthy();
    for (const options of [
      [
        { id: "a", label: "A" },
        { id: "b", label: "a" },
      ],
      [
        { id: "a", label: "A" },
        { id: "a", label: "B" },
      ],
      [{ id: " ", label: "A" }],
      [{ id: "a", label: "A", keywords: Array(21).fill("k") }],
      [{ id: "a", label: "A", description: "x".repeat(1001) }],
    ])
      expect(suggestionConfigurationError(options)).toBeTruthy();
  });
  it("preserves catalog IDs and protection without invoking free creation", () => {
    const option = { id: "catalog-42", label: "Research", removable: false };
    expect(
      addTokenSuggestion([], option, {
        createToken: () => {
          throw Error("must not run");
        },
      }),
    ).toEqual({ ok: true, value: [option], added: [option] });
    expect(addTokenSuggestion([], { ...option, disabled: true }).ok).toBe(
      false,
    );
    expect(
      addTokenSuggestion([{ id: "old", label: "research" }], option).ok,
    ).toBe(false);
  });
  it("applies count, length and business validation to suggestions", () => {
    expect(
      addTokenSuggestion(
        [{ id: "a", label: "A" }],
        { id: "b", label: "B" },
        { maxTokens: 1 },
      ).ok,
    ).toBe(false);
    expect(
      addTokenSuggestion([], { id: "b", label: "Long" }, { maxTokenLength: 3 })
        .ok,
    ).toBe(false);
    expect(
      addTokenSuggestion(
        [],
        { id: "b", label: "B" },
        { validateToken: () => "Forbidden" },
      ),
    ).toMatchObject({ ok: false, message: "Forbidden" });
  });
  it("creates one literal label and rejects catalog collisions after factory transformations", () => {
    expect(createSuggestedToken([], "A,B", [])).toMatchObject({
      ok: true,
      added: [{ id: "a,b", label: "A,B" }],
    });
    expect(
      createSuggestedToken([], "Design", [{ id: "d", label: "Design" }]).ok,
    ).toBe(false);
    expect(
      createSuggestedToken([], "New", [{ id: "d", label: "Design" }], {
        createToken: () => ({ id: "d", label: "New" }),
      }).ok,
    ).toBe(false);
    expect(
      createSuggestedToken([], "New", [{ id: "d", label: "Design" }], {
        createToken: () => ({ id: "n", label: "Design" }),
      }).ok,
    ).toBe(false);
  });
  it("renames immutably with ID, flags and NFC normalization", () => {
    const original: EditableToken[] = [
      { id: "stable", label: "Old", removable: false },
      { id: "b", label: "Other" },
    ];
    expect(renameToken(original, "stable", " Cafe\u0301 ")).toMatchObject({
      ok: true,
      value: [
        { id: "stable", label: "Caf\u00e9", removable: false },
        { id: "b", label: "Other" },
      ],
    });
    expect(original[0]!.label).toBe("Old");
  });
  it("rejects duplicate, empty, unavailable and oversized renames", () => {
    const tokens: EditableToken[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", editable: false },
      { id: "c", label: "C", disabled: true },
    ];
    for (const [id, draft] of [
      ["a", " b "],
      ["a", ""],
      ["b", "New"],
      ["c", "New"],
      ["missing", "New"],
    ])
      expect(renameToken(tokens, id!, draft!).ok).toBe(false);
    expect(
      renameToken(tokens, "a", "\u{1f600}\u{1f600}", { maxTokenLength: 1 }).ok,
    ).toBe(false);
    expect(
      renameToken([{ id: "a", label: "A" }], "a", "\u{1f600}", {
        maxTokenLength: 1,
      }).ok,
    ).toBe(true);
  });
  it("does not disclose validator exception text", () => {
    expect(
      renameToken([{ id: "a", label: "A" }], "a", "Next", {
        validateToken: () => {
          throw Error("private detail");
        },
      }),
    ).toEqual({
      ok: false,
      code: "validation",
      message: "Unable to validate this label.",
    });
  });
  it("clears only removable enabled tokens independently of rename protection", () => {
    const tokens: EditableToken[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", removable: false },
      { id: "c", label: "C", disabled: true },
      { id: "d", label: "D", editable: false },
    ];
    expect(clearRemovableTokens(tokens).map((t) => t.id)).toEqual(["b", "c"]);
    expect(tokens.length).toBe(4);
  });
  it("bounds current-page mounts", () => {
    expect(tokenPage(999, 3, 25)).toEqual({
      page: 8,
      pages: 9,
      size: 3,
      start: 24,
      end: 25,
    });
    expect(tokenPage(NaN, 999, 100).size).toBe(8);
    expect(tokenPage(-1, 0, 0)).toEqual({
      page: 0,
      pages: 1,
      size: 1,
      start: 0,
      end: 0,
    });
  });
});
