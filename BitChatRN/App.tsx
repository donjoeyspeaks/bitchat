import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { BitChatTheme } from './src/theme/BitChatTheme';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={BitChatTheme}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
