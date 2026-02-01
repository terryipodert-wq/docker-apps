const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'db',
  'qcow2',
  'iso'
);

module.exports = config;
