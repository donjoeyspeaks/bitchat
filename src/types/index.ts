/**
 * Core types for BitChat React Native
 * Cross-platform decentralized P2P messaging with BSV integration and AI agents
 */

export interface BitchatMessage {
  id: string;
  senderID: string;
  recipientID?: string;
  nickname?: string;
  content: string;
  timestamp: number;
  channel?: string;
  isPrivate: boolean;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  signature?: Uint8Array;
  isEncrypted: boolean;
  originalSize?: number; // For compressed messages
  bsvTxId?: string; // Associated BSV transaction ID if any
  bsvAmount?: number; // BSV amount attached (in satoshis)
  aiGenerated?: boolean; // Whether this message was AI-assisted
}

export interface BitchatPeer {
  id: string;
  nickname?: string;
  publicKey?: Uint8Array;
  publicKeyFingerprint?: string;
  rssi?: number;
  lastSeen: number;
  isConnected: boolean;
  connectionType: 'ble' | 'wifi-direct' | 'bsv-relay';
  deviceInfo?: {
    platform: 'android' | 'ios';
    version: string;
    capabilities: string[];
  };
  bsvAddress?: string; // BSV address for payments
  isFavorite: boolean;
  isBlocked: boolean;
}

export interface BitchatChannel {
  name: string; // e.g., "#general"
  creator: string; // Peer ID of creator
  isPasswordProtected: boolean;
  hasRetention: boolean; // Whether messages are saved
  memberCount: number;
  members: Set<string>; // Peer IDs
  keyCommitment?: string; // SHA256(derivedKey) for verification
  bsvChannelToken?: string; // BSV token contract address if tokenized
  accessFee?: number; // BSV fee in satoshis for access
}

export interface BitchatPacket {
  version: number;
  type: MessageType;
  senderID: Uint8Array;
  recipientID?: Uint8Array;
  timestamp: number;
  payload: Uint8Array;
  signature?: Uint8Array;
  ttl: number;
  flags: {
    hasRecipient: boolean;
    hasSignature: boolean;
    isCompressed: boolean;
    isBSVRelated: boolean; // New flag for BSV transactions
  };
}

export enum MessageType {
  ANNOUNCE = 0x01,
  KEY_EXCHANGE = 0x02,
  LEAVE = 0x03,
  MESSAGE = 0x04,
  FRAGMENT_START = 0x05,
  FRAGMENT_CONTINUE = 0x06,
  FRAGMENT_END = 0x07,
  CHANNEL_ANNOUNCE = 0x08,
  CHANNEL_RETENTION = 0x09,
  DELIVERY_ACK = 0x0A,
  DELIVERY_STATUS_REQUEST = 0x0B,
  READ_RECEIPT = 0x0C,
  BSV_TRANSACTION = 0x0D, // New: BSV transaction broadcast
  BSV_PAYMENT_REQUEST = 0x0E, // New: Request BSV payment
  AI_RESPONSE = 0x0F, // New: AI agent response
  WIFI_DIRECT_ANNOUNCE = 0x10, // New: WiFi Direct capability
}

export interface BSVWallet {
  mnemonic: string;
  seed: Uint8Array;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  address: string;
  balance: number; // in satoshis
  unspentOutputs: BSVUtxo[];
  isTestnet: boolean;
}

export interface BSVUtxo {
  txid: string;
  vout: number;
  satoshis: number;
  script: string;
  height?: number;
}

export interface BSVTransaction {
  id: string;
  inputs: BSVUtxo[];
  outputs: Array<{
    address: string;
    satoshis: number;
    script?: string; // Optional script for OP_RETURN or contract outputs
  }>;
  fee: number;
  timestamp: number;
  confirmations: number;
  opReturn?: string; // For embedding chat metadata
}

export interface AIAgent {
  id: string;
  modelName: string;
  modelSize: number; // in MB
  isLoaded: boolean;
  isQuantized: boolean;
  capabilities: Array<'text' | 'voice' | 'analysis' | 'translation'>;
  personalityPrompt?: string;
  lastUsed: number;
  usageStats: {
    totalQueries: number;
    avgResponseTime: number;
    batteryUsage: number; // estimated mAh per hour
  };
}

export interface NetworkTransport {
  type: 'ble' | 'wifi-direct' | 'bsv-relay';
  isActive: boolean;
  quality: number; // 0-1 connection quality score
  latency: number; // ms
  throughput: number; // bytes/sec
  batteryDrain: number; // estimated mAh/hour
}

export interface AppConfig {
  nickname: string;
  batteryMode: 'aggressive' | 'balanced' | 'performance' | 'maximum';
  enableCoverTraffic: boolean;
  enableAI: boolean;
  aiModel: string;
  enableBSV: boolean;
  bsvNetwork: 'mainnet' | 'testnet';
  enableWifiDirect: boolean;
  maxCachedMessages: number;
  maxCachedMessagesForFavorites: number;
  messageRetentionHours: number;
  enableNotifications: boolean;
  enableVoice: boolean;
  theme: 'light' | 'dark' | 'auto';
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    highContrast: boolean;
    reduceAnimations: boolean;
    screenReaderEnabled: boolean;
  };
}

export interface CryptoKeys {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  keyPair?: any; // Platform-specific key pair object
}

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
}

export interface DeliveryStatus {
  messageId: string;
  status: 'pending' | 'relayed' | 'delivered' | 'read';
  timestamp: number;
  hops: number;
  lastRelay?: string; // Peer ID of last relay
}

// Event types for the app
export type BitchatEvent =
  | { type: 'peer_connected'; peer: BitchatPeer }
  | { type: 'peer_disconnected'; peerId: string }
  | { type: 'message_received'; message: BitchatMessage }
  | { type: 'message_sent'; messageId: string }
  | { type: 'channel_joined'; channel: string }
  | { type: 'channel_left'; channel: string }
  | { type: 'bsv_transaction'; transaction: BSVTransaction }
  | { type: 'ai_response'; response: string; queryId: string }
  | { type: 'connection_quality_changed'; transport: NetworkTransport }
  | { type: 'battery_mode_changed'; mode: string }
  | { type: 'error'; error: Error; context?: string };

export interface BitchatDelegate {
  onPeerConnected(peer: BitchatPeer): void;
  onPeerDisconnected(peerId: string): void;
  onMessageReceived(message: BitchatMessage): void;
  onChannelAnnouncement(channel: BitchatChannel): void;
  onDeliveryStatusChanged(status: DeliveryStatus): void;
  onBSVTransaction(transaction: BSVTransaction): void;
  onAIResponse(response: string, queryId: string): void;
  onError(error: Error, context?: string): void;
}

// Special recipient IDs
export const SPECIAL_RECIPIENTS = {
  BROADCAST: new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
  AI_AGENT: new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]),
  BSV_RELAY: new Uint8Array([0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB]),
} as const;

// Protocol constants
export const PROTOCOL_CONSTANTS = {
  VERSION: 2, // Incremented for new features
  HEADER_SIZE: 13,
  SENDER_ID_SIZE: 8,
  RECIPIENT_ID_SIZE: 8,
  SIGNATURE_SIZE: 64,
  MAX_TTL: 7,
  MAX_PAYLOAD_SIZE: 4096,
  MAX_FRAGMENT_SIZE: 512,
  COMPRESSION_THRESHOLD: 128, // Compress if payload > 128 bytes
  BATTERY_CHECK_INTERVAL: 30000, // 30 seconds
  PEER_CLEANUP_INTERVAL: 300000, // 5 minutes
  COVER_TRAFFIC_INTERVAL: 60000, // 1 minute
  BSV_DUST_LIMIT: 546, // satoshis
  AI_RESPONSE_TIMEOUT: 30000, // 30 seconds
} as const;
