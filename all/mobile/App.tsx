import React, { useEffect, useState } from 'react';
import { Platform, UIManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryProvider } from './src/providers/QueryProvider';
import { AuthProvider } from './src/auth/AuthProvider';
import { I18nProvider } from './src/i18n';
import { ToastProvider } from './src/components/Toast';
import { CompetitionDetailsScreen } from './src/screens/CompetitionDetailsScreen';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_SLUG = 'feedants-classical-dance';
const SLUG_KEY = 'feedants.slug.v1';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [slug, setSlug] = useState(DEFAULT_SLUG);

  useEffect(() => {
    AsyncStorage.getItem(SLUG_KEY)
      .then((v) => v && setSlug(v))
      .catch(() => undefined);
  }, []);

  const changeSlug = (next: string) => {
    setSlug(next);
    AsyncStorage.setItem(SLUG_KEY, next).catch(() => undefined);
  };

  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <CompetitionDetailsScreen slug={slug} onChangeSlug={changeSlug} />
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
