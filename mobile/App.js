import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, BackHandler } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import ExploreScreen from './src/screens/ExploreScreen.js';
import CreateScreen from './src/screens/CreateScreen.js';
import ProfileScreen from './src/screens/ProfileScreen.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

export default function App() {
  // Navigation stack state with 'CompetitionDetails' as primary default
  const [history, setHistory] = useState(['CompetitionDetails']);
  const [routeParams, setRouteParams] = useState({});

  const currentScreen = history[history.length - 1] || 'CompetitionDetails';

  const navigate = useCallback((screenName, params = {}) => {
    // Normalize aliases
    const target = screenName === 'Competitions' ? 'CompetitionDetails' : screenName;
    setRouteParams(params);
    setHistory((prev) => {
      if (prev[prev.length - 1] === target) return prev;
      return [...prev, target];
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      return prev;
    });
  }, []);

  const canGoBack = useCallback(() => {
    return history.length > 1;
  }, [history.length]);

  // Handle hardware Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (history.length > 1) {
        goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [history.length, goBack]);

  const navigation = {
    navigate,
    goBack,
    canGoBack,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} route={{ name: 'Home', params: routeParams }} />;
      case 'Explore':
        return <ExploreScreen navigation={navigation} route={{ name: 'Explore', params: routeParams }} />;
      case 'Create':
        return <CreateScreen navigation={navigation} route={{ name: 'Create', params: routeParams }} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} route={{ name: 'Profile', params: routeParams }} />;
      case 'CompetitionDetails':
      default:
        return (
          <CompetitionDetailsScreen
            navigation={navigation}
            route={{ name: 'CompetitionDetails', params: routeParams }}
          />
        );
    }
  };

  return (
    <SafeAreaProvider style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.wrapper}>{renderScreen()}</View>
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
