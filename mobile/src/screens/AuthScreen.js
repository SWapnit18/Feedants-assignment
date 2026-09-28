import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signIn, signUp, devLogin } from '../api/authApi';
import { colors, radius, spacing } from '../theme';

export default function AuthScreen({ navigation, route }) {
  const initialMode = route?.params?.mode === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'name' | 'email' | 'password' | null

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validate = () => {
    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    if (mode === 'signup' && password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    clearMessages();
    if (!validate()) return;

    try {
      setLoading(true);
      if (mode === 'signin') {
        await signIn({ email, password });
        setSuccessMessage('Welcome back! Signed in successfully.');
      } else {
        await signUp({ name, email, password });
        setSuccessMessage('Account created! Welcome to Feedants.');
      }

      // Automatically open Competition Details screen on success
      setTimeout(() => {
        navigation?.navigate('CompetitionDetails');
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    clearMessages();
    try {
      setDemoLoading(true);
      await devLogin('user@feedants.dev');
      setSuccessMessage('Logged in with demo account!');
      setTimeout(() => {
        navigation?.navigate('CompetitionDetails');
      }, 400);
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Go Back */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.navigate('CompetitionDetails')}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Feedants</Text>
            </TouchableOpacity>
          </View>

          {/* Brand Logo & Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🐜</Text>
            </View>
            <Text style={styles.brandTitle}>
              {mode === 'signin' ? 'Sign In to Feedants' : 'Create Account'}
            </Text>
            <Text style={styles.brandSubtitle}>
              {mode === 'signin'
                ? 'Access your registered competitions, submissions & rewards.'
                : 'Join top creators, showcase your talent and win rewards.'}
            </Text>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.tabSwitchContainer}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'signin' && styles.tabButtonActive]}
              onPress={() => {
                clearMessages();
                setMode('signin');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, mode === 'signin' && styles.tabButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'signup' && styles.tabButtonActive]}
              onPress={() => {
                clearMessages();
                setMode('signup');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, mode === 'signup' && styles.tabButtonTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error & Success Banners */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}
          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name field (Sign Up only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    clearMessages();
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  clearMessages();
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password with Show/Hide Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                {mode === 'signup' && (
                  <Text style={styles.labelHint}>Min 8 characters</Text>
                )}
              </View>
              <View style={[styles.passwordContainer, focusedField === 'password' && styles.passwordContainerFocused]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    clearMessages();
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide 👁️' : 'Show 👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Primary Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading || demoLoading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'signin' ? 'Sign In' : 'Create Feedants Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode Footer Link */}
            <View style={styles.switchModeRow}>
              <Text style={styles.switchModeText}>
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  clearMessages();
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchModeLink}>
                  {mode === 'signin' ? ' Sign Up' : ' Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR QUICK TEST</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Account 1-Tap Login Option */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            disabled={loading || demoLoading}
            activeOpacity={0.85}
          >
            {demoLoading ? (
              <ActivityIndicator color="#0F766E" size="small" />
            ) : (
              <Text style={styles.demoButtonText}>⚡ Sign In with Demo Account</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.demoSubtext}>
            Instant 1-tap sign in with a pre-configured test user
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F8FAFC',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(8),
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(3),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
    marginRight: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing(2),
    marginBottom: spacing(5),
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    marginBottom: spacing(2.5),
  },
  logoIcon: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing(2),
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: spacing(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#004D40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing(3),
    marginBottom: spacing(3),
  },
  errorIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 16,
  },
  successBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radius.md,
    padding: spacing(3),
    marginBottom: spacing(3),
  },
  successIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginRight: 8,
  },
  successBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#047857',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing(4.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: spacing(3.5),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  labelHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          boxShadow: 'none',
        }
      : {}),
  },
  inputFocused: {
    borderColor: '#004D40',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(0, 77, 64, 0.15)',
        }
      : {}),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          boxShadow: 'none',
        }
      : {}),
  },
  passwordContainerFocused: {
    borderColor: '#004D40',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(0, 77, 64, 0.15)',
        }
      : {}),
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          border: 'none',
          boxShadow: 'none',
        }
      : {}),
  },
  eyeButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F1F5F9',
  },
  eyeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#004D40',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#004D40',
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(2),
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing(3.5),
  },
  switchModeText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  switchModeLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#004D40',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: spacing(3),
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  demoButton: {
    width: '100%',
    backgroundColor: '#E6FFFA',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    color: '#004D40',
    fontSize: 13.5,
    fontWeight: '800',
  },
  demoSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
});
