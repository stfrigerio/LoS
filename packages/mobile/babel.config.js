module.exports = function(api) {
  api.cache(true);
  const config = {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      '@babel/plugin-proposal-export-namespace-from'
    ],
  };
  // console.log('Babel config:', JSON.stringify(config, null, 2));
  return config;
};