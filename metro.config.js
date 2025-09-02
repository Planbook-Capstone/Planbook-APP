const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ⚡ Thêm config cho react-native-svg-transformer
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// Bỏ svg khỏi assetExts, thêm vào sourceExts
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");

// Xuất ra với NativeWind
module.exports = withNativeWind(config, {
  input: "./global.css",
});
