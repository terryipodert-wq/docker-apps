/**
 * PullImageScreen
 * Search and pull Docker images
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
import { ActionButton, LoadingSpinner } from '../components';
import { COMMON_IMAGES } from '../utils/constants';

const ImageSuggestion = ({ image, onPress }) => (
  <TouchableOpacity style={styles.suggestionCard} onPress={onPress}>
    <MaterialCommunityIcons
      name="layers"
      size={24}
      color={ColorTokens.accent.olive}
    />
    <View style={styles.suggestionInfo}>
      <Text style={styles.suggestionName}>{image.name}:{image.tag}</Text>
      <Text style={styles.suggestionDesc}>{image.description}</Text>
    </View>
    <MaterialCommunityIcons
      name="download"
      size={20}
      color={ColorTokens.accent.mauve}
    />
  </TouchableOpacity>
);

const PullImageScreen = () => {
  const navigation = useNavigation();
  const { pullImage, isPulling, pullProgress } = useDockerStore();

  const [imageName, setImageName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handlePull = async (name) => {
    const imageToFull = name || imageName;
    
    if (!imageToFull.trim()) {
      Alert.alert('Error', 'Please enter an image name');
      return;
    }

    try {
      await pullImage(imageToFull.trim());
      Alert.alert(
        'Success',
        `Image "${imageToFull}" pulled successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderProgress = () => {
    if (!pullProgress) return null;

    const { status, progress } = pullProgress;
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressStatus}>{status}</Text>
        {progress !== undefined && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        )}
        <Text style={styles.progressPercent}>
          {progress !== undefined ? `${progress}%` : 'Processing...'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={ColorTokens.text.muted}
          />
          <TextInput
            style={styles.searchInput}
            value={imageName}
            onChangeText={setImageName}
            placeholder="Enter image name (e.g., nginx:alpine)"
            placeholderTextColor={ColorTokens.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isPulling}
          />
          {imageName.length > 0 && (
            <TouchableOpacity onPress={() => setImageName('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={ColorTokens.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <ActionButton
          title="Pull"
          variant="primary"
          onPress={() => handlePull()}
          loading={isPulling}
          disabled={!imageName.trim() || isPulling}
          style={styles.pullButton}
        />
      </View>

      {/* Pull Progress */}
      {isPulling && renderProgress()}

      {/* Common Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Images</Text>
        <FlatList
          data={COMMON_IMAGES}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={({ item }) => (
            <ImageSuggestion
              image={item}
              onPress={() => handlePull(`${item.name}:${item.tag}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Loading Overlay */}
      {isPulling && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <LoadingSpinner size="large" message="Pulling image..." />
            {pullProgress && (
              <Text style={styles.loadingStatus}>
                {pullProgress.status}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SpaceTokens.md,
    gap: SpaceTokens.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.sm,
    paddingHorizontal: SpaceTokens.md,
    borderWidth: 1,
    borderColor: ColorTokens.bg.soft,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginLeft: SpaceTokens.sm,
  },
  pullButton: {
    paddingHorizontal: SpaceTokens.lg,
  },
  progressContainer: {
    padding: SpaceTokens.md,
    backgroundColor: ColorTokens.bg.surface,
    marginHorizontal: SpaceTokens.md,
    borderRadius: RadiusTokens.md,
    marginBottom: SpaceTokens.md,
  },
  progressStatus: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginBottom: SpaceTokens.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: ColorTokens.bg.soft,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SpaceTokens.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ColorTokens.accent.mauve,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.accent.mauve,
    textAlign: 'right',
  },
  section: {
    flex: 1,
    paddingHorizontal: SpaceTokens.md,
  },
  sectionTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginBottom: SpaceTokens.md,
  },
  listContent: {
    paddingBottom: SpaceTokens.xl,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: SpaceTokens.md,
    marginBottom: SpaceTokens.sm,
    ...ShadowTokens.soft,
  },
  suggestionInfo: {
    flex: 1,
    marginHorizontal: SpaceTokens.md,
  },
  suggestionName: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
  },
  suggestionDesc: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginTop: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.lg,
    padding: SpaceTokens.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingStatus: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginTop: SpaceTokens.md,
    textAlign: 'center',
  },
});

export default PullImageScreen;
