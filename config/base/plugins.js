const webpack = require('webpack');
const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');

const plugins = [
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  }),
  new WebpackManifestPlugin({
    fileName: 'asset-manifest.json',
    publicPath: paths.appPublic,
    generate: (seed, files, entrypoints) => {
      const manifestFiles = files.reduce((manifest, file) => {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);
      const entrypointFiles = entrypoints.main.filter(
        (fileName) => !fileName.endsWith('.map')
      );

      return {
        files: manifestFiles,
        entrypoints: entrypointFiles,
      };
    },
  }),
  new ESLintPlugin({
    // Plugin options
    extensions: ['js', 'mjs', 'ts'],
    eslintPath: require.resolve('eslint'),
    emitWarning: true,
    context: paths.appSrc,
    cache: true,
    cacheLocation: path.resolve(paths.appNodeModules, '.cache/.eslintcache'),
    // ESLint class options
    cwd: paths.appPath,
    resolvePluginsRelativeTo: __dirname,
    baseConfig: {
      extends: [require.resolve('eslint-config-airbnb-base')],
    },
  }),
];

module.exports = plugins;
