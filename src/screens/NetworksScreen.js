/**
 * NetworksScreen
 * List and manage Docker networks
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
import { truncateId } from '../utils/helpers';

const NetworkCard = ({ network, onDelete }) => {
  const containerCount = Object.keys(network.Containers || {}).length;
  const isSystemNetwork = ['bridge', 'host', 'none'].includes(network.Name);
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name="lan"
          size={24}
          color={ColorTokens.accent.mint}
        />
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {network.Name}
          </Text>
          <Text style={styles.cardSubtitle}>
            {network.Driver} • {truncateId(network.Id)}
          </Text>
        </View>
        {isSystemNetwork && (
          <View style={styles.systemBadge}>
            <Text style={styles.systemBadgeText}>System</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Scope</Text>
          <Text style={styles.infoValue}>{network.Scope}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Containers</Text>
          <Text style={styles.infoValue}>{containerCount}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Internal</Text>
          <Text style={styles.infoValue}>
            {network.Internal ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
      
      {network.IPAM?.Config?.[0] && (
        <View style={styles.ipamInfo}>
          <Text style={styles.ipamLabel}>Subnet:</Text>
          <Text style={styles.ipamValue}>
            {network.IPAM.Config[0].Subnet}
          </Text>
          {network.IPAM.Config[0].Gateway && (
            <>
              <Text style={styles.ipamLabel}>Gateway:</Text>
              <Text style={styles.ipamValue}>
                {network.IPAM.Config[0].Gateway}
              </Text>
            </>
          )}
        </View>
      )}
      
      {!isSystemNetwork && (
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(network)}
            disabled={containerCount > 0}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color={containerCount > 0 ? ColorTokens.text.muted : ColorTokens.state.error}
            />
            <Text
              style={[
                styles.deleteText,
                containerCount > 0 && styles.deleteTextDisabled,
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const NetworksScreen = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  
  const {
    networks,
    isLoading,
    isRefreshing,
    fetchNetworks,
    createNetwork,
    removeNetwork,
  } = useDockerStore();

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchNetworks();
  }, []);

  const handleCreate = async () => {
    if (!newNetworkName.trim()) {
      Alert.alert('Error', 'Please enter a network name');
      return;
    }
    
    try {
      await createNetwork(newNetworkName.trim());
      setShowCreateModal(false);
      setNewNetworkName('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (network) => {
    const containerCount = Object.keys(network.Containers || {}).length;
    
    if (containerCount > 0) {
      Alert.alert(
        'Cannot Delete',
        'This network has connected containers. Disconnect them first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Delete Network',
      `Are you sure you want to delete "${network.Name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeNetwork(network.Id);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderNetwork = ({ item }) => (
    <NetworkCard network={item} onDelete={handleDelete} />
  );

  if (isLoading && networks.length === 0) {
    return <LoadingSpinner fullScreen message="Loading networks..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {networks.length} network{networks.length !== 1 ? 's' : ''}
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
        data={networks}
        keyExtractor={(item) => item.Id}
        renderItem={renderNetwork}
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
            icon="lan"
            title="No networks"
            message="Create a network to connect containers"
            actionLabel="Create Network"
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
            <Text style={styles.modalTitle}>Create Network</Text>
            
            <TextInput
              style={styles.input}
              value={newNetworkName}
              onChangeText={setNewNetworkName}
              placeholder="Network name"
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
  systemBadge: {
    backgroundColor: ColorTokens.accent.olive,
    paddingHorizontal: SpaceTokens.sm,
    paddingVertical: 2,
    borderRadius: RadiusTokens.pill,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: FontTokens.weight.medium,
    color: '#FFFFFF',
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: SpaceTokens.sm,
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
  ipamInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: RadiusTokens.sm,
    padding: SpaceTokens.sm,
    marginBottom: SpaceTokens.sm,
    gap: SpaceTokens.xs,
  },
  ipamLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
  },
  ipamValue: {
    fontSize: FontTokens.size.caption,
    fontFamily: 'monospace',
    color: ColorTokens.text.primary,
    marginRight: SpaceTokens.md,
  },
  cardFooter: {
    paddingTop: SpaceTokens.sm,
    borderTopWidth: 1,
    borderTopColor: ColorTokens.bg.soft,
    alignItems: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SpaceTokens.sm,
  },
  deleteText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.state.error,
    marginLeft: 4,
  },
  deleteTextDisabled: {
    color: ColorTokens.text.muted,
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

export default NetworksScreen;
