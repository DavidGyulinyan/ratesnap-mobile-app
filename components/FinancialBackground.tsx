import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useThemeColor } from "@/hooks/use-theme-color";

/**
 * Decorative full-screen layer: soft market-style lines and fill behind app content.
 * pointerEvents="none" so taps pass through.
 */
export function FinancialBackground() {
  const { width: w, height: h } = useWindowDimensions();
  const primary = useThemeColor({}, "primary");
  const accent = useThemeColor({}, "accent");
  const rw = Math.max(w, 1);
  const rh = Math.max(h, 1);

  const { lineD, areaD, line2D } = useMemo(() => {
    const baseY = rh * 0.52;
    const amp = Math.min(rh * 0.07, 52);
    const segments = 16;
    let line = `M 0 ${baseY}`;
    let line2 = `M 0 ${baseY + amp * 0.4}`;
    for (let i = 1; i <= segments; i++) {
      const x = (rw * i) / segments;
      const t = i * 0.55;
      const wave =
        Math.sin(t) * amp + Math.sin(t * 0.5) * amp * 0.45 + Math.cos(t * 0.35) * amp * 0.25;
      const y = baseY + wave;
      line += ` L ${x} ${y}`;
      const y2 = baseY + amp * 0.35 + Math.sin(t + 1.2) * amp * 0.6;
      line2 += ` L ${x} ${y2}`;
    }
    const lastX = rw;
    const area = `${line} L ${lastX} ${rh} L 0 ${rh} Z`;
    return { lineD: line, areaD: area, line2D: line2 };
  }, [rw, rh]);

  const gridPath = useMemo(() => {
    const lines: string[] = [];
    const cols = 5;
    for (let c = 1; c < cols; c++) {
      const x = (rw * c) / cols;
      lines.push(`M ${x} 0 L ${x} ${rh}`);
    }
    const rows = 4;
    for (let r = 1; r < rows; r++) {
      const y = (rh * r) / rows;
      lines.push(`M 0 ${y} L ${rw} ${y}`);
    }
    return lines.join(" ");
  }, [rw, rh]);

  return (
    <View
      style={styles.layer}
      pointerEvents="none"
      accessibilityElementsHidden
      collapsable={false}
    >
      <Svg width={rw} height={rh}>
        <Defs>
          <LinearGradient id="financialChartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={primary} stopOpacity="0.22" />
            <Stop offset="0.45" stopColor={primary} stopOpacity="0.1" />
            <Stop offset="1" stopColor={primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        <Path
          d={gridPath}
          stroke={primary}
          strokeWidth={0.75}
          strokeOpacity={0.14}
        />
        <Path d={areaD} fill="url(#financialChartFill)" />
        <Path
          d={lineD}
          stroke={primary}
          strokeWidth={2.25}
          fill="none"
          strokeOpacity={0.32}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={line2D}
          stroke={accent}
          strokeWidth={1.75}
          fill="none"
          strokeOpacity={0.26}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={`M 0 ${rh * 0.22} L ${rw} ${rh * 0.18}`}
          stroke={primary}
          strokeWidth={1.25}
          strokeOpacity={0.14}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});
