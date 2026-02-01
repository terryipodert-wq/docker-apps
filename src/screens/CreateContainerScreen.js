/**
 * CreateContainerScreen
 * Form to create a new Docker container
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ColorTokens,
  SpaceTokens,
  RadiusTokens,
  FontTokens,
  ShadowTokens,
} from '../theme';
import { useDockerStore } from '../store/useDockerStore';
import { ActionButton } from '../components';
import { validateContainerName, validatePort, validateEnvVar } from '../utils/validators';
import { COMMON_IMAGES, COMMON_PORTS } from '../utils/constants';

const InputField = ({ label, value, onChangeText, placeholder, error, multiline, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        error && styles.inputError,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={ColorTokens.text.muted}
      multiline={multiline}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const QuickImageChip = ({ name, tag, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.quickChip, selected && styles.quickChipSelected]}
    onPress={onPress}
  >
    <Text style={[styles.quickChipText, selected && styles.quickChipTextSelected]}>
      {name}:{tag}
    </Text>
  </TouchableOpacity>
);

const CreateContainerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedImage: initialImage } = route.params || {};

  const { createContainer, startContainer, isLoading } = useDockerStore();

  const [containerName, setContainerName] = useState('');
  const [image, setImage] = useState(initialImage || '');
  const [hostPort, setHostPort] = useState('');
  const [containerPort, setContainerPort] = useState('');
  const [envVars, setEnvVars] = useState('');
  const [command, setCommand] = useState('');
  const [autoStart, setAutoStart] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (containerName) {
      const nameValidation = validateContainerName(containerName);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error;
      }
    }

    if (!image) {
      newErrors.image = 'Image is required';
    }

    if (hostPort) {
      const hostValidation = validatePort(hostPort);
      if (!hostValidation.valid) {
        newErrors.hostPort = hostValidation.error;
      }
    }

    if (containerPort) {
      const containerValidation = validatePort(containerPort);
      if (!containerValidation.valid) {
        newErrors.containerPort = containerValidation.error;
      }
    }

    if (envVars) {
      const envLines = envVars.split('\n').filter(l => l.trim());
      for (const line of envLines) {
        const envValidation = validateEnvVar(line);
        if (!envValidation.valid) {
          newErrors.envVars = envValidation.error;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const config = {
        Image: image,
        Tty: true,
        OpenStdin: true,
      };

      if (containerName) {
        config.name = containerName;
      }

      if (command) {
        config.Cmd = command.split(' ');
      }

      if (envVars) {
        config.Env = envVars.split('\n').filter(l => l.trim());
      }

      if (hostPort && containerPort) {
        config.ExposedPorts = {
          [`${containerPort}/tcp`]: {},
        };
        config.HostConfig = {
          PortBindings: {
            [`${containerPort}/tcp`]: [{ HostPort: hostPort }],
          },
        };
      }

      const result = await createContainer(config);

      if (autoStart && result.Id) {
        await startContainer(result.Id);
      }

      Alert.alert(
        'Success',
        `Container created${autoStart ? ' and started' : ''} successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectQuickImage = (img) => {
    setImage(`${img.name}:${img.tag}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Image</Text>
      <InputField
        label="Image name"
        value={image}
        onChangeText={setImage}
        placeholder="e.g., nginx:alpine"
        error={errors.image}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.quickLabel}>Quick select:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
      >
        {COMMON_IMAGES.slice(0, 6).map((img, i) => (
          <QuickImageChip
            key={i}
            name={img.name}
            tag={img.tag}
            selected={image === `${img.name}:${img.tag}`}
            onPress={() => selectQuickImage(img)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Container Settings</Text>
      <InputField
        label="Container name (optional)"
        value={containerName}
        onChangeText={setContainerName}
        placeholder="e.g., my-nginx"
        error={errors.name}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <InputField
        label="Command (optional)"
        value={command}
        onChangeText={setCommand}
        placeholder="e.g., npm start"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.sectionTitle}>Port Mapping</Text>
      <View style={styles.portRow}>
        <View style={styles.portInput}>
          <InputField
            label="Host port"
            value={hostPort}
            onChangeText={setHostPort}
            placeholder="8080"
            error={errors.hostPort}
            keyboardType="numeric"
          />
        </View>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={ColorTokens.text.muted}
          style={styles.portArrow}
        />
        <View style={styles.portInput}>
          <InputField
            label="Container port"
            value={containerPort}
            onChangeText={setContainerPort}
            placeholder="80"
            error={errors.containerPort}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Environment Variables</Text>
      <InputField
        label="One per line (KEY=value)"
        value={envVars}
        onChangeText={setEnvVars}
        placeholder="NODE_ENV=production"
        error={errors.envVars}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAutoStart(!autoStart)}
        >
          <MaterialCommunityIcons
            name={autoStart ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={autoStart ? ColorTokens.accent.mauve : ColorTokens.text.muted}
          />
          <Text style={styles.checkboxLabel}>Start container after creation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <ActionButton
          title="Cancel"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        />
        <ActionButton
          title="Create"
          variant="primary"
          onPress={handleCreate}
          loading={isSubmitting}
          style={styles.actionButton}
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
  sectionTitle: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    marginTop: SpaceTokens.lg,
    marginBottom: SpaceTokens.sm,
  },
  inputContainer: {
    marginBottom: SpaceTokens.md,
  },
  inputLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
    marginBottom: SpaceTokens.xs,
  },
  input: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.sm,
    padding: SpaceTokens.md,
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    borderWidth: 1,
    borderColor: ColorTokens.bg.soft,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: ColorTokens.state.error,
  },
  errorText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.state.error,
    marginTop: SpaceTokens.xs,
  },
  quickLabel: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.muted,
    marginBottom: SpaceTokens.sm,
  },
  quickScroll: {
    marginBottom: SpaceTokens.md,
  },
  quickChip: {
    paddingHorizontal: SpaceTokens.md,
    paddingVertical: SpaceTokens.sm,
    borderRadius: RadiusTokens.pill,
    backgroundColor: ColorTokens.bg.surface,
    marginRight: SpaceTokens.sm,
    borderWidth: 1,
    borderColor: ColorTokens.bg.soft,
  },
  quickChipSelected: {
    backgroundColor: ColorTokens.accent.mauve,
    borderColor: ColorTokens.accent.mauve,
  },
  quickChipText: {
    fontSize: FontTokens.size.caption,
    color: ColorTokens.text.secondary,
  },
  quickChipTextSelected: {
    color: '#FFFFFF',
  },
  portRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  portInput: {
    flex: 1,
  },
  portArrow: {
    marginHorizontal: SpaceTokens.sm,
    marginTop: 36,
  },
  checkboxRow: {
    marginTop: SpaceTokens.lg,
    marginBottom: SpaceTokens.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: FontTokens.size.body,
    color: ColorTokens.text.primary,
    marginLeft: SpaceTokens.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SpaceTokens.md,
    marginTop: SpaceTokens.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default CreateContainerScreen;
