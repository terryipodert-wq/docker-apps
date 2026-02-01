/**
 * ActionButton Component
 * Custom button following design tokens
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ComponentTokens,
  ShadowTokens,
  MotionTokens,
} from '../theme';

const VARIANTS = {
  primary: {
    background: ColorTokens.accent.mauve,
    text: '#FFFFFF',
  },
  secondary: {
    background: ColorTokens.bg.soft,
    text: ColorTokens.text.primary,
  },
  success: {
    background: ColorTokens.state.success,
    text: '#FFFFFF',
  },
  warning: {
    background: ColorTokens.state.warning,
    text: ColorTokens.text.primary,
  },
  danger: {
    background: ColorTokens.state.error,
    text: '#FFFFFF',
  },
  outline: {
    background: 'transparent',
    text: ColorTokens.accent.mauve,
    borderColor: ColorTokens.accent.mauve,
  },
  ghost: {
    background: 'transparent',
    text: ColorTokens.accent.mauve,
  },
};

const ActionButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  
  const sizeStyles = {
    small: {
      height: 32,
      paddingHorizontal: SpaceTokens.md,
      fontSize: FontTokens.size.caption,
      iconSize: 16,
    },
    medium: {
      height: ComponentTokens.button.height,
      paddingHorizontal: ComponentTokens.button.paddingX,
      fontSize: FontTokens.size.body,
      iconSize: 20,
    },
    large: {
      height: 52,
      paddingHorizontal: SpaceTokens.xl,
      fontSize: FontTokens.size.h3,
      iconSize: 24,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={currentSize.iconSize}
              color={variantStyle.text}
              style={styles.iconLeft}
            />
          )}
          {title && (
            <Text
              style={[
                styles.text,
                {
                  color: variantStyle.text,
                  fontSize: currentSize.fontSize,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={currentSize.iconSize}
              color={variantStyle.text}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.background,
          height: currentSize.height,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderWidth: variantStyle.borderColor ? 1.5 : 0,
          borderColor: variantStyle.borderColor,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        variant !== 'ghost' && variant !== 'outline' && ShadowTokens.soft,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RadiusTokens.sm,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: ComponentTokens.button.fontWeight,
  },
  iconLeft: {
    marginRight: SpaceTokens.sm,
  },
  iconRight: {
    marginLeft: SpaceTokens.sm,
  },
  loader: {
    marginHorizontal: SpaceTokens.sm,
  },
});

export default ActionButton;
