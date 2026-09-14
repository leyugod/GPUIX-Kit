export type ModalPresentation = "dialog" | "sheet" | "drawer";
export function modalDimensions(
  windowWidth: number,
  windowHeight: number,
  presentation: ModalPresentation,
  width?: number,
  height?: number,
) {
  const ww = Number.isFinite(windowWidth) ? Math.max(1, windowWidth) : 800,
    wh = Number.isFinite(windowHeight) ? Math.max(1, windowHeight) : 600;
  const availableWidth = Math.max(1, ww - 32),
    availableHeight = Math.max(
      1,
      wh - (presentation === "dialog" ? 80 : presentation === "sheet" ? 24 : 0),
    );
  const defaultWidth =
    presentation === "drawer" ? 380 : presentation === "sheet" ? 620 : 480;
  const requested = Number.isFinite(width) ? width! : defaultWidth;
  const resolvedWidth = Math.min(
    availableWidth,
    Math.max(240, Math.min(1200, requested)),
  );
  const maxHeight = Math.min(
    availableHeight,
    Math.max(
      200,
      Number.isFinite(height)
        ? height!
        : presentation === "sheet"
          ? 420
          : availableHeight,
    ),
  );
  return {
    width: resolvedWidth,
    maxHeight,
    height: presentation === "dialog" ? undefined : maxHeight,
  };
}
export function validatePrompt(
  value: string,
  validate?: (value: string) => string | null,
): string | null {
  if (value.length > 10000) return "Use at most 10000 code units.";
  try {
    return validate?.(value) ?? null;
  } catch {
    return "Unable to validate this value.";
  }
}
