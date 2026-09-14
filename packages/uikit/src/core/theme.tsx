import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  createTheme,
  type Colors,
  type ThemeMode,
  type UIKitTheme,
} from "./tokens";
const ThemeContext = createContext<UIKitTheme>(createTheme("dark"));
/** 主题与持久化解耦；跟随系统由应用解析后传入，不读取系统或数据库。 */
export function UIKitProvider({
  mode = "dark",
  colors,
  children,
}: {
  mode?: ThemeMode;
  colors?: Partial<Colors>;
  children: ReactNode;
}) {
  const value = useMemo(() => createTheme(mode, colors), [mode, colors]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
export function useNativeTheme() {
  const { mode, colors: c } = useTheme();
  return {
    appearance: mode,
    bg: c.canvas,
    text: c.text,
    textMuted: c.muted,
    textFaint: c.faint,
    textDim: c.muted,
    border: c.border,
    accent: c.accent,
    caret: c.accent,
    codeText: c.warning,
    codeWash: c.subtle,
    fontSans: ".AppleSystemUIFont",
    fontMono: "Menlo",
  };
}
export type { Colors, ThemeMode, UIKitTheme } from "./tokens";
