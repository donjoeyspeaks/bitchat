# BitChat React Native - Development Guide

## Quick Start

```bash
# Navigate to project
cd /workspaces/bitchat/BitChatRN

# Install dependencies
npm install

# Start development server
npm start

# Test on device - scan QR code with Expo Go app
# Or test in web browser
npm run web
```

## Development Commands

```bash
# Development
npm start              # Start Expo dev server
npm run android       # Open Android emulator  
npm run ios           # Open iOS simulator (macOS only)
npm run web           # Open in web browser

# Testing & Quality
npx tsc --noEmit      # Check TypeScript compilation
npm run lint          # Run ESLint (if configured)
npm run test          # Run Jest tests (if configured)

# Building
expo build:android    # Build Android APK
expo build:ios        # Build iOS IPA (macOS only)
```

## Key Files & Directories

```
BitChatRN/
├── App.tsx                    # Main app entry point
├── src/
│   ├── types/index.ts         # TypeScript type definitions
│   ├── store/                 # Redux store and slices
│   │   ├── index.ts          # Store configuration
│   │   └── slices/           # Redux slices
│   ├── services/             # Business logic services
│   │   ├── BluetoothMeshService.ts
│   │   ├── BSVWalletService.ts
│   │   ├── AIAgentService.ts
│   │   └── CryptographyService.ts
│   ├── protocols/            # Network protocols
│   │   └── BinaryProtocol.ts
│   ├── screens/              # React Native screens
│   ├── components/           # Reusable UI components
│   ├── navigation/           # Navigation configuration
│   ├── theme/               # App theming
│   └── utils/               # Utility functions
├── assets/                   # Images, fonts, etc.
└── docs/                    # Documentation
```

## Making Changes

### Adding a New Screen
1. Create screen component in `src/screens/`
2. Add to navigation in `src/navigation/AppNavigator.tsx`
3. Export from `src/screens/index.ts`

### Adding New Redux State
1. Create slice in `src/store/slices/`
2. Add to store in `src/store/index.ts`
3. Use with `useSelector` and `useDispatch` hooks

### Adding New Service
1. Create service class in `src/services/`
2. Add types to `src/types/index.ts`
3. Integrate with Redux actions/thunks

## Testing on Device

### Using Expo Go (Recommended for Development)
1. Install Expo Go from App Store / Google Play
2. Run `npm start` in terminal
3. Scan QR code with Expo Go app
4. App loads instantly with hot reload

### Building Native Apps
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Apple Developer Account)
eas build --platform ios
```

## Debugging

### React Native Debugger
```bash
# Install React Native Debugger
# Open debugger before starting app
# Press Cmd+D (iOS) or Cmd+M (Android) to open dev menu
# Select "Debug JS Remotely"
```

### Expo DevTools
- Press `j` in terminal to open debugger
- Access network requests, console logs, performance metrics

### Console Logging
```typescript
console.log('Debug info');
console.warn('Warning message');
console.error('Error details');
```

## Common Issues & Solutions

### Metro Bundle Error
```bash
# Clear Metro cache
npx expo start --clear

# Reset node modules
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check all TypeScript errors
npx tsc --noEmit

# Fix import paths
# Ensure all types are properly exported
```

### Package Version Conflicts
```bash
# Check for version mismatches
expo doctor

# Install compatible versions
expo install package-name
```

## Performance Tips

### Bundle Size Optimization
- Use `import { specific } from 'library'` instead of `import * as library`
- Enable Hermes JavaScript engine in `app.json`
- Use `expo-optimize` for asset optimization

### Memory Management
- Avoid memory leaks with proper cleanup in `useEffect`
- Use `React.memo` for expensive components
- Implement lazy loading for large screens

### Battery Optimization
- Minimize background tasks
- Use efficient algorithms for BLE scanning
- Implement smart duty cycling

## Deployment Checklist

### Pre-Release
- [ ] All TypeScript errors resolved
- [ ] All features tested on iOS and Android
- [ ] Performance metrics meet targets
- [ ] Security audit completed
- [ ] App icons and splash screens added

### App Store Submission
- [ ] Build signed release APK/IPA
- [ ] Create app store listings
- [ ] Prepare screenshots and descriptions
- [ ] Submit for review

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

Happy coding! 🚀
