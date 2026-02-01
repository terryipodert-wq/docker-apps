/**
 * ErrorBoundary Component
 * Catches and displays errors gracefully
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorTokens, SpaceTokens, RadiusTokens, FontTokens } from '../theme';
import ActionButton from './ActionButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color={ColorTokens.state.error}
            />
          </View>
          
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          
          <ActionButton
            title="Try Again"
            onPress={this.handleRetry}
            variant="primary"
            icon="refresh"
            style={styles.button}
          />
          
          {__DEV__ && this.state.errorInfo && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

// Functional error display component
export const ErrorDisplay = ({
  message = 'Something went wrong',
  onRetry,
  icon = 'alert-circle-outline',
}) => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={ColorTokens.state.error}
      />
    </View>
    
    <Text style={styles.title}>Oops!</Text>
    <Text style={styles.message}>{message}</Text>
    
    {onRetry && (
      <ActionButton
        title="Try Again"
        onPress={onRetry}
        variant="primary"
        icon="refresh"
        style={styles.button}
      />
    )}
  </View>
);

// Empty state component
export const EmptyState = ({
  title = 'Nothing here yet',
  message,
  icon = 'inbox-outline',
  actionLabel,
  onAction,
}) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={ColorTokens.text.muted}
      />
    </View>
    
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMessage}>{message}</Text>}
    
    {actionLabel && onAction && (
      <ActionButton
        title={actionLabel}
        onPress={onAction}
        variant="primary"
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpaceTokens.xl,
    backgroundColor: ColorTokens.bg.canvas,
  },
  iconContainer: {
    marginBottom: SpaceTokens.lg,
  },
  title: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
    textAlign: 'center',
    marginBottom: SpaceTokens.lg,
    paddingHorizontal: SpaceTokens.lg,
  },
  button: {
    marginTop: SpaceTokens.md,
  },
  debugContainer: {
    marginTop: SpaceTokens.xl,
    padding: SpaceTokens.md,
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.sm,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.xs,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: ColorTokens.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpaceTokens.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ColorTokens.bg.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SpaceTokens.lg,
  },
  emptyTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SpaceTokens.lg,
  },
});

export default ErrorBoundary;
