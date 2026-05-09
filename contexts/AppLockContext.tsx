import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  authenticateAsync,
  getEnrolledLevelAsync,
  SecurityLevel,
} from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getAsyncStorage } from '@/lib/storage';

const APP_LOCK_STORAGE_KEY = 'appLock.enabled.v1';

type AppLockContextValue = {
  lockSupported: boolean;
  lockEnabled: boolean;
  prefsReady: boolean;
  enableAppLock: () => Promise<boolean>;
  disableAppLock: () => Promise<void>;
};

const AppLockContext = createContext<AppLockContextValue | undefined>(undefined);

function AppLockOverlay({
  onUnlock,
  busy,
}: {
  onUnlock: () => void;
  busy: boolean;
}) {
  const { t } = useLanguage();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textInverseColor = useThemeColor({}, 'textInverse');
  const borderColor = useThemeColor({}, 'border');

  return (
    <SafeAreaView style={[styles.overlayRoot, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.overlayInner}>
        <Ionicons name="lock-closed-outline" size={48} color={primaryColor} style={{ marginBottom: 16 }} />
        <ThemedText style={styles.overlayTitle}>{t('appLock.unlockTitle')}</ThemedText>
        <ThemedText style={[styles.overlaySubtitle, { color: textSecondaryColor }]}>
          {t('appLock.unlockSubtitle')}
        </ThemedText>
        <TouchableOpacity
          style={[styles.unlockButton, { backgroundColor: primaryColor, borderColor }]}
          onPress={onUnlock}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color={textInverseColor} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="finger-print-outline" size={22} color={textInverseColor} />
              <ThemedText style={[styles.unlockButtonText, { color: textInverseColor }]}>
                {t('appLock.unlockButton')}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const bootstrapBg = useThemeColor({}, 'background');
  const lockSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  const [prefsReady, setPrefsReady] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const wentToBackgroundRef = useRef(false);

  const runSystemAuth = useCallback(async (): Promise<boolean> => {
    if (!lockSupported) return true;
    try {
      const result = await authenticateAsync({
        promptMessage: t('appLock.authPrompt'),
        cancelLabel: t('common.cancel'),
        disableDeviceFallback: false,
      });
      return result.success === true;
    } catch {
      return false;
    }
  }, [lockSupported, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lockSupported) {
        if (!cancelled) {
          setLockEnabled(false);
          setScreenLocked(false);
          setPrefsReady(true);
        }
        return;
      }
      try {
        const storage = getAsyncStorage();
        const raw = await storage.getItem(APP_LOCK_STORAGE_KEY);
        const on = raw === '1';
        if (!cancelled) {
          setLockEnabled(on);
          setScreenLocked(on);
        }
      } finally {
        if (!cancelled) setPrefsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lockSupported]);

  useEffect(() => {
    if (!lockSupported || !prefsReady || !lockEnabled) return;

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next === 'background' || next === 'inactive') {
        wentToBackgroundRef.current = true;
        return;
      }

      if (next === 'active' && (prev === 'background' || prev === 'inactive') && wentToBackgroundRef.current) {
        wentToBackgroundRef.current = false;
        setScreenLocked(true);
      }
    });

    return () => sub.remove();
  }, [lockEnabled, lockSupported, prefsReady]);

  const persistEnabled = useCallback(async (enabled: boolean) => {
    const storage = getAsyncStorage();
    await storage.setItem(APP_LOCK_STORAGE_KEY, enabled ? '1' : '0');
    setLockEnabled(enabled);
    if (!enabled) setScreenLocked(false);
  }, []);

  const enableAppLock = useCallback(async (): Promise<boolean> => {
    if (!lockSupported) {
      return false;
    }
    try {
      const level = await getEnrolledLevelAsync();
      if (level === SecurityLevel.NONE) {
        Alert.alert(t('common.error'), t('appLock.notEnrolled'));
        return false;
      }
    } catch {
      Alert.alert(t('common.error'), t('appLock.notAvailable'));
      return false;
    }

    const ok = await runSystemAuth();
    if (!ok) return false;

    await persistEnabled(true);
    setScreenLocked(false);
    return true;
  }, [lockSupported, persistEnabled, runSystemAuth, t]);

  const disableAppLock = useCallback(async () => {
    await persistEnabled(false);
  }, [persistEnabled]);

  const handleUnlockPress = useCallback(async () => {
    if (authBusy) return;
    setAuthBusy(true);
    try {
      const ok = await runSystemAuth();
      if (ok) setScreenLocked(false);
    } finally {
      setAuthBusy(false);
    }
  }, [authBusy, runSystemAuth]);

  const value = useMemo<AppLockContextValue>(
    () => ({
      lockSupported,
      lockEnabled,
      prefsReady,
      enableAppLock,
      disableAppLock,
    }),
    [disableAppLock, enableAppLock, lockEnabled, lockSupported, prefsReady]
  );

  const showBootstrapBlock = !prefsReady && lockSupported;
  const showLockOverlay = prefsReady && lockEnabled && screenLocked && lockSupported;

  return (
    <AppLockContext.Provider value={value}>
      {children}
      {showBootstrapBlock ? (
        <View style={[styles.bootstrapBlock, { backgroundColor: bootstrapBg }]}>
          <ActivityIndicator />
        </View>
      ) : null}
      {showLockOverlay ? <AppLockOverlay onUnlock={handleUnlockPress} busy={authBusy} /> : null}
    </AppLockContext.Provider>
  );
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  bootstrapBlock: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlayInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  overlaySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  unlockButton: {
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  unlockButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
