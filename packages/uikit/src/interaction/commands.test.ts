import { describe, it, expect } from "vitest";
import { createCommandRegistry } from "./commands";
import {
  stepNumber,
  isISODate,
  dateWithinBounds,
} from "../components/value-input/rules";
describe("desktop interaction rules", () => {
  it("rejects ambiguous command IDs and never executes disabled or missing commands", () => {
    let count = 0;
    const registry = createCommandRegistry([
      {
        id: "new",
        label: "New project",
        keywords: ["创建"],
        group: "Workspace",
        run: () => count++,
      },
      { id: "locked", label: "Delete", disabled: true, run: () => count++ },
    ]);
    expect(registry.search("创建 workspace").map((c) => c.id)).toEqual(["new"]);
    expect(registry.execute("locked")).toBe(false);
    expect(registry.execute("missing")).toBe(false);
    expect(registry.execute("new")).toBe(true);
    expect(count).toBe(1);
    expect(() =>
      createCommandRegistry([registry.commands[0]!, registry.commands[0]!]),
    ).toThrow("Duplicate");
  });
  it("steps decimal values without accumulating tails and clamps at both bounds", () => {
    expect(stepNumber(0.2, 1, 0.1, 0, 1)).toBe(0.3);
    expect(stepNumber(0.9, 2, 0.1, 0, 1)).toBe(1);
    expect(stepNumber(0, -1, 0.1, 0, 1)).toBe(0);
    expect(() => stepNumber(0, 1, 0, 0, 1)).toThrow();
  });
  it("validates calendar dates without Date parsing or timezone normalization", () => {
    for (const value of ["2024-02-29", "2000-02-29", "0001-01-01"])
      expect(isISODate(value)).toBe(true);
    for (const value of [
      "1900-02-29",
      "2026-02-29",
      "2026-04-31",
      "0000-01-01",
      "2026-2-1",
      "2026-01-01T00:00Z",
    ])
      expect(isISODate(value)).toBe(false);
    expect(dateWithinBounds("2026-09-13", "2026-09-13", "2026-09-13")).toBe(
      true,
    );
    expect(dateWithinBounds("2026-09-12", "2026-09-13")).toBe(false);
  });
});
