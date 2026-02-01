/**
 * ContainerCard Component
 * Displays container information in a card layout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
  MotionTokens,
} from '../theme';
import { parseContainerName, truncateId, formatRelativeTime } from '../utils/helpers';

const ContainerCard = ({
  container,
  onPress,
  onStart,
  onStop,
  onRestart,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const name = parseContainerName(container.Names);
  const shortId = truncateId(container.Id);
  const isRunning = container.State === 'running';
  const createdTime = formatRelativeTime(container.Created);
  
  // Get first exposed port
  const exposedPort = container.Ports?.find(p => p.PublicPort);

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
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="docker"
            size={24}
            color={isRunning ? ColorTokens.state.success : ColorTokens.text.muted}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.id}>{shortId}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => handleActionPress(onToggleFavorite, e)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'star' : 'star-outline'}
            size={22}
            color={isFavorite ? ColorTokens.state.warning : ColorTokens.text.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="image"
            size={16}
            color={ColorTokens.text.secondary}
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {container.Image}
          </Text>
        </View>
        
        {exposedPort && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="lan-connect"
              size={16}
              color={ColorTokens.text.secondary}
            />
            <Text style={styles.infoText}>
              {exposedPort.PublicPort}:{exposedPort.PrivatePort}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={ColorTokens.text.secondary}
          />
          <Text style={styles.infoText}>{createdTime}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={container.State} size="small" />
        
        <View style={styles.actions}>
          {isRunning ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.restartButton]}
                onPress={(e) => handleActionPress(onRestart, e)}
              >
                <MaterialCommunityIcons
                  name="restart"
                  size={18}
                  color={ColorTokens.accent.mauve}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.stopButton]}
                onPress={(e) => handleActionPress(onStop, e)}
              >
                <MaterialCommunityIcons
                  name="stop"
                  size={18}
                  color={ColorTokens.state.error}
                />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={(e) => handleActionPress(onStart, e)}
            >
              <MaterialCommunityIcons
                name="play"
                size={18}
                color={ColorTokens.state.success}
              />
            </TouchableOpacity>
          )}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SpaceTokens.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: SpaceTokens.sm,
    flex: 1,
  },
  name: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
  },
  id: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginTop: 2,
  },
  info: {
    marginBottom: SpaceTokens.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SpaceTokens.xs,
  },
  infoText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginLeft: SpaceTokens.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SpaceTokens.sm,
    borderTopWidth: 1,
    borderTopColor: ColorTokens.bg.soft,
  },
  actions: {
    flexDirection: 'row',
    gap: SpaceTokens.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RadiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: `${ColorTokens.state.success}15`,
  },
  stopButton: {
    backgroundColor: `${ColorTokens.state.error}15`,
  },
  restartButton: {
    backgroundColor: `${ColorTokens.accent.mauve}15`,
  },
});

export default ContainerCard;
