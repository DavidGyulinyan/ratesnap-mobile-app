import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
}

export default function Logo({ size = 36, showText = true, textSize = 26 }: LogoProps) {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('../assets/images/splash-icon.png')}
        style={[
          styles.logoImage,
          {
            width: size,
            height: size,
          },
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text
          style={[
            styles.logoText,
            {
              color: colors.text, // Use theme-aware text color
              fontSize: textSize,
            },
          ]}
        >
          ExRatio
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    maxWidth: '60%', // Prevent logo from taking too much space
  },
  logoImage: {
    borderRadius: 2,
    flexShrink: 0,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 16, // Slightly smaller base size
    marginLeft: 2,
    flexWrap: 'wrap',
    flexShrink: 1, // Allow text to shrink if needed
  },
});