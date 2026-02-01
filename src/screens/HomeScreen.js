/**
 * HomeScreen
 * Dashboard overview with VM status and quick stats
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { useQemuStore } from '../store/useQemuStore';
import { StatusBadge, ActionButton, LoadingSpinner } from '../components';
import { ROUTES, VM_STATUS } from '../utils/constants';
import { formatUptime, formatBytes } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const QuickAction = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const {
    containers,
    images,
    systemInfo,
    isLoading,
    isRefreshing,
    fetchContainers,
    fetchImages,
    fetchSystemInfo,
    mockMode,
  } = useDockerStore();

  const {
    vmStatus,
    vmStats,
    startVM,
    stopVM,
    isVmBusy,
  } = useQemuStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchContainers(),
        fetchImages(),
        fetchSystemInfo(),
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    await loadData();
  }, []);

  const runningContainers = containers.filter(c => c.State === 'running').length;
  const stoppedContainers = containers.length - runningContainers;
  const isVmRunning = vmStatus === VM_STATUS.RUNNING;
  const isBusy = isVmBusy();

  const handleVmToggle = async () => {
    try {
      if (isVmRunning) {
        await stopVM();
      } else {
        await startVM();
      }
    } catch (error) {
      console.error('VM toggle error:', error);
    }
  };

  if (isLoading && containers.length === 0) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        {/* VM Status Card */}
        <View style={styles.vmCard}>
          <View style={styles.vmHeader}>
            <View style={styles.vmTitleRow}>
              <MaterialCommunityIcons
                name="server"
                size={28}
                color={isVmRunning ? ColorTokens.state.success : ColorTokens.text.muted}
              />
              <View style={styles.vmTitleContainer}>
                <Text style={styles.vmTitle}>Alpine Linux VM</Text>
                <StatusBadge status={vmStatus} size="small" />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.QEMU_CONTROL)}
            >
              <MaterialCommunityIcons
                name="cog"
                size={22}
                color={ColorTokens.text.muted}
              />
            </TouchableOpacity>
          </View>

          {isVmRunning && (
            <View style={styles.vmStats}>
              <View style={styles.vmStatItem}>
                <Text style={styles.vmStatLabel}>Uptime</Text>
                <Text style={styles.vmStatValue}>
                  {formatUptime(vmStats.uptime)}
                </Text>
              </View>
              <View style={styles.vmStatDivider} />
              <View style={styles.vmStatItem}>
                <Text style={styles.vmStatLabel}>CPU</Text>
                <Text style={styles.vmStatValue}>
                  {vmStats.cpuUsage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.vmStatDivider} />
              <View style={styles.vmStatItem}>
                <Text style={styles.vmStatLabel}>Memory</Text>
                <Text style={styles.vmStatValue}>
                  {vmStats.memoryUsage.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          <ActionButton
            title={isVmRunning ? 'Stop VM' : 'Start VM'}
            onPress={handleVmToggle}
            variant={isVmRunning ? 'danger' : 'success'}
            icon={isVmRunning ? 'stop' : 'play'}
            loading={isBusy}
            fullWidth
            style={styles.vmButton}
          />
        </View>

        {/* Mode Badge */}
        {mockMode && (
          <View style={styles.mockBadge}>
            <MaterialCommunityIcons
              name="test-tube"
              size={16}
              color={ColorTokens.state.warning}
            />
            <Text style={styles.mockBadgeText}>Mock Mode Active</Text>
          </View>
        )}

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="docker"
            label="Running"
            value={runningContainers}
            color={ColorTokens.state.success}
            onPress={() => navigation.navigate(ROUTES.CONTAINERS)}
          />
          <StatCard
            icon="stop-circle-outline"
            label="Stopped"
            value={stoppedContainers}
            color={ColorTokens.state.error}
            onPress={() => navigation.navigate(ROUTES.CONTAINERS)}
          />
          <StatCard
            icon="layers"
            label="Images"
            value={images.length}
            color={ColorTokens.accent.olive}
            onPress={() => navigation.navigate(ROUTES.IMAGES)}
          />
          <StatCard
            icon="harddisk"
            label="Storage"
            value={formatBytes(systemInfo?.MemTotal || 0, 0)}
            color={ColorTokens.accent.mauve}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction
            icon="plus-circle"
            label="New Container"
            color={ColorTokens.state.success}
            onPress={() => navigation.navigate(ROUTES.CREATE_CONTAINER)}
          />
          <QuickAction
            icon="download"
            label="Pull Image"
            color={ColorTokens.accent.mauve}
            onPress={() => navigation.navigate(ROUTES.PULL_IMAGE)}
          />
          <QuickAction
            icon="console"
            label="Terminal"
            color={ColorTokens.accent.terracotta}
            onPress={() => navigation.navigate(ROUTES.TERMINAL)}
          />
          <QuickAction
            icon="cog"
            label="Settings"
            color={ColorTokens.accent.olive}
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
          />
        </View>

        {/* Docker Info */}
        {systemInfo && (
          <>
            <Text style={styles.sectionTitle}>Docker Engine</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>
                  {systemInfo.ServerVersion || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Operating System</Text>
                <Text style={styles.infoValue}>
                  {systemInfo.OperatingSystem || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Architecture</Text>
                <Text style={styles.infoValue}>
                  {systemInfo.Architecture || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPUs</Text>
                <Text style={styles.infoValue}>{systemInfo.NCPU || 'N/A'}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  vmCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.lg,
    padding: SpaceTokens.lg,
    marginBottom: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  vmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SpaceTokens.md,
  },
  vmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vmTitleContainer: {
    marginLeft: SpaceTokens.md,
  },
  vmTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.xs,
  },
  vmStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SpaceTokens.md,
    marginBottom: SpaceTokens.md,
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.md,
  },
  vmStatItem: {
    alignItems: 'center',
  },
  vmStatLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginBottom: 4,
  },
  vmStatValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
  },
  vmStatDivider: {
    width: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  vmButton: {
    marginTop: SpaceTokens.sm,
  },
  mockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${ColorTokens.state.warning}20`,
    paddingVertical: SpaceTokens.sm,
    paddingHorizontal: SpaceTokens.md,
    borderRadius: RadiusTokens.pill,
    marginBottom: SpaceTokens.md,
  },
  mockBadgeText: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.state.warning,
    marginLeft: SpaceTokens.xs,
  },
  sectionTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.md,
    marginTop: SpaceTokens.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SpaceTokens.xs,
    marginBottom: SpaceTokens.md,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: SpaceTokens.xs,
    marginBottom: SpaceTokens.sm,
  },
  statCardInner: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    alignItems: 'center',
    ...ShadowTokens.soft,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RadiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SpaceTokens.sm,
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    alignItems: 'center',
    ...ShadowTokens.soft,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SpaceTokens.lg,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: RadiusTokens.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SpaceTokens.sm,
  },
  quickActionLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SpaceTokens.sm,
  },
  infoLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  infoValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: ColorTokens.bg.soft,
  },
});

export default HomeScreen;
