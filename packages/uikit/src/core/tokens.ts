/** Darwin UI 固定快照的色彩与半径适配；原生表面不依赖 CSS 层叠。 */
export type ThemeMode = "light" | "dark";
export interface Colors {
  canvas: string;
  surface: string;
  elevated: string;
  subtle: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  faint: string;
  primary: string;
  primaryHover: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
  shadow: string;
}
export const darkColors: Readonly<Colors> = Object.freeze({
  canvas: "#0A0A0B",
  surface: "#111113",
  elevated: "#202023",
  subtle: "#18181B",
  border: "#303034",
  borderStrong: "#52525B",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  faint: "#71717A",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  onPrimary: "#FFFFFF",
  accent: "#60A5FA",
  accentSoft: "#172644",
  success: "#34D399",
  successSoft: "#102E27",
  warning: "#FBBF24",
  warningSoft: "#342A14",
  danger: "#F87171",
  dangerSoft: "#391D22",
  overlay: "#000000AA",
  shadow: "#00000066",
});
export const lightColors: Readonly<Colors> = Object.freeze({
  canvas: "#FFFFFF",
  surface: "#FAFAFA",
  elevated: "#FFFFFF",
  subtle: "#F4F4F5",
  border: "#E4E4E7",
  borderStrong: "#A1A1AA",
  text: "#18181B",
  muted: "#52525B",
  faint: "#71717A",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  onPrimary: "#FFFFFF",
  accent: "#1D4ED8",
  accentSoft: "#EFF6FF",
  success: "#047857",
  successSoft: "#ECFDF5",
  warning: "#92400E",
  warningSoft: "#FFFBEB",
  danger: "#B91C1C",
  dangerSoft: "#FEF2F2",
  overlay: "#18181B66",
  shadow: "#00000016",
});
export const space = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
});
export const radius = Object.freeze({
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
});
export const typography = Object.freeze({
  caption: 11,
  small: 12,
  body: 14,
  heading: 18,
  title: 26,
  display: 36,
});
export const controlSizes = Object.freeze({
  sm: { height: 28, padding: 10, font: 12 },
  md: { height: 36, padding: 14, font: 13 },
  lg: { height: 42, padding: 18, font: 14 },
});
export type ControlSize = keyof typeof controlSizes;
export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
export function toneColors(
  colors: Colors,
  tone: Tone,
): { text: string; background: string } {
  if (tone === "neutral")
    return { text: colors.muted, background: colors.subtle };
  return { text: colors[tone], background: colors[`${tone}Soft`] };
}
export function createTheme(mode: ThemeMode, overrides: Partial<Colors> = {}) {
  return {
    mode,
    colors: { ...(mode === "dark" ? darkColors : lightColors), ...overrides },
    space,
    radius,
    typography,
    controlSizes,
  };
}
export type UIKitTheme = ReturnType<typeof createTheme>;
