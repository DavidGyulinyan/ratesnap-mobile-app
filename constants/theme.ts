/**
 * Design tokens: colors, radii, and spacing for a consistent UI.
 * Brand: teal (#00BEAC), highlight (#00ECD6), canvas (#EFEFEF), coral (#F77872).
 */

import { Platform } from "react-native";

const brand = "#00BEAC";
const brandLight = "#00ECD6";
const canvas = "#EFEFEF";
const coral = "#F77872";
const brandPressed = "#009A8C";

/** Shared layout tokens — use for padding, gaps, and corner radius. */
export const Layout = {
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 20,
  radiusXl: 28,
  spaceXs: 6,
  spaceSm: 10,
  spaceMd: 16,
  spaceLg: 22,
  spaceXl: 28,
};

/** Theme hex (#RRGGBB) → rgba for soft panels (same approach as CurrencyConverter). */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Text inputs and form cards — match CurrencyConverter amount panel / field sizing. */
export const FormField = {
  radiusCard: 16,
  radiusPanel: 14,
  radiusInput: 12,
  padH: 14,
  padV: 12,
  fontSize: 18,
  fontWeight: "600" as const,
  labelSize: 13,
};

export const Colors = {
  light: {
    primary: brand,
    primaryDark: brandPressed,
    secondary: brandLight,
    colorAccent: brandLight,

    background: canvas,
    surface: "#ffffff",
    surfaceSecondary: "#f5f5f5",
    cardBackground: "#ffffff",

    text: "#1c1c1e",
    textSecondary: "#636366",
    textTertiary: "#8e8e93",
    textInverse: "#ffffff",

    tint: brand,
    accent: brandLight,
    success: brand,
    warning: "#c4a574",
    error: coral,

    border: "#e0e0e0",
    borderLight: "#ebebeb",
    divider: "#e5e5e5",

    icon: "#636366",
    iconSecondary: "#8e8e93",
    iconInverse: "#ffffff",

    tabIconDefault: "#8e8e93",
    tabIconSelected: brand,
    tabBackground: "#e8e8e8",

    headerBackground: "#f0f0f0",
    headerBorder: "#e0e0e0",

    online: brand,
    offline: "#8e8e93",
    pending: "#c4a574",
  },
  dark: {
    primary: brandLight,
    primaryDark: brand,
    secondary: brand,
    colorAccent: brandLight,

    background: "#0f1414",
    surface: "#1a2020",
    surfaceSecondary: "#242b2b",
    cardBackground: "#1a2020",
    modalBackground: "rgba(0, 0, 0, 0.72)",

    text: "#f2f2f7",
    textSecondary: "#aeaeb2",
    textTertiary: "#8e8e93",
    textInverse: "#0f1414",

    tint: brandLight,
    accent: brandLight,
    success: brandLight,
    warning: "#d4c4a8",
    error: coral,

    border: "#3a4242",
    borderLight: "#4a5454",
    divider: "#3a4242",

    icon: "#aeaeb2",
    iconSecondary: "#8e8e93",
    iconInverse: "#0f1414",

    tabIconDefault: "#8e8e93",
    tabIconSelected: brandLight,
    tabBackground: "#242b2b",

    headerBackground: "#242b2b",
    headerBorder: "#3a4242",

    online: brandLight,
    offline: "#8e8e93",
    pending: "#d4c4a8",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
