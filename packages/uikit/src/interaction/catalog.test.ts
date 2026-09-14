import {
  eventCalendarError,
  eventsOnDate,
  eventCalendarDays,
} from "../components/event-calendar/model";
import { describe, it, expect } from "vitest";
import jsQR from "jsqr";
import {
  catalogError,
  verificationValue,
  ratingValue,
  gradientError,
  gradientAt,
  radarError,
  radarPoints,
  richDocumentError,
  updateRichBlock,
  richMarkdown,
  validLink,
  type GradientValue,
} from "../components/catalog-model";
import { qrMatrix, utf8Bytes } from "../components/qr-code/model";
describe("catalog value contracts", () => {
  it("rejects duplicate and unbounded identities", () => {
    expect(catalogError([{ id: "a" }, { id: "a" }])).toBeTruthy();
    expect(catalogError([{ id: " " }])).toBeTruthy();
    expect(catalogError([{ id: "a" }, { id: "b" }], 1)).toBeTruthy();
    expect(catalogError([])).toBeNull();
  });
  it("normalizes pasted codes and keeps leading zeros", () => {
    expect(verificationValue("0 1-2a34567", 6)).toBe("012345");
    expect(verificationValue("abc")).toBe("");
  });
  it("clamps rating endpoints and rejects nonfinite state", () => {
    expect(ratingValue(9)).toBe(5);
    expect(ratingValue(-2)).toBe(0);
    expect(ratingValue(NaN)).toBe(0);
    expect(ratingValue(2.4, 5, 0.5)).toBe(2.5);
  });
  const gradient: GradientValue = {
    angle: 90,
    stops: [
      { id: "a", position: 0, color: "#000000" },
      { id: "b", position: 1, color: "#FFFFFF" },
    ],
  };
  it("validates gradient count identity angles colors and positions", () => {
    expect(gradientError(gradient)).toBeNull();
    for (const patch of [
      { angle: NaN },
      { angle: 361 },
      { stops: [gradient.stops[0]!] },
      { stops: [...gradient.stops, { id: "a", position: 1, color: "#FFF" }] },
    ])
      expect(gradientError({ ...gradient, ...patch })).toBeTruthy();
  });
  it("interpolates byte colors without mutating order", () => {
    const reversed = { ...gradient, stops: [...gradient.stops].reverse() };
    expect(gradientAt(reversed, 0.5)).toBe("#808080ff");
    expect(reversed.stops[0]!.id).toBe("b");
    expect(gradientAt(gradient, 0)).toBe("#000000");
    expect(gradientAt(gradient, 1)).toBe("#ffffffff");
  });
  it("preserves alpha and resolves coincident gradient stops", () => {
    expect(
      gradientAt(
        {
          angle: 0,
          stops: [
            { id: "a", position: 0, color: "#00000000" },
            { id: "b", position: 1, color: "#FFFFFF" },
          ],
        },
        0.5,
      ),
    ).toBe("#80808080");
    expect(
      gradientAt(
        {
          angle: 0,
          stops: [
            { id: "a", position: 0.5, color: "#000000" },
            { id: "b", position: 0.5, color: "#FFFFFF" },
          ],
        },
        0.5,
      ),
    ).toBe("#000000");
  });
  const axes = [
    { id: "a", label: "A", max: 100 },
    { id: "b", label: "B", max: 10 },
    { id: "c", label: "C", max: 1 },
  ];
  it("validates radar dimensions and per-axis domains", () => {
    expect(
      radarError(axes, [{ id: "one", label: "One", values: [50, 5, 0.5] }]),
    ).toBeNull();
    expect(
      radarError(axes, [{ id: "one", label: "One", values: [50, 11, 0.5] }]),
    ).toBeTruthy();
    expect(radarError(axes, [])).toBeNull();
    expect(radarError(axes.slice(1), [])).toBeTruthy();
  });
  it("maps independent radar maxima to common radius", () => {
    const p = radarPoints(axes, [100, 10, 1], 50);
    expect(p[0]![0]).toBeCloseTo(50);
    expect(p[0]![1]).toBeCloseTo(0);
    for (const [x, y] of p) expect(Math.hypot(x - 50, y - 50)).toBeCloseTo(50);
  });
  it("edits immutable rich blocks and protects identities", () => {
    const value = [{ id: "a", kind: "paragraph" as const, text: "hello" }];
    const result = updateRichBlock(value, "a", { bold: true });
    expect(result[0]!.bold).toBe(true);
    expect(value[0]).not.toHaveProperty("bold");
    expect(richDocumentError(result)).toBeNull();
    expect(richDocumentError([])).toBeTruthy();
  });
  it("escapes raw markup and rejects executable links", () => {
    expect(validLink("javascript:alert(1)")).toBe(false);
    expect(
      richDocumentError([
        { id: "a", kind: "paragraph", text: "x", link: "javascript:x" },
      ]),
    ).toBeTruthy();
    expect(
      richMarkdown([
        { id: "a", kind: "heading", text: "<script>*x*", bold: true },
      ]),
    ).toContain("\\<script\\>");
    expect(
      richMarkdown([
        {
          id: "a",
          kind: "paragraph",
          text: "x",
          link: "https://example.com/(x)",
        },
      ]),
    ).toContain("%28x%29");
  });
  it("encodes UTF-8 including emoji and unpaired surrogate replacement", () => {
    for (const text of ["hello", "你好ὠ0", "\ud800"])
      expect(utf8Bytes(text)).toEqual([...new TextEncoder().encode(text)]);
    expect(() => qrMatrix("")).toThrow();
    expect(() => qrMatrix("x".repeat(1501))).toThrow();
  });
  it("roundtrips generated QR through an independent decoder", () => {
    for (const value of ["https://gpuix.dev/", "原生 UIKit ὠ0"]) {
      const matrix = qrMatrix(value),
        scale = 5,
        n = (matrix.length + 8) * scale,
        data = new Uint8ClampedArray(n * n * 4).fill(255);
      matrix.forEach((row, y) =>
        row.forEach((dark, x) => {
          if (dark)
            for (let j = 0; j < scale; j++)
              for (let i = 0; i < scale; i++) {
                const offset =
                  (((y + 4) * scale + j) * n + (x + 4) * scale + i) * 4;
                data[offset] = data[offset + 1] = data[offset + 2] = 0;
              }
        }),
      );
      expect(jsQR(data, n, n)?.data).toBe(value);
    }
  });
});

describe("event calendar contracts", () => {
  it("validates real dates, intervals and same-day time order", () => {
    expect(
      eventCalendarError([{ id: "a", title: "A", date: "2024-02-29" }]),
    ).toBeNull();
    expect(
      eventCalendarError([{ id: "a", title: "A", date: "2023-02-29" }]),
    ).toBeTruthy();
    expect(
      eventCalendarError([
        {
          id: "a",
          title: "A",
          date: "2024-02-29",
          startTime: "12:00",
          endTime: "11:00",
        },
      ]),
    ).toBeTruthy();
  });
  it("includes spanning events and stably sorts without mutation", () => {
    const events = [
      { id: "b", title: "B", date: "2024-02-28", endDate: "2024-03-01" },
      { id: "a", title: "A", date: "2024-02-29", startTime: "10:00" },
    ];
    expect(eventsOnDate(events, "2024-02-29").map((e) => e.id)).toEqual([
      "b",
      "a",
    ]);
    expect(eventsOnDate(events, "2024-03-02")).toEqual([]);
    expect(events[0]!.id).toBe("b");
  });
  it("builds bounded month/week/day windows at date domain edges", () => {
    expect(eventCalendarDays("2024-02-29", "month")).toHaveLength(42);
    expect(eventCalendarDays("2024-02-29", "week")[0]).toBe("2024-02-26");
    expect(eventCalendarDays("0001-01-01", "week")).toHaveLength(7);
    expect(eventCalendarDays("bad", "day")).toEqual([]);
  });
});
