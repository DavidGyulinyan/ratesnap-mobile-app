import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLanguage } from "@/contexts/LanguageContext";

interface FooterProps {
  style?: any;
}

export default function Footer({ style }: FooterProps) {
  const { t, tWithParams } = useLanguage();
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={[{ backgroundColor, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor, paddingVertical: 18, paddingHorizontal: 20, paddingBottom: 36, alignItems: "center" }, style]}>
      <ThemedText style={{ fontSize: 12, textAlign: "center", color: textSecondaryColor, lineHeight: 18 }}>
        {tWithParams('footer.copyright', {
          appTitle: "RateSnap",
          suiteName: t('footer.suiteName')
        })}
      </ThemedText>
    </View>
  );
}
