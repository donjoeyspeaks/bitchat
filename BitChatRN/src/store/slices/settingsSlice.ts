import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppConfig } from '../../types';

interface SettingsState extends AppConfig {
  isFirstLaunch: boolean;
  lastBackupTime: number;
  deviceId: string;
  appVersion: string;
  privacySettings: {
    shareNickname: boolean;
    shareOnlineStatus: boolean;
    allowDirectMessages: boolean;
    enableReadReceipts: boolean;
    shareLocation: boolean;
  };
  debugSettings: {
    enableLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    showNetworkDebugInfo: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

const initialState: SettingsState = {
  // Core app config
  nickname: '',
  batteryMode: 'balanced',
  enableCoverTraffic: false,
  enableAI: true,
  aiModel: 'gemma-2b-q4',
  enableBSV: true,
  bsvNetwork: 'testnet',
  enableWifiDirect: true,
  maxCachedMessages: 1000,
  maxCachedMessagesForFavorites: 5000,
  messageRetentionHours: 168, // 7 days
  enableNotifications: true,
  enableVoice: false,
  theme: 'auto',
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceAnimations: false,
    screenReaderEnabled: false,
  },

  // Additional settings state
  isFirstLaunch: true,
  lastBackupTime: 0,
  deviceId: '',
  appVersion: '1.0.0',
  privacySettings: {
    shareNickname: true,
    shareOnlineStatus: true,
    allowDirectMessages: true,
    enableReadReceipts: true,
    shareLocation: false,
  },
  debugSettings: {
    enableLogging: false,
    logLevel: 'error',
    showNetworkDebugInfo: false,
    enablePerformanceMonitoring: false,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },

    setBatteryMode: (state, action: PayloadAction<'aggressive' | 'balanced' | 'performance' | 'maximum'>) => {
      state.batteryMode = action.payload;
    },

    toggleCoverTraffic: (state) => {
      state.enableCoverTraffic = !state.enableCoverTraffic;
    },

    setAIEnabled: (state, action: PayloadAction<boolean>) => {
      state.enableAI = action.payload;
    },

    setAIModel: (state, action: PayloadAction<string>) => {
      state.aiModel = action.payload;
    },

    setBSVEnabled: (state, action: PayloadAction<boolean>) => {
      state.enableBSV = action.payload;
    },

    setBSVNetwork: (state, action: PayloadAction<'mainnet' | 'testnet'>) => {
      state.bsvNetwork = action.payload;
    },

    setWiFiDirectEnabled: (state, action: PayloadAction<boolean>) => {
      state.enableWifiDirect = action.payload;
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },

    updateAccessibility: (state, action: PayloadAction<Partial<AppConfig['accessibility']>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },

    updatePrivacySettings: (state, action: PayloadAction<Partial<SettingsState['privacySettings']>>) => {
      state.privacySettings = { ...state.privacySettings, ...action.payload };
    },

    updateDebugSettings: (state, action: PayloadAction<Partial<SettingsState['debugSettings']>>) => {
      state.debugSettings = { ...state.debugSettings, ...action.payload };
    },

    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.enableNotifications = action.payload;
    },

    setVoiceEnabled: (state, action: PayloadAction<boolean>) => {
      state.enableVoice = action.payload;
    },

    setMessageRetention: (state, action: PayloadAction<number>) => {
      state.messageRetentionHours = action.payload;
    },

    setCacheSettings: (state, action: PayloadAction<{ messages: number; favorites: number }>) => {
      state.maxCachedMessages = action.payload.messages;
      state.maxCachedMessagesForFavorites = action.payload.favorites;
    },

    completeFirstLaunch: (state) => {
      state.isFirstLaunch = false;
    },

    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },

    updateBackupTime: (state) => {
      state.lastBackupTime = Date.now();
    },

    resetToDefaults: (state) => {
      // Reset to initial state but keep device info
      const { deviceId, isFirstLaunch, appVersion } = state;
      Object.assign(state, initialState);
      state.deviceId = deviceId;
      state.isFirstLaunch = isFirstLaunch;
      state.appVersion = appVersion;
    },
  },
});

export const {
  setNickname,
  setBatteryMode,
  toggleCoverTraffic,
  setAIEnabled,
  setAIModel,
  setBSVEnabled,
  setBSVNetwork,
  setWiFiDirectEnabled,
  setTheme,
  updateAccessibility,
  updatePrivacySettings,
  updateDebugSettings,
  setNotificationsEnabled,
  setVoiceEnabled,
  setMessageRetention,
  setCacheSettings,
  completeFirstLaunch,
  setDeviceId,
  updateBackupTime,
  resetToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;
