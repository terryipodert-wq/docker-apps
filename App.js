/**
 * Docker Android
 * React Native app to run Docker containers on Android via QEMU
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useDockerStore } from './src/store/useDockerStore';
import { useQemuStore } from './src/store/useQemuStore';
import { ErrorBoundary, LoadingSpinner } from './src/components';
import { ColorTokens } from './src/theme';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const initializeDocker = useDockerStore((state) => state.initialize);
  const loadQemuSettings = useQemuStore((state) => state.loadSettings);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
        await initializeDocker();
        await loadQemuSettings();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Initializing Docker Android..." />
      </View>
    );
  }

  return children;
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppInitializer>
            <AppNavigator />
          </AppInitializer>
        </ErrorBoundary>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
