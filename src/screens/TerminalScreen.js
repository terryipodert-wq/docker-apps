/**
 * TerminalScreen
 * Terminal emulator for VM/container commands
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ColorTokens, SpaceTokens } from '../theme';
import { Terminal } from '../components';
import { useQemuStore } from '../store/useQemuStore';

const TerminalScreen = () => {
  const route = useRoute();
  const { containerId } = route.params || {};
  
  const { sendCommand, addLog } = useQemuStore();

  const handleCommand = async (command) => {
    try {
      if (containerId) {
        // Execute command in container
        addLog(`[Container ${containerId.substring(0, 12)}] ${command}`);
        // In real implementation, this would use docker exec
        await new Promise(resolve => setTimeout(resolve, 500));
        addLog('Command executed successfully');
      } else {
        // Execute command in VM
        await sendCommand(command);
      }
    } catch (error) {
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Terminal
        onCommand={handleCommand}
        height="100%"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
    padding: SpaceTokens.md,
  },
});

export default TerminalScreen;
