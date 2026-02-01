/**
 * AppNavigator
 * Main navigation container with stack and tab navigators
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme, ColorTokens, FontTokens } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { ROUTES } from '../utils/constants';

import BottomTabNavigator from './BottomTabNavigator';

// Screens
import ContainerDetailScreen from '../screens/ContainerDetailScreen';
import ImageDetailScreen from '../screens/ImageDetailScreen';
import WebViewScreen from '../screens/WebViewScreen';
import TerminalScreen from '../screens/TerminalScreen';
import QemuControlScreen from '../screens/QemuControlScreen';
import CreateContainerScreen from '../screens/CreateContainerScreen';
import PullImageScreen from '../screens/PullImageScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: ColorTokens.bg.surface,
  },
  headerTintColor: ColorTokens.text.primary,
  headerTitleStyle: {
    fontWeight: FontTokens.weight.semibold,
    fontSize: FontTokens.size.body,
  },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: {
    backgroundColor: ColorTokens.bg.canvas,
  },
  animation: 'slide_from_right',
};

const AppNavigator = () => {
  const { themeMode } = useSettingsStore();
  const isDark = themeMode === 'dark';

  return (
    <NavigationContainer theme={isDark ? darkTheme : lightTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.CONTAINER_DETAIL}
          component={ContainerDetailScreen}
          options={{ title: 'Container Details' }}
        />
        <Stack.Screen
          name={ROUTES.IMAGE_DETAIL}
          component={ImageDetailScreen}
          options={{ title: 'Image Details' }}
        />
        <Stack.Screen
          name={ROUTES.WEBVIEW}
          component={WebViewScreen}
          options={{ title: 'Web View' }}
        />
        <Stack.Screen
          name={ROUTES.TERMINAL}
          component={TerminalScreen}
          options={{ title: 'Terminal' }}
        />
        <Stack.Screen
          name={ROUTES.QEMU_CONTROL}
          component={QemuControlScreen}
          options={{ title: 'VM Control' }}
        />
        <Stack.Screen
          name={ROUTES.CREATE_CONTAINER}
          component={CreateContainerScreen}
          options={{ 
            title: 'Create Container',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name={ROUTES.PULL_IMAGE}
          component={PullImageScreen}
          options={{ 
            title: 'Pull Image',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
