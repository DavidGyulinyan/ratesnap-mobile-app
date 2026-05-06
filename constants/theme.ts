/**
 * Design tokens: colors, radii, and spacing for a consistent UI.
 * Brand: orange (#F07E25), highlight (#FFB366), warm canvas (#FAF6F2), error (#E04D4D).
 */

import { Platform } from "react-native";

const brand = "#F07E25";
const brandLight = "#FFB366";
const canvas = "#FAF6F2";
const coral = "#E04D4D";
const brandPressed = "#C86418";

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
    warning: "#c47d32",
    error: coral,

    border: "#ebe4dc",
    borderLight: "#f0e8e0",
    divider: "#ede5dc",

    icon: "#636366",
    iconSecondary: "#8e8e93",
    iconInverse: "#ffffff",

    tabIconDefault: "#8e8e93",
    tabIconSelected: brand,
    tabBackground: "#f2ebe4",

    headerBackground: "#f5efe8",
    headerBorder: "#ebe4dc",

    online: brand,
    offline: "#8e8e93",
    pending: "#c47d32",
  },
  dark: {
    primary: brandLight,
    primaryDark: brand,
    secondary: brand,
    colorAccent: brandLight,

    background: "#141210",
    surface: "#1f1a16",
    surfaceSecondary: "#2a241e",
    cardBackground: "#1f1a16",
    modalBackground: "rgba(0, 0, 0, 0.72)",

    text: "#f2f2f7",
    textSecondary: "#aeaeb2",
    textTertiary: "#8e8e93",
    textInverse: "#141210",

    tint: brandLight,
    accent: brandLight,
    success: brandLight,
    warning: "#d4a574",
    error: coral,

    border: "#3d352c",
    borderLight: "#4a4036",
    divider: "#3d352c",

    icon: "#aeaeb2",
    iconSecondary: "#8e8e93",
    iconInverse: "#141210",

    tabIconDefault: "#8e8e93",
    tabIconSelected: brandLight,
    tabBackground: "#2a241e",

    headerBackground: "#2a241e",
    headerBorder: "#3d352c",

    online: brandLight,
    offline: "#8e8e93",
    pending: "#d4a574",
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
