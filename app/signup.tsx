import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import Logo from '@/components/Logo';
import AuthButtons from '@/components/AuthButtons';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

function SignUpScreen() {
   const [email, setEmail] = useState('');
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [passwordVisible, setPasswordVisible] = useState(false);
   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
   const [selectedLanguage, setSelectedLanguage] = useState('en');
   const [showLanguagePicker, setShowLanguagePicker] = useState(false);
   const [loading, setLoading] = useState(false);

   const { signUp } = useAuth();
   const { t, language, setLanguage } = useLanguage();
   const router = useRouter();

   // Helper function to add opacity to hex colors
   const addOpacity = (hexColor: string, opacity: number) => {
     const r = parseInt(hexColor.slice(1, 3), 16);
     const g = parseInt(hexColor.slice(3, 5), 16);
     const b = parseInt(hexColor.slice(5, 7), 16);
     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   };

   // Theme colors
   const backgroundColor = useThemeColor({}, 'background');
   const surfaceColor = useThemeColor({}, 'surface');
   const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');
   const primaryColor = useThemeColor({}, 'primary');
   const textColor = useThemeColor({}, 'text');
   const textSecondaryColor = useThemeColor({}, 'textSecondary');
   const borderColor = useThemeColor({}, 'border');

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
      alignItems: 'center',
    },
    topBar: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    backNavButton: {
      padding: 8,
      marginLeft: -8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: textColor,
      marginTop: 24,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: textSecondaryColor,
      textAlign: 'center',
      marginBottom: 32,
    },
    form: {
      width: '100%',
      maxWidth: 400,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: textColor,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: surfaceSecondaryColor,
    },
    passwordInputContainer: {
      position: 'relative',
    },
    passwordInput: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingRight: 50, // Make room for the eye button
      fontSize: 16,
      backgroundColor: surfaceSecondaryColor,
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: [{ translateY: -10 }],
      padding: 4,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    primaryButton: {
      backgroundColor: primaryColor,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      flexWrap: 'wrap',
      includeFontPadding: false,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      color: textSecondaryColor,
      fontSize: 14,
    },
    signInLink: {
      color: primaryColor,
      fontSize: 14,
      fontWeight: '600',
    },
    pickerContainer: {
      position: 'relative',
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: surfaceSecondaryColor,
    },
    pickerButtonText: {
      fontSize: 16,
      color: textColor,
      flex: 1,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    languagePickerModal: {
      backgroundColor: surfaceColor,
      borderRadius: 20,
      width: '90%',
      maxWidth: 400,
      maxHeight: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: textColor,
    },
    closeButton: {
      padding: 4,
    },
    languageList: {
      maxHeight: 300,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    languageOptionSelected: {
      backgroundColor: addOpacity(primaryColor, 0.10),
    },
    languageOptionText: {
      fontSize: 16,
      color: textColor,
    },
    languageOptionTextSelected: {
      color: primaryColor,
      fontWeight: '600',
    },
  }), [backgroundColor, surfaceColor, surfaceSecondaryColor, primaryColor, textColor, textSecondaryColor, borderColor]);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const getLanguageDisplayName = (lang: string) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'hy': 'Հայերեն (Armenian)',
      'ru': 'Русский (Russian)',
      'es': 'Español (Spanish)',
      'zh': '中文 (Chinese)',
      'hi': 'हिन्दी (Hindi)'
    };
    return languageNames[lang] || lang;
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common.error'), t('signup.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signup.passwordsDontMatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('signup.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, username);
      if (error) {
        Alert.alert(t('auth.signup'), error.message);
      } else {

        // Navigate directly to main app - onboarding will be shown automatically for new users
        router.replace('/');
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('error.loading'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backNavButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <Logo size={72} showText={true} textSize={26} />
            <Text style={styles.title}>{t('signup.createAccount')}</Text>
            <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('signup.usernameOptional')}</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t('signup.chooseUsername')}
                  placeholderTextColor={textSecondaryColor}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('signup.preferredLanguage')}</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowLanguagePicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {getLanguageDisplayName(selectedLanguage)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('signup.enterEmail')}
                  placeholderTextColor={textSecondaryColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.password')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('signup.createPassword')}
                    placeholderTextColor={textSecondaryColor}
                    secureTextEntry={!passwordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-off" : "eye"}
                      size={20}
                      color={textSecondaryColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('signup.confirmPassword')}
                    placeholderTextColor={textSecondaryColor}
                    secureTextEntry={!confirmPasswordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    <Ionicons
                      name={confirmPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      color={textSecondaryColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? t('signup.creatingAccount') : t('signup.createAccount')}
                </Text>
              </TouchableOpacity>
            </View>

            <AuthButtons onSuccess={() => router.push('/')} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => router.push('/signin')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Picker Modal */}
      {showLanguagePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.languagePickerModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguagePicker(false)}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={24} color={textSecondaryColor} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { flex: 1, textAlign: 'center' }]}>Select Language</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.languageList}>
              {[
                { code: 'en', name: 'English' },
                { code: 'hy', name: 'Հայերեն (Armenian)' },
                { code: 'ru', name: 'Русский (Russian)' },
                { code: 'es', name: 'Español (Spanish)' },
                { code: 'zh', name: '中文 (Chinese)' },
                { code: 'hi', name: 'हिन्दी (Hindi)' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.code && styles.languageOptionSelected
                  ]}
                  onPress={async () => {
                    await setLanguage(lang.code as Language);
                    setSelectedLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage === lang.code && styles.languageOptionTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                  {selectedLanguage === lang.code && (
                    <Ionicons name="checkmark" size={20} color={primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default SignUpScreen;
