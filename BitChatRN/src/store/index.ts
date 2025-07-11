import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slice reducers (we'll create these)
import chatReducer from './slices/chatSlice';
import walletReducer from './slices/walletSlice';
import peersReducer from './slices/peersSlice';
import aiReducer from './slices/aiSlice';
import networkReducer from './slices/networkSlice';
import settingsReducer from './slices/settingsSlice';

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'wallet'], // Only persist settings and wallet
  blacklist: ['chat', 'peers', 'network', 'ai'], // Don't persist ephemeral data
};

const rootReducer = combineReducers({
  chat: chatReducer,
  wallet: walletReducer,
  peers: peersReducer,
  ai: aiReducer,
  network: networkReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
