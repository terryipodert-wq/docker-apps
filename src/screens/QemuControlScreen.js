/**
 * QemuControlScreen
 * VM control panel with logs and management
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useQemuStore } from '../store/useQemuStore';
import { StatusBadge, ActionButton, LogViewer } from '../components';
import { formatUptime } from '../utils/helpers';
import { VM_STATUS } from '../utils/constants';

const StatBox = ({ icon, label, value, color }) => (
  <View style={styles.statBox}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QemuControlScreen = () => {
  const {
    vmStatus,
    vmStats,
    vmLogs,
    isInitialized,
    error,
    ramMB,
    cpuCores,
    initialize,
    startVM,
    stopVM,
    restartVM,
    clearLogs,
    isVmRunning,
    isVmBusy,
  } = useQemuStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, []);

  const isRunning = isVmRunning();
  const isBusy = isVmBusy();

  const handleStart = async () => {
    try {
      await startVM(ramMB, cpuCores);
    } catch (error) {
      console.error('Start VM error:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopVM();
    } catch (error) {
      console.error('Stop VM error:', error);
    }
  };

  const handleRestart = async () => {
    try {
      await restartVM();
    } catch (error) {
      console.error('Restart VM error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MaterialCommunityIcons
            name="server"
            size={32}
            color={isRunning ? ColorTokens.state.success : ColorTokens.text.muted}
          />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Alpine Linux VM</Text>
            <StatusBadge status={vmStatus} />
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color={ColorTokens.state.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* VM Stats */}
        {isRunning && (
          <View style={styles.statsRow}>
            <StatBox
              icon="clock-outline"
              label="Uptime"
              value={formatUptime(vmStats.uptime)}
              color={ColorTokens.accent.mauve}
            />
            <StatBox
              icon="cpu-64-bit"
              label="CPU"
              value={`${vmStats.cpuUsage.toFixed(1)}%`}
              color={ColorTokens.accent.terracotta}
            />
            <StatBox
              icon="memory"
              label="Memory"
              value={`${vmStats.memoryUsage.toFixed(1)}%`}
              color={ColorTokens.accent.olive}
            />
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {isRunning ? (
            <>
              <ActionButton
                icon="restart"
                title="Restart"
                variant="secondary"
                onPress={handleRestart}
                loading={isBusy && vmStatus === VM_STATUS.STARTING}
                disabled={isBusy}
                style={styles.controlButton}
              />
              <ActionButton
                icon="stop"
                title="Stop VM"
                variant="danger"
                onPress={handleStop}
                loading={isBusy && vmStatus === VM_STATUS.STOPPING}
                disabled={isBusy}
                style={styles.controlButton}
              />
            </>
          ) : (
            <ActionButton
              icon="play"
              title="Start VM"
              variant="success"
              onPress={handleStart}
              loading={isBusy}
              disabled={isBusy}
              fullWidth
            />
          )}
        </View>
      </View>

      {/* Configuration */}
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Configuration</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>RAM</Text>
          <Text style={styles.configValue}>{ramMB} MB</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>CPU Cores</Text>
          <Text style={styles.configValue}>{cpuCores}</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Network</Text>
          <Text style={styles.configValue}>NAT (Ports forwarded)</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Docker API</Text>
          <Text style={styles.configValue}>localhost:2375</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>SSH</Text>
          <Text style={styles.configValue}>localhost:2222</Text>
        </View>
      </View>

      {/* Logs */}
      <View style={styles.logsSection}>
        <View style={styles.logsSectionHeader}>
          <Text style={styles.cardTitle}>VM Logs</Text>
        </View>
        <LogViewer
          logs={vmLogs}
          maxHeight={300}
          onClear={clearLogs}
          showControls={true}
        />
      </View>
    </ScrollView>
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
  statusCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.lg,
    padding: SpaceTokens.lg,
    marginBottom: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SpaceTokens.lg,
  },
  statusInfo: {
    marginLeft: SpaceTokens.md,
  },
  statusTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ColorTokens.state.error}15`,
    padding: SpaceTokens.sm,
    borderRadius: RadiusTokens.sm,
    marginBottom: SpaceTokens.md,
  },
  errorText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.state.error,
    marginLeft: SpaceTokens.sm,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SpaceTokens.md,
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.md,
    marginBottom: SpaceTokens.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginTop: SpaceTokens.xs,
  },
  statLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: SpaceTokens.sm,
  },
  controlButton: {
    flex: 1,
  },
  configCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    marginBottom: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  cardTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.md,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  configLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  configValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
  },
  logsSection: {
    marginBottom: SpaceTokens.lg,
  },
  logsSectionHeader: {
    marginBottom: SpaceTokens.sm,
  },
});

export default QemuControlScreen;
