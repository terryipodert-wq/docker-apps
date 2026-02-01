/**
 * StatusBadge Component
 * Displays container/VM status with color-coded badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorTokens, SpaceTokens, RadiusTokens, FontTokens } from '../theme';

const STATUS_COLORS = {
  running: ColorTokens.state.success,
  exited: ColorTokens.state.error,
  paused: ColorTokens.state.warning,
  restarting: ColorTokens.accent.mauve,
  dead: ColorTokens.state.error,
  created: ColorTokens.accent.olive,
  starting: ColorTokens.accent.mauve,
  stopping: ColorTokens.state.warning,
  stopped: ColorTokens.text.muted,
  error: ColorTokens.state.error,
  initializing: ColorTokens.accent.mint,
};

const StatusBadge = ({ status, size = 'medium', showDot = true }) => {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  const color = STATUS_COLORS[normalizedStatus] || ColorTokens.text.muted;
  
  const sizeStyles = {
    small: {
      paddingHorizontal: SpaceTokens.sm,
      paddingVertical: 2,
      fontSize: 10,
      dotSize: 6,
    },
    medium: {
      paddingHorizontal: SpaceTokens.md,
      paddingVertical: SpaceTokens.xs,
      fontSize: FontTokens.size.caption,
      dotSize: 8,
    },
    large: {
      paddingHorizontal: SpaceTokens.lg,
      paddingVertical: SpaceTokens.sm,
      fontSize: FontTokens.size.body,
      dotSize: 10,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color}20`,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: color,
              width: currentSize.dotSize,
              height: currentSize.dotSize,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RadiusTokens.pill,
  },
  dot: {
    borderRadius: RadiusTokens.pill,
    marginRight: SpaceTokens.xs,
  },
  text: {
    fontWeight: FontTokens.weight.medium,
  },
});

export default StatusBadge;
