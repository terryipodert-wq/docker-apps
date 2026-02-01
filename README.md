# Docker Android 🐳

A React Native (Expo) application that runs Docker containers on Android devices using QEMU to host an Alpine Linux VM with Docker Engine.

## Features

- 🖥️ **QEMU-based VM**: Runs Alpine Linux VM with Docker Engine inside QEMU
- 🐳 **Full Docker API**: Complete Docker Engine management via REST API
- 📱 **Native Module**: Android native module for QEMU control via JNI
- 🎨 **Clean UI**: Watercolor-inspired design with calm, clean aesthetics
- 🌙 **Dark Mode**: Full dark mode support
- 🔄 **Mock Mode**: Development/testing without actual VM

## Architecture

```
┌─────────────────────────────────────┐
│  React Native (JavaScript)          │
│  ├── App.js                         │
│  ├── Screens (Home, Containers...)  │
│  └── Services (DockerAPI, QemuSvc)  │
└─────────────────────────────────────┘
              ↕ (Bridge)
┌─────────────────────────────────────┐
│  Native Module (Java/Kotlin)        │
│  ├── QemuModule.java                │
│  ├── QemuPackage.java               │
│  └── QemuService.java               │
└─────────────────────────────────────┘
              ↕ (JNI)
┌─────────────────────────────────────┐
│  QEMU C Wrapper (JNI)               │
│  └── qemu_jni.c                     │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│  QEMU Binary + Alpine Linux VM      │
│  └── Docker Engine (localhost:2375) │
└─────────────────────────────────────┘
```

## Tech Stack

- **React Native** with Expo SDK 51+
- **React Navigation v6** for routing
- **Zustand** for state management
- **Axios** for Docker API communication
- **react-native-webview** for container web apps
- **Android Native Module** (Java + JNI/C)

## Project Structure

```
docker-android/
├── App.js                        # Main entry point
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── src/
│   ├── components/               # Reusable UI components
│   ├── navigation/               # Navigation configuration
│   ├── screens/                  # App screens
│   ├── services/                 # API and services
│   ├── store/                    # Zustand stores
│   ├── theme/                    # Design tokens
│   └── utils/                    # Utilities and helpers
└── android/
    └── app/src/main/
        ├── java/.../qemu/        # QEMU native module
        ├── jni/                  # JNI wrapper code
        └── jniLibs/              # QEMU binary (arm64)
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Android Studio (for native development)
- Android NDK (for JNI compilation)

### Installation

```bash
# Clone and install dependencies
cd docker-android
npm install

# Start development
npx expo start

# Build APK with EAS
eas build --platform android --profile preview
```

### Development Mode

The app includes a **Mock Mode** that simulates Docker/QEMU responses for development and testing without an actual VM.

Toggle in Settings → Mock Mode

## Building for Android

### Debug APK (Development)
```bash
eas build --platform android --profile development
```

### Preview APK (Testing)
```bash
eas build --platform android --profile preview
```

### Production Bundle
```bash
eas build --platform android --profile production
```

## Native Module Development

### QEMU Integration

The QEMU native module provides:

1. **QemuModule.java** - React Native bridge
2. **QemuService.java** - Android foreground service
3. **QemuManager.java** - VM lifecycle management
4. **qemu_jni.c** - JNI wrapper for QEMU binary

### Building Native Code

```bash
cd android
./gradlew assembleDebug
```

### QEMU Binary

Place precompiled QEMU binary in:
```
android/app/src/main/jniLibs/arm64-v8a/libqemu-system-x86_64.so
```

Get from [Limbo Emulator](https://github.com/limboemu/limbo) or compile from source.

## API Reference

### Docker API Client

```javascript
import DockerAPI from './services/DockerAPI';

const docker = new DockerAPI('http://localhost:2375');

// List containers
const containers = await docker.listContainers();

// Start container
await docker.startContainer(containerId);

// Pull image
await docker.pullImage('nginx:alpine');
```

### QEMU Service

```javascript
import QemuService from './services/QemuService';

// Initialize
await QemuService.initialize();

// Start VM
await QemuService.startVM(2048, 2); // RAM MB, CPU cores

// Stop VM
await QemuService.stopVM();
```

## Design Tokens

Clean Watercolor theme with:

- **Colors**: Canvas (#F6F4F1), Mauve (#7A6EAA), Mint (#A7C4B8)
- **Typography**: System fonts with semantic sizing
- **Spacing**: 4/8/16/24/40px scale
- **Shadows**: Soft, subtle elevation
- **Motion**: Calm, 280ms standard duration

## Roadmap

- [ ] Automatic Alpine setup on first boot
- [ ] VNC support for GUI access
- [ ] Battery optimization for mobile
- [ ] Snapshot/save state functionality
- [ ] Docker Hub search integration
- [ ] Container import/export
- [ ] x86 emulation optimizations

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines.

---

Built with ❤️ for running Docker anywhere
