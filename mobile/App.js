import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

// Reference app entry: in a real app this competitionId comes from
// navigation params (e.g. tapping a competition card on the list screen).
const DEMO_COMPETITION_ID = '6ab90c66d8bb4a814e559a4b';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CompetitionDetailsScreen
          route={{ params: { competitionId: DEMO_COMPETITION_ID } }}
          navigation={{ goBack: () => {}, navigate: () => {} }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
