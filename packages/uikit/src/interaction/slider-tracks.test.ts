import { expect, it } from "vitest";
import {
  sliderStops,
  sliderMarksError,
  sliderHitRegions,
  nearestSliderThumb,
} from "../components/slider/model";
const bounds = { min: 0, max: 100, step: 5 };
it("bounds stop generation, retains an irregular maximum and supports decimal steps", () => {
  expect(sliderStops({ min: 0, max: 10, step: 3 })).toEqual([0, 3, 6, 9, 10]);
  expect(sliderStops({ min: 0.1, max: 0.4, step: 0.1 })).toEqual([
    0.1, 0.2, 0.3, 0.4,
  ]);
  expect(sliderStops({ min: 0, max: 1, step: 0.005 })).toHaveLength(201);
  expect(sliderStops({ min: 0, max: 1, step: 0.000001 })).toBeNull();
  expect(sliderStops({ min: 2, max: 2, step: 1 })).toEqual([2]);
  expect(sliderStops({ min: 2, max: 1, step: 1 })).toBeNull();
});
it("tiles the complete local track without gaps and uses midpoint boundaries", () => {
  const regions = sliderHitRegions(bounds, 280);
  expect(regions).toHaveLength(21);
  expect(regions[0]).toEqual({ value: 0, start: 0, length: 16.5 });
  expect(regions.at(-1)!.start + regions.at(-1)!.length).toBe(280);
  for (let i = 1; i < regions.length; i++)
    expect(regions[i]!.start).toBeCloseTo(
      regions[i - 1]!.start + regions[i - 1]!.length,
    );
  expect(sliderHitRegions(bounds, NaN)).toEqual([]);
  expect(sliderHitRegions({ ...bounds, step: 0.001 }, 280)).toEqual([]);
});
it("validates bounded, unique marks independently from the step grid", () => {
  expect(
    sliderMarksError([{ value: 2.5, label: "Custom" }], bounds),
  ).toBeNull();
  expect(sliderMarksError([{ value: 5 }, { value: 5 }], bounds)).not.toBeNull();
  expect(sliderMarksError([{ value: Infinity }], bounds)).not.toBeNull();
  expect(sliderMarksError([{ value: -1 }], bounds)).not.toBeNull();
  expect(
    sliderMarksError(
      Array.from({ length: 52 }, (_, value) => ({ value })),
      bounds,
    ),
  ).not.toBeNull();
});
it("moves the nearest thumb and resolves equal distances and coincident thumbs", () => {
  expect(nearestSliderThumb([20, 80], 10)).toBe(0);
  expect(nearestSliderThumb([20, 80], 90)).toBe(1);
  expect(nearestSliderThumb([20, 80], 50, 1)).toBe(1);
  expect(nearestSliderThumb([20, 80], 50, 0)).toBe(0);
  expect(nearestSliderThumb([50, 50], 70, 0)).toBe(1);
  expect(nearestSliderThumb([50, 50], 30, 1)).toBe(0);
});
