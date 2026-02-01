/**
 * VolumesScreen
 * List and manage Docker volumes
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { LoadingSpinner, EmptyState, ActionButton } from '../components';
import { formatBytes, formatRelativeTime } from '../utils/helpers';

const VolumeCard = ({ volume, onDelete }) => {
  const size = volume.UsageData?.Size || 0;
  const refCount = volume.UsageData?.RefCount || 0;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name="database"
          size={24}
          color={ColorTokens.accent.olive}
        />
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {volume.Name}
          </Text>
          <Text style={styles.cardSubtitle}>
            {volume.Driver} driver
          </Text>
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Size</Text>
          <Text style={styles.infoValue}>{formatBytes(size)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>In Use</Text>
          <Text style={styles.infoValue}>
            {refCount > 0 ? `${refCount} container${refCount > 1 ? 's' : ''}` : 'No'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.mountPath} numberOfLines={1}>
          {volume.Mountpoint}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(volume)}
          disabled={refCount > 0}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color={refCount > 0 ? ColorTokens.text.muted : ColorTokens.state.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VolumesScreen = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVolumeName, setNewVolumeName] = useState('');
  
  const {
    volumes,
    isLoading,
    isRefreshing,
    fetchVolumes,
    createVolume,
    removeVolume,
  } = useDockerStore();

  useEffect(() => {
    fetchVolumes();
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchVolumes();
  }, []);

  const handleCreate = async () => {
    if (!newVolumeName.trim()) {
      Alert.alert('Error', 'Please enter a volume name');
      return;
    }
    
    try {
      await createVolume(newVolumeName.trim());
      setShowCreateModal(false);
      setNewVolumeName('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (volume) => {
    const refCount = volume.UsageData?.RefCount || 0;
    
    if (refCount > 0) {
      Alert.alert(
        'Cannot Delete',
        'This volume is being used by containers. Remove the containers first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Delete Volume',
      `Are you sure you want to delete "${volume.Name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeVolume(volume.Name);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderVolume = ({ item }) => (
    <VolumeCard volume={item} onDelete={handleDelete} />
  );

  if (isLoading && volumes.length === 0) {
    return <LoadingSpinner fullScreen message="Loading volumes..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {volumes.length} volume{volumes.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={ColorTokens.accent.mauve}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={volumes}
        keyExtractor={(item) => item.Name}
        renderItem={renderVolume}
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
            icon="database"
            title="No volumes"
            message="Create a volume to persist container data"
            actionLabel="Create Volume"
            onAction={() => setShowCreateModal(true)}
          />
        }
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Volume</Text>
            
            <TextInput
              style={styles.input}
              value={newVolumeName}
              onChangeText={setNewVolumeName}
              placeholder="Volume name"
              placeholderTextColor={ColorTokens.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalActions}>
              <ActionButton
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalButton}
              />
              <ActionButton
                title="Create"
                variant="primary"
                onPress={handleCreate}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.secondary,
  },
  createButton: {
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
  card: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    marginBottom: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SpaceTokens.md,
  },
  cardTitleContainer: {
    marginLeft: SpaceTokens.md,
    flex: 1,
  },
  cardTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
  },
  cardSubtitle: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: SpaceTokens.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
  },
  infoValue: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SpaceTokens.sm,
    borderTopWidth: 1,
    borderTopColor: ColorTokens.bg.soft,
  },
  mountPath: {
    flex: 1,
    fontSize: FontTokens.size.caption,
    fontFamily: 'monospace',
    color: ColorTokens.text.secondary,
  },
  deleteButton: {
    padding: SpaceTokens.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SpaceTokens.lg,
  },
  modalContent: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.lg,
    padding: SpaceTokens.lg,
  },
  modalTitle: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.lg,
  },
  input: {
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.sm,
    padding: SpaceTokens.md,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SpaceTokens.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default VolumesScreen;
