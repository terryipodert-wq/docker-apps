/**
 * ContainersScreen
 * List all Docker containers with actions
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  ContainerCard,
  LoadingSpinner,
  EmptyState,
  ActionButton,
} from '../components';
import { ROUTES } from '../utils/constants';

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ContainersScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  
  const {
    containers,
    isLoading,
    isRefreshing,
    error,
    fetchContainers,
    refreshContainers,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
  } = useDockerStore();

  const { isFavorite, toggleFavorite } = useSettingsStore();

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshContainers();
  }, []);

  const filteredContainers = containers.filter(c => {
    if (filter === 'running') return c.State === 'running';
    if (filter === 'stopped') return c.State !== 'running';
    return true;
  });

  const handleStart = async (container) => {
    try {
      await startContainer(container.Id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleStop = async (container) => {
    try {
      await stopContainer(container.Id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRestart = async (container) => {
    try {
      await restartContainer(container.Id);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRemove = (container) => {
    Alert.alert(
      'Remove Container',
      `Are you sure you want to remove "${container.Names[0].replace('/', '')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeContainer(container.Id, true);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderContainer = ({ item }) => (
    <ContainerCard
      container={item}
      onPress={() => navigation.navigate(ROUTES.CONTAINER_DETAIL, { 
        containerId: item.Id,
        containerName: item.Names[0].replace('/', ''),
      })}
      onStart={() => handleStart(item)}
      onStop={() => handleStop(item)}
      onRestart={() => handleRestart(item)}
      isFavorite={isFavorite(item.Id)}
      onToggleFavorite={() => toggleFavorite(item.Id)}
    />
  );

  const runningCount = containers.filter(c => c.State === 'running').length;
  const stoppedCount = containers.length - runningCount;

  if (isLoading && containers.length === 0) {
    return <LoadingSpinner fullScreen message="Loading containers..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.filters}>
          <FilterChip
            label={`All (${containers.length})`}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label={`Running (${runningCount})`}
            active={filter === 'running'}
            onPress={() => setFilter('running')}
          />
          <FilterChip
            label={`Stopped (${stoppedCount})`}
            active={filter === 'stopped'}
            onPress={() => setFilter('stopped')}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate(ROUTES.CREATE_CONTAINER)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={ColorTokens.accent.mauve}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredContainers}
        keyExtractor={(item) => item.Id}
        renderItem={renderContainer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={ColorTokens.accent.mauve}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="docker"
            title="No containers"
            message={
              filter === 'all'
                ? 'Create your first container to get started'
                : `No ${filter} containers found`
            }
            actionLabel={filter === 'all' ? 'Create Container' : undefined}
            onAction={
              filter === 'all'
                ? () => navigation.navigate(ROUTES.CREATE_CONTAINER)
                : undefined
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SpaceTokens.md,
    paddingBottom: SpaceTokens.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: SpaceTokens.sm,
  },
  filterChip: {
    paddingHorizontal: SpaceTokens.md,
    paddingVertical: SpaceTokens.sm,
    borderRadius: RadiusTokens.pill,
    backgroundColor: ColorTokens.bg.surface,
  },
  filterChipActive: {
    backgroundColor: ColorTokens.accent.mauve,
  },
  filterChipText: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.secondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: RadiusTokens.sm,
    backgroundColor: `${ColorTokens.accent.mauve}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SpaceTokens.md,
    paddingTop: 0,
    flexGrow: 1,
  },
});

export default ContainersScreen;
