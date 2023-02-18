const resolve = require('resolve');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// const DotenvPlugin = require('webpack-dotenv-plugin');
const plugins = require('../base/plugins');
const paths = require('../base/paths');
const pkg = require('../../package.json');

plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development')
    }
  }),
  new CaseSensitivePathsPlugin(),
  new HtmlWebpackPlugin({
    title: pkg.name,
    inject: true,
    template: paths.appHtml,
  }),
  new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
    chunkFilename: '[id].css',
    ignoreOrder: false,
  }),
  new webpack.HotModuleReplacementPlugin(),
  new ForkTsCheckerWebpackPlugin({
    async: true,
    typescript: {
      typescriptPath: resolve.sync('typescript', {
        basedir: paths.appNodeModules,
      }),
      configOverwrite: {
        compilerOptions: {
          sourceMap: true,
          skipLibCheck: true,
          inlineSourceMap: false,
          declarationMap: false,
          noEmit: true,
          incremental: true,
          tsBuildInfoFile: paths.appTsBuildInfoFile,
        },
      },
      context: paths.appPath,
      diagnosticOptions: {
        syntactic: true,
      },
      mode: 'write-references',
      // profile: true,
    },
  }),
);

module.exports = plugins;
