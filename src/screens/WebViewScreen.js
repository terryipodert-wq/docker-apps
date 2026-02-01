/**
 * WebViewScreen
 * Display container web apps via WebView
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
} from '../theme';

const WebViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  
  const { url: initialUrl, title } = route.params || {};
  
  const [currentUrl, setCurrentUrl] = useState(initialUrl || 'http://localhost:8080');
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [error, setError] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Web View',
    });
  }, [navigation, title]);

  const handleNavigate = () => {
    let url = inputUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setCurrentUrl(url);
    setError(null);
  };

  const handleRefresh = () => {
    setError(null);
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    webViewRef.current?.goBack();
  };

  const handleGoForward = () => {
    webViewRef.current?.goForward();
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setInputUrl(navState.url);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load page');
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* URL Bar */}
      <View style={styles.urlBar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={canGoBack ? ColorTokens.text.primary : ColorTokens.text.muted}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={canGoForward ? ColorTokens.text.primary : ColorTokens.text.muted}
          />
        </TouchableOpacity>
        
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={handleNavigate}
            placeholder="Enter URL..."
            placeholderTextColor={ColorTokens.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
          />
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={ColorTokens.accent.mauve}
              style={styles.urlLoader}
            />
          )}
        </View>
        
        <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={ColorTokens.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webviewContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color={ColorTokens.state.error}
            />
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure the container is running and the port is exposed
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleError}
            onHttpError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ColorTokens.accent.mauve} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpaceTokens.sm,
    backgroundColor: ColorTokens.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RadiusTokens.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  urlInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.sm,
    marginHorizontal: SpaceTokens.sm,
    paddingHorizontal: SpaceTokens.sm,
  },
  urlInput: {
    flex: 1,
    height: 36,
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.primary,
  },
  urlLoader: {
    marginLeft: SpaceTokens.sm,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorTokens.bg.canvas,
  },
  loadingText: {
    marginTop: SpaceTokens.md,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpaceTokens.xl,
    backgroundColor: ColorTokens.bg.canvas,
  },
  errorTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginTop: SpaceTokens.md,
    marginBottom: SpaceTokens.sm,
  },
  errorMessage: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.state.error,
    textAlign: 'center',
    marginBottom: SpaceTokens.sm,
  },
  errorHint: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    textAlign: 'center',
    marginBottom: SpaceTokens.lg,
  },
  retryButton: {
    paddingHorizontal: SpaceTokens.lg,
    paddingVertical: SpaceTokens.sm,
    backgroundColor: ColorTokens.accent.mauve,
    borderRadius: RadiusTokens.sm,
  },
  retryText: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: '#FFFFFF',
  },
});

export default WebViewScreen;
