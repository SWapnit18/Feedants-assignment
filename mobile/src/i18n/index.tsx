import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '../api/types';
import { isApiError } from '../api/client';
import { en, type Dictionary, type TranslationKey } from './en';
import { hi } from './hi';

const dictionaries: Record<Lang, Dictionary> = { en, hi };
const STORAGE_KEY = 'feedants.lang.v1';

export type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
  /** Friendly, localized message for any thrown error (ApiError codes → dictionary). */
  errorMessage: (e: unknown) => string;
  /** false until the persisted language has been read (avoids an EN→HI flash). */
  hydrated: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (template: string, params?: Record<string, string | number>) =>
  params ? template.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : template;

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'en' || v === 'hi') setLangState(v);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback<TFunction>(
    (key, params) => interpolate(dictionaries[lang][key] ?? en[key] ?? key, params),
    [lang],
  );

  const errorMessage = useCallback(
    (e: unknown) => {
      if (isApiError(e)) {
        const key = `err_${e.code}` as TranslationKey;
        return key in en ? t(key) : e.message || t('err_UNKNOWN');
      }
      return t('err_UNKNOWN');
    },
    [t],
  );

  const value = useMemo(() => ({ lang, setLang, t, errorMessage, hydrated }), [lang, setLang, t, errorMessage, hydrated]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export type { TranslationKey };
