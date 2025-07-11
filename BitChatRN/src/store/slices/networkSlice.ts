import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkTransport } from '../../types';

interface NetworkState {
  transports: { [type: string]: NetworkTransport };
  isOnline: boolean;
  messageQueue: Array<{
    id: string;
    data: Uint8Array;
    destination: string;
    transport: 'ble' | 'wifi-direct' | 'bsv-relay';
    timestamp: number;
    retryCount: number;
  }>;
  batteryMode: 'aggressive' | 'balanced' | 'performance' | 'maximum';
  coverTrafficEnabled: boolean;
  lastSyncTime: number;
  networkStats: {
    messagesSent: number;
    messagesReceived: number;
    bytesTransferred: number;
    connectionUptime: number;
    lastResetTime: number;
  };
}

const initialState: NetworkState = {
  transports: {},
  isOnline: false,
  messageQueue: [],
  batteryMode: 'balanced',
  coverTrafficEnabled: false,
  lastSyncTime: 0,
  networkStats: {
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    connectionUptime: 0,
    lastResetTime: Date.now(),
  },
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    updateTransport: (state, action: PayloadAction<NetworkTransport>) => {
      const transport = action.payload;
      state.transports[transport.type] = transport;

      // Update online status
      state.isOnline = Object.values(state.transports).some(t => t.isActive);
    },

    removeTransport: (state, action: PayloadAction<string>) => {
      delete state.transports[action.payload];
      state.isOnline = Object.values(state.transports).some(t => t.isActive);
    },

    addToMessageQueue: (state, action: PayloadAction<{
      id: string;
      data: Uint8Array;
      destination: string;
      transport: 'ble' | 'wifi-direct' | 'bsv-relay';
    }>) => {
      const message = {
        ...action.payload,
        timestamp: Date.now(),
        retryCount: 0,
      };
      state.messageQueue.push(message);
    },

    removeFromMessageQueue: (state, action: PayloadAction<string>) => {
      state.messageQueue = state.messageQueue.filter(msg => msg.id !== action.payload);
    },

    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const message = state.messageQueue.find(msg => msg.id === action.payload);
      if (message) {
        message.retryCount++;
      }
    },

    setBatteryMode: (state, action: PayloadAction<'aggressive' | 'balanced' | 'performance' | 'maximum'>) => {
      state.batteryMode = action.payload;
    },

    setCoverTraffic: (state, action: PayloadAction<boolean>) => {
      state.coverTrafficEnabled = action.payload;
    },

    updateSyncTime: (state) => {
      state.lastSyncTime = Date.now();
    },

    incrementMessagesSent: (state, action: PayloadAction<number>) => {
      state.networkStats.messagesSent++;
      state.networkStats.bytesTransferred += action.payload;
    },

    incrementMessagesReceived: (state, action: PayloadAction<number>) => {
      state.networkStats.messagesReceived++;
      state.networkStats.bytesTransferred += action.payload;
    },

    updateConnectionUptime: (state, action: PayloadAction<number>) => {
      state.networkStats.connectionUptime = action.payload;
    },

    resetNetworkStats: (state) => {
      state.networkStats = {
        messagesSent: 0,
        messagesReceived: 0,
        bytesTransferred: 0,
        connectionUptime: 0,
        lastResetTime: Date.now(),
      };
    },

    clearMessageQueue: (state) => {
      state.messageQueue = [];
    },

    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  updateTransport,
  removeTransport,
  addToMessageQueue,
  removeFromMessageQueue,
  incrementRetryCount,
  setBatteryMode,
  setCoverTraffic,
  updateSyncTime,
  incrementMessagesSent,
  incrementMessagesReceived,
  updateConnectionUptime,
  resetNetworkStats,
  clearMessageQueue,
  setOnlineStatus,
} = networkSlice.actions;

export default networkSlice.reducer;
