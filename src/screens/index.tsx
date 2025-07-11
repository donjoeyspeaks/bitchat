/**
 * Mock Screen Components for BitChat
 * Basic implementations to get the app structure working
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Since React Native types aren't available yet, we'll create minimal mock components

export const SetupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BitChat</Text>
      <Text style={styles.subtitle}>Setup your wallet and preferences</Text>
    </View>
  );
};

export const ChatScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Mesh network messaging</Text>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your BitChat experience</Text>
    </View>
  );
};

export const WalletScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BSV Wallet</Text>
      <Text style={styles.subtitle}>Bitcoin SV transactions and balance</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default {
  SetupScreen,
  ChatScreen,
  SettingsScreen,
  WalletScreen,
};
