import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BitchatPeer } from '../../types';

interface PeersState {
  connectedPeers: { [id: string]: BitchatPeer };
  discoveredPeers: { [id: string]: BitchatPeer };
  favoritePeers: string[]; // Peer IDs
  blockedPeers: string[]; // Peer IDs
  isScanning: boolean;
  lastScanTime: number;
  connectionHistory: Array<{
    peerId: string;
    timestamp: number;
    action: 'connected' | 'disconnected';
  }>;
}

const initialState: PeersState = {
  connectedPeers: {},
  discoveredPeers: {},
  favoritePeers: [],
  blockedPeers: [],
  isScanning: false,
  lastScanTime: 0,
  connectionHistory: [],
};

const peersSlice = createSlice({
  name: 'peers',
  initialState,
  reducers: {
    addDiscoveredPeer: (state, action: PayloadAction<BitchatPeer>) => {
      const peer = action.payload;
      state.discoveredPeers[peer.id] = peer;
    },

    connectPeer: (state, action: PayloadAction<BitchatPeer>) => {
      const peer = action.payload;
      state.connectedPeers[peer.id] = { ...peer, isConnected: true };
      delete state.discoveredPeers[peer.id];

      // Add to connection history
      state.connectionHistory.unshift({
        peerId: peer.id,
        timestamp: Date.now(),
        action: 'connected',
      });
    },

    disconnectPeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      const peer = state.connectedPeers[peerId];

      if (peer) {
        state.discoveredPeers[peerId] = { ...peer, isConnected: false };
        delete state.connectedPeers[peerId];

        // Add to connection history
        state.connectionHistory.unshift({
          peerId,
          timestamp: Date.now(),
          action: 'disconnected',
        });
      }
    },

    updatePeerRSSI: (state, action: PayloadAction<{ peerId: string; rssi: number }>) => {
      const { peerId, rssi } = action.payload;
      if (state.connectedPeers[peerId]) {
        state.connectedPeers[peerId].rssi = rssi;
      }
      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].rssi = rssi;
      }
    },

    addFavoritePeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      if (!state.favoritePeers.includes(peerId)) {
        state.favoritePeers.push(peerId);
      }

      // Update peer objects
      if (state.connectedPeers[peerId]) {
        state.connectedPeers[peerId].isFavorite = true;
      }
      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].isFavorite = true;
      }
    },

    removeFavoritePeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      state.favoritePeers = state.favoritePeers.filter(id => id !== peerId);

      // Update peer objects
      if (state.connectedPeers[peerId]) {
        state.connectedPeers[peerId].isFavorite = false;
      }
      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].isFavorite = false;
      }
    },

    blockPeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      if (!state.blockedPeers.includes(peerId)) {
        state.blockedPeers.push(peerId);
      }

      // Remove from connected/discovered and update objects
      delete state.connectedPeers[peerId];
      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].isBlocked = true;
      }
    },

    unblockPeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      state.blockedPeers = state.blockedPeers.filter(id => id !== peerId);

      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].isBlocked = false;
      }
    },

    setScanningStatus: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
      if (action.payload) {
        state.lastScanTime = Date.now();
      }
    },

    clearPeers: (state) => {
      state.connectedPeers = {};
      state.discoveredPeers = {};
      state.isScanning = false;
    },

    updatePeerLastSeen: (state, action: PayloadAction<{ peerId: string; timestamp: number }>) => {
      const { peerId, timestamp } = action.payload;
      if (state.connectedPeers[peerId]) {
        state.connectedPeers[peerId].lastSeen = timestamp;
      }
      if (state.discoveredPeers[peerId]) {
        state.discoveredPeers[peerId].lastSeen = timestamp;
      }
    },
  },
});

export const {
  addDiscoveredPeer,
  connectPeer,
  disconnectPeer,
  updatePeerRSSI,
  addFavoritePeer,
  removeFavoritePeer,
  blockPeer,
  unblockPeer,
  setScanningStatus,
  clearPeers,
  updatePeerLastSeen,
} = peersSlice.actions;

export default peersSlice.reducer;
