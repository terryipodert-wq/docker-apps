/**
 * LogViewer Component
 * Displays container or VM logs with auto-scroll
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorTokens, SpaceTokens, RadiusTokens, FontTokens } from '../theme';

const LogViewer = ({
  logs = '',
  autoScroll = true,
  maxHeight = 400,
  showControls = true,
  onRefresh,
  onClear,
  isLoading = false,
}) => {
  const scrollRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(autoScroll);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [logs, isAutoScroll]);

  const logLines = typeof logs === 'string' 
    ? logs.split('\n').filter(line => line.trim())
    : Array.isArray(logs) 
      ? logs.map(l => l.message || l)
      : [];

  const getLogLevel = (line) => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('fatal')) return 'error';
    if (lowerLine.includes('warn')) return 'warning';
    if (lowerLine.includes('info')) return 'info';
    if (lowerLine.includes('debug')) return 'debug';
    return 'default';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return ColorTokens.state.error;
      case 'warning':
        return ColorTokens.state.warning;
      case 'info':
        return ColorTokens.accent.mauve;
      case 'debug':
        return ColorTokens.text.muted;
      default:
        return ColorTokens.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isAutoScroll && styles.controlButtonActive,
            ]}
            onPress={() => setIsAutoScroll(!isAutoScroll)}
          >
            <MaterialCommunityIcons
              name="arrow-down-bold-box"
              size={18}
              color={isAutoScroll ? ColorTokens.accent.mauve : ColorTokens.text.muted}
            />
            <Text
              style={[
                styles.controlText,
                isAutoScroll && styles.controlTextActive,
              ]}
            >
              Auto-scroll
            </Text>
          </TouchableOpacity>

          {onRefresh && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onRefresh}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={ColorTokens.text.muted}
              />
              <Text style={styles.controlText}>Refresh</Text>
            </TouchableOpacity>
          )}

          {onClear && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onClear}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={18}
                color={ColorTokens.text.muted}
              />
              <Text style={styles.controlText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={[styles.logContainer, { maxHeight }]}
        contentContainerStyle={styles.logContent}
        showsVerticalScrollIndicator={true}
        onScrollBeginDrag={() => setIsAutoScroll(false)}
      >
        {logLines.length === 0 ? (
          <Text style={styles.emptyText}>No logs available</Text>
        ) : (
          logLines.map((line, index) => {
            const level = getLogLevel(line);
            const color = getLevelColor(level);
            
            return (
              <View key={index} style={styles.logLine}>
                <Text style={styles.lineNumber}>{index + 1}</Text>
                <Text style={[styles.logText, { color }]}>
                  {line}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {logLines.length} line{logLines.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: RadiusTokens.md,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    padding: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: SpaceTokens.md,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpaceTokens.xs,
    borderRadius: RadiusTokens.sm,
  },
  controlButtonActive: {
    backgroundColor: `${ColorTokens.accent.mauve}20`,
  },
  controlText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginLeft: 4,
  },
  controlTextActive: {
    color: ColorTokens.accent.mauve,
  },
  logContainer: {
    backgroundColor: '#1E1E1E',
  },
  logContent: {
    padding: SpaceTokens.sm,
  },
  logLine: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  lineNumber: {
    width: 36,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
    textAlign: 'right',
    marginRight: SpaceTokens.sm,
  },
  logText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.muted,
    textAlign: 'center',
    padding: SpaceTokens.xl,
  },
  footer: {
    padding: SpaceTokens.sm,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    fontSize: FontTokens.size.caption,
    color: '#666',
    textAlign: 'right',
  },
});

export default LogViewer;
