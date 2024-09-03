module.exports = function(api) {
  api.cache(true);
  return {
      presets: ['babel-preset-expo', '@babel/preset-react'],
      plugins: [
          ['module:react-native-dotenv', {
              moduleName: 'react-native-dotenv',
              path: '.env',
              blocklist: null,
              allowlist: null,
              safe: false,
              allowUndefined: true,
          }],
      ],
  };
};
