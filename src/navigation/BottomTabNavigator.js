/**
 * BottomTabNavigator
 * Bottom tab navigation for main screens
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorTokens, SpaceTokens, RadiusTokens, ShadowTokens } from '../theme';
import { ROUTES } from '../utils/constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ContainersScreen from '../screens/ContainersScreen';
import ImagesScreen from '../screens/ImagesScreen';
import VolumesScreen from '../screens/VolumesScreen';
import NetworksScreen from '../screens/NetworksScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused, color }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <MaterialCommunityIcons
      name={name}
      size={24}
      color={focused ? ColorTokens.accent.mauve : ColorTokens.text.muted}
    />
  </View>
);

const screenOptions = {
  tabBarActiveTintColor: ColorTokens.accent.mauve,
  tabBarInactiveTintColor: ColorTokens.text.muted,
  tabBarStyle: {
    backgroundColor: ColorTokens.bg.surface,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: SpaceTokens.sm,
    ...ShadowTokens.soft,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerStyle: {
    backgroundColor: ColorTokens.bg.surface,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: ColorTokens.text.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 18,
  },
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="view-dashboard" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.CONTAINERS}
        component={ContainersScreen}
        options={{
          title: 'Containers',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="docker" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.IMAGES}
        component={ImagesScreen}
        options={{
          title: 'Images',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="layers" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.VOLUMES}
        component={VolumesScreen}
        options={{
          title: 'Volumes',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="database" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="cog" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RadiusTokens.pill,
  },
  iconContainerActive: {
    backgroundColor: `${ColorTokens.accent.mauve}15`,
  },
});

export default BottomTabNavigator;
