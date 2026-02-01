/**
 * ImageDetailScreen
 * Detailed view of a Docker image
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { ActionButton, LoadingSpinner } from '../components';
import { ROUTES } from '../utils/constants';
import { parseImageName, truncateId, formatBytes, formatTimestamp } from '../utils/helpers';

const InfoRow = ({ label, value, mono = false }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, mono && styles.mono]} numberOfLines={2}>
      {value || 'N/A'}
    </Text>
  </View>
);

const ImageDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageId } = route.params;

  const {
    selectedImage,
    isImageLoading,
    fetchImage,
    removeImage,
    clearSelectedImage,
  } = useDockerStore();

  useEffect(() => {
    fetchImage(imageId);
    return () => clearSelectedImage();
  }, [imageId]);

  const handleDelete = () => {
    const imageName = selectedImage?.RepoTags?.[0] || 'Unknown';
    
    Alert.alert(
      'Delete Image',
      `Are you sure you want to delete "${imageName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeImage(imageId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleCreateContainer = () => {
    navigation.navigate(ROUTES.CREATE_CONTAINER, {
      selectedImage: selectedImage?.RepoTags?.[0] || imageId,
    });
  };

  if (isImageLoading && !selectedImage) {
    return <LoadingSpinner fullScreen message="Loading image..." />;
  }

  if (!selectedImage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Image not found</Text>
      </View>
    );
  }

  const { name, tag } = parseImageName(selectedImage.RepoTags);
  const shortId = truncateId(selectedImage.Id.replace('sha256:', ''));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.imageName}>{name}</Text>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </View>
      <Text style={styles.imageId}>{shortId}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <ActionButton
          icon="plus"
          title="Create Container"
          variant="success"
          onPress={handleCreateContainer}
          style={styles.actionButton}
        />
        <ActionButton
          icon="delete"
          title="Delete"
          variant="danger"
          onPress={handleDelete}
          style={styles.actionButton}
        />
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Image Information</Text>
        <InfoRow label="Size" value={formatBytes(selectedImage.Size)} />
        <InfoRow
          label="Created"
          value={formatTimestamp(selectedImage.Created)}
        />
        <InfoRow
          label="ID"
          value={selectedImage.Id?.replace('sha256:', '').substring(0, 32)}
          mono
        />
        <InfoRow
          label="Containers"
          value={`${selectedImage.Containers || 0} using this image`}
        />
      </View>

      {/* Tags */}
      {selectedImage.RepoTags?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tags</Text>
          {selectedImage.RepoTags.map((repoTag, index) => (
            <View key={index} style={styles.tagRow}>
              <Text style={styles.tagName}>{repoTag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Digests */}
      {selectedImage.RepoDigests?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Digests</Text>
          {selectedImage.RepoDigests.map((digest, index) => (
            <Text key={index} style={styles.digestText} numberOfLines={1}>
              {digest}
            </Text>
          ))}
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: SpaceTokens.xs,
  },
  imageName: {
    fontSize: FontTokens.size.h2,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginRight: SpaceTokens.sm,
  },
  tagBadge: {
    backgroundColor: ColorTokens.accent.olive,
    paddingHorizontal: SpaceTokens.sm,
    paddingVertical: 4,
    borderRadius: RadiusTokens.pill,
  },
  tagText: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.medium,
    color: '#FFFFFF',
  },
  imageId: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    fontFamily: 'monospace',
    marginBottom: SpaceTokens.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SpaceTokens.sm,
    marginBottom: SpaceTokens.lg,
  },
  actionButton: {
    flex: 1,
  },
  card: {
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
  },
  infoValue: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    fontWeight: FontTokens.weight.medium,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: FontTokens.size.caption,
  },
  tagRow: {
    paddingVertical: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.bg.soft,
  },
  tagName: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    fontFamily: 'monospace',
  },
  digestText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    fontFamily: 'monospace',
    paddingVertical: SpaceTokens.xs,
  },
});

export default ImageDetailScreen;
