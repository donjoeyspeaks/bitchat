import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIAgent, AIQuery, AIResponse } from '../../types';

interface AIState {
  currentAgent: AIAgent | null;
  availableModels: string[];
  isModelLoaded: boolean;
  isProcessing: boolean;
  queryHistory: Array<{ query: AIQuery; response: AIResponse; timestamp: number }>;
  settings: {
    autoSuggest: boolean;
    spamDetection: boolean;
    translationEnabled: boolean;
    preferredLanguage: string;
    batteryOptimized: boolean;
  };
  performanceStats: {
    averageQueryTime: number;
    memoryUsage: number;
    batteryUsage: number;
    queriesProcessed: number;
  };
  error: string | null;
}

const initialState: AIState = {
  currentAgent: null,
  availableModels: ['gemma-2b-q4', 'phi-2-q4', 'tinyllama-q4'],
  isModelLoaded: false,
  isProcessing: false,
  queryHistory: [],
  settings: {
    autoSuggest: true,
    spamDetection: true,
    translationEnabled: false,
    preferredLanguage: 'en',
    batteryOptimized: true,
  },
  performanceStats: {
    averageQueryTime: 0,
    memoryUsage: 0,
    batteryUsage: 0,
    queriesProcessed: 0,
  },
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setCurrentAgent: (state, action: PayloadAction<AIAgent | null>) => {
      state.currentAgent = action.payload;
      state.isModelLoaded = action.payload !== null;
      state.error = null;
    },

    setProcessingStatus: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    addQueryToHistory: (state, action: PayloadAction<{ query: AIQuery; response: AIResponse }>) => {
      const { query, response } = action.payload;
      state.queryHistory.unshift({
        query,
        response,
        timestamp: Date.now(),
      });

      // Keep only last 50 queries
      if (state.queryHistory.length > 50) {
        state.queryHistory = state.queryHistory.slice(0, 50);
      }

      // Update performance stats
      state.performanceStats.queriesProcessed++;
      if (response.processingTime) {
        const currentAvg = state.performanceStats.averageQueryTime;
        const count = state.performanceStats.queriesProcessed;
        state.performanceStats.averageQueryTime =
          (currentAvg * (count - 1) + response.processingTime) / count;
      }
    },

    updateSettings: (state, action: PayloadAction<Partial<AIState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    updatePerformanceStats: (state, action: PayloadAction<Partial<AIState['performanceStats']>>) => {
      state.performanceStats = { ...state.performanceStats, ...action.payload };
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearHistory: (state) => {
      state.queryHistory = [];
    },

    setAvailableModels: (state, action: PayloadAction<string[]>) => {
      state.availableModels = action.payload;
    },

    resetAI: (state) => {
      state.currentAgent = null;
      state.isModelLoaded = false;
      state.isProcessing = false;
      state.error = null;
      state.performanceStats = initialState.performanceStats;
    },
  },
});

export const {
  setCurrentAgent,
  setProcessingStatus,
  addQueryToHistory,
  updateSettings,
  updatePerformanceStats,
  setError,
  clearHistory,
  setAvailableModels,
  resetAI,
} = aiSlice.actions;

export default aiSlice.reducer;
