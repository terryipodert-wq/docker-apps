/**
 * ImageCard Component
 * Displays Docker image information in a card layout
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
  MotionTokens,
} from '../theme';
import { parseImageName, truncateId, formatBytes, formatRelativeTime } from '../utils/helpers';

const ImageCard = ({
  image,
  onPress,
  onDelete,
  onCreateContainer,
}) => {
  const { name, tag } = parseImageName(image.RepoTags);
  const shortId = truncateId(image.Id.replace('sha256:', ''));
  const size = formatBytes(image.Size);
  const createdTime = formatRelativeTime(image.Created);
  const containerCount = image.Containers || 0;

  const handleActionPress = (action, event) => {
    event.stopPropagation();
    action();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="layers"
            size={28}
            color={ColorTokens.accent.olive}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.tagRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
            <Text style={styles.id}>{shortId}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="database"
            size={16}
            color={ColorTokens.text.secondary}
          />
          <Text style={styles.statText}>{size}</Text>
        </View>
        
        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={ColorTokens.text.secondary}
          />
          <Text style={styles.statText}>{createdTime}</Text>
        </View>
        
        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="docker"
            size={16}
            color={ColorTokens.text.secondary}
          />
          <Text style={styles.statText}>
            {containerCount} container{containerCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={(e) => handleActionPress(onCreateContainer, e)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={ColorTokens.state.success}
          />
          <Text style={[styles.actionText, { color: ColorTokens.state.success }]}>
            Create
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => handleActionPress(onDelete, e)}
          disabled={containerCount > 0}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={16}
            color={containerCount > 0 ? ColorTokens.text.muted : ColorTokens.state.error}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: containerCount > 0
                  ? ColorTokens.text.muted
                  : ColorTokens.state.error,
              },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    marginBottom: SpaceTokens.md,
    ...ShadowTokens.soft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: MotionTokens.transform.scaleSoft }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SpaceTokens.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RadiusTokens.sm,
    backgroundColor: `${ColorTokens.accent.olive}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginLeft: SpaceTokens.md,
    flex: 1,
  },
  name: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: ColorTokens.accent.olive,
    paddingHorizontal: SpaceTokens.sm,
    paddingVertical: 2,
    borderRadius: RadiusTokens.pill,
    marginRight: SpaceTokens.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: FontTokens.weight.medium,
    color: '#FFFFFF',
  },
  id: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SpaceTokens.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: ColorTokens.bg.soft,
    marginBottom: SpaceTokens.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SpaceTokens.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SpaceTokens.md,
    paddingVertical: SpaceTokens.sm,
    borderRadius: RadiusTokens.sm,
  },
  createButton: {
    backgroundColor: `${ColorTokens.state.success}15`,
  },
  deleteButton: {
    backgroundColor: `${ColorTokens.state.error}10`,
  },
  actionText: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.medium,
    marginLeft: 4,
  },
});

export default ImageCard;
