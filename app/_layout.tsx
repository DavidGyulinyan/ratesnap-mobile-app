import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

WebBrowser.maybeCompleteAuthSession();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { effectiveTheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor }}>
          <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <Stack screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0
              }
            }}>
              {/* Always register all screens, navigation control will handle which is shown */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="signin" options={{ presentation: 'modal' }} />
              <Stack.Screen name="signup" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
          <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
