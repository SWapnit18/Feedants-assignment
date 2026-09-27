import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

export default function App() {
  return (
    <SafeAreaProvider style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.wrapper}>
          <CompetitionDetailsScreen
            route={{ params: {} }}
            navigation={{ goBack: () => {}, navigate: () => {} }}
          />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { minHeight: '100vh', height: '100vh', width: '100vw' } : {}),
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web' ? { minHeight: '100vh', width: '100%' } : {}),
  },
});
