/**
 * Redux Store Configuration for BitChat
 * State management for cross-platform app
 */

// Mock Redux store implementation
// TODO: Replace with actual Redux store using @reduxjs/toolkit

export const store = {
  dispatch: () => { },
  getState: () => ({}),
  subscribe: () => () => { },
  replaceReducer: () => { },
};

export const persistor = {
  purge: () => Promise.resolve(),
  flush: () => Promise.resolve(),
  pause: () => { },
  persist: () => { },
};

export default store;
