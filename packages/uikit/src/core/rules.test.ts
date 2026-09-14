import { describe, it, expect } from "vitest";
import { clamp, pageWindow, nextEnabled } from "./rules";
import { createTheme, toneColors } from "./tokens";

describe("bounded UI values", () => {
  it("normalizes empty, invalid and out-of-range pages", () => {
    expect(pageWindow(100, 5, 17)).toMatchObject({
      page: 4,
      pages: 4,
      start: 15,
      end: 17,
    });
    expect(pageWindow(-1, 0, 0)).toMatchObject({
      page: 1,
      size: 1,
      start: 0,
      end: 0,
    });
    expect(pageWindow(NaN, Infinity, NaN)).toMatchObject({
      page: 1,
      size: 20,
      total: 0,
    });
    expect(clamp(NaN)).toBe(0);
    expect(clamp(120)).toBe(100);
  });
  it("wraps selection and never activates disabled choices", () => {
    const choices = [
      { value: "a" },
      { value: "b", disabled: true },
      { value: "c" },
    ];
    expect(nextEnabled(choices, "a", 1)).toBe("c");
    expect(nextEnabled(choices, "a", -1)).toBe("c");
    expect(nextEnabled(choices, "c", 1)).toBe("a");
    expect(nextEnabled(choices, "unknown", -1)).toBe("c");
    expect(
      nextEnabled([{ value: "x", disabled: true }], "x", 1),
    ).toBeUndefined();
  });
});
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const x = parseInt(hex.slice(start, start + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return r! * 0.2126 + g! * 0.7152 + b! * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe("theme readability", () => {
  for (const mode of ["dark", "light"] as const)
    it(`${mode} body, secondary, button and status labels are legible`, () => {
      const { colors: c } = createTheme(mode);
      for (const surface of [c.canvas, c.surface, c.elevated, c.subtle]) {
        expect(contrast(c.text, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(c.muted, surface)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
      for (const tone of ["accent", "success", "warning", "danger"] as const) {
        const pair = toneColors(c, tone);
        expect(contrast(pair.text, pair.background)).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    });
  it("custom themes do not mutate shared tokens", () => {
    const custom = createTheme("light", { primary: "#111111" });
    expect(custom.colors.primary).toBe("#111111");
    expect(createTheme("light").colors.primary).toBe("#2563EB");
  });
});
