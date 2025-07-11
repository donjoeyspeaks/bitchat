import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import {
  ChatScreen,
  WalletScreen,
  SettingsScreen,
  PeerListScreen,
  ChannelBrowserScreen,
  SetupScreen,
} from '../screens';
import BLETestScreen from '../screens/BLETestScreen';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Setup: undefined;
  ChannelBrowser: undefined;
  PeerDetail: { peerId: string };
  ChatDetail: { channelId: string };
  SendBSV: { recipientAddress?: string; amount?: number };
  QRScanner: { onScan: (data: string) => void };
};

export type MainTabParamList = {
  Chat: undefined;
  Peers: undefined;
  Wallet: undefined;
  BLETest: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Peers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'BLETest':
              iconName = focused ? 'bluetooth' : 'bluetooth-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'BitChat',
          headerRight: () => (
            // TODO: Add channel browser button
            null
          ),
        }}
      />
      <Tab.Screen
        name="Peers"
        component={PeerListScreen}
        options={{
          title: 'Mesh Network',
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'BSV Wallet',
        }}
      />
      <Tab.Screen
        name="BLETest"
        component={BLETestScreen}
        options={{
          title: 'BLE Testing',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChannelBrowser"
        component={ChannelBrowserScreen}
        options={{
          headerShown: true,
          title: 'Join Channel',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
