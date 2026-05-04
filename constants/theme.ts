/**
 * Design tokens: colors, radii, and spacing for a consistent UI.
 */

import { Platform } from "react-native";

const primary = "#4f46e5";
const primaryDark = "#4338ca";
const secondary = "#0891b2";
const accent = "#d97706";
const success = "#059669";
const warning = "#d97706";
const error = "#dc2626";

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

export const Colors = {
  light: {
    // Primary colors
    primary: primary,
    primaryDark: primaryDark,
    secondary: secondary,
    colorAccent: accent,
    
    // Background colors
    background: "#f1f4fb",
    surface: "#ffffff",
    surfaceSecondary: "#f4f6fb",
    cardBackground: "#ffffff",
    
    // Text colors
    text: "#1e293b",
    textSecondary: "#64748b",
    textTertiary: "#94a3b8",
    textInverse: "#ffffff",
    
    // Interactive colors
    tint: primary,
    accent: accent,
    success: success,
    warning: warning,
    error: error,
    
    // Border and dividers
    border: "#e5e9f2",
    borderLight: "#eef1f8",
    divider: "#e5e9f2",
    
    // Icon colors
    icon: "#64748b",
    iconSecondary: "#94a3b8",
    iconInverse: "#ffffff",
    
    // Tab colors
    tabIconDefault: "#64748b",
    tabIconSelected: primary,
    tabBackground: "#DAE3EA",
    
    // Special backgrounds
    headerBackground: "#DAE3EA",
    headerBorder: "#e2e8f0",
    
    // Status colors
    online: "#10b981",
    offline: "#ef4444",
    pending: "#f59e0b",
  },
  dark: {
    // Primary colors
    primary: primary,
    primaryDark: primaryDark,
    secondary: secondary,
    colorAccent: accent,
    
    // Background colors
    background: "#0c1222",
    surface: "#151d2e",
    surfaceSecondary: "#1e293b",
    cardBackground: "#151d2e",
    modalBackground: "rgba(0, 0, 0, 0.72)",
    
    // Text colors
    text: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textTertiary: "#94a3b8",
    textInverse: "#1e293b",
    
    // Interactive colors
    tint: primary,
    accent: accent,
    success: success,
    warning: warning,
    error: error,
    
    // Border and dividers
    border: "#334155",
    borderLight: "#475569",
    divider: "#334155",
    
    // Icon colors
    icon: "#cbd5e1",
    iconSecondary: "#94a3b8",
    iconInverse: "#1e293b",
    
    // Tab colors
    tabIconDefault: "#94a3b8",
    tabIconSelected: primary,
    tabBackground: "#1e293b",
    
    // Special backgrounds
    headerBackground: "#1e293b",
    headerBorder: "#334155",
    
    // Status colors
    online: "#10b981",
    offline: "#ef4444",
    pending: "#f59e0b",
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
