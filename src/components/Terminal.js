/**
 * Terminal Component
 * Terminal emulator using WebView with xterm.js
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorTokens, SpaceTokens, RadiusTokens, FontTokens } from '../theme';

const terminalHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1E1E1E;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #D4D4D4;
      padding: 8px;
      height: 100vh;
      overflow-y: auto;
    }
    #terminal {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .line {
      padding: 2px 0;
      line-height: 1.4;
    }
    .prompt {
      color: #7A6EAA;
    }
    .command {
      color: #FFFFFF;
    }
    .output {
      color: #D4D4D4;
    }
    .error {
      color: #D17C7C;
    }
    .success {
      color: #7FAF9B;
    }
    .cursor {
      display: inline-block;
      width: 8px;
      height: 14px;
      background: #7A6EAA;
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="terminal"></div>
  <script>
    const terminal = document.getElementById('terminal');
    let history = [];
    let historyIndex = -1;
    
    function addLine(text, type = 'output') {
      const line = document.createElement('div');
      line.className = 'line ' + type;
      line.textContent = text;
      terminal.appendChild(line);
      window.scrollTo(0, document.body.scrollHeight);
    }
    
    function showPrompt() {
      addLine('root@alpine:~# ', 'prompt');
    }
    
    // Initial message
    addLine('Alpine Linux VM Terminal', 'success');
    addLine('Connected to Docker host', 'output');
    addLine('', 'output');
    showPrompt();
    
    // Listen for commands from React Native
    window.executeCommand = function(cmd) {
      addLine(cmd, 'command');
      history.push(cmd);
      historyIndex = history.length;
      
      // Send to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'command',
        data: cmd
      }));
    };
    
    // Receive output from React Native
    window.addOutput = function(text, isError) {
      addLine(text, isError ? 'error' : 'output');
      showPrompt();
    };
  </script>
</body>
</html>
`;

const Terminal = ({
  onCommand,
  initialOutput,
  height = 300,
}) => {
  const webViewRef = useRef(null);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'command' && onCommand) {
        onCommand(message.data);
      }
    } catch (error) {
      console.error('Terminal message error:', error);
    }
  };

  const sendCommand = () => {
    if (!input.trim()) return;
    
    webViewRef.current?.injectJavaScript(`
      window.executeCommand(${JSON.stringify(input)});
      true;
    `);
    setInput('');
  };

  const addOutput = (text, isError = false) => {
    webViewRef.current?.injectJavaScript(`
      window.addOutput(${JSON.stringify(text)}, ${isError});
      true;
    `);
  };

  const clearTerminal = () => {
    webViewRef.current?.injectJavaScript(`
      document.getElementById('terminal').innerHTML = '';
      window.addOutput('Terminal cleared', false);
      true;
    `);
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="console"
            size={18}
            color={ColorTokens.accent.mauve}
          />
          <Text style={styles.title}>Terminal</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearTerminal}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color={ColorTokens.text.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: terminalHTML }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          onLoad={() => setIsConnected(true)}
          onError={() => setIsConnected(false)}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputPrompt}>$</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendCommand}
          placeholder="Enter command..."
          placeholderTextColor={ColorTokens.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendCommand}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={ColorTokens.accent.mauve}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: RadiusTokens.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SpaceTokens.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.bg.surface,
    marginLeft: SpaceTokens.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SpaceTokens.sm,
  },
  headerButton: {
    padding: SpaceTokens.xs,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: SpaceTokens.sm,
  },
  inputPrompt: {
    fontSize: FontTokens.size.body,
    fontFamily: 'monospace',
    color: ColorTokens.accent.mauve,
    marginRight: SpaceTokens.sm,
  },
  input: {
    flex: 1,
    fontSize: FontTokens.size.body,
    fontFamily: 'monospace',
    color: ColorTokens.bg.surface,
    padding: SpaceTokens.sm,
    backgroundColor: '#2D2D2D',
    borderRadius: RadiusTokens.sm,
  },
  sendButton: {
    padding: SpaceTokens.sm,
    marginLeft: SpaceTokens.sm,
  },
});

export default Terminal;
