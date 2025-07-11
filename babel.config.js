module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['react-native-reanimated/plugin', { relativeSourceLocation: true }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@services': './src/services',
          '@stores': './src/stores',
          '@protocols': './src/protocols',
          '@utils': './src/utils',
          '@types': './src/types',
          '@contracts': './src/contracts',
          '@assets': './assets',
        },
      },
    ],
  ],
};
