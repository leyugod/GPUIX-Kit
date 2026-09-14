import { describe, it, expect } from "vitest";
import {
  validateChart,
  chartDomain,
  chartY,
  lineSegments,
  pieModel,
  arcPath,
  chartColor,
} from "../components/charts/model";
import { canSendMessage } from "../components/messages/model";
import { createWindowAdapter } from "../platform";
describe("chart and message rules", () => {
  it("rejects invalid shape, duplicate IDs and unbounded numeric data", () => {
    expect(
      validateChart(
        [{ id: "a", label: "A" }],
        [{ id: "s", label: "S", values: [] }],
      ),
    ).toMatch(/count/);
    expect(
      validateChart(
        [{ id: "a", label: "A" }],
        [{ id: "s", label: "S", values: [NaN] }],
      ),
    ).toMatch(/finite/);
    expect(
      validateChart(
        [
          { id: "a", label: "A" },
          { id: "a", label: "Again" },
        ],
        [],
      ),
    ).toMatch(/unique/);
    expect(
      validateChart(
        [{ id: "a", label: "A" }],
        [{ id: "s", label: "S", values: [null] }],
      ),
    ).toBeNull();
  });
  it("computes signed stack domains and stable zero domains", () => {
    const s = [
      { id: "a", label: "A", values: [10, -5] },
      { id: "b", label: "B", values: [7, -8] },
    ];
    expect(chartDomain(s, true)).toEqual({ min: -13, max: 17 });
    expect(chartDomain(s, false)).toEqual({ min: -8, max: 10 });
    expect(chartDomain([{ id: "a", label: "A", values: [0, 0] }])).toEqual({
      min: 0,
      max: 1,
    });
    expect(chartY(0, { min: -10, max: 10 }, 100)).toBe(50);
  });
  it("splits line paths at missing values and keeps isolated points", () => {
    const paths = lineSegments([1, null, 2, 3], { min: 0, max: 3 }, 300, 100);
    expect(paths).toHaveLength(2);
    expect(paths[0]).not.toContain("L");
    expect(paths[1]).toContain("L");
    expect(paths.join("")).not.toContain("NaN");
  });
  it("preserves pie totals, skips zero slices, rejects negatives and draws full circles", () => {
    const model = pieModel([
      { id: "a", label: "A", value: 5 },
      { id: "b", label: "B", value: 5 },
      { id: "c", label: "C", value: 0 },
    ]);
    expect(model.total).toBe(10);
    expect(model.segments.map((s) => s.fraction)).toEqual([0.5, 0.5]);
    expect(pieModel([{ id: "a", label: "A", value: -1 }]).error).toBeTruthy();
    expect(pieModel([]).segments).toEqual([]);
    expect(arcPath(50, 50, 40, 0, Math.PI * 2, 20).match(/ A/g)).toHaveLength(
      4,
    );
    expect(chartColor("url(unsafe)", "#112233")).toBe("#112233");
  });
  it("gates sending by text, length, attachment readiness and attachment-only drafts", () => {
    expect(canSendMessage(" \n", [])).toBe(false);
    expect(canSendMessage("four", [], 3)).toBe(false);
    expect(
      canSendMessage("text", [{ id: "a", name: "x", state: "failed" }]),
    ).toBe(false);
    expect(canSendMessage("", [{ id: "a", name: "x", state: "ready" }])).toBe(
      true,
    );
  });
  it("reports unmapped or failed host capabilities without fabricating success", () => {
    const calls: string[] = [];
    const mapped = createWindowAdapter({
      applyBatch: () => [],
      getWindowSize: () => ({ width: 640, height: 480 }),
      setWindowTitle: (title) => {
        calls.push(title);
      },
      activateWindow: () => {
        calls.push("activate");
      },
    });
    expect(mapped.setTitle("Example")).toEqual({ ok: true, value: undefined });
    expect(mapped.activate().ok).toBe(true);
    expect(calls).toEqual(["Example", "activate"]);
    expect(mapped.getSize()).toEqual({
      ok: true,
      value: { width: 640, height: 480 },
    });
    expect(createWindowAdapter(null).setTitle("x")).toMatchObject({
      ok: false,
      reason: "unsupported",
    });
    const failing = createWindowAdapter({
      applyBatch: () => [],
      getWindowSize: () => {
        throw Error("native failure");
      },
    });
    expect(failing.capabilities.windowMetrics).toBe(true);
    expect(failing.getSize()).toMatchObject({ ok: false, reason: "failed" });
  });
});
