import { describe, it, expect } from "vitest";
import {
  sourceListError,
  sourceEntries,
  sourceTargets,
  sourceActive,
  sourceMove,
  toggleSourceGroup,
  sourceScrollOffset,
  type SourceGroupData,
} from "../components/source-list/model";
import { navigationLayout } from "../components/navigation-split/model";
const groups: SourceGroupData[] = [
  {
    id: "a",
    label: "A",
    items: [
      { id: "one", label: "One" },
      { id: "off", label: "Off", disabled: true },
      { id: "two", label: "Two" },
    ],
  },
  {
    id: "b",
    label: "B",
    collapsible: false,
    items: [{ id: "three", label: "Three" }],
  },
];
describe("source navigation rules", () => {
  it("validates global item identity and bounded groups", () => {
    expect(sourceListError(groups)).toBeNull();
    expect(
      sourceListError([
        ...groups,
        { id: "c", label: "C", items: [{ id: "one", label: "Duplicate" }] },
      ]),
    ).toBeTruthy();
    expect(
      sourceListError(
        Array.from({ length: 21 }, (_, i) => ({
          id: String(i),
          label: "G",
          items: [],
        })),
      ),
    ).toBeTruthy();
    expect(
      sourceListError([
        {
          id: "x",
          label: "X",
          items: Array.from({ length: 101 }, (_, i) => ({
            id: String(i),
            label: "I",
          })),
        },
      ]),
    ).toBeTruthy();
  });
  it("rejects invalid IDs and labels without mutating", () => {
    const g = [{ id: "", label: "Bad", items: [] }];
    expect(sourceListError(g)).toBeTruthy();
    expect(sourceEntries(g, [])).toEqual([]);
    expect(g[0]!.id).toBe("");
    expect(
      sourceListError([
        {
          id: "g",
          label: "G",
          items: [{ id: "x", label: "X", badge: "x".repeat(25) }],
        },
      ]),
    ).toBeTruthy();
  });
  it("collapses only collapsible groups and keeps headers", () => {
    expect(sourceEntries(groups, ["a", "b"]).map((x) => x.key)).toEqual([
      "g:a",
      "g:b",
      "i:three",
    ]);
  });
  it("skips disabled items and clamps keyboard ends", () => {
    const e = sourceEntries(groups, []);
    expect(sourceTargets(e).some((x) => x.key === "i:off")).toBe(false);
    expect(sourceMove(e, "i:one", "down")?.key).toBe("i:two");
    expect(sourceMove(e, "g:a", "up")?.key).toBe("g:a");
    expect(sourceMove(e, "i:three", "down")?.key).toBe("i:three");
    expect(sourceMove(e, null, "end")?.key).toBe("i:three");
  });
  it("preserves valid focus then selected identity and positional fallback", () => {
    const e = sourceEntries(groups, []);
    expect(sourceActive(e, "i:two", "one")?.key).toBe("i:two");
    expect(sourceActive(e, "missing", "one")?.key).toBe("i:one");
    expect(sourceActive(e, "missing", "missing", 2)?.key).toBe("i:two");
    expect(sourceActive([], null, null)).toBeNull();
  });
  it("collapse updates are immutable, deduplicated and preserve foreign IDs", () => {
    const source = Object.freeze(["other"]);
    expect(toggleSourceGroup(source, "a", true)).toEqual(["other", "a"]);
    expect(toggleSourceGroup(["a", "a"], "a", false)).toEqual([]);
    expect(source).toEqual(["other"]);
  });
  it("uses mixed header and row heights for visibility", () => {
    const e = sourceEntries(groups, []);
    expect(sourceScrollOffset(e, "i:three", 64, 38, 0)).toBe(152);
    expect(sourceScrollOffset(e, "g:a", 64, 38, 100)).toBe(0);
    expect(sourceScrollOffset(e, "i:one", 100, 32, 0)).toBe(0);
  });
});
describe("navigation split layout", () => {
  it("fits four columns and conserves width", () => {
    const l = navigationLayout({
      width: 1400,
      contentVisible: true,
      inspectorVisible: true,
    });
    expect(l.sidebar && l.content && l.detail && l.inspector).toBe(true);
    expect(
      l.sidebarWidth + l.contentWidth + l.detailWidth + l.inspectorWidth + 18,
    ).toBe(1400);
  });
  it("removes inspector before sidebar before content", () => {
    expect(
      navigationLayout({
        width: 1000,
        contentVisible: true,
        inspectorVisible: true,
      }),
    ).toMatchObject({ sidebar: true, content: true, inspector: false });
    expect(
      navigationLayout({ width: 700, contentVisible: true }),
    ).toMatchObject({ sidebar: false, content: true });
    expect(
      navigationLayout({ width: 500, contentVisible: true }),
    ).toMatchObject({ sidebar: false, content: false, detail: true });
  });
  it("offers a content-first compact view without changing options", () => {
    const input = Object.freeze({
      width: 500,
      contentVisible: true,
      sidebarVisible: true,
      compactPane: "content" as const,
    });
    expect(navigationLayout(input)).toMatchObject({
      sidebar: false,
      content: true,
      detail: false,
      contentWidth: 500,
    });
    expect(input.sidebarVisible).toBe(true);
  });
  it("bounds invalid requests and narrow windows", () => {
    const l = navigationLayout({
      width: NaN,
      sidebarWidth: Infinity,
      contentWidth: -3,
      inspectorWidth: 999,
    });
    expect(l.width).toBe(1000);
    expect(l.sidebarWidth).toBe(224);
    expect(l.contentWidth).toBe(220);
    expect(l.inspectorWidth).toBe(360);
    expect(
      navigationLayout({
        width: 1,
        contentVisible: true,
        inspectorVisible: true,
      }).detailWidth,
    ).toBe(1);
  });
  it("keeps a deliberate hidden sidebar hidden when spacious", () => {
    expect(
      navigationLayout({ width: 1500, sidebarVisible: false }),
    ).toMatchObject({ sidebar: false, content: false, detailWidth: 1500 });
  });
});
