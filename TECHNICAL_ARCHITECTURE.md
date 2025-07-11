# BitChat React Native - Technical Architecture

## Overview

BitChat React Native is a cross-platform decentralized peer-to-peer messaging application that combines Bluetooth Low Energy mesh networking, Bitcoin SV integration, and local AI agents. This document outlines the complete technical architecture for the React Native implementation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BitChat React Native                        │
├─────────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Native Components)                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Chat Screen │ Wallet View │ Settings UI │ Channel Browser │  │
│  │   Messages  │  BSV Balance│  AI Config  │   Discovery     │  │
│  │   Input Box │ Transactions│ Battery Mode│   Join/Create   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  State Management Layer (Redux + React Context)                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Chat Store  │ Wallet Store│  Peer Store │   AI Store      │  │
│  │  Messages   │ UTXOs/Txs   │ Connections │  Model Status   │  │
│  │  Channels   │ BSV Balance │ Discovery   │  Query Queue    │  │
│  │  Delivery   │ Addresses   │ RSSI Data   │  Response Cache │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer                                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Mesh        │ BSV Wallet  │    AI       │  Encryption     │  │
│  │ Networking  │ Service     │  Agent      │    Service      │  │
│  │ (BLE/WiFi)  │ (HD Wallet) │ (Local LLM) │ (E2E Crypto)    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Protocol Layer                                                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Binary      │ BSV         │ AI Query    │  Mesh Routing   │  │
│  │ Protocol    │ Transactions│ Protocol    │    Protocol     │  │
│  │ (Mesh Msgs) │ (On-chain)  │ (Local)     │ (Store&Forward) │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Transport Layer                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Bluetooth   │ WiFi Direct │ BSV Network │  Local Storage  │  │
│  │    LE       │  (Android/  │ (Blockchain)│   (Keychain)    │  │
│  │ (Cross-Plat)│   iOS P2P)  │ (WhatsOnCh) │  (Encrypted)    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Presentation Layer

#### Screen Components
```typescript
// Main application screens
src/screens/
├── ChatScreen.tsx          // Primary messaging interface
├── WalletScreen.tsx        // BSV wallet management
├── SettingsScreen.tsx      // App configuration
├── ChannelBrowser.tsx      // Discover and join channels
├── PeerListScreen.tsx      // Connected peers and favorites
└── SetupScreen.tsx         // Initial app setup

// Reusable UI components
src/components/
├── MessageBubble.tsx       // Individual message display
├── PeerStatusIndicator.tsx // Online/offline peer status
├── BSVAmountInput.tsx      // BSV amount input with validation
├── AIResponseBox.tsx       // AI agent response display
├── QRCodeScanner.tsx       // Payment request scanning
└── NetworkStatus.tsx       // Mesh network quality indicator
```

#### Navigation Structure
```typescript
// Navigation hierarchy
AppNavigator (Stack)
├── TabNavigator (Bottom Tabs)
│   ├── ChatStack
│   │   ├── ChatScreen
│   │   ├── ChannelDetail
│   │   └── PrivateChat
│   ├── WalletStack
│   │   ├── WalletScreen
│   │   ├── SendBSV
│   │   └── TransactionHistory
│   └── SettingsStack
│       ├── SettingsScreen
│       ├── AIConfig
│       └── NetworkConfig
└── Modal Stack
    ├── QRScanner
    ├── ChannelCreate
    └── PeerProfile
```

### 2. State Management

#### Redux Store Structure
```typescript
// Root state interface
interface RootState {
  chat: ChatState;
  wallet: WalletState;
  peers: PeerState;
  ai: AIState;
  network: NetworkState;
  settings: SettingsState;
}

// Chat state slice
interface ChatState {
  messages: { [channelId: string]: BitchatMessage[] };
  channels: { [id: string]: BitchatChannel };
  privateChats: { [peerId: string]: BitchatMessage[] };
  currentChannel: string | null;
  unreadCounts: { [channelId: string]: number };
  messageCache: { [messageId: string]: BitchatMessage };
  deliveryStatus: { [messageId: string]: DeliveryStatus };
}

// Wallet state slice
interface WalletState {
  wallet: BSVWallet | null;
  balance: number;
  transactions: BSVTransaction[];
  utxos: BSVUtxo[];
  isTestnet: boolean;
  pendingTransactions: string[];
}
```

#### State Persistence
```typescript
// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'wallet'], // Only persist settings and wallet
  blacklist: ['chat', 'peers', 'network'], // Don't persist ephemeral data
  transforms: [
    // Encrypt sensitive data before storage
    createEncryptTransform({
      secretKey: 'bitchat-encryption-key',
      onError: (error) => console.error('Encryption error:', error),
    }),
  ],
};
```

### 3. Service Layer

#### Bluetooth Mesh Service
```typescript
class BluetoothMeshService {
  // Core BLE functionality
  private manager: BleManager;
  private connectedPeers: Map<string, BitchatPeer>;
  private messageCache: Map<string, BitchatPacket>;
  
  // Discovery and connection
  async startScanning(): Promise<void>;
  async connectToPeer(deviceId: string): Promise<void>;
  
  // Message handling
  async sendMessage(packet: BitchatPacket): Promise<void>;
  private handleIncomingMessage(data: Uint8Array): void;
  private relayMessage(packet: BitchatPacket): void;
  
  // Network optimization
  setBatteryMode(mode: BatteryMode): void;
  private manageDutyCycle(): void;
  private cleanupStaleConnections(): void;
}
```

#### BSV Wallet Service
```typescript
class BSVWalletService {
  // Wallet management
  async generateWallet(isTestnet: boolean): Promise<BSVWallet>;
  async restoreWallet(mnemonic: string): Promise<BSVWallet>;
  
  // Transaction operations
  async sendBSV(address: string, amount: number): Promise<BSVTransaction>;
  async createPaymentRequest(amount: number): Promise<string>;
  
  // sCrypt integration
  async deployContract(code: string, params: any[]): Promise<string>;
  async executeContract(contractId: string, method: string): Promise<BSVTransaction>;
  
  // Balance and UTXO management
  async updateBalance(): Promise<number>;
  private selectUTXOs(targetAmount: number): BSVUtxo[];
}
```

#### AI Agent Service
```typescript
class AIAgentService {
  // Model management
  async loadModel(modelName: string): Promise<void>;
  async unloadModel(): Promise<void>;
  
  // Query processing
  async processQuery(query: AIQuery): Promise<AIResponse>;
  async suggestResponse(context: string): Promise<string[]>;
  
  // Specialized functions
  async detectSpam(message: string): Promise<boolean>;
  async translateText(text: string, targetLang: string): Promise<string>;
  async summarizeConversation(messages: BitchatMessage[]): Promise<string>;
  
  // Performance optimization
  private quantizeModel(model: any): any;
  private estimateBatteryUsage(): number;
}
```

#### Cryptography Service
```typescript
class CryptographyService {
  // Key management
  generateKeyPair(): CryptoKeys;
  deriveSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array;
  
  // Encryption/Decryption
  async encryptMessage(data: Uint8Array, key: CryptoKey): Promise<EncryptedPayload>;
  async decryptMessage(payload: EncryptedPayload, key: CryptoKey): Promise<Uint8Array>;
  
  // Digital signatures
  signData(data: Uint8Array, privateKey: Uint8Array): Uint8Array;
  verifySignature(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
  
  // Channel security
  deriveChannelKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  generateKeyCommitment(key: CryptoKey): string;
}
```

### 4. Protocol Layer

#### Binary Protocol Format
```
Message Structure (Binary):
┌─────────────────────────────────────────────────────────────────┐
│                          Header (13 bytes)                      │
├─────────┬─────────┬─────────┬─────────────┬─────────┬─────────┤
│ Version │  Type   │   TTL   │  Timestamp  │ Flags   │ PaySize │
│ (1 byte)│ (1 byte)│ (1 byte)│  (8 bytes)  │(1 byte) │(2 bytes)│
├─────────┴─────────┴─────────┴─────────────┴─────────┴─────────┤
│                      SenderID (8 bytes)                        │
├─────────────────────────────────────────────────────────────────┤
│                   RecipientID (8 bytes, optional)               │
├─────────────────────────────────────────────────────────────────┤
│                     Payload (variable length)                   │
├─────────────────────────────────────────────────────────────────┤
│                 Signature (64 bytes, optional)                  │
└─────────────────────────────────────────────────────────────────┘

Flags Byte:
Bit 0: hasRecipient
Bit 1: hasSignature  
Bit 2: isCompressed
Bit 3: isBSVRelated
Bit 4-7: Reserved
```

#### Message Types
```typescript
enum MessageType {
  ANNOUNCE = 0x01,           // Peer announcement
  KEY_EXCHANGE = 0x02,       // Cryptographic key exchange
  LEAVE = 0x03,              // Peer leaving network
  MESSAGE = 0x04,            // Chat message (public/private)
  FRAGMENT_START = 0x05,     // Large message fragment start
  FRAGMENT_CONTINUE = 0x06,  // Large message fragment continuation
  FRAGMENT_END = 0x07,       // Large message fragment end
  CHANNEL_ANNOUNCE = 0x08,   // Channel information
  CHANNEL_RETENTION = 0x09,  // Channel retention settings
  DELIVERY_ACK = 0x0A,       // Message delivery acknowledgment
  DELIVERY_STATUS_REQUEST = 0x0B, // Request delivery status
  READ_RECEIPT = 0x0C,       // Message read receipt
  BSV_TRANSACTION = 0x0D,    // BSV transaction broadcast
  BSV_PAYMENT_REQUEST = 0x0E, // BSV payment request
  AI_RESPONSE = 0x0F,        // AI agent response
  WIFI_DIRECT_ANNOUNCE = 0x10, // WiFi Direct capability
}
```

### 5. Transport Layer

#### Network Transport Abstraction
```typescript
interface NetworkTransport {
  type: 'ble' | 'wifi-direct' | 'bsv-relay';
  isActive: boolean;
  quality: number; // 0-1 connection quality
  latency: number; // milliseconds
  throughput: number; // bytes/second
  batteryDrain: number; // estimated mAh/hour
  
  // Transport operations
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  sendData(peerId: string, data: Uint8Array): Promise<void>;
  onDataReceived: (peerId: string, data: Uint8Array) => void;
}
```

#### Bluetooth LE Transport
```typescript
class BLETransport implements NetworkTransport {
  type = 'ble' as const;
  
  // BLE-specific configuration
  private readonly SERVICE_UUID = 'F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C';
  private readonly CHARACTERISTIC_UUID = 'A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D';
  
  // Connection management
  private maxConnections = 8;
  private rssiThreshold = -80; // dBm
  private scanDutyCycle = { active: 10000, pause: 2000 }; // ms
  
  // Performance optimization
  setBatteryMode(mode: BatteryMode): void {
    switch (mode) {
      case 'aggressive':
        this.maxConnections = 4;
        this.scanDutyCycle = { active: 5000, pause: 5000 };
        break;
      case 'balanced':
        this.maxConnections = 8;
        this.scanDutyCycle = { active: 10000, pause: 2000 };
        break;
      // ... other modes
    }
  }
}
```

#### WiFi Direct Transport (Android/iOS)
```typescript
class WiFiDirectTransport implements NetworkTransport {
  type = 'wifi-direct' as const;
  
  // Platform-specific implementations
  private androidWiFiP2P: any; // react-native-wifi-p2p
  private iosMultipeerConnectivity: any; // Native iOS module
  
  // Higher bandwidth capabilities
  private maxDataSize = 65536; // 64KB chunks
  private supportedMimeTypes = ['application/octet-stream', 'image/*', 'audio/*'];
  
  // Group management
  async createGroup(groupName: string): Promise<void>;
  async joinGroup(groupInfo: any): Promise<void>;
  async leaveGroup(): Promise<void>;
}
```

## Data Flow Architecture

### Message Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User UI   │    │ Chat Store  │    │ Mesh Service│    │ BLE Transport│
│             │    │             │    │             │    │             │
│ 1. Send Msg │───▶│ 2. Validate │───▶│ 3. Encrypt  │───▶│ 4. Transmit │
│             │    │   & Store   │    │   & Route   │    │   to Peers  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌──────▼─────┐    ┌─────────────┐
│  Remote UI  │    │Remote Store │    │Remote Mesh │    │Remote Device│
│             │    │             │    │  Service   │    │             │
│ 8. Display  │◀───│ 7. Update   │◀───│ 6. Decrypt │◀───│ 5. Receive  │
│   Message   │    │   Messages  │    │  & Validate│    │   & Process │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### BSV Transaction Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Wallet UI   │    │Wallet Store │    │BSV Service  │    │BSV Network  │
│             │    │             │    │             │    │             │
│ 1. Send BSV │───▶│ 2. Validate │───▶│ 3. Create   │───▶│ 4. Broadcast│
│             │    │   Amount    │    │   & Sign Tx │    │  Transaction│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌──────▼─────┐    ┌─────────────┐
│   Peer UI   │    │ Mesh Service│    │BSV Monitor │    │ Blockchain  │
│             │    │             │    │  Service   │    │  Explorer   │
│ 8. Notify   │◀───│ 7. Relay    │◀───│ 6. Confirm │◀───│ 5. Include  │
│  Received   │    │ via Mesh    │    │  & Notify  │    │   in Block  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### AI Query Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Chat UI   │    │  AI Store   │    │ AI Service  │    │Local Model  │
│             │    │             │    │             │    │             │
│ 1. AI Query │───▶│ 2. Queue    │───▶│ 3. Process  │───▶│ 4. Inference│
│             │    │   Request   │    │  & Context  │    │  & Generate │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌──────▼─────┐
│   Chat UI   │    │  AI Store   │    │ AI Service │
│             │    │             │    │             │
│ 7. Display  │◀───│ 6. Cache    │◀───│ 5. Post-    │
│  Response   │    │  Response   │    │  Process    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Security Architecture

### Multi-Layer Security
```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
│  ┌─────────────────┬─────────────────┬─────────────────────────┐ │
│  │ User Input      │ Message Padding │ Cover Traffic           │ │
│  │ Validation      │ (Size Obfusc.)  │ (Timing Obfuscation)    │ │
│  └─────────────────┴─────────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Protocol Layer                           │
│  ┌─────────────────┬─────────────────┬─────────────────────────┐ │
│  │ Message         │ Digital         │ Key Exchange            │ │
│  │ Encryption      │ Signatures      │ (X25519)               │ │
│  │ (AES-256-GCM)   │ (Ed25519)       │                        │ │
│  └─────────────────┴─────────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Transport Layer                          │
│  ┌─────────────────┬─────────────────┬─────────────────────────┐ │
│  │ BLE Encryption  │ WiFi Direct     │ BSV Transaction         │ │
│  │ (Platform)      │ Encryption      │ Signatures              │ │
│  └─────────────────┴─────────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Storage Layer                            │
│  ┌─────────────────┬─────────────────┬─────────────────────────┐ │
│  │ Keychain        │ Encrypted       │ Secure Memory           │ │
│  │ (Private Keys)  │ Local Storage   │ Management              │ │
│  └─────────────────┴─────────────────┴─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Management
```typescript
interface KeyManager {
  // Identity keys (persistent)
  identityKeyPair: CryptoKeys;
  identityFingerprint: string;
  
  // Session keys (ephemeral)
  sessionKeys: Map<string, CryptoKey>; // peerId -> shared secret
  
  // Channel keys
  channelKeys: Map<string, CryptoKey>; // channelId -> derived key
  
  // BSV wallet keys
  walletKeys: {
    masterPrivateKey: Uint8Array;
    derivedKeys: Map<string, Uint8Array>; // derivation path -> key
  };
  
  // Key rotation
  rotateSessionKey(peerId: string): Promise<void>;
  rotateChannelKey(channelId: string): Promise<void>;
}
```

## Performance Optimization

### Battery Management
```typescript
enum BatteryMode {
  AGGRESSIVE = 'aggressive',   // 5-10% battery drain/hour
  BALANCED = 'balanced',       // 10-15% battery drain/hour  
  PERFORMANCE = 'performance', // 15-25% battery drain/hour
  MAXIMUM = 'maximum',         // 25%+ battery drain/hour
}

interface BatteryOptimization {
  // Scanning optimization
  scanDutyCycle: { active: number; pause: number };
  maxConnections: number;
  rssiThreshold: number;
  
  // AI optimization  
  modelQuantization: '4bit' | '8bit' | '16bit';
  queryBatching: boolean;
  responseCaching: boolean;
  
  // Network optimization
  messageCompression: boolean;
  coverTrafficReduction: boolean;
  backgroundSync: boolean;
}
```

### Memory Management
```typescript
interface MemoryManager {
  // Message caching
  maxCachedMessages: number;
  messageRetentionTime: number; // milliseconds
  
  // Peer management
  maxConnectedPeers: number;
  staleConnectionTimeout: number;
  
  // AI model management
  modelMemoryLimit: number; // bytes
  modelUnloadTimeout: number; // idle time before unload
  
  // Cleanup operations
  cleanup(): void;
  forceGarbageCollection(): void;
}
```

## Testing Strategy

### Unit Tests
```typescript
// Service layer tests
describe('BluetoothMeshService', () => {
  test('should connect to nearby peers');
  test('should relay messages with TTL decrement');
  test('should handle message deduplication');
  test('should manage battery optimization modes');
});

describe('BSVWalletService', () => {
  test('should generate valid HD wallet');
  test('should create valid BSV transactions');
  test('should handle UTXO selection correctly');
  test('should integrate with sCrypt contracts');
});

describe('AIAgentService', () => {
  test('should load quantized models');
  test('should process queries locally');
  test('should detect spam content');
  test('should manage memory efficiently');
});
```

### Integration Tests
```typescript
// Cross-service integration
describe('End-to-End Message Flow', () => {
  test('should send encrypted message through mesh');
  test('should deliver BSV payment with mesh notification');
  test('should AI-assist message composition');
  test('should handle offline peer message caching');
});

// Platform integration
describe('React Native Integration', () => {
  test('should work on iOS simulator');
  test('should work on Android emulator');
  test('should handle platform permissions');
  test('should persist state across app restarts');
});
```

### E2E Tests
```typescript
// User workflow tests
describe('User Workflows', () => {
  test('should complete initial setup flow');
  test('should join mesh network and send messages');
  test('should create BSV wallet and send payment');
  test('should configure AI assistant preferences');
  test('should handle network disconnection/reconnection');
});
```

## Deployment Architecture

### Development Environment
```yaml
# React Native development setup
platform_requirements:
  ios:
    xcode: ">=12.0"
    ios_version: ">=13.0"
    simulators: [iPhone_12, iPhone_13, iPhone_14]
  
  android:
    android_studio: ">=4.0"
    sdk_version: ">=21"
    emulators: [Pixel_4, Pixel_5, Samsung_Galaxy]

# Build configuration  
build_variants:
  development:
    debug: true
    testnet: true
    ai_models: ['tinyllama-q4']
    logging: verbose
  
  staging:
    debug: false
    testnet: true
    ai_models: ['gemma-2b-q4']
    logging: normal
    
  production:
    debug: false
    testnet: false
    ai_models: ['gemma-2b-q4', 'phi-2-q4']
    logging: minimal
```

### Distribution
```yaml
# App store deployment
ios_app_store:
  bundle_id: "com.bitchat.app"
  version_strategy: semantic
  privacy_manifest: required
  bluetooth_usage: "Peer-to-peer messaging"
  
google_play_store:
  package_name: "com.bitchat.app"
  release_track: internal -> alpha -> beta -> production
  permissions:
    - android.permission.BLUETOOTH
    - android.permission.BLUETOOTH_ADMIN
    - android.permission.ACCESS_FINE_LOCATION
    - android.permission.INTERNET

# Binary size optimization
bundle_optimization:
  code_splitting: true
  ai_models_on_demand: true
  image_compression: true
  tree_shaking: aggressive
  target_size: "<50MB"
```

This architecture provides a comprehensive foundation for building a production-ready, cross-platform BitChat application with advanced features while maintaining security, performance, and user experience as primary concerns.
