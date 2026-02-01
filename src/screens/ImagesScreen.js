/**
 * ImagesScreen
 * List all Docker images
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ColorTokens, SpaceTokens, RadiusTokens } from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { ImageCard, LoadingSpinner, EmptyState } from '../components';
import { ROUTES } from '../utils/constants';

const ImagesScreen = () => {
  const navigation = useNavigation();
  
  const {
    images,
    isLoading,
    isRefreshing,
    fetchImages,
    refreshImages,
    removeImage,
  } = useDockerStore();

  useEffect(() => {
    fetchImages();
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshImages();
  }, []);

  const handleDelete = (image) => {
    const imageName = image.RepoTags?.[0] || 'Unknown';
    const hasContainers = (image.Containers || 0) > 0;
    
    if (hasContainers) {
      Alert.alert(
        'Cannot Delete',
        'This image is being used by containers. Remove the containers first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
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
              await removeImage(image.Id);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleCreateContainer = (image) => {
    navigation.navigate(ROUTES.CREATE_CONTAINER, {
      selectedImage: image.RepoTags?.[0] || image.Id,
    });
  };

  const renderImage = ({ item }) => (
    <ImageCard
      image={item}
      onPress={() => navigation.navigate(ROUTES.IMAGE_DETAIL, {
        imageId: item.Id,
      })}
      onDelete={() => handleDelete(item)}
      onCreateContainer={() => handleCreateContainer(item)}
    />
  );

  if (isLoading && images.length === 0) {
    return <LoadingSpinner fullScreen message="Loading images..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.pullButton}
          onPress={() => navigation.navigate(ROUTES.PULL_IMAGE)}
        >
          <MaterialCommunityIcons
            name="download"
            size={20}
            color={ColorTokens.accent.mauve}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={images}
        keyExtractor={(item) => item.Id}
        renderItem={renderImage}
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
            icon="layers"
            title="No images"
            message="Pull images from Docker Hub to get started"
            actionLabel="Pull Image"
            onAction={() => navigation.navigate(ROUTES.PULL_IMAGE)}
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
    justifyContent: 'flex-end',
    padding: SpaceTokens.md,
    paddingBottom: 0,
  },
  pullButton: {
    width: 40,
    height: 40,
    borderRadius: RadiusTokens.sm,
    backgroundColor: `${ColorTokens.accent.mauve}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SpaceTokens.md,
    flexGrow: 1,
  },
});

export default ImagesScreen;
