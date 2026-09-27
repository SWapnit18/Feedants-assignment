import React, { useEffect, useState } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isApiError } from '../api/client';

/** React Native has no window focus: map AppState to react-query focus so polling pauses in background. */
function useAppStateFocus() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        // Retry only transient failures; business errors (404 etc.) surface immediately.
        retry: (count, error) => count < 2 && (!isApiError(error) || error.isRetryable),
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      },
      mutations: { retry: false },
    },
  });

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeClient);
  useAppStateFocus();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
