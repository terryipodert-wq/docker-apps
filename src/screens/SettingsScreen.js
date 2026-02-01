/**
 * SettingsScreen
 * App configuration and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDockerStore } from '../store/useDockerStore';
import { ActionButton } from '../components';
import { ROUTES, VM_CONFIG } from '../utils/constants';

const SettingSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const SettingRow = ({ icon, label, description, children }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={ColorTokens.accent.mauve}
        style={styles.settingIcon}
      />
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
    </View>
    <View style={styles.settingControl}>{children}</View>
  </View>
);

const SettingsScreen = () => {
  const navigation = useNavigation();
  
  const {
    themeMode,
    mockMode,
    dockerUrl,
    vmRam,
    vmCpu,
    setThemeMode,
    setMockMode,
    setDockerUrl,
    setVmRam,
    setVmCpu,
    resetSettings,
    clearCache,
  } = useSettingsStore();

  const { isConnected, setDockerUrl: setStoreDockerUrl, setMockMode: setStoreMockMode } = useDockerStore();
  
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(dockerUrl);

  const handleThemeToggle = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  const handleMockModeToggle = async (value) => {
    await setMockMode(value);
    await setStoreMockMode(value);
  };

  const handleSaveUrl = async () => {
    await setDockerUrl(urlInput);
    await setStoreDockerUrl(urlInput);
    setEditingUrl(false);
  };

  const handleRamChange = async (value) => {
    const rounded = Math.round(value / 256) * 256;
    await setVmRam(rounded);
  };

  const handleCpuChange = async (value) => {
    await setVmCpu(Math.round(value));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            await clearCache();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            Alert.alert('Success', 'Settings reset successfully');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={mockMode ? 'test-tube' : (isConnected ? 'check-circle' : 'alert-circle')}
              size={24}
              color={mockMode ? ColorTokens.state.warning : (isConnected ? ColorTokens.state.success : ColorTokens.state.error)}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {mockMode ? 'Mock Mode' : (isConnected ? 'Connected' : 'Disconnected')}
              </Text>
              <Text style={styles.statusSubtitle}>
                {mockMode ? 'Using simulated data' : dockerUrl}
              </Text>
            </View>
          </View>
        </View>

        {/* Docker Settings */}
        <SettingSection title="Docker Configuration">
          <SettingRow
            icon="test-tube"
            label="Mock Mode"
            description="Use simulated data for testing"
          >
            <Switch
              value={mockMode}
              onValueChange={handleMockModeToggle}
              trackColor={{ true: ColorTokens.accent.mauve }}
              thumbColor="#FFFFFF"
            />
          </SettingRow>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="link"
                size={22}
                color={ColorTokens.accent.mauve}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Docker API URL</Text>
              </View>
            </View>
          </View>
          
          {editingUrl ? (
            <View style={styles.urlEditContainer}>
              <TextInput
                style={styles.urlInput}
                value={urlInput}
                onChangeText={setUrlInput}
                placeholder="http://localhost:2375"
                placeholderTextColor={ColorTokens.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <View style={styles.urlActions}>
                <ActionButton
                  title="Cancel"
                  variant="ghost"
                  size="small"
                  onPress={() => {
                    setEditingUrl(false);
                    setUrlInput(dockerUrl);
                  }}
                />
                <ActionButton
                  title="Save"
                  variant="primary"
                  size="small"
                  onPress={handleSaveUrl}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.urlDisplay}
              onPress={() => setEditingUrl(true)}
            >
              <Text style={styles.urlText}>{dockerUrl}</Text>
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={ColorTokens.text.muted}
              />
            </TouchableOpacity>
          )}
        </SettingSection>

        {/* VM Settings */}
        <SettingSection title="VM Configuration">
          <View style={styles.sliderRow}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>RAM</Text>
              <Text style={styles.sliderValue}>{vmRam} MB</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={VM_CONFIG.MIN_RAM_MB}
              maximumValue={VM_CONFIG.MAX_RAM_MB}
              step={256}
              value={vmRam}
              onSlidingComplete={handleRamChange}
              minimumTrackTintColor={ColorTokens.accent.mauve}
              maximumTrackTintColor={ColorTokens.bg.soft}
              thumbTintColor={ColorTokens.accent.mauve}
            />
          </View>

          <View style={styles.sliderRow}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>CPU Cores</Text>
              <Text style={styles.sliderValue}>{vmCpu}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={VM_CONFIG.MIN_CPU_CORES}
              maximumValue={VM_CONFIG.MAX_CPU_CORES}
              step={1}
              value={vmCpu}
              onSlidingComplete={handleCpuChange}
              minimumTrackTintColor={ColorTokens.accent.mauve}
              maximumTrackTintColor={ColorTokens.bg.soft}
              thumbTintColor={ColorTokens.accent.mauve}
            />
          </View>

          <TouchableOpacity
            style={styles.vmControlButton}
            onPress={() => navigation.navigate(ROUTES.QEMU_CONTROL)}
          >
            <MaterialCommunityIcons
              name="server"
              size={22}
              color={ColorTokens.accent.mauve}
            />
            <Text style={styles.vmControlText}>Open VM Control Panel</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={ColorTokens.text.muted}
            />
          </TouchableOpacity>
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingRow
            icon="theme-light-dark"
            label="Dark Mode"
            description="Switch between light and dark themes"
          >
            <Switch
              value={themeMode === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ true: ColorTokens.accent.mauve }}
              thumbColor="#FFFFFF"
            />
          </SettingRow>
        </SettingSection>

        {/* Data */}
        <SettingSection title="Data & Storage">
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <MaterialCommunityIcons
              name="cached"
              size={22}
              color={ColorTokens.text.secondary}
            />
            <Text style={styles.actionText}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleResetSettings}>
            <MaterialCommunityIcons
              name="restore"
              size={22}
              color={ColorTokens.state.error}
            />
            <Text style={[styles.actionText, { color: ColorTokens.state.error }]}>
              Reset All Settings
            </Text>
          </TouchableOpacity>
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2024.01</Text>
          </View>
        </SettingSection>
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
  statusCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    marginBottom: SpaceTokens.lg,
    ...ShadowTokens.soft,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: SpaceTokens.md,
  },
  statusTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
  },
  statusSubtitle: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
  },
  section: {
    marginBottom: SpaceTokens.lg,
  },
  sectionTitle: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.muted,
    textTransform: 'uppercase',
    marginBottom: SpaceTokens.sm,
    paddingHorizontal: SpaceTokens.sm,
  },
  sectionContent: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    ...ShadowTokens.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SpaceTokens.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: SpaceTokens.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
  },
  settingDescription: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginTop: 2,
  },
  settingControl: {
    marginLeft: SpaceTokens.md,
  },
  urlEditContainer: {
    padding: SpaceTokens.md,
    paddingTop: 0,
  },
  urlInput: {
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.sm,
    padding: SpaceTokens.md,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.sm,
  },
  urlActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SpaceTokens.sm,
  },
  urlDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SpaceTokens.md,
    paddingTop: 0,
  },
  urlText: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
    fontFamily: 'monospace',
    flex: 1,
  },
  sliderRow: {
    padding: SpaceTokens.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SpaceTokens.sm,
  },
  sliderLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
  },
  sliderValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.accent.mauve,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  vmControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpaceTokens.md,
  },
  vmControlText: {
    flex: 1,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginLeft: SpaceTokens.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpaceTokens.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  actionText: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginLeft: SpaceTokens.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SpaceTokens.md,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  aboutLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  aboutValue: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
  },
});

export default SettingsScreen;
