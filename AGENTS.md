# Docker Android - Agent Instructions

## Project Overview

React Native (Expo) application that runs Docker containers on Android via QEMU VM.

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build Android APK (preview)
eas build --platform android --profile preview

# Build production
eas build --platform android --profile production
```

## Architecture

- **React Native Layer**: UI, navigation, state management
- **Native Module**: QemuModule.java, QemuService.java, JNI wrapper
- **QEMU VM**: Alpine Linux with Docker Engine

## Key Files

- `App.js` - Main entry point
- `src/services/DockerAPI.js` - Docker REST API client
- `src/services/QemuService.js` - QEMU native bridge
- `src/store/*.js` - Zustand state stores
- `android/app/src/main/java/com/dockerandroid/qemu/` - Native module

## Design Tokens

Using Clean Watercolor theme:
- Canvas: #F6F4F1
- Mauve: #7A6EAA  
- Olive: #8A8C68
- Terracotta: #C47A5A
- Mint: #A7C4B8

## Testing

Mock Mode enabled by default for development.
Toggle in Settings to test with real Docker API.

## Notes

- QEMU binary needed in jniLibs/arm64-v8a/
- Large heap enabled for QEMU memory
- Foreground service for background VM
