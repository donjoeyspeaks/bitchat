# BitChat React Native

> **Cross-platform decentralized P2P messaging with Bitcoin SV integration and AI agents**

BitChat is now available as a React Native app for both iOS and Android, featuring Bluetooth Low Energy mesh networking, Bitcoin SV wallet functionality, and local AI assistants.

## 🚀 Features

### Core Messaging
- **Decentralized Mesh Network**: Bluetooth LE mesh networking with multi-hop relay
- **End-to-End Encryption**: X25519 key exchange + AES-256-GCM encryption
- **Store & Forward**: Message caching for offline peers
- **Channel System**: Password-protected channels with retention controls
- **IRC-Style Commands**: Familiar `/join`, `/msg`, `/who` interface
- **Cover Traffic**: Privacy-preserving dummy messages

### Bitcoin SV Integration
- **Native BSV Wallet**: HD wallet with mnemonic seed support
- **Send/Receive BSV**: Peer-to-peer payments within the app
- **sCrypt Smart Contracts**: On-chain message verification and channel tokens
- **Low-Fee Transactions**: Optimized for BSV's scalable infrastructure
- **Payment Requests**: QR codes and URI-based payment requests

### AI Assistant
- **Local AI Models**: Gemma-2B, Phi-2, TinyLlama running on-device
- **Chat Assistance**: Auto-suggestions, spam detection, content analysis
- **Voice Support**: Speech-to-text and text-to-speech capabilities
- **Privacy-First**: All AI processing happens locally, no cloud dependency
- **Battery Optimized**: Quantized models for efficient mobile inference

### Network Transports
- **Bluetooth Low Energy**: Primary mesh transport with dual-role operation
- **WiFi Direct**: Secondary high-bandwidth transport (Android/iOS)
- **BSV Relay**: Long-range messaging via blockchain when other transports unavailable

## 📱 Platform Support

- **iOS**: 13.0+ (iPhone 6s and newer)
- **Android**: API 21+ (Android 5.0+) with BLE support
- **Cross-Platform**: Single codebase for both platforms

## 🛠 Tech Stack

- **Frontend**: React Native with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Framework**: React Native Paper (Material Design)
- **Navigation**: React Navigation 6
- **Bluetooth**: react-native-ble-plx for cross-platform BLE
- **Cryptography**: noble-curves for Ed25519/X25519, Web Crypto API for AES
- **BSV Integration**: BSV.js library with sCrypt smart contracts
- **AI Models**: TensorFlow.js or ONNX Runtime for mobile inference
- **Storage**: React Native Keychain for sensitive data

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens and navigation
├── services/           # Core services
│   ├── BluetoothMeshService.ts    # BLE mesh networking
│   ├── BSVWalletService.ts        # Bitcoin SV wallet
│   ├── AIAgentService.ts          # Local AI assistant
│   ├── CryptographyService.ts     # Encryption & signatures
│   └── NotificationService.ts     # Push notifications
├── protocols/          # Binary protocols
│   └── BinaryProtocol.ts          # Message encoding/decoding
├── stores/            # Redux state management
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── contracts/         # sCrypt smart contracts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- React Native development environment
- iOS: Xcode 12+ and iOS Simulator
- Android: Android Studio and SDK 21+

### Installation

1. **Clone and setup:**
   ```bash
   git clone https://github.com/permissionlesstech/bitchat.git
   cd bitchat
   npm install
   ```

2. **iOS setup:**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

3. **Android setup:**
   ```bash
   npm run android
   ```

### Development

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 📋 Commands Reference

### Chat Commands
- `/j #channel` - Join or create a channel
- `/m @user message` - Send private message
- `/w` - List online users
- `/channels` - Show discovered channels
- `/block @user` - Block a peer
- `/unblock @user` - Unblock a peer

### BSV Commands
- `/sendbsv @user amount` - Send BSV to user
- `/sendbsv address amount` - Send BSV to address
- `/wallet balance` - Show wallet balance
- `/wallet history` - Show transaction history
- `/wallet address` - Show receiving address
- `/wallet backup` - Export mnemonic seed

### AI Commands
- `/ai analyze message` - Analyze message content
- `/ai translate message` - Translate message
- `/ai summarize` - Summarize recent conversation
- `/ai spam check` - Check for spam content

## 🔧 Configuration

### Battery Optimization
- **Aggressive**: Minimal scanning, 4 max connections
- **Balanced**: Standard operation, 8 max connections
- **Performance**: Frequent scanning, 12 max connections
- **Maximum**: Continuous scanning, 16 max connections

### AI Models
- **Gemma-2B-IT-Q4**: 150MB, best quality (default)
- **Phi-2-Q4**: 100MB, fast inference
- **TinyLlama-Q4**: 50MB, minimal resource usage

### BSV Networks
- **Testnet**: For development and testing
- **Mainnet**: For production use

## 🔐 Security Features

### Multi-Tiered Encryption
1. **Transport Layer**: BLE/WiFi encryption
2. **Protocol Layer**: Message padding and obfuscation
3. **Application Layer**: End-to-end encryption (X25519 + AES-256-GCM)
4. **BSV Layer**: Bitcoin transaction security

### Privacy Protection
- **Ephemeral Identifiers**: No persistent tracking
- **Cover Traffic**: Dummy messages to hide communication patterns
- **Local AI**: No data sent to cloud services
- **Key Rotation**: Regular key updates for forward secrecy

### Secure Storage
- **Keychain**: Private keys and sensitive data
- **Local Storage**: Non-sensitive app data only
- **Memory Protection**: Secure key handling and cleanup

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests (Detox)
npm run test:e2e:ios
npm run test:e2e:android

# Performance tests
npm run test:performance
```

## 📦 Building for Production

### iOS
```bash
npm run build:ios:release
```

### Android
```bash
npm run build:android:release
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is released into the **public domain**. See [LICENSE](LICENSE) for details.

## 🛣 Roadmap

### v1.1
- [ ] Full React Native UI implementation
- [ ] Real BLE mesh networking
- [ ] BSV mainnet integration
- [ ] AI model integration

### v1.2
- [ ] Voice messaging with AI transcription
- [ ] Advanced sCrypt contracts
- [ ] Multi-language support
- [ ] Accessibility improvements

### v1.3
- [ ] File sharing over mesh
- [ ] Group video calls (WiFi Direct)
- [ ] Advanced AI features
- [ ] Desktop companion app

## 🐛 Known Issues

- Mock implementations need replacement with real libraries
- BLE permissions handling needs platform-specific implementation
- AI model loading optimization required
- Battery usage needs real-world testing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/permissionlesstech/bitchat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/permissionlesstech/bitchat/discussions)
- **Email**: support@bitchat.app

---

**BitChat** - Decentralized messaging for the sovereignty-minded individual.
