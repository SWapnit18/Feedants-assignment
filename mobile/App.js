import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, BackHandler } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import ExploreScreen from './src/screens/ExploreScreen.js';
import CreateScreen from './src/screens/CreateScreen.js';
import ProfileScreen from './src/screens/ProfileScreen.js';
import AuthScreen from './src/screens/AuthScreen.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'feedants-web-custom-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      * {
        box-sizing: border-box;
      }
      /* Remove default browser focus black box borders and outlines */
      input, textarea, select {
        outline: none !important;
        box-shadow: none !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      :focus-visible {
        outline: none !important;
      }
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #0F172A;
        overflow-x: hidden;
      }
      #root {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #0F172A;
      }
      /* Ensure HTML5 video elements in React Native Web scale properly */
      video {
        width: 100% !important;
        height: 100% !important;
        display: block;
        object-fit: contain;
      }
      /* Custom scrollbar for web preview */
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #0F172A;
      }
      ::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <View><Text>{this.state.error.message}</Text></View>;
    }
    return this.props.children;
  }
}

export default function App() {
  // Navigation stack state with 'CompetitionDetails' as primary default
  const [history, setHistory] = useState(['CompetitionDetails']);
  const [routeParams, setRouteParams] = useState({ competitionId: 'feedants-classical-dance' });

  const currentScreen = history[history.length - 1] || 'CompetitionDetails';

  const navigate = useCallback((screenName, params = {}) => {
    // Normalize aliases
    const target = screenName === 'Competitions' ? 'CompetitionDetails' : screenName;
    React.startTransition(() => {
      setRouteParams(params);
      setHistory((prev) => {
        if (prev[prev.length - 1] === target) return prev;
        return [...prev, target];
      });
    });
  }, []);

  const goBack = useCallback(() => {
    React.startTransition(() => {
      setHistory((prev) => {
        if (prev.length > 1) {
          return prev.slice(0, prev.length - 1);
        }
        return prev;
      });
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
      case 'Auth':
      case 'SignIn':
      case 'SignUp':
        return <AuthScreen navigation={navigation} route={{ name: currentScreen, params: routeParams }} />;
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
    <AppErrorBoundary>
      <SafeAreaProvider style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <View style={styles.wrapper}>{renderScreen()}</View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
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
