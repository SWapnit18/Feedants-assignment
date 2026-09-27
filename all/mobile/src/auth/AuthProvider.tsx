import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { api } from '../api/endpoints';
import type { User } from '../api/types';

export const DEFAULT_DEMO_EMAIL = 'amit@feedants.dev';
const STORAGE_KEY = 'feedants.auth.v1';

interface StoredSession {
  token: string;
  user: User;
  email: string;
}

interface AuthContextValue {
  /** true once the stored session has been restored (or a login attempt finished). */
  ready: boolean;
  user: User | null;
  email: string | null;
  loggingIn: boolean;
  loginError: unknown;
  /** Demo login (dev-login endpoint). Also used to switch between seeded users. */
  login: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<unknown>(null);
  const inflight = useRef<Promise<void> | null>(null);

  const applySession = useCallback(async (next: StoredSession | null) => {
    setAuthToken(next?.token ?? null);
    setSession(next);
    try {
      if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // persistence is best-effort
    }
  }, []);

  const login = useCallback(
    (email: string = DEFAULT_DEMO_EMAIL) => {
      if (inflight.current) return inflight.current;
      const run = (async () => {
        setLoggingIn(true);
        setLoginError(null);
        try {
          const res = await api.devLogin(email);
          await applySession({ token: res.token, user: res.user, email });
          // Viewer-specific data (CTA, referral…) must be refetched for the new identity.
          qc.removeQueries({ queryKey: ['referral'] });
          void qc.invalidateQueries();
        } catch (e) {
          setLoginError(e);
          throw e;
        } finally {
          setLoggingIn(false);
          setReady(true);
          inflight.current = null;
        }
      })();
      inflight.current = run;
      return run;
    },
    [applySession, qc],
  );

  const logout = useCallback(async () => {
    await applySession(null);
    await qc.invalidateQueries();
  }, [applySession, qc]);

  // Restore persisted session, or dev-login as the default demo user on first launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: StoredSession | null = null;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        stored = raw ? (JSON.parse(raw) as StoredSession) : null;
      } catch {
        stored = null;
      }
      if (cancelled) return;
      if (stored?.token) {
        setAuthToken(stored.token);
        setSession(stored);
        setReady(true);
      } else {
        login().catch(() => undefined); // screen still renders anonymously if the backend is down
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [login]);

  // Expired / invalid token → silently re-login as the same demo user.
  const emailRef = useRef<string | null>(null);
  emailRef.current = session?.email ?? null;
  useEffect(() => {
    setUnauthorizedHandler(() => {
      const email = emailRef.current ?? DEFAULT_DEMO_EMAIL;
      setAuthToken(null);
      login(email).catch(() => undefined);
    });
    return () => setUnauthorizedHandler(null);
  }, [login]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user: session?.user ?? null,
      email: session?.email ?? null,
      loggingIn,
      loginError,
      login,
      logout,
    }),
    [ready, session, loggingIn, loginError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
