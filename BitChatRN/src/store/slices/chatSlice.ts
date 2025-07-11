import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BitchatMessage, BitchatChannel, DeliveryStatus } from '../../types';

interface ChatState {
  messages: { [channelId: string]: BitchatMessage[] };
  channels: { [id: string]: BitchatChannel };
  privateChats: { [peerId: string]: BitchatMessage[] };
  currentChannel: string | null;
  unreadCounts: { [channelId: string]: number };
  messageCache: { [messageId: string]: BitchatMessage };
  deliveryStatus: { [messageId: string]: DeliveryStatus };
}

const initialState: ChatState = {
  messages: {},
  channels: {},
  privateChats: {},
  currentChannel: null,
  unreadCounts: {},
  messageCache: {},
  deliveryStatus: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ channelId: string; message: BitchatMessage }>) => {
      const { channelId, message } = action.payload;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      state.messages[channelId].push(message);
      state.messageCache[message.id] = message;

      // Update unread count if not current channel
      if (channelId !== state.currentChannel) {
        state.unreadCounts[channelId] = (state.unreadCounts[channelId] || 0) + 1;
      }
    },

    addChannel: (state, action: PayloadAction<BitchatChannel>) => {
      const channel = action.payload;
      state.channels[channel.name] = channel;
      if (!state.messages[channel.name]) {
        state.messages[channel.name] = [];
      }
    },

    setCurrentChannel: (state, action: PayloadAction<string>) => {
      state.currentChannel = action.payload;
      // Clear unread count for current channel
      state.unreadCounts[action.payload] = 0;
    },

    updateDeliveryStatus: (state, action: PayloadAction<{ messageId: string; status: DeliveryStatus }>) => {
      const { messageId, status } = action.payload;
      state.deliveryStatus[messageId] = status;
    },

    clearMessages: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;
      state.messages[channelId] = [];
      state.unreadCounts[channelId] = 0;
    },

    addPrivateMessage: (state, action: PayloadAction<{ peerId: string; message: BitchatMessage }>) => {
      const { peerId, message } = action.payload;
      if (!state.privateChats[peerId]) {
        state.privateChats[peerId] = [];
      }
      state.privateChats[peerId].push(message);
      state.messageCache[message.id] = message;
    },
  },
});

export const {
  addMessage,
  addChannel,
  setCurrentChannel,
  updateDeliveryStatus,
  clearMessages,
  addPrivateMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
