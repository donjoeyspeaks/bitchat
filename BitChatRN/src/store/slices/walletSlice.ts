import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BSVWallet, BSVTransaction, BSVUtxo } from '../../types';

interface WalletState {
  wallet: BSVWallet | null;
  balance: number;
  transactions: BSVTransaction[];
  utxos: BSVUtxo[];
  isTestnet: boolean;
  pendingTransactions: string[];
  isInitialized: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  balance: 0,
  transactions: [],
  utxos: [],
  isTestnet: true, // Default to testnet
  pendingTransactions: [],
  isInitialized: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<BSVWallet>) => {
      state.wallet = action.payload;
      state.isInitialized = true;
      state.error = null;
    },

    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },

    addTransaction: (state, action: PayloadAction<BSVTransaction>) => {
      const transaction = action.payload;
      const existingIndex = state.transactions.findIndex(tx => tx.id === transaction.id);
      if (existingIndex >= 0) {
        state.transactions[existingIndex] = transaction;
      } else {
        state.transactions.unshift(transaction); // Add to beginning
      }
    },

    updateUTXOs: (state, action: PayloadAction<BSVUtxo[]>) => {
      state.utxos = action.payload;
    },

    addPendingTransaction: (state, action: PayloadAction<string>) => {
      state.pendingTransactions.push(action.payload);
    },

    removePendingTransaction: (state, action: PayloadAction<string>) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        txId => txId !== action.payload
      );
    },

    setTestnet: (state, action: PayloadAction<boolean>) => {
      state.isTestnet = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearWallet: (state) => {
      state.wallet = null;
      state.balance = 0;
      state.transactions = [];
      state.utxos = [];
      state.pendingTransactions = [];
      state.isInitialized = false;
      state.error = null;
    },
  },
});

export const {
  setWallet,
  updateBalance,
  addTransaction,
  updateUTXOs,
  addPendingTransaction,
  removePendingTransaction,
  setTestnet,
  setError,
  clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
