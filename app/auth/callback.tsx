import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabaseClient } from '@/lib/supabase-safe';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔵 Processing OAuth callback...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const incomingUrl = await Linking.getInitialURL();
        if (incomingUrl) {
          const { params, errorCode } = AuthSession.parse(incomingUrl);

          if (errorCode) {
            throw new Error(`OAuth callback error: ${errorCode}`);
          }

          const typeParam = params?.type;
          const type =
            typeof typeParam === 'string'
              ? typeParam
              : Array.isArray(typeParam)
              ? typeParam[0]
              : undefined;

          const codeParam = params?.code;
          const code =
            typeof codeParam === 'string'
              ? codeParam
              : Array.isArray(codeParam)
              ? codeParam[0]
              : undefined;

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              throw exchangeError;
            }
          } else if (type === 'recovery') {
            const accessTokenParam = params?.access_token;
            const refreshTokenParam = params?.refresh_token;
            const accessToken =
              typeof accessTokenParam === 'string'
                ? accessTokenParam
                : Array.isArray(accessTokenParam)
                ? accessTokenParam[0]
                : undefined;
            const refreshToken =
              typeof refreshTokenParam === 'string'
                ? refreshTokenParam
                : Array.isArray(refreshTokenParam)
                ? refreshTokenParam[0]
                : undefined;

            if (accessToken && refreshToken) {
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (setSessionError) {
                throw setSessionError;
              }
            }
            router.replace('/reset-password');
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔴 OAuth callback error:', error);
          setError(error.message);
          Alert.alert('Authentication Error', error.message);
          return;
        }

        if (data.session) {
          console.log('✅ OAuth callback successful, user authenticated');
          Alert.alert('Success', 'You have been signed in successfully!');
          router.replace({ pathname: '/' });
        } else {
          console.log('⚠️ No session found after callback');
          // Try to force refresh the session in case it's still processing
          setTimeout(async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              console.log('✅ Session found after delay');
              router.replace({ pathname: '/' });
            } else {
              setError('No authentication session found');
              Alert.alert('Error', 'No authentication session found');
            }
          }, 2000);
        }
      } catch (err) {
        console.error('🔴 OAuth callback processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        Alert.alert('Error', 'Failed to complete authentication');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Retry the callback processing
    const handleAuthCallback = async () => {
      try {
        console.log('🔵 Retrying OAuth callback...');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Check for session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔴 Retry OAuth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          console.log('✅ Retry OAuth callback successful');
          router.replace({ pathname: '/' });
        }
      } catch (err) {
        console.error('🔴 Retry OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Completing authentication...</Text>
          <Text style={styles.subtitle}>Please wait while we sign you in</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Authentication Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.buttonContainer}>
            <Text style={styles.retryButton} onPress={handleRetry}>
              🔄 Try Again
            </Text>
            <Text style={styles.backButton} onPress={handleGoBack}>
              ← Go Back
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#10b981" />
        <Text style={styles.successTitle}>Authentication Complete</Text>
        <Text style={styles.successText}>You have been successfully signed in!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  retryButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    padding: 12,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    padding: 12,
  },
});