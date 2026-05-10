import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { hexToRgba } from '@/constants/theme';

interface AuthButtonsProps {
  onSuccess?: () => void;
}

export default function AuthButtons({ onSuccess }: AuthButtonsProps) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { t } = useLanguage();
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textColor = useThemeColor({}, 'text');

  const themed = useMemo(
    () =>
      StyleSheet.create({
        dividerLine: {
          flex: 1,
          height: StyleSheet.hairlineWidth * 2,
          backgroundColor: hexToRgba(borderColor, 0.55),
        },
        dividerLabel: {
          marginHorizontal: 14,
          fontSize: 12,
          letterSpacing: 0.25,
          color: textSecondaryColor,
          opacity: 0.92,
        },
        oauthButton: {
          backgroundColor: surfaceColor,
          borderWidth: 1,
          borderColor: hexToRgba(borderColor, 0.85),
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
          marginBottom: 10,
        },
        googleLabel: {
          color: textColor,
          fontSize: 15,
          fontWeight: '500',
          marginLeft: 10,
          flex: 1,
          textAlign: 'center',
          includeFontPadding: false,
        },
        appleLabel: {
          color: textColor,
          fontSize: 15,
          fontWeight: '500',
          marginLeft: 10,
          flex: 1,
          textAlign: 'center',
          includeFontPadding: false,
        },
      }),
    [borderColor, surfaceColor, textSecondaryColor, textColor]
  );

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert(t('auth.continueWithGoogle'), error.message);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      Alert.alert(t('auth.continueWithGoogle'), error instanceof Error ? error.message : t('error.loading'));
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { error } = await signInWithApple();
      if (error) {
        Alert.alert(t('auth.continueWithApple'), error.message);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      Alert.alert(t('auth.continueWithApple'), error instanceof Error ? error.message : t('error.loading'));
    }
  };

  return (
    <>
      <View style={styles.divider}>
        <View style={themed.dividerLine} />
        <ThemedText style={themed.dividerLabel}>{t('auth.orContinueWith')}</ThemedText>
        <View style={themed.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={[styles.buttonRow, themed.oauthButton]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.82}
        >
          <Ionicons name="logo-google" size={20} color={textSecondaryColor} />
          <ThemedText style={themed.googleLabel}>{t('auth.continueWithGoogle')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonRow, themed.oauthButton]}
          onPress={handleAppleSignIn}
          activeOpacity={0.82}
        >
          <Ionicons name="logo-apple" size={22} color={textColor} />
          <ThemedText style={themed.appleLabel}>{t('auth.continueWithApple')}</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
    width: '100%',
    maxWidth: 400,
  },
  socialButtons: {
    width: '100%',
    maxWidth: 400,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});