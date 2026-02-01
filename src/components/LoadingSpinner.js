/**
 * LoadingSpinner Component
 * Displays loading state with optional message
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ColorTokens, SpaceTokens, FontTokens } from '../theme';

const LoadingSpinner = ({
  size = 'large',
  color = ColorTokens.accent.mauve,
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const content = (
    <View style={[styles.content, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{content}</View>;
  }

  return content;
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpaceTokens.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(246, 244, 241, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: SpaceTokens.md,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
