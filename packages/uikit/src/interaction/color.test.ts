import { describe, it, expect } from "vitest";
import {
  parseHexColor,
  formatHexColor,
  normalizeHexColor,
  setColorChannel,
  compositeColor,
  paletteError,
  movePalette,
  paletteColumns,
  defaultPalette,
} from "../components/color/model";
describe("8-bit sRGB color rules", () => {
  it("expands short forms and canonicalizes opaque alpha", () => {
    expect(parseHexColor("#abc")).toEqual({ r: 170, g: 187, b: 204, a: 255 });
    expect(normalizeHexColor(" #abcd ")).toBe("#AABBCCDD");
    expect(normalizeHexColor("#AbCdEfFF")).toBe("#ABCDEF");
    expect(normalizeHexColor("#0000")).toBe("#00000000");
  });
  it("rejects incomplete and other color formats without lossy coercion", () => {
    for (const v of [
      "",
      "red",
      "transparent",
      "abc",
      "#12",
      "#12345",
      "#GGG",
      "#123456789",
      "rgb(1,2,3)",
      "#ff ff ff",
    ])
      expect(parseHexColor(v)).toBeNull();
    expect(parseHexColor("#fff", false)).not.toBeNull();
    expect(parseHexColor("#ffff", false)).not.toBeNull();
    expect(parseHexColor("#fff0", false)).toBeNull();
  });
  it("round trips channel boundaries and alpha without quantization loss", () => {
    for (const r of [0, 1, 127, 128, 254, 255])
      for (const a of [0, 1, 128, 254, 255]) {
        const color = { r, g: 255 - r, b: 42, a };
        expect(parseHexColor(formatHexColor(color)!)).toEqual(color);
      }
  });
  it("rejects non-byte numeric channels", () => {
    for (const value of [-1, 256, 1.5, NaN, Infinity]) {
      expect(formatHexColor({ r: value, g: 0, b: 0, a: 255 })).toBeNull();
      expect(setColorChannel("#123456", "a", value)).toBeNull();
    }
    expect(setColorChannel("invalid", "r", 42)).toBeNull();
    expect(setColorChannel("#12345680", "g", 255)).toBe("#12FF5680");
  });
  it("composites alpha over opaque checkerboard colors", () => {
    expect(compositeColor({ r: 255, g: 0, b: 0, a: 0 }, "#FFFFFF")).toBe(
      "#FFFFFF",
    );
    expect(compositeColor({ r: 255, g: 0, b: 0, a: 255 }, "#FFFFFF")).toBe(
      "#FF0000",
    );
    expect(compositeColor({ r: 255, g: 0, b: 0, a: 128 }, "#FFFFFF")).toBe(
      "#FF7F7F",
    );
    expect(compositeColor({ r: 255, g: 0, b: 0, a: 128 }, "#FFF0")).toBeNull();
  });
  it("validates bounded palette identities while allowing duplicate colors", () => {
    expect(paletteError(defaultPalette)).toBeNull();
    expect(
      paletteError([
        { id: "x", label: "One", value: "#abc" },
        { id: "x", label: "Two", value: "#fff" },
      ]),
    ).toBeTruthy();
    expect(paletteError([{ id: "x", label: "", value: "#abc" }])).toBeTruthy();
    expect(
      paletteError([{ id: "x", label: "One", value: "red" }]),
    ).toBeTruthy();
    expect(
      paletteError(
        Array.from({ length: 97 }, (_, i) => ({
          id: String(i),
          label: "Color",
          value: "#fff",
        })),
      ),
    ).toBeTruthy();
    expect(
      paletteError([
        { id: "a", label: "A", value: "#fff" },
        { id: "b", label: "B", value: "#fff" },
      ]),
    ).toBeNull();
  });
  it("moves across pages and skips disabled or unsupported alpha colors", () => {
    const items = Array.from({ length: 18 }, (_, i) => ({
      id: String(i),
      label: "Color",
      value: i === 17 ? "#fff0" : "#fff",
      disabled: i === 1,
    }));
    expect(movePalette(0, "right", items, 6)).toBe(2);
    expect(movePalette(0, "down", items, 6)).toBe(6);
    expect(movePalette(0, "pagedown", items, 6)).toBe(12);
    expect(movePalette(0, "end", items, 6, false)).toBe(16);
    expect(movePalette(0, "end", items, 6, true)).toBe(17);
    expect(movePalette(17, "right", items, 6, true)).toBe(17);
    expect(movePalette(0, "home", [], 6)).toBe(0);
  });
  it("bounds palette geometry and protects the default collection", () => {
    expect(paletteColumns(NaN)).toBe(6);
    expect(paletteColumns(30)).toBe(8);
    expect(paletteColumns(1)).toBe(2);
    expect(Object.isFrozen(defaultPalette)).toBe(true);
    expect(Object.isFrozen(defaultPalette[0])).toBe(true);
  });
});
