import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// BitChat brand colors
const BitChatColors = {
  primary: '#1E88E5',      // Blue - BitChat brand
  primaryDark: '#1565C0',  // Darker blue
  secondary: '#FF6B35',    // Orange accent
  accent: '#00E676',       // Green for active status
  surface: '#FFFFFF',      // White surface
  surfaceDark: '#121212',  // Dark surface
  onSurface: '#000000',    // Text on surface
  onSurfaceDark: '#FFFFFF', // Text on dark surface
  error: '#F44336',        // Red for errors
  warning: '#FF9800',      // Orange for warnings
  success: '#4CAF50',      // Green for success
  background: '#F5F5F5',   // Light background
  backgroundDark: '#000000', // Dark background

  // Mesh network indicators
  meshConnected: '#00E676',    // Bright green
  meshConnecting: '#FFC107',   // Amber
  meshDisconnected: '#F44336', // Red

  // BSV colors
  bsvGold: '#EAB308',         // BSV gold
  bsvGreen: '#16A34A',        // Transaction success

  // Chat bubble colors
  sentMessage: '#1E88E5',     // Blue for sent messages
  receivedMessage: '#E0E0E0', // Light gray for received
  aiMessage: '#9C27B0',       // Purple for AI messages
  systemMessage: '#757575',   // Gray for system
};

export const BitChatLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BitChatColors.primary,
    primaryContainer: BitChatColors.primary + '20',
    secondary: BitChatColors.secondary,
    secondaryContainer: BitChatColors.secondary + '20',
    surface: BitChatColors.surface,
    surfaceVariant: '#F5F5F5',
    onSurface: BitChatColors.onSurface,
    onSurfaceVariant: '#757575',
    background: BitChatColors.background,
    onBackground: BitChatColors.onSurface,
    error: BitChatColors.error,
    onError: '#FFFFFF',
    outline: '#E0E0E0',

    // Custom colors for BitChat
    meshConnected: BitChatColors.meshConnected,
    meshConnecting: BitChatColors.meshConnecting,
    meshDisconnected: BitChatColors.meshDisconnected,
    bsvGold: BitChatColors.bsvGold,
    bsvGreen: BitChatColors.bsvGreen,
    sentMessage: BitChatColors.sentMessage,
    receivedMessage: BitChatColors.receivedMessage,
    aiMessage: BitChatColors.aiMessage,
    systemMessage: BitChatColors.systemMessage,
  },
};

export const BitChatDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: BitChatColors.primary,
    primaryContainer: BitChatColors.primaryDark,
    secondary: BitChatColors.secondary,
    secondaryContainer: BitChatColors.secondary + '40',
    surface: BitChatColors.surfaceDark,
    surfaceVariant: '#1E1E1E',
    onSurface: BitChatColors.onSurfaceDark,
    onSurfaceVariant: '#BDBDBD',
    background: BitChatColors.backgroundDark,
    onBackground: BitChatColors.onSurfaceDark,
    error: BitChatColors.error,
    onError: '#FFFFFF',
    outline: '#424242',

    // Custom colors for BitChat
    meshConnected: BitChatColors.meshConnected,
    meshConnecting: BitChatColors.meshConnecting,
    meshDisconnected: BitChatColors.meshDisconnected,
    bsvGold: BitChatColors.bsvGold,
    bsvGreen: BitChatColors.bsvGreen,
    sentMessage: BitChatColors.sentMessage,
    receivedMessage: '#424242',
    aiMessage: BitChatColors.aiMessage,
    systemMessage: '#757575',
  },
};

// Default theme (can be switched based on settings)
export const BitChatTheme = BitChatLightTheme;

// Typography
export const BitChatTypography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace', // For BSV addresses and hashes
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing scale
export const BitChatSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BitChatBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Shadows
export const BitChatShadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation durations
export const BitChatAnimations = {
  fast: 150,
  normal: 300,
  slow: 500,

  // Easing curves
  easeInOut: 'ease-in-out',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
};
