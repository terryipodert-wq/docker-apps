/**
 * ContainerDetailScreen
 * Detailed view of a single container
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import {
  StatusBadge,
  ActionButton,
  LoadingSpinner,
  LogViewer,
} from '../components';
import { ROUTES } from '../utils/constants';
import {
  truncateId,
  formatTimestamp,
  formatBytes,
  parsePortMappings,
  calculateCpuPercent,
  calculateMemoryPercent,
} from '../utils/helpers';

const InfoRow = ({ label, value, mono = false }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, mono && styles.mono]} numberOfLines={2}>
      {value || 'N/A'}
    </Text>
  </View>
);

const ContainerDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { containerId, containerName } = route.params;
  
  const [activeTab, setActiveTab] = useState('info');
  
  const {
    selectedContainer,
    containerStats,
    containerLogs,
    isContainerLoading,
    isRefreshing,
    fetchContainer,
    fetchContainerStats,
    fetchContainerLogs,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    clearSelectedContainer,
  } = useDockerStore();

  useEffect(() => {
    loadData();
    return () => clearSelectedContainer();
  }, [containerId]);

  const loadData = async () => {
    try {
      await fetchContainer(containerId);
      await fetchContainerStats(containerId);
      await fetchContainerLogs(containerId);
    } catch (error) {
      console.error('Load container error:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    await loadData();
  }, [containerId]);

  const handleStart = async () => {
    try {
      await startContainer(containerId);
      await fetchContainer(containerId);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleStop = async () => {
    try {
      await stopContainer(containerId);
      await fetchContainer(containerId);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRestart = async () => {
    try {
      await restartContainer(containerId);
      await fetchContainer(containerId);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Container',
      `Are you sure you want to remove "${containerName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeContainer(containerId, true);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleOpenWebView = (port) => {
    navigation.navigate(ROUTES.WEBVIEW, {
      url: `http://localhost:${port}`,
      title: containerName,
    });
  };

  if (isContainerLoading && !selectedContainer) {
    return <LoadingSpinner fullScreen message="Loading container..." />;
  }

  if (!selectedContainer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Container not found</Text>
      </View>
    );
  }

  const isRunning = selectedContainer.State === 'running';
  const stats = containerStats[containerId];
  const logs = containerLogs[containerId] || '';
  const ports = parsePortMappings(selectedContainer.NetworkSettings?.Ports || {});

  const cpuPercent = stats ? calculateCpuPercent(stats) : 0;
  const memPercent = stats ? calculateMemoryPercent(stats) : 0;
  const memUsage = stats?.memory_stats?.usage || 0;

  const tabs = [
    { key: 'info', label: 'Info' },
    { key: 'stats', label: 'Stats' },
    { key: 'logs', label: 'Logs' },
    { key: 'ports', label: 'Ports' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={ColorTokens.accent.mauve}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.containerName}>{containerName}</Text>
            <Text style={styles.containerId}>{truncateId(containerId)}</Text>
          </View>
          <StatusBadge status={selectedContainer.State} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isRunning ? (
            <>
              <ActionButton
                icon="stop"
                title="Stop"
                variant="danger"
                size="small"
                onPress={handleStop}
                style={styles.actionButton}
              />
              <ActionButton
                icon="restart"
                title="Restart"
                variant="secondary"
                size="small"
                onPress={handleRestart}
                style={styles.actionButton}
              />
            </>
          ) : (
            <ActionButton
              icon="play"
              title="Start"
              variant="success"
              size="small"
              onPress={handleStart}
              style={styles.actionButton}
            />
          )}
          <ActionButton
            icon="console"
            title="Terminal"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate(ROUTES.TERMINAL, { containerId })}
            style={styles.actionButton}
          />
          <ActionButton
            icon="delete"
            title="Remove"
            variant="ghost"
            size="small"
            onPress={handleRemove}
            style={styles.actionButton}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <View style={styles.card}>
            <InfoRow label="Image" value={selectedContainer.Image} />
            <InfoRow
              label="Created"
              value={formatTimestamp(selectedContainer.Created)}
            />
            <InfoRow
              label="Command"
              value={selectedContainer.Config?.Cmd?.join(' ') || selectedContainer.Command}
              mono
            />
            <InfoRow
              label="Working Dir"
              value={selectedContainer.Config?.WorkingDir}
              mono
            />
            <InfoRow
              label="Network Mode"
              value={selectedContainer.HostConfig?.NetworkMode}
            />
            
            {selectedContainer.Config?.Env?.length > 0 && (
              <>
                <Text style={styles.subTitle}>Environment Variables</Text>
                {selectedContainer.Config.Env.slice(0, 5).map((env, i) => (
                  <Text key={i} style={styles.envVar} numberOfLines={1}>
                    {env}
                  </Text>
                ))}
                {selectedContainer.Config.Env.length > 5 && (
                  <Text style={styles.moreText}>
                    +{selectedContainer.Config.Env.length - 5} more
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="cpu-64-bit"
                  size={24}
                  color={ColorTokens.accent.mauve}
                />
                <Text style={styles.statValue}>{cpuPercent}%</Text>
                <Text style={styles.statLabel}>CPU</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="memory"
                  size={24}
                  color={ColorTokens.accent.terracotta}
                />
                <Text style={styles.statValue}>{memPercent}%</Text>
                <Text style={styles.statLabel}>
                  {formatBytes(memUsage)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'logs' && (
          <LogViewer
            logs={logs}
            maxHeight={400}
            onRefresh={() => fetchContainerLogs(containerId)}
          />
        )}

        {activeTab === 'ports' && (
          <View style={styles.card}>
            {ports.length === 0 ? (
              <Text style={styles.emptyText}>No ports exposed</Text>
            ) : (
              ports.map((port, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.portRow}
                  onPress={() => port.hostPort && handleOpenWebView(port.hostPort)}
                  disabled={!port.hostPort}
                >
                  <View style={styles.portInfo}>
                    <Text style={styles.portText}>
                      {port.hostPort || '-'}:{port.containerPort}/{port.protocol}
                    </Text>
                    <Text style={styles.portLabel}>
                      {port.hostIp}
                    </Text>
                  </View>
                  {port.hostPort && (
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={20}
                      color={ColorTokens.accent.mauve}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  content: {
    padding: SpaceTokens.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SpaceTokens.lg,
  },
  headerInfo: {
    flex: 1,
  },
  containerName: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: 4,
  },
  containerId: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpaceTokens.sm,
    marginBottom: SpaceTokens.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: 4,
    marginBottom: SpaceTokens.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SpaceTokens.sm,
    alignItems: 'center',
    borderRadius: RadiusTokens.sm,
  },
  tabActive: {
    backgroundColor: ColorTokens.accent.mauve,
  },
  tabText: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  infoLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    fontWeight: FontTokens.weight.medium,
    flex: 2,
    textAlign: 'right',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: FontTokens.size.caption,
  },
  subTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginTop: SpaceTokens.md,
    marginBottom: SpaceTokens.sm,
  },
  envVar: {
    fontSize: FontTokens.size.caption,
    fontFamily: 'monospace',
    color: ColorTokens.text.secondary,
    paddingVertical: 2,
  },
  moreText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.accent.mauve,
    marginTop: SpaceTokens.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: SpaceTokens.lg,
  },
  statValue: {
    fontSize: FontTokens.size.h2,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginTop: SpaceTokens.sm,
  },
  statLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.muted,
    textAlign: 'center',
    padding: SpaceTokens.lg,
  },
  portRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  portInfo: {
    flex: 1,
  },
  portText: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
    fontFamily: 'monospace',
  },
  portLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
  },
});

export default ContainerDetailScreen;
